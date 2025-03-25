import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as path from 'path';

export interface PresignedUrlLambdaProps {
  imagesBucket: s3.Bucket;
  api: appsync.GraphqlApi;
}

export class PresignedUrlLambda extends Construct {
  public readonly function: lambda.Function;

  constructor(scope: Construct, id: string, props: PresignedUrlLambdaProps) {
    super(scope, id);

    // Create Lambda function for generating presigned URLs
    this.function = new lambda.Function(this, 'GeneratePresignedUrlFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const s3 = new AWS.S3();
        
        exports.handler = async (event) => {
          // Validate input
          if (!event.arguments || !event.arguments.shopId || !event.arguments.fileName || !event.arguments.contentType) {
            return {
              statusCode: 400,
              body: 'Missing required parameters: shopId, fileName, contentType'
            };
          }
          
          // Extract parameters
          const { shopId, fileName, contentType } = event.arguments;
          
          // Validate shopId to prevent directory traversal
          if (shopId.includes('/') || shopId.includes('..')) {
            return {
              statusCode: 400,
              body: 'Invalid shopId'
            };
          }
          
          // Validate fileName to prevent directory traversal
          if (fileName.includes('..')) {
            return {
              statusCode: 400,
              body: 'Invalid fileName'
            };
          }
          
          // Validate content type
          const allowedContentTypes = [
            'image/jpeg', 
            'image/png', 
            'image/gif', 
            'image/webp'
          ];
          
          if (!allowedContentTypes.includes(contentType)) {
            return {
              statusCode: 400,
              body: 'Invalid content type. Allowed types: ' + allowedContentTypes.join(', ')
            };
          }
          
          // Generate a safe key with shop ID as prefix
          const key = \`\${shopId}/\${Date.now()}-\${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}\`;
          
          // Set up parameters for presigned URL
          const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: key,
            ContentType: contentType,
            Expires: 300, // URL expires in 5 minutes
          };
          
          try {
            // Generate presigned URL
            const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
            
            // Return the URL and the key
            return {
              uploadUrl,
              key
            };
          } catch (error) {
            console.error('Error generating presigned URL:', error);
            return {
              statusCode: 500,
              body: 'Error generating presigned URL'
            };
          }
        };
      `),
      environment: {
        BUCKET_NAME: props.imagesBucket.bucketName,
      },
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
    });

    // Grant the Lambda function permission to generate presigned URLs for the S3 bucket
    props.imagesBucket.grantPut(this.function);
    
    // Create a data source for the Lambda function in AppSync
    const lambdaDataSource = props.api.addLambdaDataSource(
      'PresignedUrlDataSource',
      this.function
    );
    
    // Create a resolver for the generateUploadUrl mutation
    lambdaDataSource.createResolver('GenerateUploadUrlResolver', {
      typeName: 'Mutation',
      fieldName: 'generateUploadUrl',
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
    });
  }
}
