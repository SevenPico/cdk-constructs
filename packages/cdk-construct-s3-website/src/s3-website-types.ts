import { Context } from '@sevenpico/cdk-context';
import { aws_cloudfront as cloudfront } from 'aws-cdk-lib';

export interface CustomErrorResponse {
  readonly httpStatus: number;
  readonly responseHttpStatus?: number;
  readonly responsePagePath?: string;
  readonly ttl?: number;
}

export interface GeoRestriction {
  readonly restrictionType: string;
  readonly locations?: string[];
}

export interface S3WebsiteProps {
  readonly context: Context;

  /** ACM certificate ARN (must be in us-east-1 for CloudFront). Required. */
  readonly acmCertificateArn: string;

  /** Additional CloudFront aliases (CNAMEs) */
  readonly additionalAliases?: string[];

  /** Default root object. Default: 'index.html' */
  readonly defaultRootObject?: string;

  /** Custom error responses. Default: 404 -> index.html with 10s TTL */
  readonly customErrorResponses?: CustomErrorResponse[];

  /** Enable WAF on the CloudFront distribution. Default: false */
  readonly wafEnabled?: boolean;

  /** Enable S3 origin access logging. Default: true */
  readonly s3AccessLoggingEnabled?: boolean;

  /** S3 bucket construct ID to receive S3 access logs */
  readonly s3AccessLogBucketId?: string;

  /** S3 access log prefix */
  readonly s3AccessLogPrefix?: string;

  /** CloudFront function associations for the default behavior */
  readonly functionAssociations?: cloudfront.FunctionAssociation[];

  /** CORS allowed origins */
  readonly corsAllowedOrigins?: string[];

  /** IAM principal ARNs allowed to deploy to the S3 origin bucket */
  readonly deploymentPrincipalArns?: string[];

  /** Route53 hosted zone ID for DNS alias */
  readonly parentZoneId?: string;

  /** Route53 hosted zone name */
  readonly parentZoneName?: string;

  /** Create a Route53 DNS alias record. Default: false */
  readonly dnsAliasEnabled?: boolean;

  /** TLS protocol version. Default: 'TLSv1.2_2021' */
  readonly tlsProtocolVersion?: string;

  /** Geo restriction configuration */
  readonly geoRestriction?: GeoRestriction;
}
