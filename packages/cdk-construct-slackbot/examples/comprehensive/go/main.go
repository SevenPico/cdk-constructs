package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	"github.com/sevenpico/cdk-constructs/cdkbridge"
	slackbot "github.com/sevenpico/cdk-constructs/cdkconstructslackbot"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("SlackbotComprehensiveStack"), nil)

	// Load context and platform references from CDK Bridge JSON.
	context := cdkbridge.CdkBridge_Context(stack)
	slackTokenArn := cdkbridge.CdkBridge_String(stack, jsii.String("slackTokenArn"), nil)
	secretsKmsKeyArn := cdkbridge.CdkBridge_String(stack, jsii.String("secretsKmsKeyArn"), nil)

	slackbot.NewSlackbot(stack, jsii.String("SlackbotConstruct"), &slackbot.SlackbotProps{
		Context: context,

		// Multiple Slack channels: SNS attribute name -> Slack channel ID
		SlackChannels: &map[string]*string{
			"alerts":      jsii.String("C01234ABCDE"),
			"deployments": jsii.String("C09876ZYXWV"),
			"incidents":   jsii.String("C0INCIDENT0"),
		},

		SlackTokenSecretArn:       slackTokenArn,
		SlackTokenSecretKmsKeyArn: secretsKmsKeyArn,

		// Custom Lambda deployment package
		LambdaCodePath: jsii.String("./lambda"),
		LambdaRuntime:  jsii.String("python3.11"),

		// Custom CloudWatch log retention (30 days instead of default 90)
		CloudwatchLogExpirationDays: jsii.Number(30),

		// Allow CloudWatch Alarms service to publish notifications
		SnsPubPrincipals: &map[string]*[]*string{
			"Service": {jsii.String("cloudwatch.amazonaws.com"), jsii.String("events.amazonaws.com")},
		},

		// Allow specific IAM role to subscribe
		SnsSubPrincipals: &map[string]*[]*string{
			"AWS": {jsii.String("arn:aws:iam::123456789012:role/acme-dev-app-ops-role")},
		},
	})

	app.Synth(nil)
}
