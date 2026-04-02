import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns
from sevenpico.cdk_construct_step_functions import (
    StepFunctions,
    StepFunctionsProps,
    StepFunctionsLoggingConfig,
)

app = cdk.App()
stack = cdk.Stack(app, "StepFunctionsComprehensiveStack")

context = ContextFns.make(namespace="acme", environment="dev", stage="app")

StepFunctions(stack, "StateMachine", StepFunctionsProps(
    context=context,
    role_description="Execution role for acme-dev-app workflow",
    type="EXPRESS",
    tracing_enabled=True,
    log_group_retention_days=30,
    logging_configuration=StepFunctionsLoggingConfig(
        level="ALL",
        include_execution_data=True,
    ),
    managed_policy_arns=["arn:aws:iam::aws:policy/AWSLambda_ReadOnlyAccess"],
    definition={
        "Comment": "Comprehensive state machine with Lambda invoke",
        "StartAt": "ProcessInput",
        "States": {
            "ProcessInput": {
                "Type": "Task",
                "Resource": "arn:aws:states:::lambda:invoke",
                "Parameters": {
                    "FunctionName": "arn:aws:lambda:us-east-1:123456789012:function:acme-dev-app-processor",
                    "Payload.$": "$",
                },
                "Next": "Success",
            },
            "Success": {
                "Type": "Succeed",
            },
        },
    },
))

app.synth()
