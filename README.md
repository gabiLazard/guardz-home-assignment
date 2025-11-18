# Guardz Submission System

A full-stack web application for submitting and viewing user information, built with NestJS, React, and MongoDB.

## Overview

This application provides a user-friendly form for submitting information (name, email, phone, message) with real-time table display of all submissions. Features RESTful API with validation, responsive Material-UI design, and containerized deployment.

**Tech Stack:**
- **Backend:** NestJS, MongoDB with Mongoose, TypeScript
- **Frontend:** React 19, Vite, Material-UI, TypeScript
- **DevOps:** Docker & Docker Compose

**Architecture:** React (Port 80) → NestJS API (Port 8080) → MongoDB (Port 27017)

## Prerequisites

- Node.js 22.x+
- npm 10.x+
- Docker & Docker Compose (for containerized deployment)

## Quick Start

### Local Development

**Backend:**
```bash
cd backend
npm install
# Start MongoDB: docker run -d -p 27017:27017 --name guardz-mongo mongo:7
npm run start:dev  # Available at http://localhost:8080
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev  # Available at http://localhost:3000
```

**Environment Variables:**
- Backend: `PORT=8080`, `MONGODB_URI=mongodb://localhost:27017/guardz`
- Frontend: `VITE_API_URL=http://localhost:8080/api`

### Testing

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## Docker Deployment

### Local Deployment

```bash
# Build and start all services
docker-compose up --build

# Access:
# - Frontend: http://localhost:80
# - Backend API: http://localhost:8080

# Stop services
docker-compose down
```

### GCP Deployment

1. **SSH into GCP instance as explained in instructions** 

2. **Install Docker (if needed):**
```bash
sudo apt-get update
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo usermod -aG docker $USER  # Log out and back in
```

3. **Clone and configure:**
```bash
git clone <repository-url> && cd <repository-name>
```

4. **Deploy with helper script:**
```bash
./deploy.sh <GCP_IP>

# Verify
docker ps
docker-compose logs -f
```

5. **Access:**
- Frontend: `http://<GCP_IP>`
- Backend API: `http://<GCP_IP>:8080`

**Update deployment:**
```bash
git pull && ./deploy.sh <GCP_IP>
```

## API Reference

**Base URL:** `/api/submissions`

**Endpoints:**
- `POST /api/submissions` - Create submission
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",  // Optional
    "message": "Test message"
  }
  ```
- `GET /api/submissions` - Get all submissions
- `GET /api/submissions/:id` - Get single submission

**Validation:**
- `name`: Required, max 100 chars
- `email`: Required, valid email format
- `phone`: Optional, max 20 chars
- `message`: Required, max 1000 chars

## Project Structure

```
guardz/
├── backend/              # NestJS API
│   ├── src/submissions/  # Submissions module
│   └── Dockerfile
├── frontend/             # React app
│   ├── src/components/   # UI components
│   └── Dockerfile
└── docker-compose.yml    # Container orchestration
```
