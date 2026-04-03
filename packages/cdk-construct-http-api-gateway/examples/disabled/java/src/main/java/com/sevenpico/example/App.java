package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.ContextProps;
import com.sevenpico.cdk.construct.http.api.gateway.HttpApiGateway;
import com.sevenpico.cdk.construct.http.api.gateway.HttpApiGatewayProps;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "HttpApiGatewayDisabledStack");

        var context = ContextFns.make(ContextProps.builder()
            .namespace("acme").environment("dev").stage("app").enabled(false).build());

        new HttpApiGateway(stack, "Api",
            HttpApiGatewayProps.builder()
                .context(context)
                .build());

        app.synth();
    }
}
