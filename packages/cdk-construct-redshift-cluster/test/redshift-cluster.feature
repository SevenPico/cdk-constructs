Feature: Redshift Cluster Construct
  As an infrastructure engineer
  I want to provision a Redshift cluster with subnet and parameter groups
  So that I can run analytics workloads with consistent naming and configuration

  @enabled:false
  Scenario: Cluster identifier uses context ID
    Given a context with namespace "7p", stage "prod", name "analytics"
    When a RedshiftCluster is created with required props
    Then the cluster identifier is "7p-prod-analytics"

  @enabled:false
  Scenario: Single-node cluster with dc2.large by default
    Given no clusterType or nodeType props
    When a RedshiftCluster is created
    Then the cluster type is "single-node" and node type is "dc2.large"

  @enabled:false
  Scenario: Cluster is not publicly accessible by default
    Given no publiclyAccessible prop
    When a RedshiftCluster is created
    Then publiclyAccessible is false

  @enabled:false
  Scenario: Encryption disabled by default
    Given no encrypted prop
    When a RedshiftCluster is created
    Then encrypted is false

  @enabled:false
  Scenario: Subnet group and parameter group are created
    Given a valid context and subnetIds
    When a RedshiftCluster is created
    Then a AWS::Redshift::ClusterSubnetGroup resource exists
    And a AWS::Redshift::ClusterParameterGroup resource exists

  @enabled:false
  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When a RedshiftCluster is created
    Then no AWS::Redshift::Cluster resources exist in the stack
