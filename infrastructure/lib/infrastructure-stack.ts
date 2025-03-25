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
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cloudfront_origins from 'aws-cdk-lib/aws-cloudfront-origins';

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
  public readonly imagesBucket: s3.Bucket;
  public readonly imagesCdn: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket for storing menu item images - with enhanced security
    this.imagesBucket = new s3.Bucket(this, 'MenuItemImagesBucket', {
      // Block all public access
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      // Enforce encryption
      encryption: s3.BucketEncryption.S3_MANAGED,
      // Enforce SSL
      enforceSSL: true,
      // For development only - in production, consider RETAIN
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      // CORS configuration for presigned URL uploads
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
          ],
          // Restrict to your application domains in production
          allowedOrigins: ['http://localhost:3000', 'https://*.brewrewards.com'],
          allowedHeaders: [
            'Authorization',
            'Content-Type',
            'Content-Length',
            'Content-Disposition',
            'x-amz-date',
            'x-amz-content-sha256',
            'x-amz-security-token',
          ],
          exposedHeaders: [
            'x-amz-server-side-encryption',
            'x-amz-request-id',
            'x-amz-id-2',
            'ETag',
          ],
          maxAge: 3000,
        },
      ],
    });

    // CloudFront Origin Access Identity for S3
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'ImagesBucketOAI', {
      comment: 'OAI for BrewRewards images bucket',
    });

    // Grant CloudFront OAI read access to the bucket
    this.imagesBucket.grantRead(originAccessIdentity);

    // Create a custom response headers policy
    const securityHeadersPolicy = new cloudfront.ResponseHeadersPolicy(this, 'SecurityHeadersPolicy', {
      responseHeadersPolicyName: 'SecurityHeadersPolicy',
      securityHeadersBehavior: {
        contentSecurityPolicy: {
          contentSecurityPolicy: "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self';",
          override: true,
        },
        strictTransportSecurity: {
          accessControlMaxAge: cdk.Duration.days(2 * 365),
          includeSubdomains: true,
          preload: true,
          override: true,
        },
        contentTypeOptions: {
          override: true,
        },
        referrerPolicy: {
          referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
          override: true,
        },
        xssProtection: {
          protection: true,
          modeBlock: true,
          override: true,
        },
        frameOptions: {
          frameOption: cloudfront.HeadersFrameOption.DENY,
          override: true,
        },
      },
    });

    // CloudFront Distribution for secure image delivery
    this.imagesCdn = new cloudfront.Distribution(this, 'ImagesCDN', {
      defaultBehavior: {
        origin: new cloudfront_origins.S3Origin(this.imagesBucket, {
          originAccessIdentity,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
        responseHeadersPolicy: securityHeadersPolicy,
      },
      // Enable HTTPS
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      // Enable logging (optional)
      enableLogging: true,
    });

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
      generateSecret: false,
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

    // Create IAM role for S3 presigned URLs
    const s3AccessRole = new iam.Role(this, 'S3AccessRole', {
      assumedBy: new iam.ServicePrincipal('appsync.amazonaws.com'),
    });

    // Grant permissions to generate presigned URLs
    this.imagesBucket.grantReadWrite(s3AccessRole);
    s3AccessRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject', 's3:GetObject'],
        resources: [this.imagesBucket.arnForObjects('*')],
      })
    );

    // Create Lambda data source for S3 presigned URL generation
    const s3LambdaDS = this.graphqlApi.addNoneDataSource('S3PresignedUrlDataSource');

    // Add resolver for generating presigned URLs
    s3LambdaDS.createResolver('GenerateUploadUrlResolver', {
      typeName: 'Mutation',
      fieldName: 'generateUploadUrl',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        #set($context.stash.fileName = $context.arguments.fileName)
        #set($context.stash.contentType = $context.arguments.contentType)
        #set($context.stash.shopId = $context.arguments.shopId)
        {
          "version": "2018-05-29",
          "operation": "Invoke",
          "payload": {
            "shopId": $util.toJson($context.arguments.shopId),
            "fileName": $util.toJson($context.arguments.fileName),
            "contentType": $util.toJson($context.arguments.contentType)
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if($context.error)
          $util.error($context.error.message, $context.error.type)
        #end
        
        #set($bucket = "${this.imagesBucket.bucketName}")
        #set($key = "shops/$context.stash.shopId/$context.stash.fileName")
        #set($expiration = 3600)
        
        #set($presignedUrl = $util.time.nowISO8601())
        
        {
          "uploadUrl": "https://$bucket.s3.amazonaws.com/$key",
          "key": "$key"
        }
      `),
    });

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

    new cdk.CfnOutput(this, 'ImagesBucketName', {
      value: this.imagesBucket.bucketName,
    });

    new cdk.CfnOutput(this, 'ImagesBucketDomainName', {
      value: this.imagesBucket.bucketDomainName,
    });
  }
}
