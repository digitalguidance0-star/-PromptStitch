import { ROLE_MAP as INITIAL_ROLE_MAP } from '../assembly/blocks/roleBlock';
import { ALLOWED_VALUES } from '../schemas/inputSchema';

/**
 * Mutable version of the ROLE_MAP for dynamic expansion.
 */
export let ROLE_MAP: Record<string, Record<string, string>> = { ...INITIAL_ROLE_MAP };

/**
 * Versioning and Change Tracking
 */
export let role_version_number: number = 1;
export const role_changes: Array<{
  timestamp: string;
  added_role: string;
  intent_type: string;
  task_domain: string;
  version: number;
}> = [];

/**
 * Validates the new role name and keys before registration.
 */
export const validateRole = (intent_type: string, task_domain: string, role_name: string): void => {
  // 1. Validate Intent Type
  if (!Object.keys(ROLE_MAP).includes(intent_type)) {
    throw new Error(`Invalid intent_type: "${intent_type}". Must be one of: ${Object.keys(ROLE_MAP).join(', ')}`);
  }

  // 2. Validate Task Domain
  const validDomains = ALLOWED_VALUES.task_domain;
  if (!validDomains.includes(task_domain as any)) {
    throw new Error(`Invalid task_domain: "${task_domain}".`);
  }

  // 3. Validate Role Name Length
  if (role_name.length < 3 || role_name.length > 100) {
    throw new Error("Role name must be between 3 and 100 characters.");
  }

  // 4. Validate Special Characters 
  const roleRegex = /^[a-zA-Z0-9\s\-\']+$/;
  if (!roleRegex.test(role_name)) {
    throw new Error("Role name contains invalid characters. Only letters, numbers, spaces, hyphens, and apostrophes are allowed.");
  }
};

/**
 * Adds a new role to the registry dynamically.
 * Increments version number and logs the change.
 */
export const addRole = (intent_type: string, task_domain: string, role_name: string): void => {
  // Perform validation
  validateRole(intent_type, task_domain, role_name);

  // Apply change in-place
  ROLE_MAP[intent_type][task_domain] = role_name;

  // Update tracking metadata
  role_version_number++;
  role_changes.push({
    timestamp: new Date().toISOString(),
    added_role: role_name,
    intent_type,
    task_domain,
    version: role_version_number
  });

  console.log(`[RoleRegistry] Successfully updated role for ${intent_type}/${task_domain} to "${role_name}" (v${role_version_number})`);
};