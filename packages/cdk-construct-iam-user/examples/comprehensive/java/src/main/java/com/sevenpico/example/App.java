package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.Context;
import com.sevenpico.cdk.construct.iam.user.IamUser;
import com.sevenpico.cdk.construct.iam.user.IamUserProps;
import java.util.List;

public class App {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "IamUserComprehensiveStack");

        Context context = ContextFns.make(b -> b
            .namespace("acme").environment("dev").stage("app"));

        IamUser.Builder.create(stack, "User")
            .context(context)
            .userName("alice@example.com")
            .path("/engineering/")
            .groups(List.of("developers", "readonly"))
            .loginProfileEnabled(true)
            .passwordResetRequired(true)
            .passwordLength(32)
            .build();

        app.synth();
    }
}
