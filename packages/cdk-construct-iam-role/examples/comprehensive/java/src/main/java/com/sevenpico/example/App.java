package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.Context;
import com.sevenpico.cdk.construct.iam.role.IamRole;
import com.sevenpico.cdk.construct.iam.role.IamRoleProps;
import java.util.List;
import java.util.Map;

public class App {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "IamRoleComprehensiveStack");

        Context context = ContextFns.make(b -> b
            .namespace("acme").environment("dev").stage("app"));

        String policyDoc = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\","
            + "\"Action\":[\"s3:GetObject\",\"s3:PutObject\"],"
            + "\"Resource\":\"arn:aws:s3:::acme-dev-app-*/*\"}]}";

        IamRole.Builder.create(stack, "Role")
            .context(context)
            .roleDescription("Acme EC2 instance role with S3 access")
            .principals(Map.of("Service", List.of("ec2.amazonaws.com")))
            .managedPolicyArns(List.of("arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"))
            .instanceProfileEnabled(true)
            .maxSessionDuration(7200)
            .policyDocuments(List.of(policyDoc))
            .build();

        app.synth();
    }
}
