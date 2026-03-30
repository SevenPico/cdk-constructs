import { Construct } from 'constructs';
import { Context, makeContext, MakeContextOptions } from '@sevenpico/cdk-context';

// TODO: implement full bridge per spec/02-cdk-bridge.md
export const contextFromCdk = (scope: Construct, opts: MakeContextOptions): Context => {
  return makeContext(opts);
};
