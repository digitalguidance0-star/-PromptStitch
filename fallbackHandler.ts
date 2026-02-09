import { 
  InputVariables, 
  ALLOWED_VALUES, 
  DEFAULT_VALUES 
} from '../schemas/inputSchema';

export interface FallbackWarning {
  field: string;
  invalidValue: any;
  correctedValue: any;
}

/**
 * Logs warnings for corrected values to the console for developer visibility.
 */
export const logWarning = (warning: FallbackWarning): void => {
  console.warn(
    `[Fallback] Field "${warning.field}" had invalid value "${warning.invalidValue}". ` +
    `Corrected to "${warning.correctedValue}".`
  );
};

/**
 * Validates, corrects, and enforces tier restrictions on input data.
 * This is the final safety gate before prompt assembly begins.
 */
export const applyFallbacks = (input: Partial<InputVariables>): InputVariables => {
  const warnings: FallbackWarning[] = [];

  // 1. Critical Check: Task Description
  if (!input.task_description || input.task_description.trim().length === 0) {
    throw new Error("Task description required");
  }

  // Merge with defaults to ensure a complete object
  const sanitized: InputVariables = { ...DEFAULT_VALUES, ...input };

  // 2. Enum Validation & Fallback
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
      warnings.push({
        field,
        invalidValue: value,
        correctedValue: defaultValue
      });
      (sanitized as any)[field] = defaultValue;
    }
  });

  // Log gathered warnings
  warnings.forEach(logWarning);

  // 3. Tier Violation Fallback (Enforcement)
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