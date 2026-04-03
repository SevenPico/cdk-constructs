package com.sevenpico.example;

import com.sevenpico.cdk.bridge.CdkBridge;
import com.sevenpico.cdk.context.Context;
import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;

public class App {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "DisabledBridgeExample");

        // Read Context from bridge fixture — enabled:false is set in the fixture.
        Context ctx = CdkBridge.context(stack);
        System.out.println("Context ID:   " + ctx.getId());
        System.out.println("Is enabled:   " + ctx.getEnabled());  // false

        // Guard: skip resource creation when context is disabled.
        if (!ctx.getEnabled()) {
            System.out.println("Context is disabled — skipping resource creation.");
        } else {
            String vpcId = CdkBridge.string(stack, "vpcId");
            System.out.println("VPC ID:       " + vpcId);
        }

        app.synth();
    }
}
