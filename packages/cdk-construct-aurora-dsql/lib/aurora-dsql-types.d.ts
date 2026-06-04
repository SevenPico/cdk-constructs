import { Context } from '@sevenpico/cdk-context';
export interface AuroraDsqlProps {
    readonly context: Context;
    /** Cluster name. Default: context.id */
    readonly clusterName?: string;
    /** Database name. Default: 'nowcuisine' */
    readonly databaseName?: string;
    /** VPC to deploy cluster into. Default: lookup default VPC */
    readonly vpc?: object;
    /** Master username. Default: 'postgres' */
    readonly masterUsername?: string;
    /** Master password. Required. Omit for random generation. */
    readonly masterPassword?: string;
    /** Backup retention in days. Default: 7 */
    readonly backupRetentionDays?: number;
    /** Enable automated backups. Default: true */
    readonly backupsEnabled?: boolean;
    /** Enable delete protection. Default: true */
    readonly deleteProtection?: boolean;
    /** Enable storage auto-scaling. Default: true */
    readonly storageAutoScalingEnabled?: boolean;
    /** Max allocated storage in GB. Default: 1000 */
    readonly maxAllocatedStorageGb?: number;
    /** Enable multi-AZ deployment. Default: true */
    readonly multiAz?: boolean;
    /** Enable IAM database authentication. Default: true */
    readonly iamDatabaseAuthenticationEnabled?: boolean;
    /** Enable performance insights. Default: false */
    readonly performanceInsightsEnabled?: boolean;
    /** Enable enhanced monitoring. Default: true */
    readonly enhancedMonitoringEnabled?: boolean;
    /** Monitoring interval in seconds (0, 1, 5, 10, 15, 30, 60). Default: 60 */
    readonly monitoringIntervalSeconds?: number;
    /** CloudWatch log exports (e.g., ['postgresql']). Default: ['postgresql'] */
    readonly cloudwatchLogsExports?: string[];
    /** CloudWatch log retention in days. Default: 7 */
    readonly cloudwatchLogsRetentionDays?: number;
}
