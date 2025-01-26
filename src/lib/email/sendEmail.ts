import { resend, emailConfig } from './config';
import {
  generateItemFoundEmail,
  generateShippingConfirmationEmail,
  generateClaimApprovedEmail,
} from './templates';
import { LostItem } from '@/models/LostItem';
import { Claim } from '@/models/Claim';

interface ItemFoundEmailData {
  email: string;
  lostItem: any;
  flight: any;
  message?: string;  // Add optional message parameter
}

export async function sendItemFoundEmail(
  email: string,
  lostItem: any,
  flight: any
) {
  const { subject, html } = generateItemFoundEmail({
    flightNumber: flight.flightNumber,
    itemName: lostItem.itemName,
    itemDescription: lostItem.itemDescription,
    claimUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/claim/${lostItem._id}`,
    qrCodeUrl: lostItem.qrCodeUrl,
  });

  await resend.emails.send({
    from: emailConfig.from,
    replyTo: emailConfig.replyTo,
    to: email,
    subject,
    html,
  });
}

export async function sendShippingConfirmationEmail(
  claim: any,
  lostItem: any
) {
  const { subject, html } = generateShippingConfirmationEmail({
    customerName: claim.customerName,
    itemName: lostItem.itemName,
    trackingNumber: claim.trackingNumber,
    estimatedDelivery: claim.estimatedDelivery,
    shippingAddress: claim.shippingAddress,
  });

  await resend.emails.send({
    from: emailConfig.from,
    reply_to: emailConfig.replyTo,
    to: claim.customerEmail,
    subject,
    html,
  });
}

export async function sendClaimApprovedEmail(
  claim: any,
  lostItem: any
) {
  const { subject, html } = generateClaimApprovedEmail({
    customerName: claim.customerName,
    itemName: lostItem.itemName,
    claimMethod: claim.claimMethod,
    pickupLocation: process.env.PICKUP_LOCATION,
    paymentLink: claim.claimMethod === 'shipped' 
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/payment/${claim._id}`
      : undefined,
  });

  await resend.emails.send({
    from: emailConfig.from,
    reply_to: emailConfig.replyTo,
    to: claim.customerEmail,
    subject,
    html,
  });
}

// Error handling wrapper
export async function sendEmail(
  template: 'item-found' | 'shipping-confirmation' | 'claim-approved',
  data: ItemFoundEmailData
) {
  const { email, lostItem, flight, message } = data;

  let subject: string;
  let html: string;

  try {
    switch (template) {
      case 'item-found':
        if (!email || !flight) throw new Error('Missing required data for item-found email');
        subject = 'Lost Item Found on Your Recent Flight';
        html = `
          <h1>Lost Item Found</h1>
          ${message ? `<p><strong>${message}</strong></p>` : ''}
          <p>A lost item has been found on flight ${flight.flightNumber}:</p>
          <ul>
            <li>Item: ${lostItem.itemName}</li>
            <li>Description: ${lostItem.itemDescription}</li>
            <li>Found at seat: ${lostItem.seat.seatNumber}</li>
          </ul>
          <p>If this is your item, please visit our lost and found desk with the following collection code:</p>
          <h2>${lostItem.collectionCode}</h2>
          ${lostItem.qrCodeUrl ? `<img src="${lostItem.qrCodeUrl}" alt="QR Code" />` : ''}
        `;
        await sendItemFoundEmail(email, lostItem, flight);
        break;
      
      case 'shipping-confirmation':
        if (!data.claim) throw new Error('Missing claim data for shipping-confirmation email');
        await sendShippingConfirmationEmail(data.claim, data.lostItem);
        break;
      
      case 'claim-approved':
        if (!data.claim) throw new Error('Missing claim data for claim-approved email');
        await sendClaimApprovedEmail(data.claim, data.lostItem);
        break;
      
      default:
        throw new Error(`Unknown email type: ${template}`);
    }
  } catch (error: any) {
    console.error('Failed to send email:', error);
    throw new Error(`Failed to send ${template} email: ${error.message}`);
  }
} 