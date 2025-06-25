// src/app/api/clean/route.ts
import { NextResponse } from 'next/server';
import { CleanApiPayload, CleanApiResponse } from '@/services/api';

export async function POST(request: Request) {
  const body: CleanApiPayload = await request.json();

  // Mock processing: just return the same images
  // In a real scenario, the backend would clean them.
  const cleaned_images = body.images.map(image => ({
    ...image,
    // Optional: you could add a filter effect via canvas to simulate cleaning
  }));

  const response: CleanApiResponse = { cleaned_images };

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return NextResponse.json(response);
}