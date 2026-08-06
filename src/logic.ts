import { can } from "./permissions";
import type { AppState, OverrideRequest, Role } from "./types";

/**
 * Pure state-transition functions for the override workflow.
 *
 * Every function returns a NEW AppState (no mutation) and records an audit entry
 * for the action. Permission checks are enforced here, so the UI cannot perform
 * an action that the permission matrix forbids. `now` and `id` are injectable to
 * keep the functions deterministic under test.
 */

export class PermissionError extends Error {
  constructor(role: Role, action: string) {
    super(`Role "${role}" is not allowed to ${action}`);
    this.name = "PermissionError";
  }
}

let counter = 0;
function defaultId(prefix: string): string {
  counter += 1;
  return `${prefix}_${counter}`;
}

export const initialState: AppState = { overrides: [], audit: [] };

interface ProposeInput {
  actorRole: Role;
  routeId: string;
  routeName: string;
  description: string;
  reason: string;
}

export function propose(
  state: AppState,
  input: ProposeInput,
  now: string = new Date().toISOString(),
  makeId: (p: string) => string = defaultId,
): AppState {
  if (!can(input.actorRole, "propose")) {
    throw new PermissionError(input.actorRole, "propose an override");
  }
  const request: OverrideRequest = {
    id: makeId("ovr"),
    routeId: input.routeId,
    routeName: input.routeName,
    description: input.description,
    reason: input.reason,
    status: "proposed",
    createdByRole: input.actorRole,
    createdAt: now,
  };
  return {
    overrides: [request, ...state.overrides],
    audit: [
      {
        id: makeId("aud"),
        at: now,
        actorRole: input.actorRole,
        action: "propose",
        target: input.routeName,
        detail: input.description,
      },
      ...state.audit,
    ],
  };
}

interface DecideInput {
  actorRole: Role;
  requestId: string;
  decision: "approve" | "reject";
}

export function decide(
  state: AppState,
  input: DecideInput,
  now: string = new Date().toISOString(),
  makeId: (p: string) => string = defaultId,
): AppState {
  if (!can(input.actorRole, input.decision)) {
    throw new PermissionError(input.actorRole, input.decision);
  }
  const request = state.overrides.find((o) => o.id === input.requestId);
  if (!request) {
    throw new Error(`Override request "${input.requestId}" not found`);
  }
  if (request.status !== "proposed") {
    throw new Error(
      `Override request "${input.requestId}" is "${request.status}", not "proposed"`,
    );
  }
  const nextStatus = input.decision === "approve" ? "approved" : "rejected";
  const updated: OverrideRequest = {
    ...request,
    status: nextStatus,
    decidedByRole: input.actorRole,
    decidedAt: now,
  };
  return {
    overrides: state.overrides.map((o) => (o.id === request.id ? updated : o)),
    audit: [
      {
        id: makeId("aud"),
        at: now,
        actorRole: input.actorRole,
        action: input.decision,
        target: request.routeName,
        detail: `${request.description}（提案者: ${request.createdByRole}）`,
      },
      ...state.audit,
    ],
  };
}

interface FullOverrideInput {
  actorRole: Role;
  routeId: string;
  routeName: string;
  description: string;
  reason: string;
}

export function fullOverride(
  state: AppState,
  input: FullOverrideInput,
  now: string = new Date().toISOString(),
  makeId: (p: string) => string = defaultId,
): AppState {
  if (!can(input.actorRole, "full_override")) {
    throw new PermissionError(input.actorRole, "perform a full override");
  }
  const request: OverrideRequest = {
    id: makeId("ovr"),
    routeId: input.routeId,
    routeName: input.routeName,
    description: input.description,
    reason: input.reason,
    status: "applied",
    createdByRole: input.actorRole,
    createdAt: now,
    decidedByRole: input.actorRole,
    decidedAt: now,
  };
  return {
    overrides: [request, ...state.overrides],
    audit: [
      {
        id: makeId("aud"),
        at: now,
        actorRole: input.actorRole,
        action: "full_override",
        target: input.routeName,
        detail: `${input.description}（即時適用）`,
      },
      ...state.audit,
    ],
  };
}
