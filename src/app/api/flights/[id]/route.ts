import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Flight from '@/models/Flight';
import Seat from '@/models/Seat';
import LostItem from '@/models/LostItem';
import { validateRequest } from '@/lib/middleware';
import { partialFlightSchema } from '@/lib/validations/schemas';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const flight = await Flight.findById(params.id);

    if (!flight) {
      return NextResponse.json(
        { error: 'Flight not found' },
        { status: 404 }
      );
    }

    // Get associated seats and lost items
    const seats = await Seat.find({ flight: params.id });
    const lostItems = await LostItem.find({ flight: params.id })
      .populate('seat');

    return NextResponse.json({
      ...flight.toJSON(),
      seats,
      lostItems,
    });
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
    
    const validation = await validateRequest(req, partialFlightSchema);
    if (!validation.success) {
      return validation.error;
    }
    
    const flight = await Flight.findByIdAndUpdate(
      params.id,
      { ...validation.data },
      { new: true, runValidators: true }
    );

    if (!flight) {
      return NextResponse.json(
        { error: 'Flight not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(flight);
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
    
    // Check for associated lost items
    const hasLostItems = await LostItem.exists({ flight: params.id });
    if (hasLostItems) {
      return NextResponse.json(
        { error: 'Cannot delete flight with associated lost items' },
        { status: 400 }
      );
    }

    // Delete associated seats first
    await Seat.deleteMany({ flight: params.id });
    
    // Delete the flight
    const flight = await Flight.findByIdAndDelete(params.id);

    if (!flight) {
      return NextResponse.json(
        { error: 'Flight not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Flight and associated seats deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
} 