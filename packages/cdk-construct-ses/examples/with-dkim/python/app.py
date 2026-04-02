import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_ses import Ses

app = cdk.App()
stack = cdk.Stack(app, "SesWithDkimStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app"))

Ses(stack, "Ses",
    context=context,
    verify_domain=True,
    verify_dkim=True,
    zone_id="Z0PUBLICZONEID00000",
    zone_name="dev.acme.example.com",
)

app.synth()
