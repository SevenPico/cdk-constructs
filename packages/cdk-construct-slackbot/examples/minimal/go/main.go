package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	"github.com/sevenpico/cdk-constructs/cdkbridge"
	slackbot "github.com/sevenpico/cdk-constructs/cdkconstructslackbot"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("SlackbotMinimalStack"), nil)

	// Load context and platform references from CDK Bridge JSON.
	context := cdkbridge.CdkBridge_Context(stack)
	slackTokenArn := cdkbridge.CdkBridge_String(stack, jsii.String("slackTokenArn"), nil)

	slackbot.NewSlackbot(stack, jsii.String("SlackbotConstruct"), &slackbot.SlackbotProps{
		Context: context,
		SlackChannels: &map[string]*string{
			"alerts": jsii.String("C01234ABCDE"),
		},
		SlackTokenSecretArn: slackTokenArn,
		LambdaCodePath:      jsii.String("./lambda"),
	})

	app.Synth(nil)
}
