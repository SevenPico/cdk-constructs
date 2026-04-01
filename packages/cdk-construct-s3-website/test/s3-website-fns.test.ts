import { makeContext } from '@sevenpico/cdk-context';
import { Duration, aws_cloudfront as cloudfront, aws_s3 as s3 } from 'aws-cdk-lib';
import {
  originBucketName,
  originBucketProps,
  defaultCustomErrorResponses,
  mapErrorResponse,
  cloudfrontGeoRestriction,
  mapTlsVersion,
  defaultWafRules,
} from '../src/s3-website-fns';

describe('originBucketName', () => {
  test('returns context id with -origin suffix', () => {
    const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'web' });
    expect(originBucketName(ctx)).toBe('7p-prod-web-origin');
  });
});

describe('originBucketProps', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'web' });
  const props = { context: ctx, acmCertificateArn: 'arn:aws:acm:us-east-1:123:certificate/abc' } as any;

  test('sets bucket name from context', () => {
    expect(originBucketProps(ctx, props).bucketName).toBe('7p-prod-web-origin');
  });

  test('blocks all public access', () => {
    expect(originBucketProps(ctx, props).blockPublicAccess).toBe(s3.BlockPublicAccess.BLOCK_ALL);
  });

  test('uses S3 managed encryption', () => {
    expect(originBucketProps(ctx, props).encryption).toBe(s3.BucketEncryption.S3_MANAGED);
  });

  test('versioning is disabled', () => {
    expect(originBucketProps(ctx, props).versioned).toBe(false);
  });
});

describe('defaultCustomErrorResponses', () => {
  test('returns 404 -> index.html with 10s TTL', () => {
    const responses = defaultCustomErrorResponses();
    expect(responses).toHaveLength(1);
    expect(responses[0].httpStatus).toBe(404);
    expect(responses[0].responseHttpStatus).toBe(200);
    expect(responses[0].responsePagePath).toBe('/index.html');
    expect(responses[0].ttl).toEqual(Duration.seconds(10));
  });
});

describe('mapErrorResponse', () => {
  test('maps all fields', () => {
    const result = mapErrorResponse({
      httpStatus: 403,
      responseHttpStatus: 200,
      responsePagePath: '/error.html',
      ttl: 30,
    });
    expect(result.httpStatus).toBe(403);
    expect(result.responseHttpStatus).toBe(200);
    expect(result.responsePagePath).toBe('/error.html');
    expect(result.ttl).toEqual(Duration.seconds(30));
  });

  test('ttl is undefined when not provided', () => {
    const result = mapErrorResponse({ httpStatus: 500 });
    expect(result.ttl).toBeUndefined();
  });
});

describe('cloudfrontGeoRestriction', () => {
  test('returns undefined for no restriction', () => {
    expect(cloudfrontGeoRestriction({ restrictionType: 'none' })).toBeUndefined();
  });

  test('returns undefined when undefined', () => {
    expect(cloudfrontGeoRestriction(undefined)).toBeUndefined();
  });

  test('returns allowlist for whitelist type', () => {
    const result = cloudfrontGeoRestriction({ restrictionType: 'whitelist', locations: ['US', 'CA'] });
    expect(result).toBeDefined();
  });

  test('returns denylist for blacklist type', () => {
    const result = cloudfrontGeoRestriction({ restrictionType: 'blacklist', locations: ['CN'] });
    expect(result).toBeDefined();
  });
});

describe('mapTlsVersion', () => {
  test('maps TLSv1.2_2021', () => {
    expect(mapTlsVersion('TLSv1.2_2021')).toBe(cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021);
  });

  test('maps TLSv1.2_2019', () => {
    expect(mapTlsVersion('TLSv1.2_2019')).toBe(cloudfront.SecurityPolicyProtocol.TLS_V1_2_2019);
  });

  test('maps TLSv1.2_2018', () => {
    expect(mapTlsVersion('TLSv1.2_2018')).toBe(cloudfront.SecurityPolicyProtocol.TLS_V1_2_2018);
  });

  test('defaults to TLSv1.2_2021 for unknown', () => {
    expect(mapTlsVersion('unknown')).toBe(cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021);
  });
});

describe('defaultWafRules', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'web' });

  test('returns 7 managed rule groups', () => {
    expect(defaultWafRules(ctx)).toHaveLength(7);
  });

  test('first rule is AWSManagedRulesCommonRuleSet with priority 1', () => {
    const rules = defaultWafRules(ctx);
    expect(rules[0].name).toBe('7p-prod-web-AWSManagedRulesCommonRuleSet');
    expect(rules[0].priority).toBe(1);
  });

  test('rules use override action none', () => {
    const rules = defaultWafRules(ctx);
    rules.forEach(rule => {
      expect(rule.overrideAction).toEqual({ none: {} });
    });
  });

  test('rules have CloudWatch metrics enabled', () => {
    const rules = defaultWafRules(ctx);
    rules.forEach(rule => {
      expect(rule.visibilityConfig).toMatchObject({
        cloudWatchMetricsEnabled: true,
        sampledRequestsEnabled: true,
      });
    });
  });
});
