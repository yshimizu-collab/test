import { can, ROLE_LABELS } from "../permissions";
import type { AuditAction, AuditEntry, Role } from "../types";

const ACTION_LABELS: Record<AuditAction, string> = {
  propose: "提案",
  approve: "承認",
  reject: "却下",
  full_override: "フル上書き",
};

interface Props {
  role: Role;
  audit: AuditEntry[];
}

export function AuditLog({ role, audit }: Props) {
  if (!can(role, "view_audit")) {
    return (
      <section className="panel full-width">
        <h2>監査ログ</h2>
        <div className="locked">
          監査ログは安全責任者 / IT・Admin のみ閲覧できます。
        </div>
      </section>
    );
  }

  return (
    <section className="panel full-width">
      <h2>自動監査ログ（誰が・何を・いつ）</h2>
      <p className="hint">
        コンプライアンス確認用。すべてのアクションが自動で記録されます。
      </p>
      {audit.length === 0 ? (
        <p className="empty">まだ記録がありません。</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>いつ (UTC)</th>
              <th>誰が</th>
              <th>アクション</th>
              <th>対象ルート</th>
              <th>詳細</th>
            </tr>
          </thead>
          <tbody>
            {audit.map((e) => (
              <tr key={e.id}>
                <td>{e.at.replace("T", " ").replace(".000Z", "")}</td>
                <td>{ROLE_LABELS[e.actorRole]}</td>
                <td>{ACTION_LABELS[e.action]}</td>
                <td>{e.target}</td>
                <td>{e.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
