import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_redshift_cluster import RedshiftCluster

app = cdk.App()
stack = cdk.Stack(app, "RedshiftClusterEncryptedStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app"))

RedshiftCluster(stack, "Cluster",
    context=context,
    subnet_ids=["subnet-01111111111111111", "subnet-02222222222222222", "subnet-03333333333333333"],
    admin_password="Placeholder1!",
    encrypted=True,
    kms_key_arn="arn:aws:kms:us-east-1:123456789012:key/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")

app.synth()
