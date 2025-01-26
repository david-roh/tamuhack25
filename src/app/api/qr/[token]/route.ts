import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LostItem from '@/models/LostItem';
import Flight from '@/models/Flight';
import Seat from '@/models/Seat';
import { z } from 'zod'; // Add validation
import { timingSafeEqual } from 'crypto';
import AuditLog from '@/models/AuditLog';

// Validation schema for verification code
const verificationSchema = z.object({
  verificationCode: z.string().min(6).max(8)
});

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    await dbConnect();
    const { token } = params;

    const lostItem = await LostItem.findOne({ 
      claimToken: token
    })
      .populate({
        path: 'flight',
        model: Flight,
        select: 'flightNumber originCode destinationCode departureTime'
      })
      .populate({
        path: 'seat',
        model: Seat,
        select: 'seatNumber'
      })
      .lean(); // Add lean() to convert to plain object

    if (!lostItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Transform shippingDetails to match the frontend interface
    if (lostItem.status === 'shipped' && lostItem.shippingDetails) {
      lostItem.shipping = {
        address: lostItem.shippingDetails.address,
        city: lostItem.shippingDetails.city,
        state: lostItem.shippingDetails.state,
        postalCode: lostItem.shippingDetails.postalCode,
        country: lostItem.shippingDetails.country,
        trackingNumber: lostItem.shippingDetails.trackingNumber
      };
    }

    // Add audit log
    await AuditLog.create({
      action: 'item_viewed',
      itemId: lostItem._id,
      token,
      timestamp: new Date()
    });

    return NextResponse.json(lostItem);
  } catch (error) {
    console.error('Error processing QR code:', error);
    return NextResponse.json(
      { error: 'Failed to process QR code' },
      { status: 500 }
    );
  }
}

// For in-person collection verification
export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    await dbConnect();
    const { token } = await params;
    
    // Validate request body
    const body = await req.json();
    const { verificationCode } = verificationSchema.parse(body);
    
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

    // Convert strings to Buffers for timing-safe comparison
    const codeBuffer = Buffer.from(lostItem.collectionCode);
    const inputBuffer = Buffer.from(verificationCode);

    // Verify the collection code with timing-safe comparison
    if (
      codeBuffer.length !== inputBuffer.length || 
      !timingSafeEqual(codeBuffer, inputBuffer)
    ) {
      // Add failed attempt to audit log
      await AuditLog.create({
        action: 'verification_failed',
        itemId: lostItem._id,
        token,
        verificationCode,
        timestamp: new Date()
      });

      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Update item status
    lostItem.status = 'claimed';
    lostItem.claimedAt = new Date();
    await lostItem.save();

    // Add successful claim to audit log
    await AuditLog.create({
      action: 'item_claimed',
      itemId: lostItem._id,
      token,
      timestamp: new Date()
    });

    return NextResponse.json({
      message: 'Item collected successfully',
      item: lostItem,
    });
  } catch (error) {
    console.error('Error verifying collection:', error);
    return NextResponse.json(
      { error: 'Failed to verify collection' },
      { status: 500 }
    );
  }
} 