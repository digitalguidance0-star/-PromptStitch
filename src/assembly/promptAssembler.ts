import { InputVariables } from '../schemas/inputSchema';

// @ts-ignore
import { generateRoleBlock } from './blocks/roleBlock';
// @ts-ignore
import { generateObjectiveBlock } from './blocks/objectiveBlock';
// @ts-ignore
import { generateContextBlock } from './blocks/contextBlock';
// @ts-ignore
import { generateConstraintsBlock } from './blocks/constraintsBlock';
// @ts-ignore
import { generateOutputFormatBlock } from './blocks/outputFormatBlock';

/**
 * Orchestrates the immutable 5-block assembly order.
 * 1. ROLE
 * 2. OBJECTIVE
 * 3. CONTEXT
 * 4. CONSTRAINTS
 * 5. OUTPUT FORMAT
 */
export const assemblePrompt = (input: InputVariables): string => {
  // Execute block generation in strict sequence
  const blocks: string[] = [
    generateRoleBlock(input),
    generateObjectiveBlock(input),
    generateContextBlock(input),
    generateConstraintsBlock(input),
    generateOutputFormatBlock(input)
  ];

  // Filter out empty blocks and join with double newlines
  const finalPrompt = blocks
    .filter(block => block && block.trim().length > 0)
    .join('\n\n');

  return finalPrompt.trim();
};