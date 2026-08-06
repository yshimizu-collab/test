import { can, ROLE_LABELS } from "../permissions";
import type { OverrideRequest, OverrideStatus, Role } from "../types";

const STATUS_LABELS: Record<OverrideStatus, string> = {
  proposed: "承認待ち",
  approved: "承認済み",
  applied: "適用済み",
  rejected: "却下",
};

interface Props {
  role: Role;
  overrides: OverrideRequest[];
  onDecide: (requestId: string, decision: "approve" | "reject") => void;
}

export function ApprovalQueue({ role, overrides, onDecide }: Props) {
  const mayDecide = can(role, "approve") || can(role, "reject");
  const pending = overrides.filter((o) => o.status === "proposed");
  const decided = overrides.filter((o) => o.status !== "proposed");

  return (
    <section className="panel">
      <h2>承認キュー</h2>
      {!mayDecide && (
        <p className="hint">
          このロールは承認/却下ができません（閲覧のみ）。
        </p>
      )}

      {pending.length === 0 && (
        <p className="empty">承認待ちの提案はありません。</p>
      )}

      {pending.map((o) => (
        <div className="request" key={o.id}>
          <div className="route">{o.routeName}</div>
          <div className="meta">
            提案: {ROLE_LABELS[o.createdByRole]} ／ {o.description} ／ 理由:{" "}
            {o.reason}
          </div>
          <span className={`badge ${o.status}`}>{STATUS_LABELS[o.status]}</span>
          {mayDecide && (
            <div className="actions" style={{ marginTop: 8 }}>
              <button
                className="approve"
                onClick={() => onDecide(o.id, "approve")}
              >
                承認
              </button>
              <button
                className="reject"
                onClick={() => onDecide(o.id, "reject")}
              >
                却下
              </button>
            </div>
          )}
        </div>
      ))}

      {decided.length > 0 && (
        <>
          <h2 style={{ marginTop: 16 }}>処理済み</h2>
          {decided.map((o) => (
            <div className="request" key={o.id}>
              <div className="route">{o.routeName}</div>
              <div className="meta">
                {o.description}
                {o.decidedByRole
                  ? ` ／ 判断: ${ROLE_LABELS[o.decidedByRole]}`
                  : ""}
              </div>
              <span className={`badge ${o.status}`}>
                {STATUS_LABELS[o.status]}
              </span>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
