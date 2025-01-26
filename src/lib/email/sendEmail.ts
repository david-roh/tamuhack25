import { resend, emailConfig } from './config';
import {
  generateItemFoundEmail,
  generateShippingConfirmationEmail,
  generateClaimApprovedEmail,
} from './templates';
import { LostItem } from '@/models/LostItem';
import { Claim } from '@/models/Claim';
import { generateQRCode } from '@/lib/qrcode';

interface ItemFoundEmailData {
  email: string;
  lostItem: any;
  flight: any;
  message?: string;
}

export async function sendEmail(
  template: 'item-found' | 'shipping-confirmation' | 'claim-approved',
  data: ItemFoundEmailData
) {
  const { email, lostItem, flight, message } = data;

  try {
    switch (template) {
      case 'item-found': {
        if (!email || !flight) throw new Error('Missing required data for item-found email');
        
        const qrCodeUrl = await generateQRCode(
          `${process.env.NEXT_PUBLIC_BASE_URL}/qr/${lostItem.claimToken}`,
          {
            width: 400,
            margin: 4,
            color: {
              dark: '#000000',
              light: '#ffffff',
            },
          }
        );

        const subject = 'Lost Item Found on Your Recent Flight';
        const html = `
          <h1>Lost Item Found</h1>
          ${message ? `<p><strong>${message}</strong></p>` : ''}
          <p>A lost item has been found on flight ${flight.flightNumber}:</p>
          <ul>
            <li>Item: ${lostItem.itemName}</li>
            <li>Description: ${lostItem.itemDescription}</li>
            <li>Found at seat: ${lostItem.seat?.seatNumber || 'Unknown'}</li>
          </ul>
          <p>If this is your item, please visit our lost and found desk with the following collection code:</p>
          <h2>${lostItem.collectionCode || 'N/A'}</h2>
          <div style="text-align: center; margin: 20px 0;">
            <img src="${qrCodeUrl}" alt="QR Code" style="max-width: 300px;" />
            <p style="margin-top: 10px;">Scan this QR code to claim your item</p>
          </div>
        `;

        console.log('Sending email with:', {
          from: emailConfig.from,
          to: email,
          subject,
        });

        const result = await resend.emails.send({
          from: emailConfig.from,
          to: email,
          subject,
          html,
        });

        console.log('Email send result:', result);
        return result;
      }
      
      case 'shipping-confirmation':
      case 'claim-approved':
        throw new Error('Template not implemented yet');
      
      default:
        throw new Error(`Unknown email type: ${template}`);
    }
  } catch (error: any) {
    console.error('Failed to send email:', error);
    throw new Error(`Failed to send ${template} email: ${error.message}`);
  }
} 