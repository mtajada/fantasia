#!/bin/bash
set -e

# Messages colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Starting production deployment with PM2 ===${NC}"

# Verify if pm2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 is not installed. Installing globally...${NC}"
    npm install -g pm2
fi

# Verify if .env file exists
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}File .env not found. Copying from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}¡Copied! Please edit the .env file with your real credentials before continuing.${NC}"
        exit 1
    else
        echo -e "${RED}File .env.example not found. Please create a .env file manually.${NC}"
        exit 1
    fi
fi

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
npm ci

# Build the application
echo -e "${GREEN}Building the application for production...${NC}"
npm run build:prod

# Stop previous instance in PM2 (if exists)
echo -e "${GREEN}Stopping previous instance (if exists)...${NC}"
pm2 delete fantasia-site 2>/dev/null || true

# Start with PM2
echo -e "${GREEN}Starting the application with PM2...${NC}"
pm2 start ecosystem.config.cjs --env production

# Save PM2 configuration
echo -e "${GREEN}Saving PM2 configuration...${NC}"
pm2 save

# Show status
echo -e "${GREEN}Showing application status...${NC}"
pm2 status

echo -e "${GREEN}=== Deployment completed ===${NC}"
echo -e "${GREEN}The application is available at: http://localhost:8081${NC}"
echo -e "${YELLOW}To see the logs: pm2 logs fantasia-site${NC}"
echo -e "${YELLOW}To stop the application: pm2 stop fantasia-site${NC}"
echo -e "${YELLOW}To restart the application: pm2 restart fantasia-site${NC}"
echo -e "${YELLOW}To monitor resources: pm2 monit${NC}" 