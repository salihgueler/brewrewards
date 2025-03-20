#!/bin/bash

# BrewRewards Demo Setup Script
# This script sets up and runs the BrewRewards demo

set -e

echo "🚀 Setting up BrewRewards demo..."

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
    echo "📦 Installing project dependencies..."
    npm install
fi

# Deploy infrastructure if needed
if [ ! -f ".env.local" ]; then
    echo "🏗️ Infrastructure not detected. Deploying AWS resources..."
    cd infrastructure
    
    # Install infrastructure dependencies if needed
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    # Run the deployment script
    ./deploy.sh
    cd ..
else
    echo "✅ Infrastructure already deployed."
fi

# Start the application
echo "🌟 Starting the BrewRewards application..."
echo "🔗 The application will be available at http://localhost:3000"
echo ""
echo "🔑 Demo Credentials:"
echo "   - Shop Admin: admin@example.com / Password123"
echo "   - Customer: customer@example.com / Password123"
echo ""
echo "📱 Demo Shops:"
echo "   - http://localhost:3000/shops/demo"
echo "   - http://localhost:3000/shops/coffee-heaven"
echo ""
echo "⚙️ Admin Portal:"
echo "   - http://localhost:3000/shop-admin"
echo ""
echo "Press Ctrl+C to stop the application"
echo ""

npm run dev
