// src/services/api.ts
import axios from 'axios';

// Define common interfaces for API communication
export interface SignatureImage {
  id: string;
  data: string; // base64 encoded image
}

// Interfaces for the /clean endpoint
export interface CleanApiPayload {
  images: SignatureImage[];
}
export interface CleanApiResponse {
  cleaned_images: SignatureImage[];
}

// Interfaces for the /match endpoint
export interface MatchApiPayload {
  image1: SignatureImage;
  image2: SignatureImage;
}
export interface MatchApiResponse {
  match: 'match' | 'no match';
  similarity_score: number; // A value between 0 and 1
}

// Create an Axios instance
const apiClient = axios.create({
  baseURL: '/api', // This will be proxied by Next.js
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Calls the /clean endpoint to denoise signatures.
 * @param images - An array of signature images.
 * @returns A promise that resolves to the cleaned images.
 */
export const cleanSignatures = async (images: SignatureImage[]): Promise<CleanApiResponse> => {
  const payload: CleanApiPayload = { images };
  const response = await apiClient.post('/clean', payload);
  return response.data;
};

/**
 * Calls the /match endpoint to compare two signatures.
 * @param image1 - The first signature image.
 * @param image2 - The second signature image.
 * @returns A promise that resolves to the match result and score.
 */
export const matchSignatures = async (image1: SignatureImage, image2: SignatureImage): Promise<MatchApiResponse> => {
  const payload: MatchApiPayload = { image1, image2 };
  const response = await apiClient.post('/match', payload);
  return response.data;
};