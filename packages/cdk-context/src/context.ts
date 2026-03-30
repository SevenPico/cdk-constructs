export interface Context {
  readonly namespace: string;
  readonly environment?: string;
  readonly stage?: string;
  readonly name?: string;
  readonly attributes?: string[];
  readonly tags?: Record<string, string>;
  readonly enabled?: boolean;
  readonly delimiter?: string;
}

export interface MakeContextOptions {
  readonly namespace: string;
  readonly environment?: string;
  readonly stage?: string;
  readonly name?: string;
  readonly attributes?: string[];
  readonly tags?: Record<string, string>;
  readonly enabled?: boolean;
  readonly delimiter?: string;
}

export const makeContext = (opts: MakeContextOptions): Context => ({
  namespace: opts.namespace,
  environment: opts.environment,
  stage: opts.stage,
  name: opts.name,
  attributes: opts.attributes ?? [],
  tags: opts.tags ?? {},
  enabled: opts.enabled ?? true,
  delimiter: opts.delimiter ?? '-',
});

export const contextId = (ctx: Context): string => {
  const parts = [ctx.namespace, ctx.environment, ctx.stage, ctx.name, ...(ctx.attributes ?? [])];
  return parts.filter(Boolean).join(ctx.delimiter ?? '-');
};

export const contextTags = (ctx: Context): Record<string, string> => ({
  Namespace: ctx.namespace,
  ...(ctx.environment ? { Environment: ctx.environment } : {}),
  ...(ctx.stage ? { Stage: ctx.stage } : {}),
  ...(ctx.name ? { Name: ctx.name } : {}),
  ...(ctx.tags ?? {}),
});

export const isEnabled = (ctx: Context): boolean => ctx.enabled !== false;

export const extendContext = (ctx: Context, overrides: Partial<MakeContextOptions>): Context => ({
  ...ctx,
  ...overrides,
  attributes: [...(ctx.attributes ?? []), ...(overrides.attributes ?? [])],
  tags: { ...(ctx.tags ?? {}), ...(overrides.tags ?? {}) },
});
