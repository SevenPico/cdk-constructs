import { makeContext } from '@sevenpico/cdk-context';
import {
  apiName,
  corsConfigProperty,
  defaultAccessLogFormat,
} from '../src/http-api-gateway-fns';
import { HttpApiGatewayProps } from '../src/http-api-gateway-types';

describe('HttpApiGateway pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'api' });
  const defaultProps: HttpApiGatewayProps = { context: ctx };

  describe('apiName', () => {
    test('returns context ID', () => {
      expect(apiName(ctx, defaultProps)).toBe('7p-prod-api');
    });
  });

  describe('corsConfigProperty', () => {
    test('returns undefined when no cors config', () => {
      expect(corsConfigProperty(undefined)).toBeUndefined();
    });

    test('maps allowOrigins', () => {
      const result = corsConfigProperty({ allowOrigins: ['https://example.com'] });
      expect(result!.allowOrigins).toEqual(['https://example.com']);
    });

    test('maps allowMethods', () => {
      const result = corsConfigProperty({ allowMethods: ['GET', 'POST'] });
      expect(result!.allowMethods).toEqual(['GET', 'POST']);
    });

    test('maps allowHeaders', () => {
      const result = corsConfigProperty({ allowHeaders: ['Content-Type', 'Authorization'] });
      expect(result!.allowHeaders).toEqual(['Content-Type', 'Authorization']);
    });

    test('maps exposeHeaders', () => {
      const result = corsConfigProperty({ exposeHeaders: ['X-Custom'] });
      expect(result!.exposeHeaders).toEqual(['X-Custom']);
    });

    test('maps maxAge', () => {
      const result = corsConfigProperty({ maxAge: 300 });
      expect(result!.maxAge).toBe(300);
    });

    test('maxAge undefined when not provided', () => {
      const result = corsConfigProperty({ allowOrigins: ['*'] });
      expect(result!.maxAge).toBeUndefined();
    });

    test('maps allowCredentials', () => {
      const result = corsConfigProperty({ allowCredentials: true });
      expect(result!.allowCredentials).toBe(true);
    });
  });

  describe('defaultAccessLogFormat', () => {
    test('returns valid JSON string', () => {
      const fmt = defaultAccessLogFormat();
      const parsed = JSON.parse(fmt);
      expect(parsed.requestId).toBe('$context.requestId');
      expect(parsed.sourceIp).toBe('$context.identity.sourceIp');
      expect(parsed.httpMethod).toBe('$context.httpMethod');
      expect(parsed.routeKey).toBe('$context.routeKey');
      expect(parsed.status).toBe('$context.status');
      expect(parsed.protocol).toBe('$context.protocol');
      expect(parsed.responseLength).toBe('$context.responseLength');
      expect(parsed.error).toBe('$context.error.message');
    });
  });
});
