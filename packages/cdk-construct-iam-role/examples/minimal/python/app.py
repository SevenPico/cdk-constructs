import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns
from sevenpico.cdk_construct_iam_role import IamRole, IamRoleProps

app = cdk.App()
stack = cdk.Stack(app, "IamRoleMinimalStack")

context = ContextFns.make(namespace="acme", environment="dev", stage="app")

IamRole(stack, "Role", IamRoleProps(
    context=context,
    role_description="Acme application role",
    principals={"Service": ["lambda.amazonaws.com"]},
))

app.synth()
