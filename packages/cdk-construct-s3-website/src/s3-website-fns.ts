import { Context, contextId } from '@sevenpico/cdk-context';
import {
  RemovalPolicy,
  Duration,
  aws_s3 as s3,
  aws_cloudfront as cloudfront,
  aws_wafv2 as wafv2,
} from 'aws-cdk-lib';
import { CustomErrorResponse, GeoRestriction, S3WebsiteProps } from './s3-website-types';

export const originBucketName = (ctx: Context): string =>
  `${contextId(ctx)}-origin`;

export const originBucketProps = (ctx: Context, _props: S3WebsiteProps): s3.BucketProps => ({
  bucketName: originBucketName(ctx),
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  removalPolicy: RemovalPolicy.RETAIN,
  versioned: false,
  encryption: s3.BucketEncryption.S3_MANAGED,
});

export const defaultCustomErrorResponses = (): cloudfront.ErrorResponse[] => ([
  {
    httpStatus: 404,
    responseHttpStatus: 200,
    responsePagePath: '/index.html',
    ttl: Duration.seconds(10),
  },
]);

export const mapErrorResponse = (e: CustomErrorResponse): cloudfront.ErrorResponse => ({
  httpStatus: e.httpStatus,
  responseHttpStatus: e.responseHttpStatus,
  responsePagePath: e.responsePagePath,
  ttl: e.ttl !== undefined ? Duration.seconds(e.ttl) : undefined,
});

export const cloudfrontGeoRestriction = (geo?: GeoRestriction): cloudfront.GeoRestriction | undefined => {
  if (!geo || geo.restrictionType === 'none') return undefined;
  if (geo.restrictionType === 'whitelist') return cloudfront.GeoRestriction.allowlist(...(geo.locations ?? []));
  return cloudfront.GeoRestriction.denylist(...(geo.locations ?? []));
};

export const mapTlsVersion = (v: string): cloudfront.SecurityPolicyProtocol => {
  const map: Record<string, cloudfront.SecurityPolicyProtocol> = {
    'TLSv1.2_2021': cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
    'TLSv1.2_2019': cloudfront.SecurityPolicyProtocol.TLS_V1_2_2019,
    'TLSv1.2_2018': cloudfront.SecurityPolicyProtocol.TLS_V1_2_2018,
  };
  return map[v] ?? cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021;
};

export const defaultWafRules = (ctx: Context): wafv2.CfnWebACL.RuleProperty[] => {
  const managedRuleGroups = [
    'AWSManagedRulesCommonRuleSet',
    'AWSManagedRulesAmazonIpReputationList',
    'AWSManagedRulesKnownBadInputsRuleSet',
    'AWSManagedRulesSQLiRuleSet',
    'AWSManagedRulesLinuxRuleSet',
    'AWSManagedRulesUnixRuleSet',
    'AWSManagedRulesAnonymousIpList',
  ];
  return managedRuleGroups.map((name, i) => ({
    name: `${contextId(ctx)}-${name}`,
    priority: i + 1,
    overrideAction: { none: {} },
    statement: {
      managedRuleGroupStatement: {
        vendorName: 'AWS',
        name,
      },
    },
    visibilityConfig: {
      cloudWatchMetricsEnabled: true,
      metricName: `${contextId(ctx)}-${name}`,
      sampledRequestsEnabled: true,
    },
  }));
};
