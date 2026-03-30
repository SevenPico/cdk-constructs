import { makeContext } from '@sevenpico/cdk-context';
import { httpApiGatewayProps } from '../src/http-api-gateway-fns';

describe('HttpApiGateway pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(httpApiGatewayProps(ctx, {})).toBeDefined();
  });
});
