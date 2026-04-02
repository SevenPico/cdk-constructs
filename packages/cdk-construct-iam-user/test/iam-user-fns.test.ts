import { makeContext } from '@sevenpico/cdk-context';
import { iamUserProps, loginProfileProps } from '../src/iam-user-fns';
import { IamUserProps } from '../src/iam-user-types';

describe('IamUser pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'ci' });

  describe('iamUserProps', () => {
    test('returns correct userName', () => {
      const props: IamUserProps = { context: ctx, userName: 'ci@example.com' };
      const result = iamUserProps(props);
      expect(result.userName).toBe('ci@example.com');
    });

    test('returns default path /', () => {
      const props: IamUserProps = { context: ctx, userName: 'ci@example.com' };
      const result = iamUserProps(props);
      expect(result.path).toBe('/');
    });

    test('returns custom path', () => {
      const props: IamUserProps = { context: ctx, userName: 'ci@example.com', path: '/service/' };
      const result = iamUserProps(props);
      expect(result.path).toBe('/service/');
    });
  });

  describe('loginProfileProps', () => {
    test('returns login profile by default', () => {
      const props: IamUserProps = { context: ctx, userName: 'user@example.com' };
      const result = loginProfileProps(props);
      expect(result).toBeDefined();
      expect(result!.passwordResetRequired).toBe(true);
    });

    test('returns undefined when loginProfileEnabled is false', () => {
      const props: IamUserProps = { context: ctx, userName: 'user@example.com', loginProfileEnabled: false };
      const result = loginProfileProps(props);
      expect(result).toBeUndefined();
    });

    test('passwordResetRequired defaults to true', () => {
      const props: IamUserProps = { context: ctx, userName: 'user@example.com' };
      const result = loginProfileProps(props);
      expect(result!.passwordResetRequired).toBe(true);
    });

    test('passwordResetRequired can be set to false', () => {
      const props: IamUserProps = { context: ctx, userName: 'user@example.com', passwordResetRequired: false };
      const result = loginProfileProps(props);
      expect(result!.passwordResetRequired).toBe(false);
    });
  });
});
