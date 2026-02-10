import { InputVariables } from '../../schemas/inputSchema';

/**
 * CONTEXT_BLOCK CONSTRUCTION
 * Context Assembly
 * Logic: Collects context, audience, and examples. Skips block if all are empty.
 */
export const generateContextBlock = (input: InputVariables): string => {
  const contextElements: string[] = [];

  // 1. Context Provided
  if (input.context_provided && input.context_provided.trim() !== "") {
    contextElements.push(`Context:\n${input.context_provided.trim()}`);
  }

  // 2. Target Audience 
  if (
    input.target_audience && 
    input.target_audience.trim().toLowerCase() !== "general audience" &&
    input.target_audience.trim() !== ""
  ) {
    contextElements.push(`Target audience: ${input.target_audience.trim()}`);
  }

  // 3. Example Text
  if (input.example_text && input.example_text.trim() !== "") {
    contextElements.push(`Reference examples:\n${input.example_text.trim()}`);
  }

  // Skip Check
  if (contextElements.length === 0) {
    return "";
  }

  // Join elements with double newlines under the block header
  return `[CONTEXT]\n${contextElements.join('\n\n')}`;
};