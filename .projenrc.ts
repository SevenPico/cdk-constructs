import { MonorepoTsProject } from '@aws/pdk/monorepo';
import { AwsCdkConstructLibrary } from 'projen/lib/awscdk';
import { NodePackageManager } from 'projen/lib/javascript';

const monorepo = new MonorepoTsProject({
  name: 'sevenpico-cdk-constructs',
  packageManager: NodePackageManager.NPM,
  defaultReleaseBranch: 'main',
  devDeps: ['@aws/pdk', 'projen@^0.99.27'],
  gitIgnoreOptions: { ignorePatterns: ['.env', '*.js.map', '.claude'] },
});

// ── Shared helper ─────────────────────────────────────────────────────────────
const pkg = (name: string, outdir: string, opts: any = {}) =>
  new AwsCdkConstructLibrary({
    parent: monorepo,
    name: `@sevenpico/${name}`,
    outdir: `packages/${outdir ?? name}`,
    author: 'SevenPico',
    authorAddress: 'https://sevenpico.com',
    repositoryUrl: 'https://github.com/SevenPico/cdk-constructs',
    cdkVersion: '2.246.0',
    constructsVersion: '10.5.0',
    defaultReleaseBranch: 'main',
    jsiiVersion: '~5.4.0',
    packageManager: NodePackageManager.NPM,
    ...opts,
  });

// ── Foundation packages ───────────────────────────────────────────────────────
pkg('cdk-context', 'cdk-context', { cdkVersion: '2.246.0', deps: [] });
pkg('cdk-bridge',  'cdk-bridge',  { deps: ['@sevenpico/cdk-context'] });

// ── Construct packages ────────────────────────────────────────────────────────
const ctx = ['@sevenpico/cdk-context'];

pkg('cdk-construct-kms-key',                         'cdk-construct-kms-key',                         { deps: ctx });
pkg('cdk-construct-s3-bucket',                       'cdk-construct-s3-bucket',                       { deps: ctx });
pkg('cdk-construct-s3-log-storage',                  'cdk-construct-s3-log-storage',                  { deps: [...ctx, '@sevenpico/cdk-construct-s3-bucket'] });
pkg('cdk-construct-s3-website',                      'cdk-construct-s3-website',                      { deps: ctx });
pkg('cdk-construct-secret',                          'cdk-construct-secret',                          { deps: ctx });
pkg('cdk-construct-iam-role',                        'cdk-construct-iam-role',                        { deps: ctx });
pkg('cdk-construct-iam-policy',                      'cdk-construct-iam-policy',                      { deps: ctx });
pkg('cdk-construct-iam-user',                        'cdk-construct-iam-user',                        { deps: ctx });
pkg('cdk-construct-lambda-function',                 'cdk-construct-lambda-function',                 { deps: ctx });
pkg('cdk-construct-lambda-error-notification',       'cdk-construct-lambda-error-notification',       { deps: [...ctx, '@sevenpico/cdk-construct-sqs-queue'] });
pkg('cdk-construct-step-functions',                  'cdk-construct-step-functions',                  { deps: [...ctx, '@sevenpico/cdk-construct-iam-role'] });
pkg('cdk-construct-sfn-error-notification',          'cdk-construct-sfn-error-notification',          { deps: [...ctx, '@sevenpico/cdk-construct-sqs-queue'] });
pkg('cdk-construct-express-sfn-error-notification',  'cdk-construct-express-sfn-error-notification',  { deps: [...ctx, '@sevenpico/cdk-construct-sqs-queue'] });
pkg('cdk-construct-sqs-queue',                       'cdk-construct-sqs-queue',                       { deps: ctx });
pkg('cdk-construct-sns',                             'cdk-construct-sns',                             { deps: ctx });
pkg('cdk-construct-kinesis-stream',                  'cdk-construct-kinesis-stream',                  { deps: ctx });
pkg('cdk-construct-eventbridge',                     'cdk-construct-eventbridge',                     { deps: ctx });
pkg('cdk-construct-eventbridge-rule',                'cdk-construct-eventbridge-rule',                { deps: ctx });
pkg('cdk-construct-dynamodb',                        'cdk-construct-dynamodb',                        { deps: ctx });
pkg('cdk-construct-redshift-cluster',                'cdk-construct-redshift-cluster',                { deps: ctx });
pkg('cdk-construct-ses',                             'cdk-construct-ses',                             { deps: ctx });
pkg('cdk-construct-http-api-gateway',                'cdk-construct-http-api-gateway',                { deps: ctx });
pkg('cdk-construct-slackbot',                        'cdk-construct-slackbot',                        { deps: [...ctx, '@sevenpico/cdk-construct-sns', '@sevenpico/cdk-construct-lambda-function'] });
pkg('cdk-construct-cloudtrail',                      'cdk-construct-cloudtrail',                      { deps: ctx });
pkg('cdk-construct-cloudtrail-cloudwatch-alarms',    'cdk-construct-cloudtrail-cloudwatch-alarms',    { deps: ctx });
pkg('cdk-construct-cloudwatch-events',               'cdk-construct-cloudwatch-events',               { deps: ctx });
pkg('cdk-construct-cloudwatch-flow-logs',            'cdk-construct-cloudwatch-flow-logs',            { deps: ctx });

// ── Security overrides for vulnerable transitive dependencies ─────────────────
// PDK-managed overrides are preserved here so they survive re-synths.
// brace-expansion, js-yaml, minimatch, yaml: fix ReDoS/prototype-pollution in
// projen, nx, and @aws/pdk internal deps.
// lodash in @aws/pdk has no fix available upstream.
monorepo.package.addField('overrides', {
  '@types/babel__traverse': '7.18.2',       // PDK-managed, keep
  '@zkochan/js-yaml': 'npm:js-yaml@^4.1.1', // was 4.1.0, needs >=4.1.1
  'wrap-ansi': '^7.0.0',                    // PDK-managed, keep
  'brace-expansion': '^2.0.1',
  'js-yaml': '^4.1.1',
  'minimatch': '^9.0.7',
  'yaml': '^2.9.0',
});

monorepo.synth();
