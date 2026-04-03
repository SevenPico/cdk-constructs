import aws_cdk as cdk
from sevenpico.cdk_bridge import CdkBridge

app = cdk.App()
stack = cdk.Stack(app, "BasicBridgeExample")

# Read Context labels from the bridge fixture.
ctx = CdkBridge.context(stack)
print("Context ID:  ", ctx.id)       # acme-dev-app
print("Is enabled:  ", ctx.enabled)  # True

# Read a single Platform output — vpcId — as a string.
vpc_id = CdkBridge.string(stack, "vpcId")
print("VPC ID:      ", vpc_id)

cdk.CfnOutput(stack, "ContextId", value=ctx.id)
cdk.CfnOutput(stack, "VpcId",     value=vpc_id)

app.synth()
