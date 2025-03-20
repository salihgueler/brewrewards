#!/bin/bash

# BrewRewards Infrastructure Destruction Script
# This script removes all AWS resources created for BrewRewards

set -e

echo "⚠️  WARNING: This will remove all BrewRewards AWS resources ⚠️"
echo "All data will be permanently deleted."
echo ""
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Operation cancelled."
    exit 0
fi

echo "🗑️  Starting BrewRewards infrastructure removal..."

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

# Destroy the infrastructure
echo "🧨 Destroying infrastructure..."
npm run cdk destroy -- --force

# Remove the .env.local file
echo "🧹 Cleaning up environment variables..."
if [ -f "../.env.local" ]; then
    rm "../.env.local"
    echo "✅ Removed .env.local file"
else
    echo "⚠️ No .env.local file found"
fi

echo "✅ Infrastructure removal complete!"
echo ""
echo "All AWS resources have been removed. Your AWS account should no longer incur charges for BrewRewards."
