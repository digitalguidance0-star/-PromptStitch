import { InputVariables } from '../schemas/inputSchema';
import { assemblePrompt } from './promptAssembler';
import { ROLE_MAP } from './blocks/roleBlock';
import { validateInputs } from '../schemas/inputSchema';

/**
 *Template Extension System - Data Store
 */
export interface CustomTemplate {
  structure: (input: InputVariables) => string;
  tier: "free" | "pro" | "enterprise";
  version: number;
}

const CUSTOM_TEMPLATES: Record<string, CustomTemplate> = {};
let custom_template_count: number = 0;

/**
 *Template Extension System - Registration
 */
export const registerCustomTemplate = (
  name: string, 
  structure: (input: InputVariables) => string, 
  tierRequirement: "free" | "pro" | "enterprise"
): void => {
  // Validate structure is a function
  if (typeof structure !== 'function') {
    throw new Error("Invalid template structure: must be a function.");
  }

  CUSTOM_TEMPLATES[name] = {
    structure,
    tier: tierRequirement,
    version: 1.0
  };
  
  custom_template_count++;
  console.log(`[TemplateExtension] Registered "${name}" (Total: ${custom_template_count})`);
};

/**
 * TEMPLATE SELECTION LOGIC
 * Modified to support custom template lookup with tier validation and standard fallback.
 */
export const selectTemplate = (input: InputVariables, customTemplateName?: string): string => {
  const tier = input.complexity_tier;

  // Custom Template Selection Logic
  if (customTemplateName && CUSTOM_TEMPLATES[customTemplateName]) {
    const template = CUSTOM_TEMPLATES[customTemplateName];
    
    // Check tier hierarchy (enterprise > pro > free)
    const tierWeight = { "free": 0, "pro": 1, "enterprise": 2 };
    if (tierWeight[tier] >= tierWeight[template.tier]) {
      return template.structure(input);
    } else {
      console.warn(`Tier "${tier}" insufficient for custom template "${customTemplateName}". Falling back.`);
    }
  }
  
  // Standard Selection Logic (Fallback)
  if (tier === "enterprise") {
    return applyEnterpriseTemplate(input);
  } else if (tier === "pro") {
    return applyAdvancedTemplate(input);
  } else {
    return applyBaseTemplate(input);
  }
};

/**
 * BASE TEMPLATE (GEMINI TIER)
 */
const applyBaseTemplate = (input: InputVariables): string => {
  return assemblePrompt(input);
};

/**
 * ADVANCED TEMPLATE (GPT-4 TIER)
 */
const applyAdvancedTemplate = (input: InputVariables): string => {
  let prompt = assemblePrompt(input);
  if (input.custom_instructions && input.custom_instructions.trim()) {
    prompt += `\n\nAdditional Instructions:\n${input.custom_instructions.trim()}`;
  }
  return prompt;
};

/**
 * OPUS-4 TEMPLATE (ENTERPRISE TIER)
 */
const applyEnterpriseTemplate = (input: InputVariables): string => {
  let prompt = assemblePrompt(input);

  let finalRole: string;
  if (input.role && input.role.trim() !== "") {
    finalRole = input.role;
  } else {
    finalRole = ROLE_MAP[input.intent_type][input.task_domain];
  }

  const enterpriseRole = `You are a ${finalRole} with deep expertise in ${input.task_domain}.`;
  const basePlaceholder = `You are a ${finalRole}.`;
  prompt = prompt.replace(basePlaceholder, enterpriseRole);

  const processReqs: string[] = [];
  if (input.chain_of_thought) processReqs.push("- Show reasoning process before final answer (Chain of Thought)");
  if (input.multi_step_enabled) processReqs.push("- Number each step clearly (Sequential Process)");
  
  if (processReqs.length > 0) {
    prompt += `\n\nProcess Requirements:\n${processReqs.join('\n')}`;
  }

  if (input.custom_instructions && input.custom_instructions.trim()) {
    prompt += `\n\nAdditional Instructions:\n${input.custom_instructions.trim()}`;
  }

  prompt += `\n\nQuality Standards:
- Ensure accuracy and completeness
- Cross-reference with provided context
- Validate against all constraints before finalizing`;

  return prompt;
};

