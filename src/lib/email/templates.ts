interface ItemFoundEmailData {
  customerName?: string;
  flightNumber: string;
  itemName: string;
  itemDescription: string;
  claimUrl: string;
  qrCodeUrl: string;
}

interface ShippingConfirmationData {
  customerName?: string;
  itemName: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  shippingAddress: string;
}

interface ClaimApprovedData {
  customerName?: string;
  itemName: string;
  claimMethod: 'in-person' | 'shipped';
  pickupLocation?: string;
  paymentLink?: string;
}

export function generateItemFoundEmail({
  customerName,
  flightNumber,
  itemName,
  itemDescription,
  claimUrl,
  qrCodeUrl,
}: ItemFoundEmailData): { subject: string; html: string } {
  const subject = `Lost Item Found - Flight ${flightNumber}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Lost Item Found</h2>
      ${customerName ? `<p>Dear ${customerName},</p>` : '<p>Hello,</p>'}
      
      <p>We found an item that might belong to you on flight ${flightNumber}.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #2c3e50; margin-top: 0;">Item Details:</h3>
        <p><strong>Item:</strong> ${itemName}</p>
        <p><strong>Description:</strong> ${itemDescription}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <img src="${qrCodeUrl}" alt="QR Code" style="max-width: 200px;"/>
        <p style="color: #666; font-size: 14px;">Scan QR code to claim</p>
      </div>

      <div style="text-align: center;">
        <a href="${claimUrl}" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Claim Item
        </a>
      </div>

      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        If you didn't lose an item on this flight, please disregard this email.
      </p>
    </div>
  `;

  return { subject, html };
}

export function generateShippingConfirmationEmail({
  customerName,
  itemName,
  trackingNumber,
  estimatedDelivery,
  shippingAddress,
}: ShippingConfirmationData): { subject: string; html: string } {
  const subject = 'Your Lost Item is On Its Way';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Shipping Confirmation</h2>
      ${customerName ? `<p>Dear ${customerName},</p>` : '<p>Hello,</p>'}
      
      <p>Your lost item (${itemName}) has been shipped and is on its way to you!</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #2c3e50; margin-top: 0;">Shipping Details:</h3>
        ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
        ${estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>` : ''}
        <p><strong>Shipping Address:</strong><br/>${shippingAddress.replace(/\\n/g, '<br/>')}</p>
      </div>

      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        If you have any questions about your shipment, please reply to this email.
      </p>
    </div>
  `;

  return { subject, html };
}

export function generateClaimApprovedEmail({
  customerName,
  itemName,
  claimMethod,
  pickupLocation,
  paymentLink,
}: ClaimApprovedData): { subject: string; html: string } {
  const subject = 'Lost Item Claim Approved';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Claim Approved</h2>
      ${customerName ? `<p>Dear ${customerName},</p>` : '<p>Hello,</p>'}
      
      <p>Your claim for the lost item (${itemName}) has been approved!</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #2c3e50; margin-top: 0;">Next Steps:</h3>
        ${claimMethod === 'in-person' 
          ? `<p>You can pick up your item at:<br/>${pickupLocation}</p>`
          : `<p>To proceed with shipping, please complete the payment using the link below:</p>
             <div style="text-align: center; margin-top: 20px;">
               <a href="${paymentLink}" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
                 Complete Payment
               </a>
             </div>`
        }
      </div>

      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        If you have any questions, please don't hesitate to contact us.
      </p>
    </div>
  `;

  return { subject, html };
} 