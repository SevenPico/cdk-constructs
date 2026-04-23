import { makeContext } from '@sevenpico/cdk-context';
import { aws_iam as iam } from 'aws-cdk-lib';
import { roleName, buildIamPrincipal, buildTrustPolicy, mergePolicyDocuments } from '../src/iam-role-fns';

describe('roleName', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'lambda' });

  test('defaults to full context id', () => {
    expect(roleName(ctx, { context: ctx, roleDescription: 'test' })).toBe('7p-prod-lambda');
  });

  test('uses context.name when useFullname is false', () => {
    expect(roleName(ctx, { context: ctx, roleDescription: 'test', useFullname: false })).toBe('lambda');
  });
});

describe('buildIamPrincipal', () => {
  test('creates ServicePrincipal for Service type', () => {
    const principal = buildIamPrincipal('Service', 'lambda.amazonaws.com');
    expect(principal).toBeInstanceOf(iam.ServicePrincipal);
  });

  test('creates ArnPrincipal for AWS type', () => {
    const principal = buildIamPrincipal('AWS', 'arn:aws:iam::123456789:root');
    expect(principal).toBeInstanceOf(iam.ArnPrincipal);
  });

  test('creates FederatedPrincipal for Federated type', () => {
    const principal = buildIamPrincipal('Federated', 'cognito-identity.amazonaws.com');
    expect(principal).toBeInstanceOf(iam.FederatedPrincipal);
  });

  test('defaults to ArnPrincipal for unknown type', () => {
    const principal = buildIamPrincipal('Unknown', 'some-arn');
    expect(principal).toBeInstanceOf(iam.ArnPrincipal);
  });
});

describe('buildTrustPolicy', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'lambda' });

  test('uses AccountRootPrincipal when no principals provided', () => {
    const doc = buildTrustPolicy({ context: ctx, roleDescription: 'test' });
    const json = doc.toJSON();
    expect(json.Statement).toHaveLength(1);
    expect(json.Statement[0].Action).toContain('sts:AssumeRole');
  });

  test('uses provided principals', () => {
    const doc = buildTrustPolicy({
      context: ctx,
      roleDescription: 'test',
      principals: { Service: ['lambda.amazonaws.com'] },
    });
    const json = doc.toJSON();
    expect(json.Statement).toHaveLength(1);
    expect(JSON.stringify(json.Statement[0].Principal)).toContain('lambda.amazonaws.com');
  });

  test('uses custom assume role actions', () => {
    const doc = buildTrustPolicy({
      context: ctx,
      roleDescription: 'test',
      assumeRoleActions: ['sts:AssumeRoleWithSAML'],
    });
    const json = doc.toJSON();
    expect(json.Statement[0].Action).toContain('sts:AssumeRoleWithSAML');
  });

  test('uses override policy document when provided', () => {
    const overrideDoc = JSON.stringify({
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Principal: { Service: 'ec2.amazonaws.com' },
        Action: 'sts:AssumeRole',
      }],
    });
    const doc = buildTrustPolicy({
      context: ctx,
      roleDescription: 'test',
      assumeRolePolicyDocumentOverride: overrideDoc,
    });
    const json = doc.toJSON();
    expect(JSON.stringify(json)).toContain('ec2.amazonaws.com');
  });

  test('adds conditions when provided', () => {
    const doc = buildTrustPolicy({
      context: ctx,
      roleDescription: 'test',
      principals: { Service: ['lambda.amazonaws.com'] },
      assumeRoleConditions: [{ test: 'StringEquals', variable: 'aws:SourceAccount', values: ['123456789'] }],
    });
    const json = doc.toJSON();
    expect(json.Statement[0].Condition).toBeDefined();
  });
});

describe('mergePolicyDocuments', () => {
  test('returns undefined for empty array', () => {
    expect(mergePolicyDocuments([])).toBeUndefined();
  });

  test('merges multiple policy documents', () => {
    const doc1 = JSON.stringify({
      Version: '2012-10-17',
      Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
    });
    const doc2 = JSON.stringify({
      Version: '2012-10-17',
      Statement: [{ Effect: 'Allow', Action: 'logs:PutLogEvents', Resource: '*' }],
    });
    const merged = mergePolicyDocuments([doc1, doc2]);
    expect(merged).toBeDefined();
    const json = merged!.toJSON();
    expect(json.Statement).toHaveLength(2);
  });

  test('handles policy document with no Statement field', () => {
    const docWithNoStatement = JSON.stringify({ Version: '2012-10-17' });
    const merged = mergePolicyDocuments([docWithNoStatement]);
    expect(merged).toBeDefined();
  });
});

