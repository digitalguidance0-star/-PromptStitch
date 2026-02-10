import { InputVariables, ALLOWED_VALUES } from '../schemas/inputSchema';
import { generateMetadata, PromptMetadata } from './metadataGenerator';

export type MutationType = 
  | "tone_shift" 
  | "detail_expansion" 
  | "detail_reduction" 
  | "format_transform" 
  | "constraint_add" 
  | "constraint_remove" 
  | "role_refinement";

export interface MutationRecord {
  original_version_id: string;
  mutation_type: MutationType;
  timestamp: string;
}


export const trackLineage = (
  originalMetadata: PromptMetadata, 
  type: MutationType
): MutationRecord => {
  return {
    original_version_id: originalMetadata.version_id,
    mutation_type: type,
    timestamp: new Date().toISOString()
  };
};


export const mutatePrompt = async (
  originalInput: InputVariables,
  mutationType: MutationType,
  parameters: any
): Promise<{ mutatedInput: InputVariables; lineage: MutationRecord }> => {
  // 1. Deep clone the original input to ensure immutability
  const mutatedInput: InputVariables = { 
    ...originalInput, 
    constraints: [...originalInput.constraints] 
  };

  // 2. Apply mutation logic based on type
  switch (mutationType) {
    case "tone_shift":
      if (ALLOWED_VALUES.tone.includes(parameters.new_tone)) {
        mutatedInput.tone = parameters.new_tone;
      }
      break;

    case "detail_expansion":
      mutatedInput.detail_level = "comprehensive";
      break;

    case "detail_reduction":
      mutatedInput.detail_level = "brief";
      break;

    case "format_transform":
      if (ALLOWED_VALUES.output_type.includes(parameters.new_output_type)) {
        mutatedInput.output_type = parameters.new_output_type;
      }
      break;

    case "constraint_add":
      if (parameters.constraint && mutatedInput.constraints.length < 10) {
        mutatedInput.constraints.push(parameters.constraint.trim());
      }
      break;

    case "constraint_remove":
      if (typeof parameters.constraint_index === 'number') {
        mutatedInput.constraints.splice(parameters.constraint_index, 1);
      }
      break;

    case "role_refinement":
      if (parameters.specialization) {
        mutatedInput.role = `${mutatedInput.role} with a focus on ${parameters.specialization}`;
      }
      break;

    default:
      throw new Error(`Unsupported mutation type: ${mutationType}`);
  }

  // 3. Generate fresh metadata for the mutated version
  const dummyMetadata: PromptMetadata = await generateMetadata(originalInput);
  const lineage = trackLineage(dummyMetadata, mutationType);

  return { mutatedInput, lineage };
};