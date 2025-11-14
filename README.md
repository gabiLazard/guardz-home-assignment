# Guardz Submission System

A full-stack web application for submitting and viewing user information, built with NestJS, React, and MongoDB.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Testing](#testing)
- [Docker Deployment](#docker-deployment)
- [GCP Deployment](#gcp-deployment)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)

## Overview

This application provides:
- A user-friendly form for submitting information (name, email, phone, message)
- Real-time table display of all submissions
- RESTful API with validation
- Responsive Material-UI design
- Dockerized deployment

## Architecture

```
┌─────────────────┐
│   React App     │  Port 80 (Frontend)
│   - Form UI     │
│   - Table View  │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  NestJS API     │  Port 8080 (Backend)
│  - POST /api/   │
│  - GET /api/    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   MongoDB       │  Port 27017
└─────────────────┘
```

## Tech Stack

### Backend
- **NestJS** - TypeScript framework for Node.js
- **MongoDB** with Mongoose - NoSQL database
- **class-validator** - DTO validation
- **Jest** - Testing framework

### Frontend
- **React 19** with TypeScript
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - UI component library
- **Axios** - HTTP client
- **Vitest** - Testing framework

### DevOps
- **Docker** & **Docker Compose** - Containerization
- **Nginx Alternative**: Using `serve` package for static files

## Prerequisites

- **Node.js** 22.x or higher
- **npm** 10.x or higher
- **Docker** and **Docker Compose** (for containerized deployment)
- **Git**

## Local Development

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (or use the provided `.env` file):
```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/guardz
NODE_ENV=development
```

4. Start MongoDB (if running locally):
```bash
# Using Docker
docker run -d -p 27017:27017 --name guardz-mongo mongo:7

# OR install MongoDB locally
```

5. Start the development server:
```bash
npm run start:dev
```

The backend will be available at `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:8080/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Testing

### Backend Tests

Run unit and integration tests:
```bash
cd backend
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:cov
```

### Frontend Tests

Run tests:
```bash
cd frontend
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

## Docker Deployment

### Building and Running with Docker Compose

1. From the root directory, build and start all services:
```bash
docker-compose up --build
```

2. Access the application:
- Frontend: `http://localhost:80`
- Backend API: `http://localhost:8080`
- MongoDB: `localhost:27017`

3. Stop the services:
```bash
docker-compose down
```

4. Stop and remove volumes (clears database):
```bash
docker-compose down -v
```

## GCP Deployment

### Prerequisites

- GCP Compute Engine instance
- SSH access with provided private key
- Ports 80 and 8080 configured for public access

### Deployment Steps

1. **SSH into the GCP instance**:
```bash
ssh -i <path_to>/<private_key> candidate@<IP>
```

2. **Install Docker and Docker Compose** (if not already installed):
```bash
# Update package manager
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in for group changes to take effect
```

3. **Clone the repository**:
```bash
git clone <repository-url>
cd <repository-name>
```

4. **Configure the frontend API URL** for production:

Edit `docker-compose.yml` and update the frontend build args with your GCP IP:
```yaml
frontend:
  build:
    context: ./frontend
    args:
      VITE_API_URL: http://<GCP_IP>:8080/api
```

5. **Build and start the application**:
```bash
docker-compose up -d --build
```

6. **Verify the deployment**:
```bash
# Check running containers
docker ps

# View logs
docker-compose logs -f
```

7. **Test the API**:
```bash
# POST request
curl -X POST -H "Content-Type: application/json" -d '{"name":"John Doe","email":"john@example.com","message":"Test message"}' http://<GCP_IP>:8080/api/submissions

# GET request
curl http://<GCP_IP>:8080/api/submissions
```

8. **Access the application**:
- Frontend: `http://<GCP_IP>:80`
- Backend API: `http://<GCP_IP>:8080`

### Updating the Application

```bash
# Pull latest changes
git pull

# Rebuild and restart containers
docker-compose up -d --build

# View logs
docker-compose logs -f
```

## API Documentation

### Base URL
- Local: `http://localhost:8080/api`
- Production: `http://<GCP_IP>:8080/api`

### Endpoints

#### Create Submission
```http
POST /api/submissions
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",     // Optional
  "message": "Test message"
}
```

**Response** (201 Created):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "message": "Test message",
  "createdAt": "2024-11-14T10:00:00.000Z",
  "updatedAt": "2024-11-14T10:00:00.000Z"
}
```

#### Get All Submissions
```http
GET /api/submissions
```

**Response** (200 OK):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "message": "Test message",
    "createdAt": "2024-11-14T10:00:00.000Z",
    "updatedAt": "2024-11-14T10:00:00.000Z"
  }
]
```

#### Get Single Submission
```http
GET /api/submissions/:id
```

**Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "message": "Test message",
  "createdAt": "2024-11-14T10:00:00.000Z",
  "updatedAt": "2024-11-14T10:00:00.000Z"
}
```

### Validation Rules

- `name`: Required, string, max 100 characters
- `email`: Required, valid email format
- `phone`: Optional, string, max 20 characters
- `message`: Required, string, max 1000 characters

## Project Structure

```
guardz/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── submissions/     # Submissions module
│   │   │   ├── dto/         # Data Transfer Objects
│   │   │   ├── schemas/     # Mongoose schemas
│   │   │   ├── submissions.controller.ts
│   │   │   ├── submissions.service.ts
│   │   │   └── *.spec.ts    # Tests
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   └── __tests__/   # Component tests
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── vite.config.ts
│   └── package.json
├── docker-compose.yml       # Docker orchestration
└── README.md               # This file
```

## Environment Variables

### Backend (.env)
```env
PORT=8080
MONGODB_URI=mongodb://mongodb:27017/guardz
NODE_ENV=production
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8080/api
```

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
docker ps | grep mongo

# Check MongoDB logs
docker logs guardz-mongodb
```

### Backend Not Starting
```bash
# Check backend logs
docker logs guardz-backend

# Rebuild backend
docker-compose up -d --build backend
```

### Frontend Build Issues
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules
npm install

# Rebuild Docker image
docker-compose build --no-cache frontend
```

### Port Already in Use
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>
```

## License

This project is created for the Guardz Full Stack Developer home assignment.

## Contact

For questions or issues, please reach out to the development team.
