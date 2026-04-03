import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_s3_website import S3Website, S3WebsiteProps

app = cdk.App()
stack = cdk.Stack(app, "S3WebsiteMinimalStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app"))

# Minimal S3Website — only required props: context + ACM certificate ARN
S3Website(stack, "Website", S3WebsiteProps(
    context=context,
    acm_certificate_arn="arn:aws:acm:us-east-1:123456789012:certificate/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
))

app.synth()
