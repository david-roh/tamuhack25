import { resend, emailConfig } from './config';
import { itemFoundTemplate } from './templates/itemFound';

interface EmailData {
  email: string;
  lostItem: {
    itemName: string;
    itemDescription: string;
    claimToken: string;
    collectionCode: string;
    qrCodeUrl: string;
  };
  flight: {
    flightNumber: string;
    originCode: string;
    destinationCode: string;
  };
  message: string;
  options?: {
    collect?: {
      code: string;
      verifyUrl: string;
    };
    shipping?: {
      url: string;
      cost: string;
    };
  };
}

export async function sendEmail(template: 'item-found', data: EmailData) {
  try {
    const { from, replyTo } = emailConfig;

    const emailContent = itemFoundTemplate(data);

    const response = await resend.emails.send({
      from,
      replyTo,
      to: data.email,
      subject: `Lost Item Found - ${data.lostItem.itemName}`,
      html: emailContent,
    });

    return response;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
} 