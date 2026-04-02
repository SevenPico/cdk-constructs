import { Context } from '@sevenpico/cdk-context';

export interface DynamodbAttribute {
  readonly name: string;
  readonly type: string;
}

export interface DynamodbGsi {
  readonly name: string;
  readonly hashKey: string;
  readonly rangeKey?: string;
  readonly projectionType: string;
  readonly nonKeyAttributes?: string[];
  readonly readCapacity?: number;
  readonly writeCapacity?: number;
}

export interface DynamodbLsi {
  readonly name: string;
  readonly rangeKey: string;
  readonly projectionType: string;
  readonly nonKeyAttributes?: string[];
}

export interface DynamodbReplicaConfig {
  readonly region: string;
  readonly kmsKeyArn?: string;
  readonly pointInTimeRecovery?: boolean;
  readonly propagateTags?: boolean;
}

export interface DynamodbProps {
  readonly context: Context;
  readonly hashKey: string;
  readonly hashKeyType?: string;
  readonly rangeKey?: string;
  readonly rangeKeyType?: string;
  readonly billingMode?: string;
  readonly readCapacity?: number;
  readonly writeCapacity?: number;
  readonly enableAutoscaler?: boolean;
  readonly autoscaleReadMin?: number;
  readonly autoscaleReadMax?: number;
  readonly autoscaleWriteMin?: number;
  readonly autoscaleWriteMax?: number;
  readonly autoscaleReadTarget?: number;
  readonly autoscaleWriteTarget?: number;
  readonly enableEncryption?: boolean;
  readonly kmsKeyArn?: string;
  readonly enablePointInTimeRecovery?: boolean;
  readonly enableStreams?: boolean;
  readonly streamViewType?: string;
  readonly ttlEnabled?: boolean;
  readonly ttlAttribute?: string;
  readonly tableClass?: string;
  readonly dynamodbAttributes?: DynamodbAttribute[];
  readonly globalSecondaryIndexes?: DynamodbGsi[];
  readonly localSecondaryIndexes?: DynamodbLsi[];
  readonly replicas?: DynamodbReplicaConfig[];
}
