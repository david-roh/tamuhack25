import { Groq } from 'groq-sdk';
import { z } from 'zod';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

// Schema for item description from image
const imageAnalysisSchema = z.object({
  itemName: z.string(),
  itemDescription: z.string(),
  condition: z.string(),
  category: z.string(),
  color: z.string().optional(),
  brand: z.string().optional(),
  size: z.string().optional(),
});

export type ImageAnalysis = z.infer<typeof imageAnalysisSchema>;

export async function analyzeImage(imageBase64: string): Promise<ImageAnalysis> {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze the image of a lost item found on a plane and provide details in JSON format, including itemName, itemDescription, condition, category (e.g., electronics, clothing, personal items), and optional fields like color, brand, and size.',
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    model: 'llama-3.2-90b-vision-preview',
    temperature: 0.1,
    max_tokens: 500,
    response_format: { type: 'json_object' },
  });

  const result = imageAnalysisSchema.parse(JSON.parse(completion.choices[0]?.message?.content || '{}'));
  return result;
}

// Schema for transcription result
const transcriptionSchema = z.object({
  text: z.string(),
  language: z.string().optional(),
  duration: z.number().optional(),
});

export type TranscriptionResult = z.infer<typeof transcriptionSchema>;

export async function transcribeAudio(audioFile: Buffer): Promise<TranscriptionResult> {
  const file = new File([audioFile], 'audio.wav', { type: 'audio/wav' });

  const transcription = await groq.audio.transcriptions.create({
    file,
    model: 'distil-whisper-large-v3-en',
    response_format: 'json',
    language: 'en',
    temperature: 0.0,
  });

  const result = transcriptionSchema.parse(transcription);
  return result;
}

// Extract structured data from text description
export async function extractItemDetails(text: string): Promise<Partial<ImageAnalysis>> {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: `Extract structured information about lost items from this description: ${text}`,
      },
    ],
    model: 'llama-3.3-70b-specdec',
    temperature: 0.3,
    max_tokens: 500,
    response_format: { type: 'json_object' },
  });

  const result = imageAnalysisSchema.partial().parse(JSON.parse(completion.choices[0]?.message?.content || '{}'));
  return result;
}

// Schema for image title
const imageTitleSchema = z.object({
  title: z.string(),
});

export type ImageTitle = z.infer<typeof imageTitleSchema>;

export async function generateImageTitle(imageBase64: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Generate a concise but descriptive title (3-5 words) for this item. Note this is a title for a lost item, so it should be concise and descriptive. Respond in JSON format with a single "title" field.',
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    model: 'llama-3.2-90b-vision-preview',
    temperature: 0.1,
    max_tokens: 100,
    response_format: { type: 'json_object' },
  });

  const result = imageTitleSchema.parse(JSON.parse(completion.choices[0]?.message?.content || '{}'));
  return result.title;
}