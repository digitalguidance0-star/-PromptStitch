import { 
  InputVariables, 
  ALLOWED_VALUES, 
  DEFAULT_VALUES, 
  VALIDATION_RULES 
} from '../schemas/inputSchema';

/**
 * Normalizes input strings according to business rules.
 */
export const normalizeInput = (input: InputVariables): InputVariables => {
  const normalizeSentence = (str: string) => {
    const trimmed = str.trim();
    if (!trimmed) return "";
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  return {
    ...input,
    // Lowercase/Trim Enums
    intent_type: input.intent_type.trim().toLowerCase() as any,
    task_domain: input.task_domain.trim().toLowerCase() as any,
    output_type: input.output_type.trim().toLowerCase() as any,
    tone: input.tone.trim().toLowerCase() as any,
    detail_level: input.detail_level.trim().toLowerCase() as any,
    complexity_tier: input.complexity_tier.trim().toLowerCase() as any,

    // Specific string formats
    role: normalizeSentence(input.role),
    task_description: normalizeSentence(input.task_description),

    // Standard trim
    context_provided: input.context_provided.trim(),
    example_text: input.example_text.trim(),
    custom_instructions: input.custom_instructions.trim(),
    target_audience: input.target_audience.trim(),

    // Array normalization: trim and unique
    constraints: Array.from(new Set(input.constraints.map(c => c.trim())))
  };
};

/**
 * Validates an individual field. 
 */
export const validateField = (field: keyof InputVariables, value: any): any => {
  // 1. Enum Validation (Fallback to default)
  if (Object.keys(ALLOWED_VALUES).includes(field)) {
    const allowed = (ALLOWED_VALUES as any)[field];
    if (!allowed.includes(value)) {
      console.warn(`Invalid value for ${field}: "${value}". Falling back to "${(DEFAULT_VALUES as any)[field]}"`);
      return (DEFAULT_VALUES as any)[field];
    }
    return value;
  }

  // 2. Critical Validation
  if (field === 'task_description') {
    const val = String(value || "").trim();
    if (!val || val.length < VALIDATION_RULES.primary.task_description.min) {
      throw new Error(`Task description must be at least ${VALIDATION_RULES.primary.task_description.min} characters.`);
    }
    if (val.length > VALIDATION_RULES.primary.task_description.max) {
      return val.substring(0, VALIDATION_RULES.primary.task_description.max);
    }
  }

  // 3. Length Validations
  if (typeof value === 'string') {
    if (field === 'role' && (value.length < 3 || value.length > 100)) return DEFAULT_VALUES.role;
    if (field === 'context_provided' && value.length > 1000) return value.substring(0, 1000);
    if (field === 'example_text' && value.length > 2000) return value.substring(0, 2000);
    if (field === 'target_audience' && value.length > 100) return value.substring(0, 100);
    if (field === 'custom_instructions' && value.length > 500) return value.substring(0, 500);
  }

  // 4. Constraint Array Validation
  if (field === 'constraints' && Array.isArray(value)) {
    return value
      .slice(0, VALIDATION_RULES.secondary.constraints.maxItems)
      .filter(c => c.length >= 5 && c.length <= 200);
  }

  // 5. Number Validation
  if (field === 'output_length_target' && value !== null) {
    const num = parseInt(value);
    if (isNaN(num) || num < 50 || num > 5000) return null;
    return num;
  }

  return value;
};

/**
 * Validates and normalizes the entire input object.
 */
export const validateInput = (input: Partial<InputVariables>): InputVariables => {
 
  const merged: InputVariables = { ...DEFAULT_VALUES, ...input };

  // Validate each field
  const validatedData: any = {};
  (Object.keys(merged) as Array<keyof InputVariables>).forEach((key) => {
    validatedData[key] = validateField(key, merged[key]);
  });

  // Cross-field requirement
  if (validatedData.examples_included && !validatedData.example_text) {
    console.warn("examples_included is true but example_text is empty.");
  }

  // Final normalization pass
  return normalizeInput(validatedData as InputVariables);
};