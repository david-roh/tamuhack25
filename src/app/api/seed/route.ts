import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Flight from '@/models/Flight';
import Seat from '@/models/Seat';
import LostItem from '@/models/LostItem';
import QRCode from 'qrcode';
import { generateToken } from "@/lib/utils";

// Fix error typing
interface SeedError extends Error {
  message: string;
}

export async function POST() {
  try {
    await dbConnect();

    // Clear existing data
    await Promise.all([
      Flight.deleteMany({}),
      Seat.deleteMany({}),
      LostItem.deleteMany({})
    ]);

    // Create a default flight for our seats
    const defaultFlight = await Flight.create({
      flightNumber: 'BA999',
      origin: 'London',
      destination: 'New York',
      originCode: 'LHR',
      destinationCode: 'JFK',
      date: new Date(),
      departureTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
      arrivalTime: new Date(new Date().getTime() + 8 * 60 * 60 * 1000),
    });

    // Create sample flights
    const flights = await Flight.create([
      {
        flightNumber: 'BA123',
        origin: 'London',
        destination: 'Paris',
        originCode: 'LHR',
        destinationCode: 'CDG',
        date: new Date(),
        departureTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
        arrivalTime: new Date(new Date().getTime() + 4 * 60 * 60 * 1000),
      },
      {
        flightNumber: 'BA456',
        origin: 'Paris',
        destination: 'London',
        originCode: 'CDG',
        destinationCode: 'LHR',
        date: new Date(),
        departureTime: new Date(new Date().getTime() + 6 * 60 * 60 * 1000),
        arrivalTime: new Date(new Date().getTime() + 8 * 60 * 60 * 1000),
      }
    ]);

    // Create sample seats for each flight
    const seats = [];
    for (const flight of flights) {
      const flightSeats = await Seat.create([
        { seatNumber: '12A', flight: flight._id, customerEmail: 'david.roh@tamu.edu' },
        { seatNumber: '12B', flight: flight._id, customerEmail: 'david.roh@tamu.edu' },
        { seatNumber: '14C', flight: flight._id, customerEmail: 'david.roh@tamu.edu' }
      ]);
      seats.push(...flightSeats);
    }

    // Create sample lost items
    const lostItems = await LostItem.create([
      {
        itemName: 'Dell XPS Laptop',
        description: 'Black laptop with stickers on the lid',
        category: 'Electronics',
        status: 'unclaimed',
        flight: flights[0]._id,
        seat: seats[0]._id,
        foundAt: new Date(),
        collectionCode: '123456'
      },
      {
        itemName: 'Nike Backpack',
        description: 'Blue backpack with white logo',
        category: 'Bags',
        status: 'unclaimed',
        flight: flights[0]._id,
        seat: seats[1]._id,
        foundAt: new Date(),
        collectionCode: '789012'
      },
      {
        itemName: 'Folding Umbrella',
        description: 'Red compact umbrella with automatic opening',
        category: 'Accessories',
        status: 'claimed',
        flight: flights[1]._id,
        seat: seats[3]._id,
        foundAt: new Date(),
        claimedAt: new Date(),
        collectionCode: '345678'
      }
    ]);

    // Generate QR codes for unclaimed items
    const qrCodes = await Promise.all(
      lostItems
        .filter(item => item.status === 'unclaimed')
        .map(async (item) => {
          const qrUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/qr/${item._id}`;
          const qrDataUrl = await QRCode.toDataURL(qrUrl);
          return {
            itemName: item.itemName,
            qrCode: qrDataUrl,
            collectionCode: item.collectionCode
          };
        })
    );

    // Generate 10 sample seats with proper tokens
    const seatData = [];
    const tokenSeats = [];
    for (let i = 1; i <= 10; i++) {
      const token = generateToken();
      const seat = {
        seatNumber: `${i}A`,
        token: token,
        status: "available",
        flight: defaultFlight._id,
        customerEmail: 'david.roh@tamu.edu'
      };
      tokenSeats.push(seat);
      seatData.push({
        seatNumber: seat.seatNumber,
        token: seat.token,
        qrCodeUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/qr/${seat.token}`,
        customerEmail: 'david.roh@tamu.edu'
      });
    }

    await Seat.insertMany(tokenSeats);

    return NextResponse.json({
      message: 'Database seeded successfully',
      data: {
        flights: flights.length + 1, // Include default flight
        seats: seats.length + tokenSeats.length,
        lostItems: lostItems.length,
        qrCodes,
        seatData
      }
    });
  } catch (error: SeedError) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error.message },
      { status: 500 }
    );
  }
} 