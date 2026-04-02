import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_kms_key import KmsKey

app = cdk.App()
stack = cdk.Stack(app, "KmsKeySymmetricHmacStack")

context = ContextFns.make(ContextProps(
    namespace="acme",
    environment="dev",
    stage="app",
    tags={"Owner": "platform-team", "CostCenter": "engineering"},
))

# HMAC_256 + GENERATE_VERIFY_MAC creates an HMAC key for MAC generation/verification.
# Key rotation is not supported for HMAC keys.
KmsKey(stack, "Key",
    context=context,
    key_spec="HMAC_256",
    key_usage="GENERATE_VERIFY_MAC",
    enable_key_rotation=False,
    alias="alias/acme-dev-app-hmac",
    description="HMAC-256 key for MAC generation and verification",
)

app.synth()
