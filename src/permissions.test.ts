import { describe, expect, it } from "vitest";
import { can } from "./permissions";
import {
  PermissionError,
  decide,
  fullOverride,
  initialState,
  propose,
} from "./logic";

const fixedNow = "2026-08-05T00:00:00.000Z";
let n = 0;
const id = (p: string) => `${p}_${(n += 1)}`;

describe("permission matrix", () => {
  it("operator can propose", () => {
    expect(can("operator", "propose")).toBe(true);
  });

  it("operator cannot approve", () => {
    expect(can("operator", "approve")).toBe(false);
  });

  it("supervisor can approve and reject", () => {
    expect(can("supervisor", "approve")).toBe(true);
    expect(can("supervisor", "reject")).toBe(true);
  });

  it("supervisor cannot perform a full override", () => {
    expect(can("supervisor", "full_override")).toBe(false);
  });

  it("safety officer can perform a full override and view audit", () => {
    expect(can("safety_officer", "full_override")).toBe(true);
    expect(can("safety_officer", "view_audit")).toBe(true);
  });

  it("it_admin can manage permissions but cannot propose", () => {
    expect(can("it_admin", "manage_permissions")).toBe(true);
    expect(can("it_admin", "propose")).toBe(false);
  });
});

describe("propose", () => {
  it("creates a proposed request and an audit entry", () => {
    const state = propose(
      initialState,
      {
        actorRole: "operator",
        routeId: "R-1",
        routeName: "Route 1",
        description: "detour",
        reason: "blocked",
      },
      fixedNow,
      id,
    );
    expect(state.overrides).toHaveLength(1);
    expect(state.overrides[0].status).toBe("proposed");
    expect(state.audit).toHaveLength(1);
    expect(state.audit[0].action).toBe("propose");
    expect(state.audit[0].actorRole).toBe("operator");
  });

  it("throws when a non-permitted role proposes", () => {
    expect(() =>
      propose(initialState, {
        actorRole: "it_admin",
        routeId: "R-1",
        routeName: "Route 1",
        description: "x",
        reason: "y",
      }),
    ).toThrow(PermissionError);
  });
});

describe("decide", () => {
  const proposed = propose(
    initialState,
    {
      actorRole: "operator",
      routeId: "R-1",
      routeName: "Route 1",
      description: "detour",
      reason: "blocked",
    },
    fixedNow,
    id,
  );
  const requestId = proposed.overrides[0].id;

  it("approves a proposed request and records who/when", () => {
    const next = decide(
      proposed,
      { actorRole: "supervisor", requestId, decision: "approve" },
      fixedNow,
      id,
    );
    expect(next.overrides[0].status).toBe("approved");
    expect(next.overrides[0].decidedByRole).toBe("supervisor");
    expect(next.overrides[0].decidedAt).toBe(fixedNow);
    expect(next.audit[0].action).toBe("approve");
  });

  it("rejects a proposed request", () => {
    const next = decide(
      proposed,
      { actorRole: "supervisor", requestId, decision: "reject" },
      fixedNow,
      id,
    );
    expect(next.overrides[0].status).toBe("rejected");
  });

  it("throws when an operator tries to approve", () => {
    expect(() =>
      decide(proposed, {
        actorRole: "operator",
        requestId,
        decision: "approve",
      }),
    ).toThrow(PermissionError);
  });

  it("throws when deciding on an already-decided request", () => {
    const approved = decide(
      proposed,
      { actorRole: "supervisor", requestId, decision: "approve" },
      fixedNow,
      id,
    );
    expect(() =>
      decide(approved, {
        actorRole: "supervisor",
        requestId,
        decision: "reject",
      }),
    ).toThrow(/not "proposed"/);
  });
});

describe("fullOverride", () => {
  it("safety officer applies immediately and logs it", () => {
    const state = fullOverride(
      initialState,
      {
        actorRole: "safety_officer",
        routeId: "R-9",
        routeName: "Route 9",
        description: "emergency stop",
        reason: "hazard",
      },
      fixedNow,
      id,
    );
    expect(state.overrides[0].status).toBe("applied");
    expect(state.audit[0].action).toBe("full_override");
  });

  it("throws when a supervisor attempts a full override", () => {
    expect(() =>
      fullOverride(initialState, {
        actorRole: "supervisor",
        routeId: "R-9",
        routeName: "Route 9",
        description: "x",
        reason: "y",
      }),
    ).toThrow(PermissionError);
  });
});
