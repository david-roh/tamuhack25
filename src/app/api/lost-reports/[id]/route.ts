import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LostItemReport from '@/models/LostItemReport';
import LostItem from '@/models/LostItem';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const report = await LostItemReport.findById(params.id)
      .populate('flight');

    if (!report) {
      return NextResponse.json(
        { error: 'Lost item report not found' },
        { status: 404 }
      );
    }

    // Get potential matching items
    const matchingItems = await LostItem.find({
      flight: report.flight,
      status: 'unclaimed',
    }).populate('seat');

    return NextResponse.json({
      report,
      matchingItems,
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
    const data = await req.json();
    
    const report = await LostItemReport.findByIdAndUpdate(
      params.id,
      { ...data },
      { new: true, runValidators: true }
    ).populate('flight');

    if (!report) {
      return NextResponse.json(
        { error: 'Lost item report not found' },
        { status: 404 }
      );
    }

    // If status is being updated to 'matched', verify matching items exist
    if (data.status === 'matched') {
      const matchingItems = await LostItem.find({
        flight: report.flight,
        status: 'unclaimed',
      });

      if (matchingItems.length === 0) {
        return NextResponse.json(
          { error: 'Cannot mark as matched: no matching unclaimed items found' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(report);
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
    const report = await LostItemReport.findByIdAndDelete(params.id);

    if (!report) {
      return NextResponse.json(
        { error: 'Lost item report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Lost item report deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
} 