/**
 * SECTION 4: EXPANSION HOOKS
 */

/**
 * AUTOMATION & API HOOKS
 */

export interface BatchResult {
  input_id: string | number;
  prompt: string;
  metadata: PromptMetadata;
}

/**
 * Batch Processing Interface
 */
export const batchGenerate = (inputArray: InputVariables[]): BatchResult[] => {
  const results: BatchResult[] = [];

  for (const inputSet of inputArray) {
    const validatedInput = validateInputs(inputSet);
    const prompt = selectTemplate(validatedInput);
    
    const metadata: PromptMetadata = {
      version_id: `v_${generateInputHash(validatedInput).substring(0, 8)}`,
      created_timestamp: new Date().toISOString(),
      input_hash: generateInputHash(validatedInput),
      template_version: "2.1.0-stable",
      engine_version: "gemini-2.5-flash-preview"
    };

    results.push({
      input_id: inputSet.id || `batch_${Math.random().toString(36).substr(2, 9)}`,
      prompt: prompt,
      metadata: metadata
    });
  }

  return results;
};

/**
 * VERSIONING, MUTATION & TESTING SYSTEM
 */

export interface PromptMetadata {
  version_id: string;
  created_timestamp: string;
  input_hash: string;
  template_version: string;
  engine_version: string;
  parent_version_id?: string;
}

export const generateInputHash = (input: InputVariables): string => {
  const serialized = JSON.stringify(input);
  return `sha256_${serialized.length}_${serialized.substring(0, 10)}`;
};

export interface PromptVariant {
  variant_label: string;
  input: InputVariables;
  lineage: string;
}

const RANDOM_MUTATION_POOL: { type: MutationType; params: any }[] = [
  { type: "tone_shift", params: { new_tone: "technical" } },
  { type: "tone_shift", params: { new_tone: "concise" } },
  { type: "detail_expansion", params: { level: "comprehensive" } },
  { type: "role_refinement", params: { specialization: "Quality Assurance" } }
];

export const generateVariants = (baseInput: InputVariables, variantCount: number): PromptVariant[] => {
  const variants: PromptVariant[] = [];
  for (let i = 1; i <= variantCount; i++) {
    const mutation = RANDOM_MUTATION_POOL[Math.floor(Math.random() * RANDOM_MUTATION_POOL.length)];
    const { mutatedInput, lineage } = mutatePrompt(baseInput, mutation.type, mutation.params);
    variants.push({
      variant_label: `V${i}`,
      input: mutatedInput,
      lineage: lineage
    });
  }
  return variants;
};

/**
 * Mutation Rules & Operations
 */
export type MutationType = "tone_shift" | "detail_expansion" | "format_transform" | "constraint_add" | "role_refinement";

export const mutatePrompt = (
  input: InputVariables, 
  mutationType: MutationType, 
  params: any
): { mutatedInput: InputVariables; lineage: string } => {
  const mutatedInput = JSON.parse(JSON.stringify(input));
  const originalId = `v_${generateInputHash(input).substring(0, 8)}`;

  switch (mutationType) {
    case "tone_shift":
      mutatedInput.tone = params.new_tone;
      break;
    case "detail_expansion":
      mutatedInput.custom_instructions = (mutatedInput.custom_instructions || "") + " Provide exhaustive detail.";
      break;
    case "role_refinement":
      mutatedInput.role = `${input.role || "Expert"} specialized in ${params.specialization}`;
      break;
  }

  const newId = `v_${generateInputHash(mutatedInput).substring(0, 8)}`;
  return { mutatedInput, lineage: `${originalId} -> ${newId}` };
};

/**
 * REGISTRIES
 */
export const addRole = (intent_type: string, task_domain: string, role_name: string): void => {
  if (!ROLE_MAP[intent_type]) ROLE_MAP[intent_type] = {};
  ROLE_MAP[intent_type][task_domain] = role_name;
};