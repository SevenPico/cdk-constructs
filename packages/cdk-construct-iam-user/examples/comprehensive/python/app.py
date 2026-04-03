import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns
from sevenpico.cdk_construct_iam_user import IamUser, IamUserProps

app = cdk.App()
stack = cdk.Stack(app, "IamUserComprehensiveStack")

context = ContextFns.make(namespace="acme", environment="dev", stage="app")

IamUser(stack, "User", IamUserProps(
    context=context,
    user_name="alice@example.com",
    path="/engineering/",
    groups=["developers", "readonly"],
    login_profile_enabled=True,
    password_reset_required=True,
    password_length=32,
))

app.synth()
