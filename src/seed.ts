import { decide, fullOverride, propose } from "./logic";
import type { AppState } from "./types";

/** A few candidate routes an operator might want to override. */
export const ROUTES = [
  { id: "R-101", name: "倉庫A → 出荷ドック 3" },
  { id: "R-204", name: "ライン2 → 検査エリア" },
  { id: "R-330", name: "資材置場 → 組立ライン1" },
];

/**
 * Deterministic sample state so the prototype opens with something to review.
 * Uses a fixed clock and id sequence so screenshots and demos are stable.
 */
export function buildSeedState(): AppState {
  let seq = 0;
  const id = (p: string) => `seed_${p}_${(seq += 1)}`;
  const at = (min: number) =>
    new Date(Date.UTC(2026, 7, 5, 0, min, 0)).toISOString();

  let state: AppState = { overrides: [], audit: [] };

  // 1) Operator proposes an override (still awaiting a decision).
  state = propose(
    state,
    {
      actorRole: "operator",
      routeId: "R-204",
      routeName: "ライン2 → 検査エリア",
      description: "混雑のため一時的に迂回ルートへ変更",
      reason: "コンベア点検で通路が塞がれているため",
    },
    at(5),
    id,
  );

  // 2) Operator proposes another one; a supervisor approves it.
  state = propose(
    state,
    {
      actorRole: "operator",
      routeId: "R-101",
      routeName: "倉庫A → 出荷ドック 3",
      description: "ドック2からドック3へ振り替え",
      reason: "ドック2で車両故障",
    },
    at(10),
    id,
  );
  const approved = state.overrides.find((o) => o.routeId === "R-101")!;
  state = decide(
    state,
    { actorRole: "supervisor", requestId: approved.id, decision: "approve" },
    at(12),
    id,
  );

  // 3) Safety officer performs an immediate full override.
  state = fullOverride(
    state,
    {
      actorRole: "safety_officer",
      routeId: "R-330",
      routeName: "資材置場 → 組立ライン1",
      description: "危険物検知により全面通行止め・代替路へ強制切替",
      reason: "安全確保（コンプライアンス優先）",
    },
    at(15),
    id,
  );

  return state;
}
