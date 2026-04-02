import aws_cdk as cdk
from sevenpico.cdk_bridge import CdkBridge
from sevenpico.cdk_construct_slackbot import Slackbot

app = cdk.App()
stack = cdk.Stack(app, "SlackbotDisabledStack")

# Load context from CDK Bridge JSON. The cdk.json sets enabled: false,
# so the construct will create no resources.
context = CdkBridge.context(stack)
slack_token_arn = CdkBridge.string(stack, "slackTokenArn")

Slackbot(stack, "SlackbotConstruct",
    context=context,
    slack_channels={"alerts": "C01234ABCDE"},
    slack_token_secret_arn=slack_token_arn,
    lambda_code_path="./lambda",
)

app.synth()
