import aws_cdk as cdk
from sevenpico.cdk_bridge import CdkBridge

app = cdk.App()
stack = cdk.Stack(app, "DisabledBridgeExample")

# Read Context from bridge fixture — enabled:False is set in the fixture.
ctx = CdkBridge.context(stack)
print("Context ID:  ", ctx.id)
print("Is enabled:  ", ctx.enabled)  # False

# Guard: skip resource creation when context is disabled.
if not ctx.enabled:
    print("Context is disabled — skipping resource creation.")
else:
    vpc_id = CdkBridge.string(stack, "vpcId")
    print("VPC ID:      ", vpc_id)

app.synth()
