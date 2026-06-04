export { Context, ContextProps } from './context-types';
export { CONTEXT_DEFAULTS } from './context-defaults';
export { makeContext, extendContext, contextId, contextTags, isEnabled } from './context-fns';

import { extendContext, isEnabled, makeContext } from './context-fns';
import { Context, ContextProps } from './context-types';

// JSII surface: standalone exported functions are not allowed in JSII.
// Wrap them in a static-method class for multi-language consumers.
export class ContextFns {
  public static make(props: ContextProps): Context {
    return makeContext(props);
  }

  public static extend(base: Context, overrides: ContextProps): Context {
    return extendContext(base, overrides);
  }

  public static id(ctx: Context): string {
    return ctx.id;
  }

  public static tags(ctx: Context): Record<string, string> {
    return ctx.tags;
  }

  public static isEnabled(ctx: Context): boolean {
    return isEnabled(ctx);
  }
}
