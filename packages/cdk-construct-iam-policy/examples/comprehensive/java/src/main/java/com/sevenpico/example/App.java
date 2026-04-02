package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.Context;
import com.sevenpico.cdk.construct.iam.policy.IamPolicy;
import com.sevenpico.cdk.construct.iam.policy.IamPolicyProps;
import com.sevenpico.cdk.construct.iam.policy.IamPolicyStatement;
import java.util.List;
import java.util.Map;

public class App {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "IamPolicyComprehensiveStack");

        Context context = ContextFns.make(b -> b
            .namespace("acme").environment("dev").stage("app"));

        IamPolicy.Builder.create(stack, "Policy")
            .context(context)
            .iamPolicyEnabled(true)
            .description("Acme application read/write policy")
            .policyStatements(Map.of(
                "AllowS3Read", IamPolicyStatement.builder()
                    .effect("Allow")
                    .actions(List.of("s3:GetObject", "s3:ListBucket"))
                    .resources(List.of("arn:aws:s3:::acme-dev-app-*", "arn:aws:s3:::acme-dev-app-*/*"))
                    .build(),
                "AllowDynamoDBWrite", IamPolicyStatement.builder()
                    .effect("Allow")
                    .actions(List.of("dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:GetItem"))
                    .resources(List.of("arn:aws:dynamodb:us-east-1:123456789012:table/acme-dev-app-*"))
                    .build(),
                "DenyDelete", IamPolicyStatement.builder()
                    .effect("Deny")
                    .actions(List.of("s3:DeleteObject", "dynamodb:DeleteItem"))
                    .resources(List.of("*"))
                    .build()
            ))
            .build();

        app.synth();
    }
}
