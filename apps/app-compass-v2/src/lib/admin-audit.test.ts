import { describe, expect, it } from "vitest";
import {
  DEFAULT_AUDIT_ACTOR,
  buildAuditRecord,
  prependAuditRecord,
  type BaseAuditRecord,
} from "./admin-audit";

describe("admin audit helpers", () => {
  it("uses fallback actor when payload actor is missing", () => {
    const entry = buildAuditRecord(
      {
        module: "finance",
        action: "payout_paid",
        target: "pr1",
        summary: "Solicitação marcada como paga.",
      },
      { at: "2026-03-10T12:00:00.000Z", id: "audit_fixed" }
    );

    expect(entry.actor).toBe(DEFAULT_AUDIT_ACTOR);
    expect(entry.id).toBe("audit_fixed");
    expect(entry.at).toBe("2026-03-10T12:00:00.000Z");
  });

  it("preserves explicit actor when provided", () => {
    const entry = buildAuditRecord(
      {
        actor: "ops@olcan.com",
        module: "settings",
        action: "toggle_feature_flag",
        target: "ai_coach_mode",
        summary: "Flag alterada.",
      },
      { at: "2026-03-10T12:00:00.000Z", id: "audit_actor" }
    );

    expect(entry.actor).toBe("ops@olcan.com");
  });

  it("prepends newest record and enforces retention limit", () => {
    const previous: BaseAuditRecord[] = [
      {
        id: "old_1",
        at: "2026-03-09T00:00:00.000Z",
        actor: "a@olcan.com",
        module: "users",
        action: "update_user_status",
        target: "u1",
        summary: "Status alterado",
      },
      {
        id: "old_2",
        at: "2026-03-08T00:00:00.000Z",
        actor: "a@olcan.com",
        module: "users",
        action: "update_user_role",
        target: "u2",
        summary: "Role alterada",
      },
    ];

    const current = buildAuditRecord(
      {
        actor: "ops@olcan.com",
        module: "finance",
        action: "payout_approved",
        target: "pr2",
        summary: "Saque aprovado",
      },
      { at: "2026-03-10T00:00:00.000Z", id: "new_1" }
    );

    const next = prependAuditRecord(previous, current, 2);
    expect(next).toHaveLength(2);
    expect(next[0].id).toBe("new_1");
    expect(next[1].id).toBe("old_1");
  });
});

