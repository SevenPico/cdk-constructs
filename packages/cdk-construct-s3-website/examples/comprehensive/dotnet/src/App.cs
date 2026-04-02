using Amazon.CDK;
using System.Collections.Generic;
using SevenPico.CdkContext;
using SevenPico.CdkConstructS3Website;

var app = new App();
var stack = new Stack(app, "S3WebsiteComprehensiveStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

// Comprehensive S3Website — WAF, CloudFront logging, custom error responses,
// CORS, geo restriction, DNS alias, deployment principals
new S3Website(stack, "Website", new S3WebsiteProps
{
    Context = context,
    AcmCertificateArn = "arn:aws:acm:us-east-1:123456789012:certificate/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    AdditionalAliases = new[] { "www.acme-dev-app.example.com" },
    DefaultRootObject = "index.html",
    WafEnabled = true,
    CloudfrontAccessLoggingEnabled = true,
    CloudfrontAccessLogBucketId = "acme-dev-app-cf-logs",
    CloudfrontAccessLogPrefix = "cf/",
    CorsAllowedOrigins = new[] { "https://acme-dev-app.example.com" },
    CustomErrorResponses = new[]
    {
        new CustomErrorResponse { HttpStatus = 403, ResponseHttpStatus = 200, ResponsePagePath = "/index.html", Ttl = 10 },
        new CustomErrorResponse { HttpStatus = 404, ResponseHttpStatus = 200, ResponsePagePath = "/index.html", Ttl = 10 },
    },
    GeoRestriction = new GeoRestriction { RestrictionType = "whitelist", Locations = new[] { "US", "CA", "GB" } },
    DnsAliasEnabled = true,
    ParentZoneId = "Z1234567890ABCDEF",
    ParentZoneName = "example.com",
    DeploymentPrincipalArns = new[] { "arn:aws:iam::123456789012:role/acme-deploy-role" },
    TlsProtocolVersion = "TLSv1.2_2021",
});

app.Synth();
