import { InputVariables } from '../../schemas/inputSchema';

/**
 * Conditional Enhancements
 * Metadata for conditional objective enhancements based on user settings.
 */
export const ENHANCEMENT_RULES = {
  detail_level: {
    comprehensive: "Provide thorough, detailed analysis covering all relevant aspects.",
    brief: "Be concise and focus on the most critical points."
  },
  examples: "Use the provided examples as reference for style and structure.",
  multi_step: "Break down the process into clear, sequential steps.",
  chain_of_thought: "Show your reasoning process step-by-step before providing the final answer."
};

/**
 * Generates the OBJECTIVE_BLOCK string.
 * Construction: [OBJECTIVE]\nYour objective is to [task_description]. [Enhancements]
 */
export const generateObjectiveBlock = (input: InputVariables): string => {
  // Base Objective
  let objectiveParts: string[] = [`Your objective is to ${input.task_description}`];

  // Ensure the base ends with a period before appending enhancements
  if (!objectiveParts[0].endsWith('.')) {
    objectiveParts[0] += '.';
  }

  // Conditional Enhancements
  if (input.detail_level === "comprehensive") {
    objectiveParts.push(ENHANCEMENT_RULES.detail_level.comprehensive);
  } else if (input.detail_level === "brief") {
    objectiveParts.push(ENHANCEMENT_RULES.detail_level.brief);
  }

  if (input.examples_included) {
    objectiveParts.push(ENHANCEMENT_RULES.examples);
  }

  if (input.multi_step_enabled) {
    objectiveParts.push(ENHANCEMENT_RULES.multi_step);
  }

  if (input.chain_of_thought) {
    objectiveParts.push(ENHANCEMENT_RULES.chain_of_thought);
  }

  // Join parts into a single paragraph with space separation
  return `[OBJECTIVE]\n${objectiveParts.join(' ')}`;
};