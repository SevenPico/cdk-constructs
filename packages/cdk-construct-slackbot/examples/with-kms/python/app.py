import aws_cdk as cdk
from sevenpico.cdk_bridge import CdkBridge
from sevenpico.cdk_construct_slackbot import Slackbot

app = cdk.App()
stack = cdk.Stack(app, "SlackbotWithKmsStack")

# Load context and platform references from CDK Bridge JSON.
context = CdkBridge.context(stack)
slack_token_arn = CdkBridge.string(stack, "slackTokenArn")
secrets_kms_key_arn = CdkBridge.string(stack, "secretsKmsKeyArn")

Slackbot(stack, "SlackbotConstruct",
    context=context,
    slack_channels={"alerts": "C01234ABCDE"},
    slack_token_secret_arn=slack_token_arn,
    slack_token_secret_kms_key_arn=secrets_kms_key_arn,
    lambda_code_path="./lambda",
)

app.synth()
