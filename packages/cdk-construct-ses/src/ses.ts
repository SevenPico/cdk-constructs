import { Construct } from 'constructs';
import { Arn, ArnFormat, Stack, Tags } from 'aws-cdk-lib';
import { aws_ses as ses, aws_route53 as route53, aws_iam as iam } from 'aws-cdk-lib';
import { contextTags, isEnabled } from '@sevenpico/cdk-context';
import { SesProps } from './ses-types';
import { sesIdentityName, sesGroupName, sesUserName, sesPolicyStatement } from './ses-fns';

export class Ses extends Construct {
  public readonly emailIdentity?: ses.CfnEmailIdentity;
  public readonly iamGroup?: iam.Group;
  public readonly iamUser?: iam.User;
  public readonly accessKey?: iam.AccessKey;

  constructor(scope: Construct, id: string, props: SesProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // SES domain identity (L1)
    this.emailIdentity = new ses.CfnEmailIdentity(this, 'Identity', {
      emailIdentity: sesIdentityName(props.context),
    });

    // Construct identity ARN (CfnEmailIdentity has no attrArn)
    const identityArn = Arn.format({
      service: 'ses',
      resource: 'identity',
      resourceName: sesIdentityName(props.context),
      arnFormat: ArnFormat.SLASH_RESOURCE_NAME,
    }, Stack.of(this));

    // Route53 domain verification TXT record
    if (props.verifyDomain && props.zoneId && props.zoneName) {
      const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', {
        hostedZoneId: props.zoneId,
        zoneName: props.zoneName,
      });
      new route53.TxtRecord(this, 'VerificationRecord', {
        zone,
        recordName: `_amazonses.${sesIdentityName(props.context)}`,
        values: [this.emailIdentity.attrDkimDnsTokenValue1],
      });
    }

    // DKIM CNAME records (3 records required)
    if (props.verifyDkim && props.zoneId && props.zoneName) {
      const dkimZone = props.verifyDomain
        ? route53.HostedZone.fromHostedZoneAttributes(this, 'DkimZone', {
          hostedZoneId: props.zoneId,
          zoneName: props.zoneName,
        })
        : route53.HostedZone.fromHostedZoneAttributes(this, 'Zone2', {
          hostedZoneId: props.zoneId,
          zoneName: props.zoneName,
        });

      const tokenNames = [
        this.emailIdentity.attrDkimDnsTokenName1,
        this.emailIdentity.attrDkimDnsTokenName2,
        this.emailIdentity.attrDkimDnsTokenName3,
      ];
      const tokenValues = [
        this.emailIdentity.attrDkimDnsTokenValue1,
        this.emailIdentity.attrDkimDnsTokenValue2,
        this.emailIdentity.attrDkimDnsTokenValue3,
      ];

      tokenNames.forEach((tokenName, i) => {
        new route53.CnameRecord(this, `DkimRecord${i + 1}`, {
          zone: dkimZone,
          recordName: tokenName,
          domainName: tokenValues[i],
        });
      });
    }

    // IAM group
    if (props.sesGroupEnabled !== false) {
      this.iamGroup = new iam.Group(this, 'Group', {
        groupName: sesGroupName(props.context, props),
        path: props.sesGroupPath ?? '/',
      });

      this.iamGroup.addToPolicy(
        sesPolicyStatement(props, identityArn),
      );
    }

    // IAM user
    if (props.sesUserEnabled !== false) {
      this.iamUser = new iam.User(this, 'User', {
        userName: sesUserName(props.context),
        path: props.path ?? '/',
        permissionsBoundary: props.permissionsBoundary
          ? iam.ManagedPolicy.fromManagedPolicyArn(this, 'Boundary', props.permissionsBoundary)
          : undefined,
      });

      if (this.iamGroup) {
        this.iamUser.addToGroup(this.iamGroup);
      }

      if (props.createIamAccessKey !== false) {
        this.accessKey = new iam.AccessKey(this, 'AccessKey', {
          user: this.iamUser,
        });
      }

      // Inline policies — parse JSON strings into PolicyDocuments and attach to user
      (props.inlinePolicies ?? []).forEach((policyJson, i) => {
        const doc = iam.PolicyDocument.fromJson(JSON.parse(policyJson));
        new iam.Policy(this, `InlinePolicy${i}`, {
          document: doc,
          users: [this.iamUser!],
        });
      });

      (props.policyArns ?? []).forEach((arn, i) =>
        this.iamUser!.addManagedPolicy(iam.ManagedPolicy.fromManagedPolicyArn(this, `Policy${i}`, arn)),
      );
    }

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
