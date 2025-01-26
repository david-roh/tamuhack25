import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LostItem from '@/models/LostItem';
import { validateRequest } from '@/lib/middleware';
import { partialLostItemSchema } from '@/lib/validations/schemas';
import { uploadImage, deleteImage } from '@/lib/cloudinary';
import Flight from '@/models/Flight';
import Seat from '@/models/Seat';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    console.log('Fetching item with id/token:', id);

    // Try to find by claim token first
    let lostItem = await LostItem.findOne({ claimToken: id })
      .populate({
        path: 'flight',
        model: Flight,
        select: 'flightNumber originCode destinationCode departureTime arrivalTime'
      })
      .populate({
        path: 'seat',
        model: Seat,
        select: 'seatNumber customerEmail'
      })
      .lean();

    // If not found by token and id is valid ObjectId, try finding by _id
    if (!lostItem && mongoose.isValidObjectId(id)) {
      lostItem = await LostItem.findById(id)
        .populate({
          path: 'flight',
          model: Flight,
          select: 'flightNumber originCode destinationCode departureTime arrivalTime'
        })
        .populate({
          path: 'seat',
          model: Seat,
          select: 'seatNumber customerEmail'
        })
        .lean();
    }

    if (!lostItem) {
      console.log('Item not found');
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    console.log('Found item:', lostItem);

    // Return the item directly without wrapping it
    return NextResponse.json(lostItem);
  } catch (error) {
    console.error('Error fetching lost item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const body = await req.json();
    // console.log("Body", body)
    let updateData = { ...body };

    // If new image is provided, upload it
    if (body.image) {
      // Get the current item to delete old image if exists
      const currentItem = await LostItem.findById(id);
      if (currentItem?.itemImageUrl) {
        await deleteImage(currentItem.itemImageUrl);
      }
    }

    // If new image is provided, upload it
    // if (body.image) {
    //   // Get the current item to delete old image if exists
    //   const currentItem = await LostItem.findById(body._id);
    //   if (currentItem?.itemImageUrl) {
    //     await deleteImage(currentItem.itemImageUrl);
    //   }

    //   // Upload new image
    //   const imageUrl = await uploadImage(body.image);
    //   updateData.itemImageUrl = imageUrl;
    //   delete updateData.image;
    // }

    const validation = await validateRequest(
      { ...req, json: () => Promise.resolve(updateData) },
      partialLostItemSchema
    );
    if (!validation.success) { // make sure items have names and follow schema guidelines defined by partialLostItemSchema
      // console.log("No Validation")
      // console.log(validation.error)
      // console.log(updateData);
      // console.log("--------------------------------------------------------------------------------------------------------")
      return validation.error;
    }

    // console.log(body);

    const item = await LostItem.findByIdAndUpdate(
      id,
      { ...validation.data },
      { new: true, runValidators: true }
    )

    if (!item) {
      return NextResponse.json(
        { error: 'Lost item not found' },
        { status: 404 }
      );
    }

    // console.log("JSON WORKED ------------------")
    return NextResponse.json(item);
  } catch (error: any) {
    // console.log("JSON DIDN'T WORK ---------------------------")
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const item = await LostItem.findById(id);

    if (!item) {
      return NextResponse.json(
        { error: 'Lost item not found' },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary if exists
    if (item.itemImageUrl) {
      await deleteImage(item.itemImageUrl);
    }

    await item.deleteOne();

    return NextResponse.json({ message: 'Lost item deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
} 