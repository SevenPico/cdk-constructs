import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns
from sevenpico.cdk_construct_iam_policy import IamPolicy, IamPolicyProps, IamPolicyStatement

app = cdk.App()
stack = cdk.Stack(app, "IamPolicyMinimalStack")

context = ContextFns.make(namespace="acme", environment="dev", stage="app")

IamPolicy(stack, "Policy", IamPolicyProps(
    context=context,
    iam_policy_enabled=True,
    policy_statements={
        "AllowS3Read": IamPolicyStatement(
            effect="Allow",
            actions=["s3:GetObject", "s3:ListBucket"],
            resources=["*"],
        ),
    },
))

app.synth()
