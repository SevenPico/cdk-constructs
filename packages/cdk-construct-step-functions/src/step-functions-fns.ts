import { Context, contextId } from '@sevenpico/cdk-context';
import {
  aws_stepfunctions as sfn,
  aws_logs as logs,
  aws_iam as iam,
} from 'aws-cdk-lib';
import { StepFunctionsProps, StepFunctionsLoggingConfig } from './step-functions-types';

export const stateMachineName = (ctx: Context, props: StepFunctionsProps): string =>
  props.stateMachineName ?? contextId(ctx);

export const logGroupName = (ctx: Context, props: StepFunctionsProps): string =>
  props.logGroupName ?? `/aws/states/${contextId(ctx)}`;

export const stateMachineType = (props: StepFunctionsProps): sfn.StateMachineType =>
  props.type === 'EXPRESS'
    ? sfn.StateMachineType.EXPRESS
    : sfn.StateMachineType.STANDARD;

export const loggingConfig = (
  logGroup: logs.ILogGroup,
  config?: StepFunctionsLoggingConfig,
): sfn.LogOptions => ({
  destination: logGroup,
  includeExecutionData: config?.includeExecutionData ?? false,
  level: mapLogLevel(config?.level ?? 'OFF'),
});

export const mapLogLevel = (level: string): sfn.LogLevel => {
  const map: Record<string, sfn.LogLevel> = {
    ALL: sfn.LogLevel.ALL,
    ERROR: sfn.LogLevel.ERROR,
    FATAL: sfn.LogLevel.FATAL,
    OFF: sfn.LogLevel.OFF,
  };
  return map[level] ?? sfn.LogLevel.OFF;
};

export const buildTrustDocument = (principals?: Record<string, string[]>): iam.PolicyDocument => {
  const allPrincipals = principals ?? { Service: ['states.amazonaws.com'] };
  const iamPrincipals = Object.entries(allPrincipals).flatMap(([type, ids]) =>
    ids.map(id => buildPrincipal(type, id)),
  );
  return new iam.PolicyDocument({
    statements: [
      new iam.PolicyStatement({
        actions: ['sts:AssumeRole'],
        principals: iamPrincipals.length > 0 ? iamPrincipals : [new iam.ServicePrincipal('states.amazonaws.com')],
      }),
    ],
  });
};

const buildPrincipal = (type: string, identifier: string): iam.IPrincipal => {
  switch (type) {
    case 'Service': return new iam.ServicePrincipal(identifier);
    case 'AWS': return new iam.ArnPrincipal(identifier);
    case 'Federated': return new iam.FederatedPrincipal(identifier, {});
    default: return new iam.ArnPrincipal(identifier);
  }
};

export const mergePolicyDocuments = (docs: string[]): iam.PolicyDocument | undefined => {
  if (!docs || docs.length === 0) return undefined;
  const allStatements: iam.PolicyStatement[] = [];
  for (const doc of docs) {
    const parsed = JSON.parse(doc);
    const stmts: unknown[] = parsed.Statement ?? [];
    stmts.forEach(stmt => {
      allStatements.push(iam.PolicyStatement.fromJson(stmt));
    });
  }
  return new iam.PolicyDocument({ statements: allStatements });
};
