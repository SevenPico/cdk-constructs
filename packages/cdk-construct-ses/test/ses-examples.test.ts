import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Ses } from '../src';

describe('ses examples', () => {
  test('minimal scenario synthesizes without error', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    const context = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });
    new Ses(stack, 'Ses', { context });
    expect(() => Template.fromStack(stack)).not.toThrow();
  });

  test('disabled scenario creates no resources', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    const context = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false });
    new Ses(stack, 'Ses', { context });
    const template = Template.fromStack(stack);
    // No SES-related resources when disabled
    expect(Object.keys(template.toJSON().Resources || {}).length).toBe(0);
  });
});
