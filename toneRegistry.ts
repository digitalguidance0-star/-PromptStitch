/**
 * Dynamic Tone Registry
 * Category: Expansion Manager
 */

/**
 * Mutable list of allowed tones.
 * Initialized with system defaults.
 */
export let ALLOWED_TONES: string[] = [
  "professional", 
  "casual", 
  "technical", 
  "friendly", 
  "authoritative", 
  "creative", 
  "neutral"
];

/**
 * Mutable map of descriptors for each tone to guide prompt assembly.
 */
export let TONE_DESCRIPTORS: Record<string, string> = {
  "professional": "formal, clear, businesslike",
  "casual": "conversational, relaxed, approachable",
  "technical": "precise, jargon-appropriate, detailed",
  "friendly": "warm, helpful, encouraging",
  "authoritative": "confident, commanding, expert",
  "creative": "imaginative, expressive, unconventional",
  "neutral": "balanced, objective, impartial"
};

/**
 * Tracking for tone registry updates.
 */
export let tone_version_number: number = 1;

/**
 * Validates the new tone and descriptor before registration.
 */
export const validateTone = (tone_name: string, tone_descriptor: string): void => {
  const normalizedTone = tone_name.toLowerCase().trim();

  // 1. Uniqueness check
  if (ALLOWED_TONES.includes(normalizedTone)) {
    throw new Error(`Tone "${normalizedTone}" already exists in the registry.`);
  }

  // 2. Name length validation
  if (normalizedTone.length < 3 || normalizedTone.length > 20) {
    throw new Error("Tone name must be between 3 and 20 characters.");
  }

  // 3. Lowercase strictness check
  if (tone_name !== normalizedTone) {
    throw new Error("Tone name must be provided in lowercase.");
  }

  // 4. Descriptor length validation
  if (tone_descriptor.length < 5 || tone_descriptor.length > 100) {
    throw new Error("Tone descriptor must be between 5 and 100 characters.");
  }
};

/**
 * Adds a new tone to the registry dynamically.
 * Increments version number and updates system records.
 */
export const addTone = (tone_name: string, tone_descriptor: string): void => {
  // Perform validation
  validateTone(tone_name, tone_descriptor);

  // Apply changes in-place
  ALLOWED_TONES.push(tone_name);
  TONE_DESCRIPTORS[tone_name] = tone_descriptor;

  // Increment version tracking
  tone_version_number++;

  console.log(`[ToneRegistry] Successfully added tone: "${tone_name}" (v${tone_version_number})`);
};