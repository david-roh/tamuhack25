import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LostItem from '@/models/LostItem';
import { z } from 'zod';
import { createPaymentIntent, confirmPayment } from '@/lib/payment';
import AuditLog from '@/models/AuditLog';

// Validation schema for shipping details
const shippingSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4),
  country: z.string().min(2)
});

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    await dbConnect();
    const { token } = await params;
    
    // Validate request body
    const body = await req.json();
    const shippingDetails = shippingSchema.parse(body);
    
    // Create payment intent
    const paymentIntent = await createPaymentIntent(999); // $9.99
    
    // Confirm payment
    await confirmPayment(paymentIntent.id);

    const lostItem = await LostItem.findOne({ 
      claimToken: token,
      status: 'unclaimed'
    });

    if (!lostItem) {
      return NextResponse.json(
        { error: 'Item not found or already claimed' },
        { status: 404 }
      );
    }

    // Update item status and add shipping details
    lostItem.status = 'shipped';
    lostItem.shippingDetails = {
      ...shippingDetails,
      paymentIntentId: paymentIntent.id
    };
    lostItem.shippedAt = new Date();
    await lostItem.save();

    // Add shipping log
    await AuditLog.create({
      action: 'item_shipped',
      itemId: lostItem._id,
      token,
      shippingDetails,
      timestamp: new Date()
    });

    return NextResponse.json({
      message: 'Shipping request processed successfully',
      item: lostItem,
    });
  } catch (error) {
    console.error('Error processing shipping:', error);
    return NextResponse.json(
      { error: 'Failed to process shipping request' },
      { status: 500 }
    );
  }
} 