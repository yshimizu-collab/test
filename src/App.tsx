import { useState } from "react";
import { ApprovalQueue } from "./components/ApprovalQueue";
import { AuditLog } from "./components/AuditLog";
import { OverrideForms } from "./components/OverrideForms";
import { PermissionMatrix } from "./components/PermissionMatrix";
import { RoleSwitcher } from "./components/RoleSwitcher";
import { decide, fullOverride, propose } from "./logic";
import { buildSeedState } from "./seed";
import type { AppState, Role } from "./types";

export function App() {
  const [role, setRole] = useState<Role>("operator");
  const [state, setState] = useState<AppState>(() => buildSeedState());

  const handlePropose = (input: {
    routeId: string;
    routeName: string;
    description: string;
    reason: string;
  }) => {
    setState((s) => propose(s, { actorRole: role, ...input }));
  };

  const handleFullOverride = (input: {
    routeId: string;
    routeName: string;
    description: string;
    reason: string;
  }) => {
    setState((s) => fullOverride(s, { actorRole: role, ...input }));
  };

  const handleDecide = (requestId: string, decision: "approve" | "reject") => {
    setState((s) => decide(s, { actorRole: role, requestId, decision }));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>ルート上書き権限プロトタイプ</h1>
        <p>
          階層権限 / 承認フロー / 自動監査ログ / 権限マトリクスの検証用（インメモリ・本番非接続）
        </p>
      </header>

      <RoleSwitcher role={role} onChange={setRole} />

      <div className="grid">
        <OverrideForms
          role={role}
          onPropose={handlePropose}
          onFullOverride={handleFullOverride}
        />
        <ApprovalQueue
          role={role}
          overrides={state.overrides}
          onDecide={handleDecide}
        />
        <PermissionMatrix role={role} />
        <AuditLog role={role} audit={state.audit} />
      </div>
    </div>
  );
}
