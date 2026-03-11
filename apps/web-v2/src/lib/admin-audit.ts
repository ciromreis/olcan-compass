export const DEFAULT_AUDIT_ACTOR = "admin@olcan.com";
export const DEFAULT_AUDIT_LIMIT = 300;

export interface BaseAuditPayload<TModule extends string = string> {
  actor?: string;
  module: TModule;
  action: string;
  target: string;
  summary: string;
}

export interface BaseAuditRecord<TModule extends string = string> {
  id: string;
  at: string;
  actor: string;
  module: TModule;
  action: string;
  target: string;
  summary: string;
}

export function buildAuditRecord<TModule extends string>(
  payload: BaseAuditPayload<TModule>,
  options?: { at?: string; id?: string }
): BaseAuditRecord<TModule> {
  return {
    id: options?.id || `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    at: options?.at || new Date().toISOString(),
    actor: payload.actor || DEFAULT_AUDIT_ACTOR,
    module: payload.module,
    action: payload.action,
    target: payload.target,
    summary: payload.summary,
  };
}

export function prependAuditRecord<TModule extends string>(
  logs: BaseAuditRecord<TModule>[],
  record: BaseAuditRecord<TModule>,
  limit: number = DEFAULT_AUDIT_LIMIT
): BaseAuditRecord<TModule>[] {
  return [record, ...logs].slice(0, limit);
}

