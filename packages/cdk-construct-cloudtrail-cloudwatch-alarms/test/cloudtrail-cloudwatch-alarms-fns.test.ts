import { makeContext } from '@sevenpico/cdk-context';
import { aws_cloudwatch as cloudwatch } from 'aws-cdk-lib';
import { alarmDefinitions, alarmProps } from '../src/cloudtrail-cloudwatch-alarms-fns';

describe('CloudtrailCloudwatchAlarms pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'audit' });

  describe('alarmDefinitions', () => {
    test('returns 14 alarm definitions', () => {
      expect(alarmDefinitions()).toHaveLength(14);
    });

    test('all definitions have required fields', () => {
      alarmDefinitions().forEach((def) => {
        expect(def.id).toBeTruthy();
        expect(def.alarmName).toBeTruthy();
        expect(def.description).toBeTruthy();
        expect(def.filterPattern).toBeTruthy();
        expect(def.metricName).toBeTruthy();
      });
    });

    test('all IDs are unique', () => {
      const ids = alarmDefinitions().map((d) => d.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    test('all metric names are unique', () => {
      const names = alarmDefinitions().map((d) => d.metricName);
      expect(new Set(names).size).toBe(names.length);
    });
  });

  describe('alarmProps', () => {
    const def = alarmDefinitions()[0];

    test('alarm name prefixed with context ID', () => {
      const result = alarmProps(ctx, def, 'CISBenchmark', 300, 1, 1);
      expect(result.alarmName).toBe(`7p-prod-audit-${def.alarmName}`);
    });

    test('uses provided namespace', () => {
      const result = alarmProps(ctx, def, 'CustomNS', 300, 1, 1);
      expect((result.metric as cloudwatch.Metric).namespace).toBe('CustomNS');
    });

    test('uses GREATER_THAN_OR_EQUAL_TO_THRESHOLD comparison', () => {
      const result = alarmProps(ctx, def, 'CISBenchmark', 300, 1, 1);
      expect(result.comparisonOperator).toBe(cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD);
    });

    test('treats missing data as NOT_BREACHING', () => {
      const result = alarmProps(ctx, def, 'CISBenchmark', 300, 1, 1);
      expect(result.treatMissingData).toBe(cloudwatch.TreatMissingData.NOT_BREACHING);
    });

    test('uses provided evaluation periods and threshold', () => {
      const result = alarmProps(ctx, def, 'CISBenchmark', 600, 3, 5);
      expect(result.evaluationPeriods).toBe(3);
      expect(result.threshold).toBe(5);
    });
  });
});
