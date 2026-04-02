import json
import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns
from sevenpico.cdk_construct_iam_role import IamRole, IamRoleProps

app = cdk.App()
stack = cdk.Stack(app, "IamRoleComprehensiveStack")

context = ContextFns.make(namespace="acme", environment="dev", stage="app")

policy_doc = json.dumps({
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Action": ["s3:GetObject", "s3:PutObject"],
        "Resource": "arn:aws:s3:::acme-dev-app-*/*",
    }],
})

IamRole(stack, "Role", IamRoleProps(
    context=context,
    role_description="Acme EC2 instance role with S3 access",
    principals={"Service": ["ec2.amazonaws.com"]},
    managed_policy_arns=["arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"],
    instance_profile_enabled=True,
    max_session_duration=7200,
    policy_documents=[policy_doc],
))

app.synth()
