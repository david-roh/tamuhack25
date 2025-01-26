import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/sendEmail';

export async function GET() {
  try {
    await sendEmail('item-found', {
      email: 'david.roh@tamu.edu', // Test email
      lostItem: {
        itemName: 'Test Item',
        itemDescription: 'Test Description',
        seat: { seatNumber: '12A' },
      },
      flight: {
        flightNumber: 'TEST123',
      },
      message: 'This is a test email',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 });
  }
} 