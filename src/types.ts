// Domain model for the route-override permission prototype.
// All data is held in memory; there is no backend or production data connection.

/** The four enterprise roles described in the PRD. */
export type Role = "operator" | "supervisor" | "safety_officer" | "it_admin";

/** Discrete capabilities that a role may or may not hold. */
export type Capability =
  | "propose" // suggest a route override
  | "approve" // authorize a proposed override
  | "reject" // decline a proposed override
  | "full_override" // apply an override immediately, bypassing approval
  | "view_audit" // read the compliance audit log
  | "manage_permissions"; // view/administer "who can override what"

/** Lifecycle of a single override request. */
export type OverrideStatus = "proposed" | "approved" | "rejected" | "applied";

/** Actions that are recorded in the audit log. */
export type AuditAction = "propose" | "approve" | "reject" | "full_override";

export interface OverrideRequest {
  id: string;
  routeId: string;
  routeName: string;
  /** What the override changes (human-readable). */
  description: string;
  /** Why the change is requested. */
  reason: string;
  status: OverrideStatus;
  createdByRole: Role;
  createdAt: string;
  decidedByRole?: Role;
  decidedAt?: string;
}

export interface AuditEntry {
  id: string;
  /** When the action happened (ISO 8601). */
  at: string;
  /** Who performed the action. */
  actorRole: Role;
  /** What action was performed. */
  action: AuditAction;
  /** What was acted on (route name). */
  target: string;
  /** Free-form detail for the compliance reader. */
  detail: string;
}

export interface AppState {
  overrides: OverrideRequest[];
  audit: AuditEntry[];
}
