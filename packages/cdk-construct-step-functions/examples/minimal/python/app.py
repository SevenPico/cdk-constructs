import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns
from sevenpico.cdk_construct_step_functions import StepFunctions, StepFunctionsProps

app = cdk.App()
stack = cdk.Stack(app, "StepFunctionsMinimalStack")

context = ContextFns.make(namespace="acme", environment="dev", stage="app")

StepFunctions(stack, "StateMachine", StepFunctionsProps(
    context=context,
    role_description="Execution role for acme-dev-app state machine",
    definition={
        "Comment": "Minimal state machine",
        "StartAt": "Pass",
        "States": {
            "Pass": {
                "Type": "Pass",
                "End": True,
            },
        },
    },
))

app.synth()
