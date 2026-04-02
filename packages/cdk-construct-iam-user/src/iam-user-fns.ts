import { aws_iam as iam } from 'aws-cdk-lib';
import { IamUserProps } from './iam-user-types';

export const iamUserProps = (props: IamUserProps): iam.UserProps => ({
  userName: props.userName,
  path: props.path ?? '/',
});

export const loginProfileProps = (props: IamUserProps): iam.CfnUser.LoginProfileProperty | undefined => {
  if (props.loginProfileEnabled === false) return undefined;
  return {
    password: generatePlaceholderPassword(props.passwordLength ?? 24),
    passwordResetRequired: props.passwordResetRequired ?? true,
  };
};

const generatePlaceholderPassword = (length: number): string => {
  return `CHANGE_ME_${'x'.repeat(Math.max(0, length - 10))}`;
};
