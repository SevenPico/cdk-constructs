import { Construct } from 'constructs';
import { makeContext, Context, ContextProps } from '@sevenpico/cdk-context';
import { BridgeConfig } from './bridge-types';

const CONTEXT_KEY = 'sevenpico';

/** Read the raw bridge config from CDK context. Throws if not found. */
export const readBridgeConfig = (scope: Construct): BridgeConfig => {
  const config = scope.node.tryGetContext(CONTEXT_KEY);
  if (!config || typeof config !== 'object') {
    throw new Error(
      `SevenPico CDK Bridge: context key '${CONTEXT_KEY}' not found or invalid. ` +
      `Run the bridge setup script to load the environment config into ~/.cdk.json.`,
    );
  }
  return config as BridgeConfig;
};

/** Map BridgeConfig fields to ContextProps. */
export const bridgeConfigToContextProps = (config: BridgeConfig): ContextProps => ({
  namespace: config.namespace,
  environment: config.environment,
  stage: config.stage,
  delimiter: config.delimiter,
  enabled: config.enabled,
  tags: config.tags,
});

/** Read bridge config and return a fully computed Context. */
export const bridgeContext = (scope: Construct): Context =>
  makeContext(bridgeConfigToContextProps(readBridgeConfig(scope)));

/** Read an arbitrary platform output value from the bridge config. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const bridgeValue = (scope: Construct, key: string): any =>
  (readBridgeConfig(scope) as unknown as Record<string, unknown>)[key];

/** Read an arbitrary platform output value as a string. Throws if missing or not a string. */
export const bridgeString = (scope: Construct, key: string, defaultValue?: string): string => {
  const value = bridgeValue(scope, key);
  if (value === undefined && defaultValue !== undefined) return defaultValue;
  if (typeof value !== 'string') {
    throw new Error(`SevenPico CDK Bridge: key '${key}' is not a string (got ${typeof value})`);
  }
  return value;
};
