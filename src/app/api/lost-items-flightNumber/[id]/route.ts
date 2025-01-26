import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LostItem from '@/models/LostItem';

export async function GET(
  request: Request, { params }: { params: { id: string } }
) {
  try {
    console.log("Hit endpoint")
    const { id } = await params // doesn't actually do anything but get rid of error
    await dbConnect();
    const item = await LostItem.find({ flight: id })
    if (!item) {
      return NextResponse.json(
        { error: 'Lost item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}