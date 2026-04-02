import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns
from sevenpico.cdk_construct_iam_policy import IamPolicy, IamPolicyProps, IamPolicyStatement

app = cdk.App()
stack = cdk.Stack(app, "IamPolicyComprehensiveStack")

context = ContextFns.make(namespace="acme", environment="dev", stage="app")

IamPolicy(stack, "Policy", IamPolicyProps(
    context=context,
    iam_policy_enabled=True,
    description="Acme application read/write policy",
    policy_statements={
        "AllowS3Read": IamPolicyStatement(
            effect="Allow",
            actions=["s3:GetObject", "s3:ListBucket"],
            resources=["arn:aws:s3:::acme-dev-app-*", "arn:aws:s3:::acme-dev-app-*/*"],
        ),
        "AllowDynamoDBWrite": IamPolicyStatement(
            effect="Allow",
            actions=["dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:GetItem"],
            resources=["arn:aws:dynamodb:us-east-1:123456789012:table/acme-dev-app-*"],
        ),
        "DenyDelete": IamPolicyStatement(
            effect="Deny",
            actions=["s3:DeleteObject", "dynamodb:DeleteItem"],
            resources=["*"],
        ),
    },
))

app.synth()
