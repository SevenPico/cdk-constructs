package com.sevenpico.example;

import com.sevenpico.cdk.bridge.CdkBridge;
import com.sevenpico.cdk.context.Context;
import software.amazon.awscdk.App;
import software.amazon.awscdk.CfnOutput;
import software.amazon.awscdk.Stack;

public class App {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "BasicBridgeExample");

        // Read Context labels from the bridge fixture.
        Context ctx = CdkBridge.context(stack);
        System.out.println("Context ID:   " + ctx.getId());      // acme-dev-app
        System.out.println("Is enabled:   " + ctx.getEnabled());  // true

        // Read a single Platform output — vpcId — as a string.
        String vpcId = CdkBridge.string(stack, "vpcId");
        System.out.println("VPC ID:       " + vpcId);

        CfnOutput.Builder.create(stack, "ContextId").value(ctx.getId()).build();
        CfnOutput.Builder.create(stack, "VpcId").value(vpcId).build();

        app.synth();
    }
}
