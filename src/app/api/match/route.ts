// src/app/api/match/route.ts
import { NextResponse } from 'next/server';
import { MatchApiResponse } from '@/services/api';

export async function POST(request: Request) {
  // In a real app, you'd receive and process two images
  // const body = await request.json();

  // Mock processing: return a random result
  const score = Math.random();
  const result: MatchApiResponse = {
    match: score > 0.75 ? 'match' : 'no match',
    similarity_score: score,
  };

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  return NextResponse.json(result);
}