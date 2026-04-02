package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.ContextProps;
import com.sevenpico.cdk.construct.s3.website.S3Website;
import com.sevenpico.cdk.construct.s3.website.S3WebsiteProps;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "S3WebsiteMinimalStack");

        var context = ContextFns.make(ContextProps.builder()
                .namespace("acme")
                .environment("dev")
                .stage("app")
                .build());

        // Minimal S3Website — only required props: context + ACM certificate ARN
        new S3Website(stack, "Website", S3WebsiteProps.builder()
                .context(context)
                .acmCertificateArn("arn:aws:acm:us-east-1:123456789012:certificate/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")
                .build());

        app.synth();
    }
}
