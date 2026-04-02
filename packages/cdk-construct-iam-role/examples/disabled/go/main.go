package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	role "github.com/sevenpico/cdk-constructs/cdkconstructiamrole"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("IamRoleDisabledStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
		Enabled:     jsii.Bool(false),
	})

	role.NewIamRole(stack, jsii.String("Role"), &role.IamRoleProps{
		Context:         context,
		RoleDescription: jsii.String("Acme application role"),
		Principals: &map[string]*[]*string{
			"Service": {jsii.String("lambda.amazonaws.com")},
		},
	})

	app.Synth(nil)
}
