package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	cwevents "github.com/sevenpico/cdk-constructs/cdkconstructcloudwatchevents"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("CloudwatchEventsComprehensiveStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	cwevents.NewCloudwatchEvents(stack, jsii.String("Events"), &cwevents.CloudwatchEventsProps{
		Context: context,
		Rules: &[]cwevents.CloudwatchEventRule{
			{
				Name:        jsii.String("heartbeat"),
				Description: jsii.String("Scheduled heartbeat every 5 minutes"),
				Schedule:    jsii.String("rate(5 minutes)"),
				Targets: &[]cwevents.CloudwatchEventTarget{
					{
						Type: jsii.String("sns"),
						Arn:  jsii.String("arn:aws:sns:us-east-1:123456789012:my-topic"),
					},
				},
			},
			{
				Name:         jsii.String("ec2-state-change"),
				Description:  jsii.String("Reacts to EC2 instance state changes"),
				EventPattern: jsii.String(`{"source":["aws.ec2"],"detail-type":["EC2 Instance State-change Notification"]}`),
				Targets: &[]cwevents.CloudwatchEventTarget{
					{
						Type: jsii.String("sqs"),
						Arn:  jsii.String("arn:aws:sqs:us-east-1:123456789012:my-queue"),
					},
				},
			},
		},
	})

	app.Synth(nil)
}
