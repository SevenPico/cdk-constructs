import { aws_dsql as dsql } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AuroraDsqlProps } from './aurora-dsql-types';
export declare class AuroraDsql extends Construct {
    readonly cluster?: dsql.CfnCluster;
    readonly clusterArn?: string;
    readonly clusterEndpoint?: string;
    constructor(scope: Construct, id: string, props: AuroraDsqlProps);
}
