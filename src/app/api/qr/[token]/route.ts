import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LostItem from '@/models/LostItem';
import Flight from '@/models/Flight';
import Seat from '@/models/Seat';

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    // Connect to database first
    await dbConnect();

    // Get token from params
    const token = String(params.token);

    // Find the lost item and populate references
    const lostItem = await LostItem.findOne({ claimToken: token })
      .populate({
        path: 'flight',
        model: Flight
      })
      .populate({
        path: 'seat',
        model: Seat
      });

    if (!lostItem) {
      return NextResponse.json(
        { error: 'Lost item not found' },
        { status: 404 }
      );
    }

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
    const { verificationCode } = await req.json();
    const token = String(params.token);
    
    const lostItem = await LostItem.findOne({ claimToken: token });

    if (!lostItem) {
      return NextResponse.json(
        { error: 'Invalid or expired QR code' },
        { status: 404 }
      );
    }

    // Verify the collection code
    if (lostItem.collectionCode !== verificationCode) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Update item status to claimed
    lostItem.status = 'claimed';
    lostItem.claimedAt = new Date();
    await lostItem.save();

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