#!/bin/bash

# BrewRewards Presentation Test Script
# This script helps demonstrate the multi-tenant capabilities of BrewRewards

# Color codes for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== BrewRewards Multi-Tenant Demo ===${NC}"
echo -e "${YELLOW}This script will guide you through testing the multi-tenant features of BrewRewards${NC}"

# Check if AWS CLI is installed and configured
echo -e "\n${BLUE}Checking AWS CLI configuration...${NC}"
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}AWS credentials are not configured or are invalid.${NC}"
    echo -e "${YELLOW}Please run 'aws configure' to set up your credentials.${NC}"
    exit 1
fi

echo -e "${GREEN}AWS CLI is properly configured.${NC}"

# Check if the infrastructure is deployed
echo -e "\n${BLUE}Checking if BrewRewards infrastructure is deployed...${NC}"
STACK_NAME="BrewRewardsStack"
if ! aws cloudformation describe-stacks --stack-name $STACK_NAME &> /dev/null; then
    echo -e "${RED}BrewRewards infrastructure is not deployed.${NC}"
    echo -e "${YELLOW}Would you like to deploy it now? (y/n)${NC}"
    read -r deploy_infra
    if [[ $deploy_infra == "y" ]]; then
        echo -e "${BLUE}Deploying BrewRewards infrastructure...${NC}"
        cd ../infrastructure && npm run deploy
    else
        echo -e "${RED}Cannot proceed without deployed infrastructure.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}BrewRewards infrastructure is already deployed.${NC}"
fi

# Create demo data
echo -e "\n${BLUE}Creating demo data for presentation...${NC}"
echo -e "${YELLOW}This will create multiple coffee shops, users, and transactions.${NC}"
echo -e "${YELLOW}Would you like to create demo data? (y/n)${NC}"
read -r create_demo
if [[ $create_demo == "y" ]]; then
    echo -e "${BLUE}Creating demo data...${NC}"
    cd .. && npx ts-node scripts/create-demo-data.ts
    echo -e "${GREEN}Demo data created successfully.${NC}"
else
    echo -e "${YELLOW}Skipping demo data creation.${NC}"
fi

# Start the application
echo -e "\n${BLUE}Starting the BrewRewards application...${NC}"
echo -e "${YELLOW}Would you like to start the application now? (y/n)${NC}"
read -r start_app
if [[ $start_app == "y" ]]; then
    echo -e "${BLUE}Starting the application...${NC}"
    cd .. && npm run dev &
    APP_PID=$!
    echo -e "${GREEN}Application started with PID: $APP_PID${NC}"
    echo -e "${GREEN}You can access it at http://localhost:3000${NC}"
else
    echo -e "${YELLOW}Skipping application start.${NC}"
fi

# Display demo credentials
echo -e "\n${BLUE}=== Demo Credentials ===${NC}"
echo -e "${GREEN}Super Admin:${NC}"
echo -e "  Email: superadmin@example.com"
echo -e "  Password: Password123"
echo -e "${GREEN}Shop Admins:${NC}"
echo -e "  Email: admin@sunrise.com"
echo -e "  Password: Password123"
echo -e "${GREEN}Customers:${NC}"
echo -e "  Email: alice@example.com"
echo -e "  Password: Password123"

# Display demo URLs
echo -e "\n${BLUE}=== Demo URLs ===${NC}"
echo -e "${GREEN}Super Admin Portal:${NC} http://localhost:3000/super-admin"
echo -e "${GREEN}Shop Admin Portal:${NC} http://localhost:3000/shop-admin"
echo -e "${GREEN}Customer Dashboard:${NC} http://localhost:3000/dashboard"
echo -e "${GREEN}Shop Customer Views:${NC}"
echo -e "  http://localhost:3000/shops/sunrise"
echo -e "  http://localhost:3000/shops/urban"
echo -e "  http://localhost:3000/shops/mountain"

# Display presentation flow
echo -e "\n${BLUE}=== Presentation Flow ===${NC}"
echo -e "${YELLOW}Follow these steps to demonstrate multi-tenant capabilities:${NC}"
echo -e "${GREEN}1. Multi-tenant isolation:${NC}"
echo -e "   - Log in as a Shop Admin (admin@sunrise.com)"
echo -e "   - Show that they can only access their own shop's data"
echo -e "   - Log in as Super Admin (superadmin@example.com)"
echo -e "   - Show that they can access all shops' data"

echo -e "${GREEN}2. Customer experience across tenants:${NC}"
echo -e "   - Log in as a Customer (alice@example.com)"
echo -e "   - Show their rewards across multiple coffee shops"
echo -e "   - Show transaction history from different shops"

echo -e "${GREEN}3. AWS service integration:${NC}"
echo -e "   - Show how Cognito handles authentication across tenants"
echo -e "   - Demonstrate AppSync's role in providing tenant-specific data"
echo -e "   - Explain DynamoDB's partition key strategy for tenant isolation"

echo -e "\n${BLUE}=== End of Demo Script ===${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the application when you're done.${NC}"

# Wait for user to finish the demo
wait $APP_PID
