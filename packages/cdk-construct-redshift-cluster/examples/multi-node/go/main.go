package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	redshiftcluster "github.com/sevenpico/cdk-constructs/cdkconstructredshiftcluster"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("RedshiftClusterMultiNodeStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	numberOfNodes := float64(2)
	redshiftcluster.NewRedshiftCluster(stack, jsii.String("Cluster"), &redshiftcluster.RedshiftClusterProps{
		Context:       context,
		SubnetIds:     &[]*string{jsii.String("subnet-01111111111111111"), jsii.String("subnet-02222222222222222"), jsii.String("subnet-03333333333333333")},
		AdminPassword: jsii.String("Placeholder1!"),
		ClusterType:   jsii.String("multi-node"),
		NumberOfNodes: &numberOfNodes,
	})

	app.Synth(nil)
}
