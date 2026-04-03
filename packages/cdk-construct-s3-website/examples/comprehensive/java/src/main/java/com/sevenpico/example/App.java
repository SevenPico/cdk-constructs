package com.sevenpico.example;

import java.util.List;
import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.ContextProps;
import com.sevenpico.cdk.construct.s3.website.S3Website;
import com.sevenpico.cdk.construct.s3.website.S3WebsiteProps;
import com.sevenpico.cdk.construct.s3.website.CustomErrorResponse;
import com.sevenpico.cdk.construct.s3.website.GeoRestriction;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "S3WebsiteComprehensiveStack");

        var context = ContextFns.make(ContextProps.builder()
                .namespace("acme")
                .environment("dev")
                .stage("app")
                .build());

        // Comprehensive S3Website — WAF, CloudFront logging, custom error responses,
        // CORS, geo restriction, DNS alias, deployment principals
        new S3Website(stack, "Website", S3WebsiteProps.builder()
                .context(context)
                .acmCertificateArn("arn:aws:acm:us-east-1:123456789012:certificate/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")
                .additionalAliases(List.of("www.acme-dev-app.example.com"))
                .defaultRootObject("index.html")
                .wafEnabled(true)
                .cloudfrontAccessLoggingEnabled(true)
                .cloudfrontAccessLogBucketId("acme-dev-app-cf-logs")
                .cloudfrontAccessLogPrefix("cf/")
                .corsAllowedOrigins(List.of("https://acme-dev-app.example.com"))
                .customErrorResponses(List.of(
                        CustomErrorResponse.builder().httpStatus(403).responseHttpStatus(200).responsePagePath("/index.html").ttl(10).build(),
                        CustomErrorResponse.builder().httpStatus(404).responseHttpStatus(200).responsePagePath("/index.html").ttl(10).build()
                ))
                .geoRestriction(GeoRestriction.builder()
                        .restrictionType("whitelist")
                        .locations(List.of("US", "CA", "GB"))
                        .build())
                .dnsAliasEnabled(true)
                .parentZoneId("Z1234567890ABCDEF")
                .parentZoneName("example.com")
                .deploymentPrincipalArns(List.of("arn:aws:iam::123456789012:role/acme-deploy-role"))
                .tlsProtocolVersion("TLSv1.2_2021")
                .build());

        app.synth();
    }
}
