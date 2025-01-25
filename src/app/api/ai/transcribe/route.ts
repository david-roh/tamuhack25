import { NextResponse } from 'next/server';
import { transcribeAudio, extractItemDetails } from '@/lib/groq';
import { z } from 'zod';

const requestSchema = z.object({
  audio: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { audio } = requestSchema.parse(body);

    // First, transcribe the audio
    const transcription = await transcribeAudio(audio);
    
    // Then, extract structured information from the transcription
    const itemDetails = await extractItemDetails(transcription.text);
    
    return NextResponse.json({
      transcription,
      itemDetails,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to process audio' },
      { status: 500 }
    );
  }
} 