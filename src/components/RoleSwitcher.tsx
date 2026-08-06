import {
  ALL_CAPABILITIES,
  CAPABILITY_LABELS,
  PERMISSION_MATRIX,
  ROLE_LABELS,
  ALL_ROLES,
} from "../permissions";
import type { Role } from "../types";

interface Props {
  role: Role;
  onChange: (role: Role) => void;
}

export function RoleSwitcher({ role, onChange }: Props) {
  const caps = ALL_CAPABILITIES.filter((c) =>
    PERMISSION_MATRIX[role].includes(c),
  ).map((c) => CAPABILITY_LABELS[c]);

  return (
    <div>
      <div className="role-switcher" role="tablist" aria-label="ロール切替">
        {ALL_ROLES.map((r) => (
          <button
            key={r}
            className={r === role ? "active" : ""}
            aria-pressed={r === role}
            onClick={() => onChange(r)}
          >
            {ROLE_LABELS[r]}
          </button>
        ))}
      </div>
      <div className="role-caps">
        現在のロールでできること: {caps.length ? caps.join(" / ") : "（なし）"}
      </div>
    </div>
  );
}
