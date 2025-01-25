import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LostItem from '@/models/LostItem';

type Params = { params: { token: string } };

export async function GET(
  req: Request,
  context: Params
) {
  try {
    await dbConnect();
    
    // Properly await the params object and its properties
    const params = await context.params;
    const token = await params.token;
    
    const lostItem = await LostItem.findById(token)
      .populate('flight')
      .populate('seat');

    if (!lostItem) {
      return NextResponse.json(
        { error: 'Invalid or expired QR code' },
        { status: 404 }
      );
    }

    // Check if item is already claimed
    if (lostItem.status !== 'unclaimed') {
      return NextResponse.json(
        { error: 'Item has already been claimed', status: lostItem.status },
        { status: 400 }
      );
    }

    return NextResponse.json({
      item: lostItem,
      claimUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/claim/${lostItem._id}`,
    });
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
  context: Params
) {
  try {
    await dbConnect();
    const { verificationCode } = await req.json();
    
    // Properly await the params object and its properties
    const params = await context.params;
    const token = await params.token;
    
    const lostItem = await LostItem.findById(token);

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