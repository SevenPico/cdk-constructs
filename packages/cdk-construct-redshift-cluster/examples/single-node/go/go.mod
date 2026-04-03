module github.com/sevenpico/examples/cdk-construct-redshift-cluster-single-node

go 1.21

require (
	github.com/aws/aws-cdk-go/awscdk/v2 v2.246.0
	github.com/aws/constructs-go/constructs/v10 v10.5.0
	github.com/aws/jsii-runtime-go v1.127.0
	github.com/sevenpico/cdk-constructs/cdkcontext v0.0.0
	// Install from local build — add replace directive pointing to dist/go output:
	// replace github.com/sevenpico/cdk-constructs/cdkcontext => <path-to-dist/go/.../cdkcontext@v0.0.0>
	github.com/sevenpico/cdk-constructs/cdkconstructredshiftcluster v0.0.0
	// replace github.com/sevenpico/cdk-constructs/cdkconstructredshiftcluster => <path-to-dist/go/.../cdkconstructredshiftcluster@v0.0.0>
)
