#!/bin/bash

# Guardz Deployment Script
# This script helps deploy the application with the correct configuration

set -e

echo "======================================"
echo "Guardz Submission System Deployment"
echo "======================================"
echo ""

# Check if IP address is provided
if [ -z "$1" ]; then
    echo "Usage: ./deploy.sh <GCP_IP_ADDRESS>"
    echo "Example: ./deploy.sh 127.0.0.1
    echo ""
    echo "For local development, use: docker-compose up --build"
    exit 1
fi

GCP_IP=$1

echo "Deploying to GCP IP: $GCP_IP"
echo ""

# Update docker-compose.yml with the correct API URL
echo "Building frontend with API URL: http://$GCP_IP:8080/api"

# Build and start containers with build argument
VITE_API_URL="http://$GCP_IP:8080/api" docker-compose build --build-arg VITE_API_URL="http://$GCP_IP:8080/api" frontend
docker-compose up -d

echo ""
echo "======================================"
echo "Deployment Complete!"
echo "======================================"
echo ""
echo "Services:"
echo "  Frontend: http://$GCP_IP:80"
echo "  Backend:  http://$GCP_IP:8080"
echo ""
echo "Test the API with:"
echo "  curl -X POST -H \"Content-Type: application/json\" -d '{\"name\":\"Test\",\"email\":\"test@example.com\",\"message\":\"Hello\"}' http://$GCP_IP:8080/api/submissions"
echo "  curl http://$GCP_IP:8080/api/submissions"
echo ""
echo "View logs with:"
echo "  docker-compose logs -f"

