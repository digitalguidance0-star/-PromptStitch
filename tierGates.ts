import { InputVariables, DEFAULT_VALUES } from '../schemas/inputSchema';

/**
 * Access Control Configuration
 * Maps specific features to the tiers allowed to use them.
 */
export const FEATURE_GATES: Record<string, string[]> = {
  custom_instructions: ["pro", "enterprise"],
  multi_step_enabled: ["pro", "enterprise"],
  chain_of_thought: ["enterprise"],
  output_length_target: ["pro", "enterprise"]
};


export const checkFeatureAccess = (feature: keyof InputVariables, tier: string): boolean => {
  const allowedTiers = FEATURE_GATES[feature as string];
  if (!allowedTiers) return true; // Not a gated feature
  return allowedTiers.includes(tier);
};

/**
 * Enforces tier-gated restrictions by nullifying or disabling restricted features.
 */
export const enforceTierGates = (input: InputVariables): InputVariables => {
  const tier = input.complexity_tier;

  // 1. Custom Instructions Gate
  if (!checkFeatureAccess("custom_instructions", tier)) {
    input.custom_instructions = DEFAULT_VALUES.custom_instructions;
  }

  // 2. Multi-Step Gate
  if (!checkFeatureAccess("multi_step_enabled", tier)) {
    input.multi_step_enabled = DEFAULT_VALUES.multi_step_enabled;
  }

  // 3. Chain of Thought Gate
  if (!checkFeatureAccess("chain_of_thought", tier)) {
    input.chain_of_thought = DEFAULT_VALUES.chain_of_thought;
  }

  // 4. Output Length Target Gate
  if (!checkFeatureAccess("output_length_target", tier)) {
    input.output_length_target = DEFAULT_VALUES.output_length_target;
  }

  return input;
};