package com.example;

import java.util.Arrays;
import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdkcontext.ContextFns;
import com.sevenpico.cdkcontext.ContextProps;
import com.sevenpico.cdkconstructdynamodb.Dynamodb;
import com.sevenpico.cdkconstructdynamodb.DynamodbGsi;

public class DynamodbComprehensiveApp {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "DynamodbComprehensiveStack");

        com.sevenpico.cdkcontext.Context context = ContextFns.make(
            ContextProps.builder()
                .namespace("acme")
                .environment("dev")
                .stage("app")
                .build()
        );

        Dynamodb.Builder.create(stack, "Table")
            .context(context)
            .hashKey("pk")
            .rangeKey("sk")
            .billingMode("PAY_PER_REQUEST")
            .enableEncryption(true)
            .enablePointInTimeRecovery(true)
            .enableStreams(true)
            .streamViewType("NEW_AND_OLD_IMAGES")
            .ttlEnabled(true)
            .ttlAttribute("expiresAt")
            .globalSecondaryIndexes(Arrays.asList(
                DynamodbGsi.builder()
                    .name("gsi1")
                    .hashKey("gsi1pk")
                    .rangeKey("gsi1sk")
                    .projectionType("ALL")
                    .build()
            ))
            .build();

        app.synth();
    }
}
