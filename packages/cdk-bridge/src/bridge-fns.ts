import { makeContext, Context, ContextProps } from '@sevenpico/cdk-context';
import { Construct } from 'constructs';
import { BridgeConfig } from './bridge-types';

const BRIDGE_CONFIG_KEYS: (keyof BridgeConfig)[] = [
  'namespace', 'environment', 'stage', 'tenant', 'region', 'project',
  'delimiter', 'labelOrder', 'labelKeyCase', 'labelValueCase',
  'idLengthLimit', 'enabled', 'tags', 'additionalTagMap', 'labelsAsTags',
];

/** Read the raw bridge config from CDK context. Throws if required keys are missing. */
export const readBridgeConfig = (scope: Construct): BridgeConfig => {
  const namespace = scope.node.tryGetContext('namespace');
  const environment = scope.node.tryGetContext('environment');
  const stage = scope.node.tryGetContext('stage');

  if (!namespace || !environment || !stage) {
    throw new Error(
      "SevenPico CDK Bridge: required context keys 'namespace', 'environment', 'stage' not found. Ensure your cdk.json or .cdk.json includes these keys under 'context'.",
    );
  }

  const config: Record<string, unknown> = {};
  for (const key of BRIDGE_CONFIG_KEYS) {
    const value = scope.node.tryGetContext(key as string);
    if (value !== undefined) config[key] = value;
  }
  return config as unknown as BridgeConfig;
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

/**
 * Read a value from CDK context. Supports dot-notation for nested access.
 * Example: bridgeValue(scope, 'dataDsqlClusterArns.main')
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const bridgeValue = (scope: Construct, key: string): any => {
  const parts = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = scope.node.tryGetContext(parts[0]);
  for (let i = 1; i < parts.length; i++) {
    if (value == null) return undefined;
    value = value[parts[i]];
  }
  return value;
};

/** Read an arbitrary platform output value as a string. Throws if missing or not a string. */
export const bridgeString = (scope: Construct, key: string, defaultValue?: string): string => {
  const value = bridgeValue(scope, key);
  if (value === undefined && defaultValue !== undefined) return defaultValue;
  if (typeof value !== 'string') {
    throw new Error(`SevenPico CDK Bridge: key '${key}' is not a string (got ${typeof value})`);
  }
  return value;
};
