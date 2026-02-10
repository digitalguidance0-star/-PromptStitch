import { InputVariables } from '../schemas/inputSchema';

/**
 * Interface representing the versioning and integrity metadata for a prompt.
 */
export interface PromptMetadata {
  version_id: string;
  created_timestamp: string;
  input_hash: string;
  template_version: string;
  engine_version: string;
}

/**
 * Generates a SHA-256 hash of the input variables to detect changes.
 * Concatenates all values into a single string before hashing.
 */
export const hashInputs = async (input: InputVariables): Promise<string> => {
  const inputValuesString = Object.values(input)
    .map(val => (Array.isArray(val) ? val.join('|') : String(val)))
    .join('::');

  const msgUint8 = new TextEncoder().encode(inputValuesString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
};

/**
 * Generates comprehensive metadata for a prompt generation event.
 */
export const generateMetadata = async (input: InputVariables): Promise<PromptMetadata> => {
  // Generate a random UUID v4
  const version_id = crypto.randomUUID();
  
  // Get current ISO 8601 timestamp
  const created_timestamp = new Date().toISOString();
  
  // Calculate the hash of the inputs
  const input_hash = await hashInputs(input);

  return {
    version_id,
    created_timestamp,
    input_hash,
    template_version: "3.2",
    engine_version: "1.0.0"
  };
};