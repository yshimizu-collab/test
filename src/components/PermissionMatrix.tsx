import {
  ALL_CAPABILITIES,
  ALL_ROLES,
  CAPABILITY_LABELS,
  can,
  ROLE_LABELS,
} from "../permissions";
import type { Role } from "../types";

interface Props {
  role: Role;
}

/**
 * "who can override what" — the discoverability screen requested by TechWare.
 * Visible to IT/Admin (and safety officers, who also hold view_audit).
 */
export function PermissionMatrix({ role }: Props) {
  if (!can(role, "manage_permissions") && !can(role, "view_audit")) {
    return (
      <section className="panel full-width">
        <h2>権限マトリクス</h2>
        <div className="locked">
          「who can override what」は IT・Admin / 安全責任者 が確認できます。
        </div>
      </section>
    );
  }

  return (
    <section className="panel full-width matrix">
      <h2>権限マトリクス（who can override what）</h2>
      <p className="hint">
        各ロールが保持する権限の一覧です。Admin はここで発見・確認できます。
      </p>
      <table>
        <thead>
          <tr>
            <th>権限 \ ロール</th>
            {ALL_ROLES.map((r) => (
              <th key={r}>{ROLE_LABELS[r]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ALL_CAPABILITIES.map((cap) => (
            <tr key={cap}>
              <td>{CAPABILITY_LABELS[cap]}</td>
              {ALL_ROLES.map((r) => (
                <td key={r} className={can(r, cap) ? "yes" : "no"}>
                  {can(r, cap) ? "✓" : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
