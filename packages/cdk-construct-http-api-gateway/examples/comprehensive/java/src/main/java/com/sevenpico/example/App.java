package com.sevenpico.example;

import java.util.List;
import java.util.Map;
import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.ContextProps;
import com.sevenpico.cdk.construct.http.api.gateway.HttpApiCorsConfig;
import com.sevenpico.cdk.construct.http.api.gateway.HttpApiGateway;
import com.sevenpico.cdk.construct.http.api.gateway.HttpApiGatewayProps;
import com.sevenpico.cdk.construct.http.api.gateway.HttpApiIntegration;
import com.sevenpico.cdk.construct.http.api.gateway.HttpApiRoute;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "HttpApiGatewayComprehensiveStack");

        var context = ContextFns.make(ContextProps.builder()
            .namespace("acme").environment("dev").stage("app")
            .tags(Map.of("Owner", "platform-team", "CostCenter", "engineering"))
            .build());

        new HttpApiGateway(stack, "Api",
            HttpApiGatewayProps.builder()
                .context(context)
                .description("Acme HTTP API")
                .enableAutoDeploy(true)
                .cloudwatchLogsRetentionDays(30)
                .corsConfiguration(HttpApiCorsConfig.builder()
                    .allowOrigins(List.of("https://acme.example.com"))
                    .allowMethods(List.of("GET", "POST", "PUT", "DELETE"))
                    .allowHeaders(List.of("Content-Type", "Authorization"))
                    .maxAge(300)
                    .build())
                .integrations(Map.of(
                    "lambda", HttpApiIntegration.builder()
                        .type("AWS_PROXY")
                        .uri("arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:123456789012:function:acme-dev-app/invocations")
                        .payloadFormatVersion("2.0")
                        .build()))
                .routes(Map.of(
                    "getItems", HttpApiRoute.builder()
                        .routeKey("GET /items")
                        .integrationKey("lambda")
                        .operationName("GetItems")
                        .build(),
                    "postItem", HttpApiRoute.builder()
                        .routeKey("POST /items")
                        .integrationKey("lambda")
                        .operationName("PostItem")
                        .build()))
                .stageVariables(Map.of("env", "dev"))
                .build());

        app.synth();
    }
}
