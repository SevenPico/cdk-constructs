package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	user "github.com/sevenpico/cdk-constructs/cdkconstructiamuser"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("IamUserMinimalStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	user.NewIamUser(stack, jsii.String("User"), &user.IamUserProps{
		Context:  context,
		UserName: jsii.String("alice@example.com"),
	})

	app.Synth(nil)
}
