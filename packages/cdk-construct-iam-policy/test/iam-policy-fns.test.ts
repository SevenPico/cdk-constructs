import { aws_iam as iam } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { buildPolicyStatement, buildPolicyDocument, mergeStatements, managedPolicyProps } from '../src/iam-policy-fns';
import { IamPolicyProps } from '../src/iam-policy-types';

describe('IamPolicy pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 's3-read' });

  describe('buildPolicyStatement', () => {
    test('creates Allow statement by default', () => {
      const stmt = buildPolicyStatement('AllowRead', {
        actions: ['s3:GetObject'],
        resources: ['*'],
      });
      expect(stmt.sid).toBe('AllowRead');
      expect(stmt.effect).toBe(iam.Effect.ALLOW);
    });

    test('creates Deny statement when effect is Deny', () => {
      const stmt = buildPolicyStatement('DenyDelete', {
        actions: ['s3:DeleteObject'],
        resources: ['*'],
        effect: 'Deny',
      });
      expect(stmt.effect).toBe(iam.Effect.DENY);
    });

    test('adds conditions', () => {
      const stmt = buildPolicyStatement('Conditional', {
        actions: ['s3:GetObject'],
        resources: ['*'],
        conditions: {
          StringEquals: { 'aws:RequestedRegion': ['us-east-1'] },
        },
      });
      const json = stmt.toJSON();
      expect(json.Condition).toEqual({
        StringEquals: { 'aws:RequestedRegion': ['us-east-1'] },
      });
    });

    test('adds principals', () => {
      const stmt = buildPolicyStatement('WithPrincipal', {
        actions: ['s3:GetObject'],
        resources: ['*'],
        principals: { Service: ['lambda.amazonaws.com'] },
      });
      const json = stmt.toJSON();
      expect(json.Principal).toBeDefined();
    });

    test('adds notActions and notResources', () => {
      const stmt = buildPolicyStatement('NotActions', {
        notActions: ['s3:DeleteObject'],
        notResources: ['arn:aws:s3:::protected/*'],
      });
      const json = stmt.toJSON();
      expect(json.NotAction).toBe('s3:DeleteObject');
      expect(json.NotResource).toBe('arn:aws:s3:::protected/*');
    });
  });

  describe('buildPolicyDocument', () => {
    test('builds document from policyStatements', () => {
      const props: IamPolicyProps = {
        context: ctx,
        policyStatements: {
          Read: { actions: ['s3:GetObject'], resources: ['*'] },
        },
      };
      const doc = buildPolicyDocument(props);
      expect(doc.statementCount).toBe(1);
    });

    test('builds document from sourcePolicyDocuments', () => {
      const sourceDoc = JSON.stringify({
        Version: '2012-10-17',
        Statement: [{ Effect: 'Allow', Action: 'logs:CreateLogGroup', Resource: '*' }],
      });
      const props: IamPolicyProps = {
        context: ctx,
        sourcePolicyDocuments: [sourceDoc],
      };
      const doc = buildPolicyDocument(props);
      expect(doc.statementCount).toBe(1);
    });

    test('combines policyStatements and sourcePolicyDocuments', () => {
      const sourceDoc = JSON.stringify({
        Version: '2012-10-17',
        Statement: [{ Effect: 'Allow', Action: 'logs:CreateLogGroup', Resource: '*' }],
      });
      const props: IamPolicyProps = {
        context: ctx,
        policyStatements: {
          Read: { actions: ['s3:GetObject'], resources: ['*'] },
        },
        sourcePolicyDocuments: [sourceDoc],
      };
      const doc = buildPolicyDocument(props);
      expect(doc.statementCount).toBe(2);
    });

    test('empty props produces empty document', () => {
      const props: IamPolicyProps = { context: ctx };
      const doc = buildPolicyDocument(props);
      expect(doc.statementCount).toBe(0);
    });
  });

  describe('mergeStatements', () => {
    test('overrides replace matching SIDs', () => {
      const source = [
        new iam.PolicyStatement({ sid: 'A', actions: ['s3:GetObject'], resources: ['*'] }),
        new iam.PolicyStatement({ sid: 'B', actions: ['s3:PutObject'], resources: ['*'] }),
      ];
      const overrides = [
        new iam.PolicyStatement({ sid: 'A', actions: ['s3:DeleteObject'], resources: ['*'], effect: iam.Effect.DENY }),
      ];
      const result = mergeStatements(source, overrides);
      expect(result).toHaveLength(2);
      const sids = result.map(s => s.sid);
      expect(sids).toContain('A');
      expect(sids).toContain('B');
      const aStmt = result.find(s => s.sid === 'A')!;
      expect(aStmt.effect).toBe(iam.Effect.DENY);
    });

    test('non-matching overrides are appended', () => {
      const source = [
        new iam.PolicyStatement({ sid: 'A', actions: ['s3:GetObject'], resources: ['*'] }),
      ];
      const overrides = [
        new iam.PolicyStatement({ sid: 'C', actions: ['logs:*'], resources: ['*'] }),
      ];
      const result = mergeStatements(source, overrides);
      expect(result).toHaveLength(2);
    });

    test('empty overrides returns source unchanged', () => {
      const source = [
        new iam.PolicyStatement({ sid: 'A', actions: ['s3:GetObject'], resources: ['*'] }),
      ];
      const result = mergeStatements(source, []);
      expect(result).toHaveLength(1);
    });
  });

  describe('managedPolicyProps', () => {
    test('returns correct managed policy name from context', () => {
      const doc = new iam.PolicyDocument({
        statements: [new iam.PolicyStatement({ actions: ['s3:GetObject'], resources: ['*'] })],
      });
      const props: IamPolicyProps = {
        context: ctx,
        description: 'Test policy',
      };
      const result = managedPolicyProps(ctx, props, doc);
      expect(result.managedPolicyName).toBe('7p-prod-s3-read');
      expect(result.description).toBe('Test policy');
      expect(result.document).toBe(doc);
    });
  });
});
