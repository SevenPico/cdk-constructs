import { contextId, extendContext, isEnabled } from '@sevenpico/cdk-context';
import { App } from 'aws-cdk-lib';
import { bridgeContext, bridgeString } from '../src/bridge-fns';

function appWithContext(ctx: Record<string, unknown>): App {
  return new App({ context: { sevenpico: ctx } });
}

describe('bridgeContext', () => {
  it('returns a Context with the correct id from valid CDK context', () => {
    const app = appWithContext({ namespace: '7p', environment: 'prod', stage: 'app' });
    const ctx = bridgeContext(app);
    expect(contextId(ctx)).toBe('7p-prod-app');
  });

  it('throws when the sevenpico context key is missing', () => {
    const app = new App();
    expect(() => bridgeContext(app)).toThrow(/context key 'sevenpico' not found/);
  });

  it('returns a disabled Context when enabled is false', () => {
    const app = appWithContext({ namespace: '7p', environment: 'prod', stage: 'app', enabled: false });
    const ctx = bridgeContext(app);
    expect(isEnabled(ctx)).toBe(false);
  });
});

describe('extendContext', () => {
  it('extends the Context with additional attributes', () => {
    const app = appWithContext({ namespace: '7p', environment: 'prod', stage: 'app' });
    const ctx = bridgeContext(app);
    const extended = extendContext(ctx, { attributes: ['api'] });
    expect(contextId(extended)).toBe('7p-prod-app-api');
  });
});

describe('bridgeString', () => {
  it('returns a string value from the bridge config', () => {
    const app = appWithContext({ namespace: '7p', environment: 'prod', stage: 'app', customKey: 'value' });
    expect(bridgeString(app, 'customKey')).toBe('value');
  });

  it('returns the default value when the key is absent', () => {
    const app = appWithContext({ namespace: '7p', environment: 'prod', stage: 'app' });
    expect(bridgeString(app, 'missingKey', 'fallback')).toBe('fallback');
  });
});
