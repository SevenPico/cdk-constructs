import { Construct } from 'constructs';
import { Tags, aws_iam as iam } from 'aws-cdk-lib';
import { contextTags, isEnabled } from '@sevenpico/cdk-context';
import { IamUserProps } from './iam-user-types';
import { iamUserProps, loginProfileProps } from './iam-user-fns';

export class IamUser extends Construct {
  public readonly user?: iam.User;

  constructor(scope: Construct, id: string, props: IamUserProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    this.user = new iam.User(this, 'User', iamUserProps(props));

    // Permissions boundary
    if (props.permissionsBoundary) {
      const boundary = iam.ManagedPolicy.fromManagedPolicyArn(this, 'Boundary', props.permissionsBoundary);
      iam.PermissionsBoundary.of(this.user).apply(boundary);
    }

    // Group membership
    (props.groups ?? []).forEach((groupName, i) => {
      const group = iam.Group.fromGroupName(this, `Group${i}`, groupName);
      this.user!.addToGroup(group);
    });

    // Login profile via L1 escape hatch
    const loginProfile = loginProfileProps(props);
    if (loginProfile) {
      const cfnUser = this.user.node.defaultChild as iam.CfnUser;
      cfnUser.loginProfile = loginProfile;
    }

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
