import { makeContext } from '@sevenpico/cdk-context';
import { roleName, buildTrustPolicyJson } from '../src/iam-role-fns';

describe('roleName', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'lambda' });

  test('uses context id by default', () => {
    expect(roleName(ctx, { context: ctx, roleDescription: 'test' })).toBe('7p-prod-lambda');
  });

  test('uses context.name when useFullname is false', () => {
    expect(roleName(ctx, { context: ctx, roleDescription: 'test', useFullname: false })).toBe('lambda');
  });
});

describe('buildTrustPolicyJson', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'lambda' });

  test('builds trust policy with service principal', () => {
    const result = buildTrustPolicyJson({
      context: ctx,
      roleDescription: 'test',
      principals: { Service: ['lambda.amazonaws.com'] },
    });
    expect(result.Version).toBe('2012-10-17');
    const stmt = (result.Statement as any[])[0];
    expect(stmt.Principal).toEqual({ Service: ['lambda.amazonaws.com'] });
    expect(stmt.Action).toEqual(['sts:AssumeRole', 'sts:TagSession']);
  });

  test('uses override document when provided', () => {
    const override = JSON.stringify({ Version: '2012-10-17', Statement: [{ Effect: 'Allow' }] });
    const result = buildTrustPolicyJson({
      context: ctx,
      roleDescription: 'test',
      assumeRolePolicyDocumentOverride: override,
    });
    expect((result.Statement as any[])[0].Effect).toBe('Allow');
  });

  test('includes conditions when provided', () => {
    const result = buildTrustPolicyJson({
      context: ctx,
      roleDescription: 'test',
      principals: { Service: ['lambda.amazonaws.com'] },
      assumeRoleConditions: [{
        test: 'StringEquals',
        variable: 'aws:SourceAccount',
        values: ['123456789012'],
      }],
    });
    const stmt = (result.Statement as any[])[0];
    expect(stmt.Condition.StringEquals['aws:SourceAccount']).toEqual(['123456789012']);
  });
});
