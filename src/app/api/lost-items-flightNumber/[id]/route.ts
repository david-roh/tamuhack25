import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LostItem from '@/models/LostItem';
import Flight from '@/models/Flight'

export async function GET(
  request: Request, { params }: { params: { id: string } }
) {
  try {
    const { id } = await params // doesn't actually do anything but get rid of error
    // console.log("Hit endpoint for lost-items-flightNumber: ", id)
    await dbConnect();
    // const items = await LostItem.find({ flight: id })
    // Find the Flight document
    const flight = await Flight.findOne({ flightNumber: id });
    if (!flight) {
      throw new Error("Flight not found");
    }

    // Query LostItem with the Flight _id
    const items = await LostItem.find({ flight: flight._id });

    // const filteredItems = items.filter(item => item.flight !== null); // Filter out null results
    // const items = await LostItem.find({ flight: id }).populate('flight')

    console.log(items);
    if (!items) {
      return NextResponse.json(
        { error: 'Lost item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}