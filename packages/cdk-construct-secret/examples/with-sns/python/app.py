import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_secret import Secret, SecretProps, SecretReadPrincipal

app = cdk.App()
stack = cdk.Stack(app, "SecretWithSnsStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app"))

# Secret with SNS topic for change notifications, read principal, and description
Secret(stack, "Secret", SecretProps(
    context=context,
    description="Application credentials with SNS notifications",
    create_sns=True,
    secret_read_principals=[
        SecretReadPrincipal(
            type="AWS",
            identifiers=["arn:aws:iam::123456789012:role/acme-app-role"],
        ),
    ],
    sns_pub_principals=[
        SecretReadPrincipal(
            type="Service",
            identifiers=["secretsmanager.amazonaws.com"],
        ),
    ],
    sns_sub_principals=[
        SecretReadPrincipal(
            type="AWS",
            identifiers=["arn:aws:iam::123456789012:role/acme-ops-role"],
        ),
    ],
))

app.synth()
