import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/sendEmail';

export async function GET() {
  try {
    const result = await sendEmail('item-found', {
      email: 'dajero0120+git@gmail.com',
      lostItem: {
        itemName: 'Test Item',
        itemDescription: 'Test Description',
        seat: { seatNumber: '12A' },
        collectionCode: 'TEST123',
        qrCodeUrl: null,
      },
      flight: {
        flightNumber: 'TEST123',
      },
      message: 'This is a test email',
    });

    console.log('Email send result:', result);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to send test email',
        details: error
      }, 
      { status: 500 }
    );
  }
} 