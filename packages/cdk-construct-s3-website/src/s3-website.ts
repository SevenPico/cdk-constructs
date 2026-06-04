import { contextId, contextTags, isEnabled } from '@sevenpico/cdk-context';
import {
  Tags,
  aws_s3 as s3,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_route53 as route53,
  aws_route53_targets as targets,
  aws_certificatemanager as acm,
  aws_wafv2 as wafv2,
  aws_iam as iam,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  originBucketProps,
  defaultCustomErrorResponses,
  mapErrorResponse,
  cloudfrontGeoRestriction,
  mapTlsVersion,
  defaultWafRules,
} from './s3-website-fns';
import { S3WebsiteProps } from './s3-website-types';

export class S3Website extends Construct {
  public readonly originBucket?: s3.Bucket;
  public readonly distribution?: cloudfront.Distribution;
  public readonly dnsRecord?: route53.ARecord;

  constructor(scope: Construct, id: string, props: S3WebsiteProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // S3 access log bucket (looked up by construct ID if provided)
    let serverAccessLogsBucket: s3.IBucket | undefined;
    if (props.s3AccessLoggingEnabled !== false && props.s3AccessLogBucketId) {
      serverAccessLogsBucket = s3.Bucket.fromBucketName(
        this, 'S3LogBucket', props.s3AccessLogBucketId,
      );
    }

    // Origin bucket
    this.originBucket = new s3.Bucket(this, 'OriginBucket', {
      ...originBucketProps(props.context, props),
      serverAccessLogsBucket,
      serverAccessLogsPrefix: props.s3AccessLogPrefix,
      cors: props.corsAllowedOrigins?.length ? [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
        allowedOrigins: props.corsAllowedOrigins,
        allowedHeaders: ['*'],
        maxAge: 3000,
      }] : undefined,
    });

    // OAC
    const oac = new cloudfront.S3OriginAccessControl(this, 'OAC', {
      signing: cloudfront.Signing.SIGV4_NO_OVERRIDE,
    });

    // Certificate (looked up, not created - must exist in us-east-1)
    const certificate = acm.Certificate.fromCertificateArn(this, 'Cert', props.acmCertificateArn);

    // Optional WAF
    let webAclArn: string | undefined;
    if (props.wafEnabled) {
      const webAcl = new wafv2.CfnWebACL(this, 'WebAcl', {
        scope: 'CLOUDFRONT',
        defaultAction: { allow: {} },
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: `${contextId(props.context)}-waf`,
          sampledRequestsEnabled: true,
        },
        rules: defaultWafRules(props.context),
      });
      webAclArn = webAcl.attrArn;
    }

    // Error responses
    const errorResponses = (props.customErrorResponses && props.customErrorResponses.length > 0)
      ? props.customErrorResponses.map(mapErrorResponse)
      : defaultCustomErrorResponses();

    // CloudFront access log bucket
    let cfLogBucket: s3.IBucket | undefined;
    let cfLogPrefix: string | undefined;
    if (props.cloudfrontAccessLoggingEnabled && props.cloudfrontAccessLogBucketId) {
      cfLogBucket = s3.Bucket.fromBucketName(this, 'CfLogBucket', props.cloudfrontAccessLogBucketId);
      cfLogPrefix = props.cloudfrontAccessLogPrefix;
    }

    // CloudFront distribution
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.originBucket, {
          originAccessControl: oac,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        functionAssociations: props.functionAssociations,
      },
      domainNames: [contextId(props.context), ...(props.additionalAliases ?? [])],
      certificate,
      defaultRootObject: props.defaultRootObject ?? 'index.html',
      errorResponses,
      webAclId: webAclArn,
      geoRestriction: cloudfrontGeoRestriction(props.geoRestriction),
      minimumProtocolVersion: mapTlsVersion(props.tlsProtocolVersion ?? 'TLSv1.2_2021'),
      logBucket: cfLogBucket,
      logFilePrefix: cfLogPrefix,
      enableLogging: props.cloudfrontAccessLoggingEnabled,
    });

    // Deployment principals - grant put to origin bucket
    (props.deploymentPrincipalArns ?? []).forEach((arn) => {
      this.originBucket!.grantPut(new iam.ArnPrincipal(arn));
    });

    // DNS alias
    if (props.dnsAliasEnabled && props.parentZoneId) {
      const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', {
        hostedZoneId: props.parentZoneId,
        zoneName: props.parentZoneName ?? '',
      });
      this.dnsRecord = new route53.ARecord(this, 'DnsAlias', {
        zone,
        recordName: contextId(props.context),
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.distribution)),
      });
    }

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
