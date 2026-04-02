using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructRedshiftCluster;

var app = new App();
var stack = new Stack(app, "RedshiftClusterSingleNodeStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

new RedshiftCluster(stack, "Cluster", new RedshiftClusterProps
{
    Context = context,
    SubnetIds = new[] { "subnet-01111111111111111", "subnet-02222222222222222", "subnet-03333333333333333" },
    AdminPassword = "Placeholder1!",
    ClusterType = "single-node",
});

app.Synth();
