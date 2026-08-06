import { useState } from "react";
import { can } from "../permissions";
import { ROUTES } from "../seed";
import type { Role } from "../types";

interface Props {
  role: Role;
  onPropose: (input: {
    routeId: string;
    routeName: string;
    description: string;
    reason: string;
  }) => void;
  onFullOverride: (input: {
    routeId: string;
    routeName: string;
    description: string;
    reason: string;
  }) => void;
}

export function OverrideForms({ role, onPropose, onFullOverride }: Props) {
  const [routeId, setRouteId] = useState(ROUTES[0].id);
  const [description, setDescription] = useState("");
  const [reason, setReason] = useState("");

  const mayPropose = can(role, "propose");
  const mayFull = can(role, "full_override");

  if (!mayPropose && !mayFull) {
    return (
      <section className="panel">
        <h2>上書きの起票</h2>
        <div className="locked">
          このロールには上書きを起票する権限がありません。
        </div>
      </section>
    );
  }

  const routeName = ROUTES.find((r) => r.id === routeId)!.name;
  const canSubmit = description.trim().length > 0 && reason.trim().length > 0;

  const reset = () => {
    setDescription("");
    setReason("");
  };

  return (
    <section className="panel">
      <h2>上書きの起票</h2>
      <p className="hint">
        提案は監督者/安全責任者の承認が必要です。フル上書きは安全責任者のみ即時適用できます。
      </p>

      <label htmlFor="route">対象ルート</label>
      <select
        id="route"
        value={routeId}
        onChange={(e) => setRouteId(e.target.value)}
      >
        {ROUTES.map((r) => (
          <option key={r.id} value={r.id}>
            {r.id} — {r.name}
          </option>
        ))}
      </select>

      <label htmlFor="desc">変更内容</label>
      <textarea
        id="desc"
        value={description}
        placeholder="例: ドック2からドック3へ振り替え"
        onChange={(e) => setDescription(e.target.value)}
      />

      <label htmlFor="reason">理由</label>
      <textarea
        id="reason"
        value={reason}
        placeholder="例: ドック2で車両故障"
        onChange={(e) => setReason(e.target.value)}
      />

      {mayPropose && (
        <button
          className="primary"
          disabled={!canSubmit}
          onClick={() => {
            onPropose({ routeId, routeName, description, reason });
            reset();
          }}
        >
          承認へ提案する
        </button>
      )}{" "}
      {mayFull && (
        <button
          className="primary danger"
          disabled={!canSubmit}
          onClick={() => {
            onFullOverride({ routeId, routeName, description, reason });
            reset();
          }}
        >
          フル上書き（即時適用）
        </button>
      )}
    </section>
  );
}
