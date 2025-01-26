import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LostItemReport from '@/models/LostItemReport';
import LostItem from '@/models/LostItem';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();
    
    const report = await LostItemReport.create(data);
    
    // Try to find matching lost items
    const matchingItems = await LostItem.find({
      flight: data.flight,
      status: 'unclaimed',
    });
    
    if (matchingItems.length > 0) {
      await LostItemReport.findByIdAndUpdate(report._id, {
        status: 'matched',
      });
    }

    return NextResponse.json({
      report,
      matchingItems,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const customerEmail = searchParams.get('customerEmail');
    const status = searchParams.get('status');
    
    const query: any = {};
    if (customerEmail) query.customerEmail = customerEmail;
    if (status) query.status = status;

    const reports = await LostItemReport.find(query)
      .populate('flight')
      .sort({ createdAt: -1 });
      
    return NextResponse.json(reports);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
} 