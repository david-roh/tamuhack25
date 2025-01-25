import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Flight from '@/models/Flight';
import { validateRequest } from '@/lib/middleware';
import { flightSchema } from '@/lib/validations/schemas';

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const validation = await validateRequest(req, flightSchema);
    if (!validation.success) {
      return validation.error;
    }

    const flight = await Flight.create(validation.data);
    return NextResponse.json(flight, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const flightNumber = searchParams.get('flightNumber');
    
    const query: any = {};
    if (flightNumber) query.flightNumber = flightNumber;

    const flights = await Flight.find(query).sort({ departureTime: -1 });
    return NextResponse.json(flights);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
} 