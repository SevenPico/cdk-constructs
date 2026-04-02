package com.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdkcontext.ContextFns;
import com.sevenpico.cdkcontext.ContextProps;
import com.sevenpico.cdkconstructredshiftcluster.RedshiftCluster;

public class RedshiftClusterEncryptedApp {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "RedshiftClusterEncryptedStack");

        com.sevenpico.cdkcontext.Context context = ContextFns.make(
            ContextProps.builder()
                .namespace("acme")
                .environment("dev")
                .stage("app")
                .build()
        );

        RedshiftCluster.Builder.create(stack, "Cluster")
            .context(context)
            .subnetIds(java.util.Arrays.asList(
                "subnet-01111111111111111",
                "subnet-02222222222222222",
                "subnet-03333333333333333"))
            .adminPassword("Placeholder1!")
            .encrypted(true)
            .kmsKeyArn("arn:aws:kms:us-east-1:123456789012:key/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")
            .build();

        app.synth();
    }
}
