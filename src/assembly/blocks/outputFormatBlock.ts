import { InputVariables, ALLOWED_VALUES, DEFAULT_VALUES } from '../../schemas/inputSchema';

/**
 * OUTPUT_FORMAT_MAP
 * Base formatting instructions for each output type.
 */
export const OUTPUT_FORMAT_MAP: Record<string, string> = {
  text: "Provide your response as clear, well-structured paragraphs.",
  list: "Format your response as a numbered or bulleted list with clear hierarchy.",
  table: "Present information in a structured table format with appropriate headers.",
  code: "Output clean, well-commented code with proper syntax and indentation.",
  outline: "Create a hierarchical outline with main points and subpoints.",
  json: "Return valid JSON with proper structure and data types.",
  markdown: "Use markdown formatting including headers, lists, and emphasis where appropriate.",
  report: "Structure as a formal report with executive summary, main sections, and conclusion.",
};

/**
 * Format Enhancement Rules
 * Implements the ENHANCE_FORMAT(base_format) logic.
 */
const ENHANCE_FORMAT = (outputType: string, baseFormat: string): string => {
  const enhancements: Record<string, string> = {
    text: " Include section headers to organize content.",
    list: " Provide brief explanations for each item.",
    table: " Include a summary row or column with totals/insights.",
    code: " Add inline documentation and usage examples.",
    outline: " Expand to at least 3 levels of depth.",
    json: " Include descriptive keys and nested structures where relevant.",
    markdown: " Use advanced markdown features like tables and code blocks.",
    report: " Add methodology section and recommendations.",
  };

  const extension = enhancements[outputType] || "";
  return baseFormat + extension;
};

/**
 * FALLBACK LOGIC
 * Internal helper to enforce safety rules before block generation.
 */
const applyBlockFallbacks = (input: InputVariables): InputVariables => {
  // Missing Required Input
  if (!input.task_description || input.task_description.trim() === "") {
    throw new Error("Task description required");
  }

  const sanitized = { ...input };

  // Invalid Enum Values
  const enumFields = [
    'intent_type',
    'task_domain',
    'output_type',
    'tone',
    'detail_level',
    'complexity_tier'
  ] as const;

  enumFields.forEach((field) => {
    const value = sanitized[field];
    const allowed = (ALLOWED_VALUES as any)[field];

    if (!allowed.includes(value)) {
      const defaultValue = (DEFAULT_VALUES as any)[field];
      console.warn(`[Fallback] Field "${field}" had invalid value "${value}". Corrected to "${defaultValue}".`);
      (sanitized as any)[field] = defaultValue;
    }
  });

  // Tier Violation Fallback
  const tier = sanitized.complexity_tier;
  if (tier === "free") {
    sanitized.custom_instructions = "";
    sanitized.multi_step_enabled = false;
    sanitized.chain_of_thought = false;
    sanitized.output_length_target = null;
  } else if (tier === "pro") {
    sanitized.chain_of_thought = false;
  }

  return sanitized;
};

/**
 * Format Specification Logic
 * Generates the OUTPUT_FORMAT_BLOCK string.
 */
export const generateOutputFormatBlock = (input: InputVariables): string => {
  // Apply fallbacks
  const validatedInput = applyBlockFallbacks(input);

  const outputType = validatedInput.output_type;
  
  //  format_spec = OUTPUT_FORMAT_MAP[output_type]
  let formatSpec = OUTPUT_FORMAT_MAP[outputType] || OUTPUT_FORMAT_MAP.text;

  // IF detail_level == "comprehensive" THEN format_spec = ENHANCE_FORMAT(format_spec)
  if (validatedInput.detail_level === "comprehensive") {
    formatSpec = ENHANCE_FORMAT(outputType, formatSpec);
  }

  return `Output Format:\n${formatSpec}`;
};

/**
 * SECTION 3: CORE PROMPT TEMPLATES
 * * 3.1 BASE TEMPLATE (GEMINI TIER)
 * - You are a [role].
 * - Your objective is to [task_description].
 * - [CONTEXT_BLOCK if exists]
 * - Constraints:
 * 1. Maintain a [tone] tone throughout
 * 2. Provide a straightforward response without advanced techniques
 * - Output Format: [output_format_specification]
 * * 3.2 ADVANCED TEMPLATE (GPT-4 TIER)
 * - You are a [role].
 * - Your objective is to [task_description]. [detail_level enhancements] [multi_step enhancement if enabled]
 * - [CONTEXT_BLOCK if exists]
 * - Constraints:
 * 1. Maintain a [tone] tone throughout
 * 2. Target approximately [output_length_target] words [if specified]
 * - Output Format: [enhanced_output_format_specification]
 * - Additional Instructions: [custom_instructions if not already in constraints]
 * * 3.3 OPUS-4 TEMPLATE (ENTERPRISE TIER)
 * - You are a [role] with deep expertise in [task_domain].
 * - Your objective is to [task_description]. [detail_level enhancements] [multi_step/CoT enhancements]
 * - [CONTEXT_BLOCK - comprehensive variant if exists]
 * - Constraints:
 * 1. Maintain a [tone] tone throughout
 * 2. Target approximately [output_length_target] words [if specified]
 * 3. [chain_of_thought instruction if enabled]
 * - Output Format: [maximum_enhanced_output_format_specification]
 * - Process Requirements:
 * [IF chain_of_thought] Show reasoning process before final answer
 * [IF multi_step_enabled] Number each step clearly
 * - Quality Standards:
 * - Ensure accuracy and completeness
 * - Cross-reference with provided context
 * - Validate against all constraints before finalizing
 */