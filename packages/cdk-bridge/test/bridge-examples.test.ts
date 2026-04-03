import { App } from 'aws-cdk-lib';
import { bridgeContext, bridgeString } from '../src/bridge-fns';

// Shared fixture values matching examples/fixtures/bridge.cdk.json
const FIXTURE = {
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  region: 'us-east-1',
  tags: {
    Owner: 'platform-team',
    CostCenter: 'engineering',
    CDK: 'true',
  },
  vpcId: 'vpc-0abc123456789def0',
  vpcCidrBlock: '10.0.0.0/16',
  kmsKeyArn: 'arn:aws:kms:us-east-1:123456789012:key/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  logKmsKeyArn: 'arn:aws:kms:us-east-1:123456789012:key/bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
  publicZoneId: 'Z0PUBLICZONEID00000',
  publicZoneName: 'dev.acme.example.com',
  logsBucketName: 'acme-dev-app-logs-123456789012',
  alarmsSnsTopicArn: 'arn:aws:sns:us-east-1:123456789012:acme-dev-app-alarms',
  certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
};

function appWithFixture(): App {
  return new App({ context: { sevenpico: FIXTURE } });
}

// ---------------------------------------------------------------------------
// Example scenario: basic
// Validates Context ID + single Platform output (vpcId).
// ---------------------------------------------------------------------------

describe('Example: basic', () => {
  const app = appWithFixture();
  const ctx = bridgeContext(app);

  test('context id is namespace-environment-stage', () => {
    expect(ctx.id).toBe('acme-dev-app');
  });

  test('context is enabled', () => {
    expect(ctx.enabled).toBe(true);
  });

  test('Name tag equals context id', () => {
    expect(ctx.tags.Name).toBe('acme-dev-app');
  });

  test('bridgeString returns vpcId from fixture', () => {
    const app2 = appWithFixture();
    expect(bridgeString(app2, 'vpcId')).toBe('vpc-0abc123456789def0');
  });

  test('bridgeString returns default when key is absent', () => {
    const app2 = appWithFixture();
    expect(bridgeString(app2, 'nonExistentKey', 'fallback')).toBe('fallback');
  });
});

// ---------------------------------------------------------------------------
// Example scenario: full-platform
// Validates all bridge sections: vpc, kms, hostedZones, logs, alarms.
// ---------------------------------------------------------------------------

describe('Example: full-platform', () => {
  let app: App;

  beforeEach(() => {
    app = appWithFixture();
  });

  test('context id is correct', () => {
    expect(bridgeContext(app).id).toBe('acme-dev-app');
  });

  test('user-provided tags flow through to context', () => {
    const ctx = bridgeContext(app);
    expect(ctx.tags.Owner).toBe('platform-team');
    expect(ctx.tags.CostCenter).toBe('engineering');
  });

  test('vpcId is readable', () => {
    expect(bridgeString(app, 'vpcId')).toBe('vpc-0abc123456789def0');
  });

  test('vpcCidrBlock is readable', () => {
    expect(bridgeString(app, 'vpcCidrBlock')).toBe('10.0.0.0/16');
  });

  test('kmsKeyArn is readable', () => {
    expect(bridgeString(app, 'kmsKeyArn')).toMatch(/^arn:aws:kms:/);
  });

  test('logKmsKeyArn is readable', () => {
    expect(bridgeString(app, 'logKmsKeyArn')).toMatch(/^arn:aws:kms:/);
  });

  test('publicZoneId is readable', () => {
    expect(bridgeString(app, 'publicZoneId')).toBe('Z0PUBLICZONEID00000');
  });

  test('publicZoneName is readable', () => {
    expect(bridgeString(app, 'publicZoneName')).toBe('dev.acme.example.com');
  });

  test('logsBucketName is readable', () => {
    expect(bridgeString(app, 'logsBucketName')).toBe('acme-dev-app-logs-123456789012');
  });

  test('alarmsSnsTopicArn is readable', () => {
    expect(bridgeString(app, 'alarmsSnsTopicArn')).toMatch(/^arn:aws:sns:/);
  });

  test('certificateArn is readable', () => {
    expect(bridgeString(app, 'certificateArn')).toMatch(/^arn:aws:acm:/);
  });

  test('optional absent key uses default value', () => {
    expect(bridgeString(app, 'missingKey', 'default-value')).toBe('default-value');
  });
});

// ---------------------------------------------------------------------------
// Example scenario: disabled
// Validates that enabled:false in the bridge fixture propagates to Context.
// ---------------------------------------------------------------------------

describe('Example: disabled', () => {
  const DISABLED_FIXTURE = { ...FIXTURE, enabled: false };

  function appWithDisabledFixture(): App {
    return new App({ context: { sevenpico: DISABLED_FIXTURE } });
  }

  test('context is not enabled', () => {
    const app = appWithDisabledFixture();
    expect(bridgeContext(app).enabled).toBe(false);
  });

  test('context id is still computed when disabled', () => {
    const app = appWithDisabledFixture();
    expect(bridgeContext(app).id).toBe('acme-dev-app');
  });

  test('Platform outputs are still readable when disabled', () => {
    const app = appWithDisabledFixture();
    expect(bridgeString(app, 'vpcId')).toBe('vpc-0abc123456789def0');
  });
});
