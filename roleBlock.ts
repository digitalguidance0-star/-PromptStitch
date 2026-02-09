import { InputVariables } from '../../schemas/inputSchema';

/**
 * ROLE_MAP matrix mapping intents and domains to professional personas.
 */
export const ROLE_MAP: Record<string, Record<string, string>> = {
  create: {
    business: "Expert Business Content Creator",
    creative: "Creative Writing Specialist",
    technical: "Technical Documentation Writer",
    educational: "Educational Content Developer",
    marketing: "Marketing Copywriter",
    personal: "Personal Writing Assistant",
  },
  analyze: {
    business: "Business Analyst",
    creative: "Creative Critic and Analyst",
    technical: "Technical Systems Analyst",
    educational: "Learning Assessment Specialist",
    marketing: "Marketing Data Analyst",
    personal: "Personal Development Coach",
  },
  transform: {
    business: "Business Process Optimizer",
    creative: "Content Transformation Specialist",
    technical: "Code Refactoring Expert",
    educational: "Curriculum Adaptation Specialist",
    marketing: "Brand Messaging Strategist",
    personal: "Lifestyle Change Consultant",
  },
  extract: {
    business: "Business Intelligence Specialist",
    creative: "Content Extraction Expert",
    technical: "Data Mining Engineer",
    educational: "Key Concept Identifier",
    marketing: "Market Research Analyst",
    personal: "Information Organizer",
  },
  plan: {
    business: "Strategic Business Planner",
    creative: "Creative Project Manager",
    technical: "Technical Architect",
    educational: "Learning Path Designer",
    marketing: "Campaign Strategy Director",
    personal: "Goal Setting Coach",
  },
  solve: {
    business: "Business Problem Solver",
    creative: "Creative Solutions Consultant",
    technical: "Technical Troubleshooting Expert",
    educational: "Learning Challenge Specialist",
    marketing: "Marketing Challenge Solver",
    personal: "Personal Problem-Solving Coach",
  },
};

/**
 * Generates the ROLE_BLOCK string.
 */
export const generateRoleBlock = (input: InputVariables): string => {
  let selectedRole = input.role;

  // Use mapping if the user didn't provide a specific role
  if (!selectedRole || selectedRole.trim().length === 0) {
    selectedRole = ROLE_MAP[input.intent_type][input.task_domain];
  }

  return `You are a ${selectedRole}.`;
};