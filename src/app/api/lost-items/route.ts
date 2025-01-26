import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Flight from '@/models/Flight';
import Seat from '@/models/Seat';
import LostItem from '@/models/LostItem';
import Notification from '@/models/Notification';
import { generateQRCode } from '@/lib/qrcode';
import { lostItemSchema } from '@/lib/validations/schemas';
import { analyzeImage } from '@/lib/groq';
import { uploadImage } from '@/lib/cloudinary';
import { sendEmail } from '@/lib/email/sendEmail';
import { generateToken } from '@/lib/token';

interface LostItemData {
  flight: string;
  seat: string;
  itemName: string;
  itemDescription: string;
  status: 'unclaimed' | 'claimed' | 'shipped';
  itemImageUrl?: string;
}

interface QueryParams {
  status?: string;
  flight?: string;
}

async function getRowPassengers(flight: any, seatNumber: string) {
  // Extract row number from seat number (e.g., "12A" -> "12")
  const rowNumber = seatNumber.match(/\d+/)?.[0];
  if (!rowNumber) return [];

  // Find all seats in the same row with customer emails
  const rowSeats = await Seat.find({
    flight: flight._id,
    seatNumber: new RegExp(`^${rowNumber}[A-Z]`),
    customerEmail: { $exists: true, $ne: null }
  }).sort({ seatNumber: 1 });

  console.log(`Found ${rowSeats.length} passengers in row ${rowNumber}`);
  return rowSeats;
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    // Parse the form data
    const formData = await req.formData();
    const itemName = formData.get('itemName') as string;
    const itemDescription = formData.get('itemDescription') as string;
    const flightNumber = formData.get('flightNumber') as string;
    const seatNumber = formData.get('seatNumber') as string;
    const itemImage = formData.get('itemImage') as File | null;

    // Find or create flight
    let flight = await Flight.findOne({ flightNumber });
    if (!flight) {
      flight = await Flight.create({
        flightNumber,
        originCode: 'TBD', // These would come from a flight lookup service
        destinationCode: 'TBD',
        departureTime: new Date(),
        arrivalTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
      });
    }

    // Find or create seat
    let seat = await Seat.findOne({
      flight: flight._id,
      seatNumber,
    });
    if (!seat) {
      seat = await Seat.create({
        flight: flight._id,
        seatNumber,
      });
    }

    // Prepare item data
    const itemData: LostItemData = {
      flight: flight._id.toString(),
      seat: seat._id.toString(),
      itemName,
      itemDescription,
      status: 'unclaimed',
    };

    // If image is provided, upload it and analyze it
    if (itemImage) {
      // Convert File to base64
      const buffer = await itemImage.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString('base64');

      // Upload to Cloudinary
      const imageUrl = await uploadImage(base64Image);
      itemData.itemImageUrl = imageUrl;

      // Analyze the image using Groq
      try {
        const imageAnalysis = await analyzeImage(base64Image);
        itemData.itemDescription = `${itemData.itemDescription}\n\nAI Analysis:\n${imageAnalysis.itemDescription}\nCondition: ${imageAnalysis.condition}\nCategory: ${imageAnalysis.category}${imageAnalysis.brand ? '\nBrand: ' + imageAnalysis.brand : ''}${imageAnalysis.color ? '\nColor: ' + imageAnalysis.color : ''}${imageAnalysis.size ? '\nSize: ' + imageAnalysis.size : ''}`;
      } catch (error) {
        console.error('Failed to analyze image:', error);
        // Continue without image analysis
      }
    }

    // Validate the data
    const validatedData = lostItemSchema.parse(itemData);

    // Generate a claim token when creating the item
    const claimToken = generateToken();
    const lostItem = await LostItem.create({
      ...validatedData,
      claimToken,
    });

    // Generate QR code using the claim token
    const qrCodeUrl = await generateQRCode(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/qr/${claimToken}`,
      {
        width: 400,
        margin: 4,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }
    );
    
    // Update the item with the QR code URL
    lostItem.qrCodeUrl = qrCodeUrl;
    await lostItem.save();

    // Populate flight data for email
    const populatedItem = await LostItem.findById(lostItem._id)
      .populate('flight')
      .populate('seat');

    // Find all passengers in the same row
    const rowPassengers = await getRowPassengers(flight, seatNumber);
    console.log(`Sending notifications to ${rowPassengers.length} passengers in the row`);

    // Send notifications to all passengers in the row
    for (const rowSeat of rowPassengers) {
      try {
        console.log(`Sending notification to passenger in seat ${rowSeat.seatNumber}`);
        
        // Create notification record
        await Notification.create({
          customerEmail: rowSeat.customerEmail,
          item: lostItem._id,
        });

        // Send email notification
        await sendEmail('item-found', {
          email: rowSeat.customerEmail,
          lostItem: {
            ...populatedItem.toObject(),
            qrCodeUrl,
            claimToken,
          },
          flight: populatedItem.flight,
          message: `An item was found near your seat (Row ${rowSeat.seatNumber.match(/\d+/)?.[0]}). If this might be yours, please follow the instructions below.`
        });

        console.log(`Successfully sent notification to ${rowSeat.customerEmail}`);
      } catch (error) {
        console.error(`Failed to send notification to ${rowSeat.customerEmail}:`, error);
        // Continue with other notifications even if one fails
      }
    }

    return NextResponse.json(lostItem, { status: 201 });
  } catch (error) {
    console.error('Error creating lost item:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create lost item' },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const flightNumber = searchParams.get('flightNumber');
    const search = searchParams.get('search');

    // Build query
    const query: QueryParams = {};
    if (status) query.status = status;

    // If flight number is provided, first find the flight
    if (flightNumber) {
      const flight = await Flight.findOne({ flightNumber });
      if (flight) {
        query.flight = flight._id.toString();
      } else {
        return NextResponse.json([]); // No flight found, so no items
      }
    }

    // Get items with populated references
    const items = await LostItem.find(query)
      .populate('flight')
      .populate('seat')
      .sort({ createdAt: -1 });

    // Include claimToken in the response
    const itemsWithUrls = items.map(item => ({
      ...item.toObject(),
      verifyUrl: `/verify/${item.claimToken}`,
      qrCodeUrl: `/api/qr/${item.claimToken}`
    }));

    // Apply search filter if provided
    const filteredItems = search
      ? itemsWithUrls.filter(item =>
          [
            item.itemName,
            item.itemDescription,
            item.flight.flightNumber,
            item.seat.seatNumber,
          ].some(field =>
            field?.toLowerCase().includes(search.toLowerCase())
          )
        )
      : itemsWithUrls;

    return NextResponse.json(filteredItems);
  } catch (error) {
    console.error('Error fetching lost items:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch lost items' },
      { status: 500 }
    );
  }
} 