import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set in environment variables');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const emailConfig = {
  from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@yourdomain.com',
};

console.log('Email config loaded:', {
  from: emailConfig.from,
  replyTo: emailConfig.replyTo,
  apiKeyExists: !!process.env.RESEND_API_KEY
}); 