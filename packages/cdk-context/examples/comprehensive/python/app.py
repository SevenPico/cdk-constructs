import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps

app = cdk.App()
stack = cdk.Stack(app, "ComprehensiveContextExample")

# Build a context with all available props exercised.
ctx = ContextFns.make(ContextProps(
    namespace="acme",
    environment="dev",
    stage="app",
    name="api",
    tenant="tenant1",
    region="use1",

    # Naming control
    delimiter="-",
    label_order=["namespace", "environment", "stage", "name", "attributes"],
    label_key_case="title",
    label_value_case="lower",
    id_length_limit=32,
    attributes=["v2"],

    # Tags
    tags={"CostCenter": "engineering", "Owner": "platform-team"},
    additional_tag_map={"ManagedBy": "cdk"},
    labels_as_tags=["namespace", "environment", "stage", "name"],
))

print("Context ID:    ", ContextFns.id(ctx))
print("Is enabled:    ", ContextFns.is_enabled(ctx))
print("Tags:          ", ContextFns.tags(ctx))

# Demonstrate context extension
child_ctx = ContextFns.extend(ctx, ContextProps(attributes=["worker"]))
print("Child ID:      ", ContextFns.id(child_ctx))

app.synth()
