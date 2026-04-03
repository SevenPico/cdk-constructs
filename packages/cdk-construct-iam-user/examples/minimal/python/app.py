import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns
from sevenpico.cdk_construct_iam_user import IamUser, IamUserProps

app = cdk.App()
stack = cdk.Stack(app, "IamUserMinimalStack")

context = ContextFns.make(namespace="acme", environment="dev", stage="app")

IamUser(stack, "User", IamUserProps(
    context=context,
    user_name="alice@example.com",
))

app.synth()
