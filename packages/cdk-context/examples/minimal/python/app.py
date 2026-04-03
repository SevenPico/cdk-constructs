import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps

app = cdk.App()
stack = cdk.Stack(app, "MinimalContextExample")

# Build a context with required props only: namespace, environment, stage.
ctx = ContextFns.make(ContextProps(
    namespace="acme",
    environment="dev",
    stage="app",
))

print("Context ID:  ", ContextFns.id(ctx))          # acme-dev-app
print("Is enabled:  ", ContextFns.is_enabled(ctx))  # True
print("Tags:        ", ContextFns.tags(ctx))

app.synth()
