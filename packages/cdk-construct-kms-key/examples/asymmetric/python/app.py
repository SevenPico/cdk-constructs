import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_kms_key import KmsKey

app = cdk.App()
stack = cdk.Stack(app, "KmsKeyAsymmetricStack")

context = ContextFns.make(ContextProps(
    namespace="acme",
    environment="dev",
    stage="app",
    tags={"Owner": "platform-team", "CostCenter": "engineering"},
))

# RSA_2048 + SIGN_VERIFY creates an asymmetric key for signing operations.
# Key rotation is not supported for asymmetric keys.
KmsKey(stack, "Key",
    context=context,
    key_spec="RSA_2048",
    key_usage="SIGN_VERIFY",
    enable_key_rotation=False,
    alias="alias/acme-dev-app-signing",
    description="Asymmetric RSA signing key",
)

app.synth()
