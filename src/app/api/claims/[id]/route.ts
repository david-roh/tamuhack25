import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Claim from '@/models/Claim';
import LostItem from '@/models/LostItem';
import { validateRequest } from '@/lib/middleware';
import { partialClaimSchema } from '@/lib/validations/schemas';
import { sendEmail } from '@/lib/email/sendEmail';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const claim = await Claim.findById(params.id)
      .populate({
        path: 'item',
        populate: ['flight', 'seat']
      });

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(claim);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const validation = await validateRequest(req, partialClaimSchema);
    if (!validation.success) {
      return validation.error;
    }
    
    const claim = await Claim.findByIdAndUpdate(
      params.id,
      { ...validation.data },
      { new: true, runValidators: true }
    ).populate({
      path: 'item',
      populate: ['flight', 'seat']
    });

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    // If payment status is updated to completed and claim method is shipped
    if (validation.data.paymentStatus === 'completed' && claim.claimMethod === 'shipped') {
      // Update lost item status
      await LostItem.findByIdAndUpdate(claim.item._id, {
        status: 'shipped'
      });

      // Send shipping confirmation email
      await sendEmail('shipping-confirmation', {
        claim,
        lostItem: claim.item,
      });
    }

    return NextResponse.json(claim);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const claim = await Claim.findById(params.id);

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    // Reset the lost item status to unclaimed
    await LostItem.findByIdAndUpdate(claim.item, {
      status: 'unclaimed',
      claimedAt: null
    });

    // Delete the claim
    await claim.deleteOne();

    return NextResponse.json({ message: 'Claim deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
} 