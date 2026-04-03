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
        Stack stack = new Stack(app, "IamRoleMinimalStack");

        Context context = ContextFns.make(b -> b
            .namespace("acme").environment("dev").stage("app"));

        IamRole.Builder.create(stack, "Role")
            .context(context)
            .roleDescription("Acme application role")
            .principals(Map.of("Service", List.of("lambda.amazonaws.com")))
            .build();

        app.synth();
    }
}
