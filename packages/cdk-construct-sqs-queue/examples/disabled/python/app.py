import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_sqs_queue import SqsQueue

app = cdk.App()
stack = cdk.Stack(app, "SqsQueueDisabledStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app", enabled=False))

SqsQueue(stack, "Queue", context=context)

app.synth()
