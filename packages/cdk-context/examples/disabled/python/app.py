import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps

app = cdk.App()
stack = cdk.Stack(app, "DisabledContextExample")

# Build a disabled context.
ctx = ContextFns.make(ContextProps(
    namespace="acme",
    environment="dev",
    stage="app",
    enabled=False,
))

print("Context ID:  ", ContextFns.id(ctx))
print("Is enabled:  ", ContextFns.is_enabled(ctx))  # False

# Extending a disabled context keeps enabled=False — the disabled flag is sticky.
child_ctx = ContextFns.extend(ctx, ContextProps(attributes=["worker"], enabled=True))
print("Child enabled:", ContextFns.is_enabled(child_ctx))  # still False

app.synth()
