import { NextResponse } from 'next/server';
import { analyzeImage } from '@/lib/groq';
import { z } from 'zod';

const requestSchema = z.object({
  image: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image } = requestSchema.parse(body);

    const analysis = await analyzeImage(image);
    
    return NextResponse.json(analysis);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to analyze image' },
      { status: 500 }
    );
  }
} 