import type { Capability, Role } from "./types";

/** Display labels for roles (Japanese, matching the PRD terminology). */
export const ROLE_LABELS: Record<Role, string> = {
  operator: "オペレーター",
  supervisor: "監督者",
  safety_officer: "安全責任者",
  it_admin: "IT / Admin",
};

/** Display labels for capabilities. */
export const CAPABILITY_LABELS: Record<Capability, string> = {
  propose: "上書きを提案",
  approve: "承認",
  reject: "却下",
  full_override: "フル上書き（即時適用）",
  view_audit: "監査ログ閲覧",
  manage_permissions: "権限管理",
};

export const ALL_ROLES: Role[] = [
  "operator",
  "supervisor",
  "safety_officer",
  "it_admin",
];

export const ALL_CAPABILITIES: Capability[] = [
  "propose",
  "approve",
  "reject",
  "full_override",
  "view_audit",
  "manage_permissions",
];

/**
 * The permission matrix — the single source of truth for "who can override what".
 *
 * Mirrors the RoboFlex three-tier model from the PRD:
 *   operators suggest → supervisors authorize → safety officers have full override.
 * IT/Admin manages the matrix itself and can read the audit log.
 */
export const PERMISSION_MATRIX: Record<Role, Capability[]> = {
  operator: ["propose"],
  supervisor: ["propose", "approve", "reject"],
  safety_officer: ["propose", "approve", "reject", "full_override", "view_audit"],
  it_admin: ["manage_permissions", "view_audit"],
};

/** Returns whether the given role holds the given capability. */
export function can(role: Role, capability: Capability): boolean {
  return PERMISSION_MATRIX[role].includes(capability);
}
