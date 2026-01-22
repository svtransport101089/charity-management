export const UPI_ID = "parthi101089-2@oksbi";
export const PAYEE_NAME = "Parthiban D";
export const CURRENCY = "INR";
export const APP_NAME = "CharityFlow AI";

export const MODELS = {
  TEXT_FAST: 'gemini-2.5-flash-lite-latest',
  TEXT_STD: 'gemini-3-flash-preview',
  TEXT_PRO: 'gemini-3-pro-preview',
  IMAGE_GEN: 'gemini-3-pro-image-preview',
  IMAGE_EDIT: 'gemini-2.5-flash-image',
  VIDEO_GEN_FAST: 'veo-3.1-fast-generate-preview',
  VIDEO_GEN_HQ: 'veo-3.1-generate-preview', // Only used if needed for complex refs
  AUDIO_SPEECH: 'gemini-2.5-flash-preview-tts',
  AUDIO_TRANSCRIPTION: 'gemini-3-flash-preview',
  MAPS: 'gemini-2.5-flash',
};

export const EXPENSE_CATEGORIES = [
  'Operational',
  'Fundraising',
  'Program Service',
  'Administrative',
  'Marketing',
  'Other'
];