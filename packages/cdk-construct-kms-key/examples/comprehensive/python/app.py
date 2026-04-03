import json
import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_kms_key import KmsKey

app = cdk.App()
stack = cdk.Stack(app, "KmsKeyComprehensiveStack")

context = ContextFns.make(ContextProps(
    namespace="acme",
    environment="dev",
    stage="app",
    tags={"Owner": "platform-team", "CostCenter": "engineering"},
))

policy = json.dumps({
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {"AWS": "arn:aws:iam::123456789012:root"},
            "Action": "kms:*",
            "Resource": "*",
        }
    ],
})

KmsKey(stack, "Key",
    context=context,
    alias="alias/acme-dev-app-custom",
    description="Comprehensive KMS key example — all props exercised",
    enable_key_rotation=False,
    pending_window_in_days=14,
    multi_region=True,
    policy=policy,
)

app.synth()
