import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function validateRequest<T>(
  req: Request,
  schema: z.Schema<T>
): Promise<{ success: true; data: T } | { success: false; error: NextResponse }> {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors,
          },
          { status: 400 }
        ),
      };
    }
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      ),
    };
  }
} 