import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LostItem from '@/models/LostItem';
import { validateRequest } from '@/lib/middleware';
import { partialLostItemSchema } from '@/lib/validations/schemas';
import { uploadImage, deleteImage } from '@/lib/cloudinary';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;
    console.log('Fetching item with id/token:', id);
    
    // Try to find item by either ObjectId or claimToken
    const item = await LostItem.findOne({
      $or: [
        // Check if id is a valid ObjectId first
        { _id: mongoose.isValidObjectId(id) ? id : null },
        { claimToken: id }
      ]
    }).populate('flight').populate('seat');

    console.log('Found item:', item);

    if (!item) {
      return NextResponse.json(
        { error: 'Lost item not found' },
        { status: 404 }
      );
    }

    // Return the item data
    return NextResponse.json({
      item,
      status: item.status
    });
  } catch (error: any) {
    console.error('Error fetching item:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
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
    let updateData = { ...body };

    // If new image is provided, upload it
    if (body.image) {
      // Get the current item to delete old image if exists
      const currentItem = await LostItem.findById(id);
      if (currentItem?.itemImageUrl) {
        await deleteImage(currentItem.itemImageUrl);
      }

      // Upload new image
      const imageUrl = await uploadImage(body.image);
      updateData.itemImageUrl = imageUrl;
      delete updateData.image;
    }

    const validation = await validateRequest(
      { ...req, json: () => Promise.resolve(updateData) },
      partialLostItemSchema
    );
    if (!validation.success) {
      return validation.error;
    }
    
    const item = await LostItem.findByIdAndUpdate(
      id,
      { ...validation.data },
      { new: true, runValidators: true }
    ).populate('flight').populate('seat');

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