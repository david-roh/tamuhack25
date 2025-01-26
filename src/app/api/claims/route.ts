import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Claim from '@/models/Claim';
import LostItem from '@/models/LostItem';
import { validateRequest } from '@/lib/middleware';
import { claimSchema } from '@/lib/validations/schemas';
import { sendEmail } from '@/lib/email/sendEmail';

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const validation = await validateRequest(req, claimSchema);
    if (!validation.success) {
      return validation.error;
    }
    
    // Create the claim
    const claim = await Claim.create(validation.data);
    
    // Update the lost item status
    const lostItem = await LostItem.findByIdAndUpdate(
      validation.data.item,
      {
        status: 'claimed',
        claimedAt: new Date(),
      },
      { new: true }
    );

    if (!lostItem) {
      throw new Error('Lost item not found');
    }

    // Send claim approval email
    await sendEmail('claim-approved', {
      claim,
      lostItem,
    });

    return NextResponse.json(claim, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const customerEmail = searchParams.get('customerEmail');
    
    const query: any = {};
    if (customerEmail) query.customerEmail = customerEmail;

    const claims = await Claim.find(query)
      .populate('item')
      .sort({ createdAt: -1 });
      
    return NextResponse.json(claims);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
} 