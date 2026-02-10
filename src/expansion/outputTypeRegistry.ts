import { 
  OUTPUT_FORMAT_MAP as INITIAL_FORMAT_MAP
} from '../assembly/blocks/outputFormatBlock';
import { ALLOWED_VALUES } from '../schemas/inputSchema';

/**
 * Mutable list of allowed output types.
 * Initialized from the core schema.
 */
export let ALLOWED_OUTPUT_TYPES: string[] = [...ALLOWED_VALUES.output_type];

/**
 * Mutable map for format instructions.
 * Uses INITIAL_FORMAT_MAP alias to avoid naming collision with the exported variable.
 */
export let OUTPUT_FORMAT_MAP: Record<string, string> = { ...INITIAL_FORMAT_MAP };

/**
 * Mutable map for format enhancements.
 * Initialized as an empty registry to be populated via addOutputType.
 */
export let FORMAT_ENHANCEMENTS: Record<string, string> = {};

/**
 * Version tracking for output type updates.
 */
export let output_version_number: number = 1;

/**
 * Validates the new output type before registration.
 */
export const validateOutputType = (
  type_name: string, 
  format_spec: string, 
  enhancement_rule: string
): void => {
  const normalizedType = type_name.toLowerCase().trim();

  // 1. Uniqueness check
  if (ALLOWED_OUTPUT_TYPES.includes(normalizedType)) {
    throw new Error(`Output type "${normalizedType}" already exists.`);
  }

  // 2. Type Name validation (3-20 chars, no spaces)
  if (normalizedType.length < 3 || normalizedType.length > 20) {
    throw new Error("Output type name must be between 3 and 20 characters.");
  }
  if (/\s/.test(normalizedType)) {
    throw new Error("Output type name cannot contain spaces.");
  }
  if (type_name !== normalizedType) {
    throw new Error("Output type name must be provided in lowercase.");
  }

  // 3. Format Spec validation (10-500 chars)
  if (format_spec.length < 10 || format_spec.length > 500) {
    throw new Error("Format specification must be between 10 and 500 characters.");
  }

  // 4. Enhancement Rule validation (optional, max 500 chars)
  if (enhancement_rule && enhancement_rule.length > 500) {
    throw new Error("Enhancement rule cannot exceed 500 characters.");
  }
};

/**
 * Adds a new output type to the system dynamically.
 * Updates the allowed types list and the formatting maps.
 */
export const addOutputType = (
  type_name: string, 
  format_spec: string, 
  enhancement_rule: string = ""
): void => {
  // Perform strict validation
  validateOutputType(type_name, format_spec, enhancement_rule);

  // Apply changes to mutable registries
  ALLOWED_OUTPUT_TYPES.push(type_name);
  OUTPUT_FORMAT_MAP[type_name] = format_spec;
  
  if (enhancement_rule) {
    FORMAT_ENHANCEMENTS[type_name] = enhancement_rule;
  }

  // Update tracking
  output_version_number++;

  console.log(
    `[OutputTypeRegistry] Added "${type_name}" at ${new Date().toISOString()} (v${output_version_number})`
  );
};