import { Context, contextId } from '@sevenpico/cdk-context';
import {
  aws_cloudwatch as cloudwatch,
  Duration,
} from 'aws-cdk-lib';

export interface AlarmDefinition {
  readonly id: string;
  readonly alarmName: string;
  readonly description: string;
  readonly filterPattern: string;
  readonly metricName: string;
}

export const alarmDefinitions = (): AlarmDefinition[] => [
  {
    id: 'unauthorized-api',
    alarmName: 'UnauthorizedApiCalls',
    description: 'Detects unauthorized API calls (AccessDenied / UnauthorizedOperation).',
    filterPattern: '{ ($.errorCode = "AccessDenied") || ($.errorCode = "UnauthorizedOperation") }',
    metricName: 'UnauthorizedApiCallCount',
  },
  {
    id: 'no-mfa-console',
    alarmName: 'NoMfaConsoleSignIn',
    description: 'Detects console sign-ins without MFA.',
    filterPattern: '{ ($.eventName = "ConsoleLogin") && ($.additionalEventData.MFAUsed != "Yes") }',
    metricName: 'NoMfaConsoleSignInCount',
  },
  {
    id: 'root-usage',
    alarmName: 'RootAccountUsage',
    description: 'Detects use of the root account.',
    filterPattern: '{ $.userIdentity.type = "Root" && $.userIdentity.invokedBy NOT EXISTS && $.eventType != "AwsServiceEvent" }',
    metricName: 'RootAccountUsageCount',
  },
  {
    id: 'iam-policy-changes',
    alarmName: 'IamPolicyChanges',
    description: 'Detects IAM policy create, update, or delete events.',
    filterPattern: '{ ($.eventName = DeleteGroupPolicy) || ($.eventName = DeleteRolePolicy) || ($.eventName = DeleteUserPolicy) || ($.eventName = PutGroupPolicy) || ($.eventName = PutRolePolicy) || ($.eventName = PutUserPolicy) || ($.eventName = CreatePolicy) || ($.eventName = DeletePolicy) || ($.eventName = CreatePolicyVersion) || ($.eventName = DeletePolicyVersion) || ($.eventName = SetDefaultPolicyVersion) || ($.eventName = AttachRolePolicy) || ($.eventName = DetachRolePolicy) || ($.eventName = AttachUserPolicy) || ($.eventName = DetachUserPolicy) || ($.eventName = AttachGroupPolicy) || ($.eventName = DetachGroupPolicy) }',
    metricName: 'IamPolicyChangeCount',
  },
  {
    id: 'cloudtrail-changes',
    alarmName: 'CloudTrailChanges',
    description: 'Detects CloudTrail configuration changes.',
    filterPattern: '{ ($.eventName = CreateTrail) || ($.eventName = UpdateTrail) || ($.eventName = DeleteTrail) || ($.eventName = StartLogging) || ($.eventName = StopLogging) }',
    metricName: 'CloudTrailChangeCount',
  },
  {
    id: 'console-failures',
    alarmName: 'ConsoleSignInFailures',
    description: 'Detects failed AWS Management Console sign-in attempts.',
    filterPattern: '{ ($.eventName = ConsoleLogin) && ($.errorMessage = "Failed authentication") }',
    metricName: 'ConsoleSignInFailureCount',
  },
  {
    id: 'kms-key-deletion',
    alarmName: 'KmsKeyDeletion',
    description: 'Detects KMS CMK disabling or scheduled deletion.',
    filterPattern: '{ ($.eventSource = kms.amazonaws.com) && (($.eventName = DisableKey) || ($.eventName = ScheduleKeyDeletion)) }',
    metricName: 'KmsKeyDeletionCount',
  },
  {
    id: 's3-bucket-policy',
    alarmName: 'S3BucketPolicyChanges',
    description: 'Detects S3 bucket policy changes.',
    filterPattern: '{ ($.eventSource = s3.amazonaws.com) && (($.eventName = PutBucketAcl) || ($.eventName = PutBucketPolicy) || ($.eventName = PutBucketCors) || ($.eventName = PutBucketLifecycle) || ($.eventName = PutBucketReplication) || ($.eventName = DeleteBucketPolicy) || ($.eventName = DeleteBucketCors) || ($.eventName = DeleteBucketLifecycle) || ($.eventName = DeleteBucketReplication)) }',
    metricName: 'S3BucketPolicyChangeCount',
  },
  {
    id: 'vpc-changes',
    alarmName: 'VpcChanges',
    description: 'Detects changes to VPC configuration.',
    filterPattern: '{ ($.eventName = CreateVpc) || ($.eventName = DeleteVpc) || ($.eventName = ModifyVpcAttribute) || ($.eventName = AcceptVpcPeeringConnection) || ($.eventName = CreateVpcPeeringConnection) || ($.eventName = DeleteVpcPeeringConnection) || ($.eventName = RejectVpcPeeringConnection) || ($.eventName = AttachClassicLinkVpc) || ($.eventName = DetachClassicLinkVpc) || ($.eventName = DisableVpcClassicLink) || ($.eventName = EnableVpcClassicLink) }',
    metricName: 'VpcChangeCount',
  },
  {
    id: 'security-group-changes',
    alarmName: 'SecurityGroupChanges',
    description: 'Detects security group create, update, or delete events.',
    filterPattern: '{ ($.eventName = AuthorizeSecurityGroupIngress) || ($.eventName = AuthorizeSecurityGroupEgress) || ($.eventName = RevokeSecurityGroupIngress) || ($.eventName = RevokeSecurityGroupEgress) || ($.eventName = CreateSecurityGroup) || ($.eventName = DeleteSecurityGroup) }',
    metricName: 'SecurityGroupChangeCount',
  },
  {
    id: 'nacl-changes',
    alarmName: 'NaclChanges',
    description: 'Detects network ACL create, update, or delete events.',
    filterPattern: '{ ($.eventName = CreateNetworkAcl) || ($.eventName = CreateNetworkAclEntry) || ($.eventName = DeleteNetworkAcl) || ($.eventName = DeleteNetworkAclEntry) || ($.eventName = ReplaceNetworkAclEntry) || ($.eventName = ReplaceNetworkAclAssociation) }',
    metricName: 'NaclChangeCount',
  },
  {
    id: 'network-gateway-changes',
    alarmName: 'NetworkGatewayChanges',
    description: 'Detects internet or customer gateway create or delete events.',
    filterPattern: '{ ($.eventName = CreateCustomerGateway) || ($.eventName = DeleteCustomerGateway) || ($.eventName = AttachInternetGateway) || ($.eventName = CreateInternetGateway) || ($.eventName = DeleteInternetGateway) || ($.eventName = DetachInternetGateway) }',
    metricName: 'NetworkGatewayChangeCount',
  },
  {
    id: 'route-table-changes',
    alarmName: 'RouteTableChanges',
    description: 'Detects route table create, update, or delete events.',
    filterPattern: '{ ($.eventName = CreateRoute) || ($.eventName = CreateRouteTable) || ($.eventName = ReplaceRoute) || ($.eventName = ReplaceRouteTableAssociation) || ($.eventName = DeleteRouteTable) || ($.eventName = DeleteRoute) || ($.eventName = DisassociateRouteTable) }',
    metricName: 'RouteTableChangeCount',
  },
  {
    id: 'organization-changes',
    alarmName: 'OrganizationChanges',
    description: 'Detects AWS Organizations configuration changes.',
    filterPattern: '{ ($.eventSource = organizations.amazonaws.com) && (($.eventName = AcceptHandshake) || ($.eventName = AttachPolicy) || ($.eventName = CreateAccount) || ($.eventName = CreateOrganizationalUnit) || ($.eventName = CreatePolicy) || ($.eventName = DeclineHandshake) || ($.eventName = DeleteOrganization) || ($.eventName = DeleteOrganizationalUnit) || ($.eventName = DeletePolicy) || ($.eventName = DetachPolicy) || ($.eventName = DisablePolicyType) || ($.eventName = EnablePolicyType) || ($.eventName = InviteAccountToOrganization) || ($.eventName = LeaveOrganization) || ($.eventName = MoveAccount) || ($.eventName = RemoveAccountFromOrganization) || ($.eventName = UpdateOrganizationalUnit) || ($.eventName = UpdatePolicy)) }',
    metricName: 'OrganizationChangeCount',
  },
];

export const alarmProps = (
  ctx: Context,
  def: AlarmDefinition,
  metricNamespace: string,
  periodSeconds: number,
  evaluationPeriods: number,
  threshold: number,
): cloudwatch.AlarmProps => ({
  alarmName: `${contextId(ctx)}-${def.alarmName}`,
  alarmDescription: def.description,
  metric: new cloudwatch.Metric({
    namespace: metricNamespace,
    metricName: def.metricName,
    period: Duration.seconds(periodSeconds),
    statistic: 'Sum',
  }),
  evaluationPeriods,
  threshold,
  comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
  treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
});
