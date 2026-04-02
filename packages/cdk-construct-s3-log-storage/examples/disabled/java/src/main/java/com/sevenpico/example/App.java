package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.bridge.CdkBridge;
import com.sevenpico.cdk.construct.s3.log.storage.S3LogStorage;
import com.sevenpico.cdk.construct.s3.log.storage.S3LogStorageProps;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "S3LogStorageDisabledStack");

        // Load context from CDK Bridge JSON. The cdk.json sets enabled: false,
        // so the construct will create no resources.
        var context = CdkBridge.context(stack);

        var storage = new S3LogStorage(stack, "LogStorage",
            S3LogStorageProps.builder()
                .context(context)
                .build());

        // getBucket() and getNotificationQueue() return null when disabled.
        System.out.println("bucket: " + storage.getBucket());
        System.out.println("queue: " + storage.getNotificationQueue());

        app.synth();
    }
}
