package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.bridge.CdkBridge;
import com.sevenpico.cdk.construct.s3.log.storage.S3LogStorage;
import com.sevenpico.cdk.construct.s3.log.storage.S3LogStorageProps;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "S3LogStorageMinimalStack");

        // Load context from CDK Bridge JSON (sevenpico key in cdk.json context).
        var context = CdkBridge.context(stack);

        new S3LogStorage(stack, "LogStorage",
            S3LogStorageProps.builder()
                .context(context)
                .build());

        app.synth();
    }
}
