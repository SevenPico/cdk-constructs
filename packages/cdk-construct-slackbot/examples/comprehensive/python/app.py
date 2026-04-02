import aws_cdk as cdk
from sevenpico.cdk_bridge import CdkBridge
from sevenpico.cdk_construct_slackbot import Slackbot

app = cdk.App()
stack = cdk.Stack(app, "SlackbotComprehensiveStack")

# Load context and platform references from CDK Bridge JSON.
context = CdkBridge.context(stack)
slack_token_arn = CdkBridge.string(stack, "slackTokenArn")
secrets_kms_key_arn = CdkBridge.string(stack, "secretsKmsKeyArn")

Slackbot(stack, "SlackbotConstruct",
    context=context,

    # Multiple Slack channels: SNS attribute name -> Slack channel ID
    slack_channels={
        "alerts": "C01234ABCDE",
        "deployments": "C09876ZYXWV",
        "incidents": "C0INCIDENT0",
    },

    slack_token_secret_arn=slack_token_arn,
    slack_token_secret_kms_key_arn=secrets_kms_key_arn,

    # Custom Lambda deployment package
    lambda_code_path="./lambda",
    lambda_runtime="python3.11",

    # Custom CloudWatch log retention (30 days instead of default 90)
    cloudwatch_log_expiration_days=30,

    # Allow CloudWatch Alarms service to publish notifications
    sns_pub_principals={
        "Service": ["cloudwatch.amazonaws.com", "events.amazonaws.com"],
    },

    # Allow specific IAM role to subscribe
    sns_sub_principals={
        "AWS": ["arn:aws:iam::123456789012:role/acme-dev-app-ops-role"],
    },
)

app.synth()
