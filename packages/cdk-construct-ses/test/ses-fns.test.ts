import { makeContext } from '@sevenpico/cdk-context';
import { sesIdentityName, sesGroupName, sesUserName, sesPolicyStatement } from '../src/ses-fns';
import { SesProps } from '../src/ses-types';

const ctx = makeContext({ namespace: 'mail', stage: 'prod', name: 'example-com' });

const baseProps: SesProps = {
  context: ctx,
};

describe('sesIdentityName', () => {
  test('returns context ID', () => {
    expect(sesIdentityName(ctx)).toBe('mail-prod-example-com');
  });
});

describe('sesGroupName', () => {
  test('returns context ID with -ses suffix by default', () => {
    expect(sesGroupName(ctx, baseProps)).toBe('mail-prod-example-com-ses');
  });

  test('returns custom group name when provided', () => {
    expect(sesGroupName(ctx, { ...baseProps, sesGroupName: 'my-ses-group' })).toBe('my-ses-group');
  });
});

describe('sesUserName', () => {
  test('returns context ID with -ses-user suffix', () => {
    expect(sesUserName(ctx)).toBe('mail-prod-example-com-ses-user');
  });
});

describe('sesPolicyStatement', () => {
  test('defaults to ses:SendRawEmail action', () => {
    const stmt = sesPolicyStatement(baseProps, 'arn:aws:ses:us-east-1:123:identity/example.com');
    expect(stmt.toJSON().Action).toBe('ses:SendRawEmail');
  });

  test('uses custom actions when provided', () => {
    const stmt = sesPolicyStatement(
      { ...baseProps, iamPermissions: ['ses:SendEmail', 'ses:SendRawEmail'] },
      'arn:aws:ses:us-east-1:123:identity/example.com',
    );
    expect(stmt.toJSON().Action).toEqual(['ses:SendEmail', 'ses:SendRawEmail']);
  });

  test('defaults resource to identity ARN', () => {
    const stmt = sesPolicyStatement(baseProps, 'arn:aws:ses:us-east-1:123:identity/example.com');
    expect(stmt.toJSON().Resource).toBe('arn:aws:ses:us-east-1:123:identity/example.com');
  });

  test('uses custom resources when provided', () => {
    const stmt = sesPolicyStatement(
      { ...baseProps, iamAllowedResources: ['arn:aws:ses:*:*:identity/*'] },
      'arn:aws:ses:us-east-1:123:identity/example.com',
    );
    expect(stmt.toJSON().Resource).toBe('arn:aws:ses:*:*:identity/*');
  });
});
