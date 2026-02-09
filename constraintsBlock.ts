import { InputVariables } from '../../schemas/inputSchema';

/**
 CONSTRAINTS_BLOCK CONSTRUCTION
 */
export const generateConstraintsBlock = (input: InputVariables): string => {
  const constraintList: string[] = [];

  // 1. Tone constraint
  constraintList.push(`Maintain a ${input.tone} tone throughout`);

  // 2. Output length constraint
  if (input.output_length_target !== null) {
    constraintList.push(`Target approximately ${input.output_length_target} words`);
  }

  // 3. User-defined constraints
  if (input.constraints && input.constraints.length > 0) {
    input.constraints.forEach(constraint => {
      if (constraint.trim() !== "") {
        constraintList.push(constraint.trim());
      }
    });
  }

  // 4. Tier-specific constraints
  if (input.complexity_tier === "free") {
    constraintList.push("Provide a straightforward response without advanced techniques");
  }

  // 5. Custom instructions
  if (input.custom_instructions && input.custom_instructions.trim() !== "") {
    constraintList.push(input.custom_instructions.trim());
  }

  // Format into a bulleted list (or indexed as per original UI preference)
  const formattedConstraints = constraintList
    .map((text) => `- ${text}`)
    .join('\n');

  return `[CONSTRAINTS]\n${formattedConstraints}`;
};