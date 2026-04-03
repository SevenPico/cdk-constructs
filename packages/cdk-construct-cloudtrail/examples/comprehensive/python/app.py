import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_cloudtrail import CloudTrail, CloudtrailDataEventSelector

app = cdk.App()
stack = cdk.Stack(app, "CloudtrailComprehensiveStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app"))

CloudTrail(
    stack,
    "Trail",
    context=context,
    s3_bucket_name="my-cloudtrail-logs-bucket",
    s3_key_prefix="cloudtrail/",
    include_global_service_events=True,
    is_multi_region_trail=True,
    enable_log_file_validation=True,
    cloud_watch_logs_enabled=True,
    cloud_watch_logs_retention_days=90,
    enable_insights=True,
    management_events="ReadWrite",
    data_events=[
        CloudtrailDataEventSelector(
            resource_type="AWS::S3::Object",
            resource_arns=["arn:aws:s3:::"],
        )
    ],
)

app.synth()
