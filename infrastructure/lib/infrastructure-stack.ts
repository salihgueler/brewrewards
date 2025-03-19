import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

export class BrewRewardsStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly graphqlApi: appsync.GraphqlApi;
  public readonly shopsTable: dynamodb.Table;
  public readonly usersTable: dynamodb.Table;
  public readonly rewardsTable: dynamodb.Table;
  public readonly stampCardsTable: dynamodb.Table;
  public readonly userRewardsTable: dynamodb.Table;
  public readonly menuTable: dynamodb.Table;
  public readonly favoritesTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Tables
    this.shopsTable = new dynamodb.Table(this, 'ShopsTable', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development only
    });

    // Add GSI for subdomain lookup
    this.shopsTable.addGlobalSecondaryIndex({
      indexName: 'SubdomainIndex',
      partitionKey: { name: 'subdomain', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    this.usersTable = new dynamodb.Table(this, 'UsersTable', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Add GSI for shop-user lookup
    this.usersTable.addGlobalSecondaryIndex({
      indexName: 'ShopUsersIndex',
      partitionKey: { name: 'GSI1-PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1-SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    this.rewardsTable = new dynamodb.Table(this, 'RewardsTable', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.stampCardsTable = new dynamodb.Table(this, 'StampCardsTable', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.userRewardsTable = new dynamodb.Table(this, 'UserRewardsTable', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.menuTable = new dynamodb.Table(this, 'MenuTable', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.favoritesTable = new dynamodb.Table(this, 'FavoritesTable', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Cognito User Pool
    this.userPool = new cognito.UserPool(this, 'BrewRewardsUserPool', {
      selfSignUpEnabled: true,
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
        givenName: { required: true, mutable: true },
        familyName: { required: true, mutable: true },
      },
      customAttributes: {
        shopId: new cognito.StringAttribute({ mutable: true }),
        userRole: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Add domain to user pool
    this.userPool.addDomain('CognitoDomain', {
      cognitoDomain: {
        domainPrefix: 'brewrewards-auth',
      },
    });

    // Create user pool groups
    new cognito.CfnUserPoolGroup(this, 'CustomersGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'Customers',
      description: 'Regular users of the BrewRewards platform',
    });

    new cognito.CfnUserPoolGroup(this, 'ShopAdminsGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'ShopAdmins',
      description: 'Coffee shop owners and managers',
    });

    new cognito.CfnUserPoolGroup(this, 'SuperAdminsGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'SuperAdmins',
      description: 'Platform administrators',
    });

    // Create app clients
    const userPoolClient = this.userPool.addClient('WebClient', {
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [
          'http://localhost:3000/api/auth/callback/cognito',
          'https://brewrewards.com/api/auth/callback/cognito',
          'https://*.brewrewards.com/api/auth/callback/cognito',
        ],
        logoutUrls: [
          'http://localhost:3000',
          'https://brewrewards.com',
          'https://*.brewrewards.com',
        ],
      },
    });

    // AppSync GraphQL API
    this.graphqlApi = new appsync.GraphqlApi(this, 'BrewRewardsAPI', {
      name: 'BrewRewardsAPI',
      schema: appsync.SchemaFile.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: this.userPool,
          },
        },
        additionalAuthorizationModes: [
          {
            authorizationType: appsync.AuthorizationType.IAM,
          },
        ],
      },
      xrayEnabled: true,
    });

    // Create IAM role for AppSync to access DynamoDB
    const appsyncDynamoDBRole = new iam.Role(this, 'AppSyncDynamoDBRole', {
      assumedBy: new iam.ServicePrincipal('appsync.amazonaws.com'),
    });

    // Grant permissions to the role
    this.shopsTable.grantReadWriteData(appsyncDynamoDBRole);
    this.usersTable.grantReadWriteData(appsyncDynamoDBRole);
    this.rewardsTable.grantReadWriteData(appsyncDynamoDBRole);
    this.stampCardsTable.grantReadWriteData(appsyncDynamoDBRole);
    this.userRewardsTable.grantReadWriteData(appsyncDynamoDBRole);
    this.menuTable.grantReadWriteData(appsyncDynamoDBRole);
    this.favoritesTable.grantReadWriteData(appsyncDynamoDBRole);

    // Create DynamoDB data sources
    const shopsDS = this.graphqlApi.addDynamoDbDataSource('ShopsDataSource', this.shopsTable);
    const usersDS = this.graphqlApi.addDynamoDbDataSource('UsersDataSource', this.usersTable);
    const rewardsDS = this.graphqlApi.addDynamoDbDataSource('RewardsDataSource', this.rewardsTable);
    const stampCardsDS = this.graphqlApi.addDynamoDbDataSource('StampCardsDataSource', this.stampCardsTable);
    const userRewardsDS = this.graphqlApi.addDynamoDbDataSource('UserRewardsDataSource', this.userRewardsTable);
    const menuDS = this.graphqlApi.addDynamoDbDataSource('MenuDataSource', this.menuTable);
    const favoritesDS = this.graphqlApi.addDynamoDbDataSource('FavoritesDataSource', this.favoritesTable);

    // Output values
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
    });

    new cdk.CfnOutput(this, 'GraphQLApiUrl', {
      value: this.graphqlApi.graphqlUrl,
    });

    new cdk.CfnOutput(this, 'GraphQLApiId', {
      value: this.graphqlApi.apiId,
    });
  }
}
