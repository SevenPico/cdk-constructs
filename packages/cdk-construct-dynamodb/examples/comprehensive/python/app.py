import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_dynamodb import Dynamodb, DynamodbGsi

app = cdk.App()
stack = cdk.Stack(app, "DynamodbComprehensiveStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app"))

Dynamodb(
    stack,
    "Table",
    context=context,
    hash_key="pk",
    range_key="sk",
    billing_mode="PAY_PER_REQUEST",
    enable_encryption=True,
    enable_point_in_time_recovery=True,
    enable_streams=True,
    stream_view_type="NEW_AND_OLD_IMAGES",
    ttl_enabled=True,
    ttl_attribute="expiresAt",
    global_secondary_indexes=[
        DynamodbGsi(
            name="gsi1",
            hash_key="gsi1pk",
            range_key="gsi1sk",
            projection_type="ALL",
        )
    ],
)

app.synth()
