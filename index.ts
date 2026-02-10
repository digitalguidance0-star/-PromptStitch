import { InputVariables } from './schemas/inputSchema';
import { applyFallbacks } from './validation/fallbackHandler';
import { selectTemplate } from './assembly/templateSelector';
import { generateMetadata, PromptMetadata } from './versioning/metadataGenerator';


// @ts-ignore
import { validateInput, normalizeInput } from './validation/inputValidator';
// @ts-ignore
import { enforceTierGates } from './monetization/featureGates';
// @ts-ignore
import { logEvent } from './analytics/eventLogger';

export interface PromptOutput {
  prompt: string;
  metadata: PromptMetadata;
  input_used: InputVariables;
}

/**
 * Primary API entry point for PromptStitch.
 * Executes the full prompt generation pipeline in a strict sequence.
 */
export const generatePrompt = async (
  raw_input: Partial<InputVariables>,
  user_id: string,
  session_id: string
): Promise<PromptOutput> => {
  try {
    // 1. Apply initial fallbacks for missing/invalid data
    let input = applyFallbacks(raw_input);

    // 2. Validate input against structural rules
    validateInput(input);

    // 3. Normalize strings (trimming, casing)
    input = normalizeInput(input);

    // 4. Enforce tier-based feature gates
    input = enforceTierGates(input);

    // 5. Generate unique metadata and lineage hash
    const metadata = await generateMetadata(input);

    // 6. Select and fill the appropriate template
    const assembledPrompt = selectTemplate(input);

    // 7. Log the generation event for analytics
    logEvent("prompt_generated", {
      user_id,
      session_id,
      version_id: metadata.version_id,
      tier: input.complexity_tier
    });

    // 8. Return final output package
    return {
      prompt: assembledPrompt,
      metadata: metadata,
      input_used: input
    };

  } catch (error: any) {
    // Handle validation or pipeline errors
    console.error("[EngineError] Failed to generate prompt:", error.message);
    throw error;
  }
};