/**
 * PromptStitch Input Variable Schema
 * Category: Backend Data Architecture
 */

export const ALLOWED_VALUES = {
  intent_type: ["create", "analyze", "transform", "extract", "plan", "solve"] as const,
  task_domain: ["business", "creative", "technical", "educational", "marketing", "personal"] as const,
  output_type: ["text", "list", "table", "code", "outline", "json", "markdown", "report"] as const,
  tone: ["professional", "casual", "technical", "friendly", "authoritative", "creative", "neutral"] as const,
  detail_level: ["brief", "standard", "comprehensive"] as const,
  complexity_tier: ["free", "pro", "enterprise"] as const,
};

export interface InputVariables {
  // PRIMARY INPUTS
  intent_type: (typeof ALLOWED_VALUES.intent_type)[number];
  task_domain: (typeof ALLOWED_VALUES.task_domain)[number];
  output_type: (typeof ALLOWED_VALUES.output_type)[number];
  tone: (typeof ALLOWED_VALUES.tone)[number];
  role: string;
  task_description: string;

  // SECONDARY INPUTS
  context_provided: string;
  constraints: string[];
  examples_included: boolean;
  example_text: string;
  detail_level: (typeof ALLOWED_VALUES.detail_level)[number];
  target_audience: string;

  // TIER-GATED INPUTS
  complexity_tier: (typeof ALLOWED_VALUES.complexity_tier)[number];
  custom_instructions: string;
  multi_step_enabled: boolean;
  chain_of_thought: boolean;
  output_length_target: number | null;
}

export const DEFAULT_VALUES: InputVariables = {
  intent_type: "create",
  task_domain: "business",
  output_type: "text",
  tone: "professional",
  role: "Expert Assistant",
  task_description: "",
  context_provided: "",
  constraints: [],
  examples_included: false,
  example_text: "",
  detail_level: "standard",
  target_audience: "general audience",
  complexity_tier: "free",
  custom_instructions: "",
  multi_step_enabled: false,
  chain_of_thought: false,
  output_length_target: null,
};

export const VALIDATION_RULES = {
  primary: {
    role: { min: 3, max: 100, normalization: "trim" },
    task_description: { min: 10, max: 500, required: true, normalization: "trim" },
  },
  secondary: {
    context_provided: { max: 1000, normalization: "trim" },
    constraints: { maxItems: 10, itemMin: 5, itemMax: 200 },
    example_text: { max: 2000, requiredIf: "examples_included", normalization: "trim" },
    target_audience: { max: 100, normalization: "trim" },
  },
  tier_gated: {
    custom_instructions: { max: 500, allowedTiers: ["pro", "enterprise"], normalization: "trim" },
    multi_step_enabled: { allowedTiers: ["pro", "enterprise"] },
    chain_of_thought: { allowedTiers: ["enterprise"] },
    output_length_target: { min: 50, max: 5000, allowedTiers: ["pro", "enterprise"] },
  },
};