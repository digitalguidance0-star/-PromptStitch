import { InputVariables, ALLOWED_VALUES } from '../schemas/inputSchema';
import { mutatePrompt, MutationType } from './promptMutator';
import { selectTemplate } from '../assembly/templateSelector';
import { generateMetadata, PromptMetadata } from './metadataGenerator';

/**
 * Represents a single A/B test variant of a prompt.
 */
export interface PromptVariant {
  variant_label: string;
  mutated_input: InputVariables;
  mutation_applied: string;
  assembled_prompt: string;
  metadata: PromptMetadata;
}


export const generateVariants = async (
  baseInput: InputVariables, 
  variantCount: number
): Promise<PromptVariant[]> => {

  const count = Math.max(2, Math.min(5, variantCount));
  const variants: PromptVariant[] = [];
  

  const mutationPool: MutationType[] = ["tone_shift", "detail_expansion", "format_transform"];

  for (let i = 1; i <= count; i++) {
    // 1. Randomly select a mutation type from the pool
    const randomMutation = mutationPool[Math.floor(Math.random() * mutationPool.length)];
    
    // 2. Prepare random parameters based on the selected mutation
    let params: any = {};
    if (randomMutation === "tone_shift") {
      const otherTones = ALLOWED_VALUES.tone.filter(t => t !== baseInput.tone);
      params.new_tone = otherTones[Math.floor(Math.random() * otherTones.length)];
    } else if (randomMutation === "format_transform") {
      const otherFormats = ALLOWED_VALUES.output_type.filter(f => f !== baseInput.output_type);
      params.new_output_type = otherFormats[Math.floor(Math.random() * otherFormats.length)];
    }

    // 3. Apply the mutation
    const { mutatedInput } = await mutatePrompt(baseInput, randomMutation, params);

    // 4. Assemble the final prompt string using the template system
    const assembledPrompt = selectTemplate(mutatedInput);

    // 5. Generate unique metadata for this specific variant
    const metadata = await generateMetadata(mutatedInput);

    // 6. Push the completed variant record
    variants.push({
      variant_label: `V${i}`,
      mutated_input: mutatedInput,
      mutation_applied: randomMutation,
      assembled_prompt: assembledPrompt,
      metadata: metadata
    });
  }

  return variants;
};