import { makeContext } from '@sevenpico/cdk-context';
import { redshiftClusterProps } from '../src/redshift-cluster-fns';

describe('RedshiftCluster pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(redshiftClusterProps(ctx, {})).toBeDefined();
  });
});
