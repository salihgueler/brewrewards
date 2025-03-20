# BrewRewards Resource Management

This document provides instructions for managing AWS resources used by the BrewRewards application.

## AWS Resources Overview

BrewRewards uses the following AWS resources:

1. **Amazon Cognito User Pool**: For user authentication and management
2. **AWS AppSync GraphQL API**: For data operations
3. **Amazon DynamoDB Tables**: For data storage
   - ShopsTable
   - UsersTable
   - RewardsTable
   - StampCardsTable
   - UserRewardsTable
   - MenuTable
   - FavoritesTable
4. **Amazon S3 Bucket**: For storing images

## Deploying Resources

You can deploy all required AWS resources with a single command:

```bash
cd infrastructure
npm run deploy
```

This script will:
1. Check for AWS CLI and proper configuration
2. Install dependencies if needed
3. Build and deploy the CDK infrastructure
4. Create a `.env.local` file with all necessary environment variables

### What Happens During Deployment

1. The CDK stack defined in `infrastructure/lib/infrastructure-stack.ts` is deployed
2. All resources are created with proper permissions and configurations
3. The outputs (endpoints, IDs, etc.) are captured and written to `.env.local`
4. The application is ready to use these resources

## Removing Resources

When you're done with the BrewRewards application or want to clean up your AWS account, you can remove all resources with:

```bash
cd infrastructure
npm run destroy
```

This script will:
1. Ask for confirmation before proceeding
2. Remove all AWS resources created by the CDK stack
3. Delete the `.env.local` file

### Important Notes About Resource Removal

- **Data Loss**: All data stored in DynamoDB tables and S3 will be permanently deleted
- **Costs**: After removal, you should no longer incur any AWS charges for BrewRewards
- **Verification**: It's recommended to check your AWS Console to verify all resources have been removed

## Monitoring Resources

To monitor the resources and their costs:

1. **AWS Cost Explorer**: View costs associated with your resources
   - Visit: https://console.aws.amazon.com/cost-management/home#/cost-explorer

2. **AWS CloudWatch**: Monitor performance and logs
   - Visit: https://console.aws.amazon.com/cloudwatch/home

3. **AWS AppSync Console**: Monitor API operations
   - Visit: https://console.aws.amazon.com/appsync/home

4. **Amazon DynamoDB Console**: Monitor database usage
   - Visit: https://console.aws.amazon.com/dynamodb/home

## Troubleshooting

### Deployment Issues

If you encounter issues during deployment:

1. Check your AWS credentials:
   ```bash
   aws sts get-caller-identity
   ```

2. Ensure you have sufficient permissions in your AWS account

3. Check the CloudFormation console for detailed error messages:
   - Visit: https://console.aws.amazon.com/cloudformation/home

### Destruction Issues

If resources fail to delete:

1. Check the CloudFormation console for stack deletion errors

2. Some resources might have dependencies that prevent deletion

3. In rare cases, you might need to manually delete resources from the AWS Console

## Cost Management

To keep costs under control:

1. Remove resources when not in use with `npm run destroy`

2. Monitor your AWS billing dashboard regularly

3. Set up AWS Budgets to get alerts when costs exceed thresholds:
   - Visit: https://console.aws.amazon.com/billing/home#/budgets

## Security Best Practices

1. Use IAM roles with least privilege

2. Regularly rotate AWS access keys

3. Enable MFA for your AWS account

4. Review CloudTrail logs for suspicious activity
