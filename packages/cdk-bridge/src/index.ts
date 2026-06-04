import { Context } from '@sevenpico/cdk-context';
import { Construct } from 'constructs';
import { bridgeContext, bridgeValue, bridgeString, readBridgeConfig } from './bridge-fns';
import { BridgeConfig } from './bridge-types';

export { BridgeConfig } from './bridge-types';
export { bridgeContext, bridgeValue, bridgeString, readBridgeConfig, bridgeConfigToContextProps } from './bridge-fns';

export class CdkBridge {
  /** Read the bridge config and return a fully computed Context. */
  public static context(scope: Construct): Context {
    return bridgeContext(scope);
  }

  /** Read an arbitrary platform output value from the bridge config. */
  public static value(scope: Construct, key: string): object {
    return bridgeValue(scope, key);
  }

  /** Read an arbitrary platform output value as a string. */
  public static string(scope: Construct, key: string, defaultValue?: string): string {
    return bridgeString(scope, key, defaultValue);
  }

  /** Read the raw bridge config object. */
  public static config(scope: Construct): BridgeConfig {
    return readBridgeConfig(scope);
  }
}
