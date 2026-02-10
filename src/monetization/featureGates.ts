/**
 * PromptStitch Feature Gate Enforcer
 * Category: Monetization & Access Control
 */

export interface UpgradeEvent {
  feature_name: string;
  required_tier: string[];
  user_tier: string;
  timestamp: string;
}

/**
 * FEATURE_GATES map defining which tiers have access to specific functionalities.
 */
export const FEATURE_GATES: Record<string, string[]> = {
  custom_instructions: ["pro", "enterprise"],
  multi_step_enabled: ["pro", "enterprise"],
  chain_of_thought: ["enterprise"],
  output_length_target: ["pro", "enterprise"],
  custom_templates: ["enterprise"],
  batch_processing: ["enterprise"],
  a_b_testing: ["enterprise"],
};

/**
 * Emits a structured log event when a user attempts to access a restricted feature.
 */
export const emitUpgradePrompt = (
  feature_name: string,
  required_tier: string[],
  user_tier: string
): void => {
  const event: UpgradeEvent = {
    feature_name,
    required_tier,
    user_tier,
    timestamp: new Date().toISOString(),
  };

  console.warn(
    `[FeatureGate] Access Denied. Feature "${feature_name}" requires ${required_tier.join(
      " or "
    )}. Current tier: "${user_tier}".`,
    event
  );
};

/**
 * Checks if the current user tier has access to a specific feature.
 */
export const checkFeatureAccess = (
  feature_name: string,
  user_tier: string
): boolean => {
  const allowedTiers = FEATURE_GATES[feature_name];

  // If feature is not registered in gates, assume public access
  if (!allowedTiers) return true;

  const isGranted = allowedTiers.includes(user_tier);

  if (!isGranted) {
    emitUpgradePrompt(feature_name, allowedTiers, user_tier);
  }

  return isGranted;
};