#!/bin/bash

# BrewRewards Infrastructure Deployment Script
# This script deploys all AWS resources and updates environment variables

set -e

echo "🚀 Starting BrewRewards infrastructure deployment..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the CDK project
echo "🔨 Building CDK project..."
npm run build

# Deploy the infrastructure
echo "🏗️ Deploying infrastructure..."
npm run cdk deploy -- --require-approval never

# Get the outputs from CloudFormation
echo "📝 Retrieving deployment outputs..."
STACK_NAME="BrewRewardsStack"
OUTPUTS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs" --output json)

# Extract values from outputs
USER_POOL_ID=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="UserPoolId") | .OutputValue')
USER_POOL_CLIENT_ID=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="UserPoolClientId") | .OutputValue')
GRAPHQL_API_URL=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="GraphQLApiUrl") | .OutputValue')
GRAPHQL_API_ID=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="GraphQLApiId") | .OutputValue')
IMAGES_BUCKET_NAME=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="ImagesBucketName") | .OutputValue')
IMAGES_BUCKET_DOMAIN_NAME=$(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="ImagesBucketDomainName") | .OutputValue')
REGION=$(aws configure get region)

# Create .env.local file in the parent directory
echo "💾 Creating environment variables file..."
cat > ../.env.local << EOL
NEXT_PUBLIC_AWS_REGION=$REGION
NEXT_PUBLIC_USER_POOL_ID=$USER_POOL_ID
NEXT_PUBLIC_USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID
NEXT_PUBLIC_GRAPHQL_API_URL=$GRAPHQL_API_URL
NEXT_PUBLIC_GRAPHQL_API_ID=$GRAPHQL_API_ID
NEXT_PUBLIC_IMAGES_BUCKET_NAME=$IMAGES_BUCKET_NAME
NEXT_PUBLIC_IMAGES_BUCKET_DOMAIN_NAME=$IMAGES_BUCKET_DOMAIN_NAME
EOL

echo "✅ Infrastructure deployment complete!"
echo "✅ Environment variables have been written to .env.local"
echo ""
echo "🌟 You can now run the application with: cd .. && npm run dev"
