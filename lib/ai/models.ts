export const GOOGLE_TEXT_MODEL = process.env.AI_GOOGLE_TEXT_MODEL || 'gemini-1.5-pro';
export const GOOGLE_IMAGE_MODEL = process.env.AI_GOOGLE_IMAGE_MODEL || 'imagen-3';

export const requiredEnv = ['AI_GOOGLE_API_KEY'];

export function assertEnv() {
  const missing = requiredEnv.filter((k) => !process.env[k]);
  return missing;
}
