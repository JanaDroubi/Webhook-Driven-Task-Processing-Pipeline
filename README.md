Here's the fixed README.md with proper UTF-8 encoding and corrected special characters:

```markdown
[![CI/CD Pipeline](https://github.com/JanaDroubi/Webhook-Driven-Task-Processing-Pipeline/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/JanaDroubi/Webhook-Driven-Task-Processing-Pipeline/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)]()
[![Express](https://img.shields.io/badge/Express.js-backend-blue?logo=express)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-orange?logo=postgresql)]()
[![Redis](https://img.shields.io/badge/Redis-Queue-red?logo=redis)]()
[![BullMQ](https://img.shields.io/badge/BullMQ-Job%20Queue-purple)]()
[![Docker](https://img.shields.io/badge/Docker-Container-blue?logo=docker)]()
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI/CD-black?logo=github-actions)]()

# 🔄 Webhook Pipeline Service — Event-Driven Task Processing Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)]()
[![Express](https://img.shields.io/badge/Express.js-backend-blue?logo=express)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-orange?logo=postgresql)]()
[![Redis](https://img.shields.io/badge/Redis-Queue-red?logo=redis)]()
[![BullMQ](https://img.shields.io/badge/BullMQ-Job%20Queue-purple)]()
[![Docker](https://img.shields.io/badge/Docker-Container-blue?logo=docker)]()

**Webhook Pipeline Service** is a Zapier-like platform that receives webhooks, processes them through configurable pipelines, and delivers results to multiple subscribers. Perfect for building event-driven workflows, data transformation pipelines, and notification systems.

> [!NOTE]
> Full API documentation and technical details are available in the sections below.

---

## 📚 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Features](#features)
5. [Processing Actions](#processing-actions)
6. [How to Run the Project](#how-to-run-the-project)
   - Prerequisites
   - Clone Repository
   - Docker Setup
   - Environment Configuration
   - Database Setup
   - Start Services
7. [API Documentation](#api-documentation)
8. [Testing with Postman](#testing-with-postman)
9. [Project Structure](#project-structure)
10. [Design Decisions](#design-decisions)
11. [Error Handling & Reliability](#error-handling--reliability)
12. [Stretch Goals Implemented](#stretch-goals-implemented)
13. [Troubleshooting](#troubleshooting)
14. [Credits](#credits)

---

## 🌍 Project Overview

**Webhook Pipeline Service** enables developers and organizations to:

* **Create pipelines** that transform incoming webhook data
* **Queue webhooks** for reliable background processing
* **Process data** with configurable action types (transform, filter, enrich)
* **Deliver results** to multiple subscribers with automatic retry logic
* **Monitor job status** through a comprehensive API
* **Track delivery attempts** for debugging and audit trails

All features are built with **TypeScript**, containerized with **Docker**, and designed for **high reliability** with built-in retry mechanisms.

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   API Server    │────▶│   BullMQ Queue   │────▶│    Worker       │
│  (Express.js)   │     │   (Redis)        │     │   Processors    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   PostgreSQL    │     │   Webhook Ingest │     │  Subscriber     │
│   (Pipeline DB) │     │                  │     │  Delivery       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

**Key Components:**

- **API Server**: Handles CRUD operations, webhook ingestion, and job queries
- **BullMQ Queue**: Manages job queuing with Redis as the message broker
- **Worker**: Processes jobs asynchronously with configurable actions
- **PostgreSQL**: Stores pipelines, jobs, and delivery attempts
- **Delivery Engine**: Handles subscriber notifications with exponential backoff

---

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- TypeScript (type-safe development)
- PostgreSQL (relational database)
- Redis + BullMQ (job queue management)
- Prisma ORM (database access)

**Infrastructure:**
- Docker & Docker Compose (containerization)
- GitHub Actions (CI/CD pipeline)

**Development Tools:**
- Nodemon (hot reload)
- Postman (API testing)
- Bull Dashboard (queue monitoring)

---

## ✨ Features

### Core Features
- ✅ **CRUD API** for managing pipelines
- ✅ **Webhook ingestion** with unique source URLs
- ✅ **Async processing** via BullMQ job queue
- ✅ **Three processing actions** (transform, filter, enrich)
- ✅ **Subscriber delivery** with automatic retry logic
- ✅ **Job status tracking** with history and delivery attempts
- ✅ **Docker Compose** for one-command setup

### Reliability Features
- ✅ **Automatic retries** with exponential backoff (3 attempts)
- ✅ **Failed job recovery** via retry endpoint
- ✅ **Delivery attempt logging** for audit trails
- ✅ **Error tracking** in database
- ✅ **Graceful shutdown** handling

### Monitoring Features
- ✅ **Bull Dashboard** (http://localhost:3000/admin/queues)
- ✅ **Job status API** with filtering
- ✅ **System statistics** endpoint
- ✅ **Health check** endpoint

---

## 🔧 Processing Actions

The service supports three built-in action types:

### 1. **TRANSFORM_UPPERCASE**
Converts all string values to uppercase.

```json
// Input
{"message": "hello world", "user": "john"}

// Output
{"MESSAGE": "HELLO WORLD", "USER": "JOHN"}
```

### 2. **EXTRACT_ISSUE_SUMMARY**
Extracts issue details into a structured summary.

```json
// Input
{"issue": {"title": "Database error", "priority": "high"}}

// Output
{
  "summary": "Issue: Database error",
  "priority": "high",
  "timestamp": "2026-03-26T12:00:00Z"
}
```

### 3. **FILTER_SENSITIVE**
Removes sensitive fields (password, token, email, credit_card).

```json
// Input
{"username": "john", "password": "secret", "message": "hello"}

// Output
{"username": "john", "message": "hello"}
```

---

## 🚀 How to Run the Project

### Prerequisites

- **Docker** and **Docker Compose** installed
- **Node.js 18+** (for local development)
- **Git** (for cloning)

---

### 1️⃣ Clone Repository

```bash
git clone https://github.com/JanaDroubi/Webhook-Driven-Task-Processing-Pipeline.git
cd Webhook-Driven-Task-Processing-Pipeline
```

---

### 2️⃣ Docker Setup

The project uses Docker Compose to orchestrate all services:

```bash
# Start all services (PostgreSQL, Redis, API, Worker)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

### 3️⃣ Environment Configuration

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/webhook_db?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=3000

# Worker
WORKER_CONCURRENCY=5
```

> [!IMPORTANT]
> The database credentials must match the ones in `docker-compose.yml`.

---

### 4️⃣ Database Setup

Once containers are running, run database migrations:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

---

### 5️⃣ Start Services (Development Mode)

**Terminal 1 - API Server:**
```bash
npm run dev
```

**Terminal 2 - Worker:**
```bash
npm run worker
```

**Terminal 3 - (Optional) Monitor:**
```bash
# Open Bull Dashboard in browser
http://localhost:3000/admin/queues
```

---

### 6️⃣ Verify Installation

```bash
# Health check
curl http://localhost:3000/health

# API documentation
curl http://localhost:3000/

# Should return service information
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000
```

### Pipeline Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/pipelines` | Create a new pipeline |
| GET | `/pipelines` | List all pipelines |
| GET | `/pipelines/:id` | Get pipeline details |
| DELETE | `/pipelines/:id` | Delete pipeline |

**Create Pipeline Example:**
```json
POST /pipelines
{
    "name": "My Pipeline",
    "sourceSlug": "unique-slug",
    "actionType": "TRANSFORM_UPPERCASE",
    "subscriberUrls": ["https://webhook.site/..."]
}
```

### Webhook Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhook/:sourceSlug` | Send webhook to pipeline |

**Send Webhook Example:**
```json
POST /webhook/unique-slug
{
    "message": "hello world",
    "user": "john doe"
}
```

### Job Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List all jobs (with filters) |
| GET | `/api/jobs/:id` | Get job details |
| POST | `/api/jobs/:id/retry` | Retry failed job |

**Query Parameters for `/api/jobs`:**
- `pipelineId`: Filter by pipeline
- `status`: Filter by status (PENDING, PROCESSING, COMPLETED, FAILED)
- `limit`: Limit results (default: 50)

### Monitoring Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |
| GET | `/api/stats` | System statistics |
| GET | `/admin/queues` | Bull dashboard UI |

---

## 🧪 Testing with Postman

### Sample Requests

**1. Create Pipeline:**
```http
POST http://localhost:3000/pipelines
Content-Type: application/json

{
    "name": "Test Pipeline",
    "sourceSlug": "test-001",
    "actionType": "TRANSFORM_UPPERCASE",
    "subscriberUrls": ["https://discord.com/api/webhooks/..."]
}
```

**2. Send Webhook:**
```http
POST http://localhost:3000/webhook/test-001
Content-Type: application/json

{
    "message": "hello world",
    "user": "john doe"
}
```

**3. Check Job Status:**
```http
GET http://localhost:3000/api/jobs
```

**4. View Statistics:**
```http
GET http://localhost:3000/api/stats
```

> [!TIP]
> Import the Postman collection from the `/postman` folder for all test cases.

**Postman Documentation:** https://documenter.getpostman.com/view/49389411/2sBXikoBHp

---

## 📁 Project Structure

```
webhook-pipeline-service/
├── src/
│   ├── api/
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/           # API routes
│   │   └── middleware/       # Error handling, validation
│   ├── services/
│   │   ├── queue.service.ts  # BullMQ configuration
│   │   ├── delivery.service.ts # Webhook delivery logic
│   │   └── retry.service.ts  # Exponential backoff
│   ├── workers/
│   │   ├── worker.ts         # Job processor
│   │   └── actions/          # Action implementations
│   ├── config/
│   │   ├── redis.ts          # Redis connection
│   │   └── database.ts       # Prisma client
│   ├── types/                # TypeScript interfaces
│   ├── index.ts              # API server
│   └── worker.ts             # Worker entry point
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # SQL migrations
├── docker-compose.yml        # Container orchestration
├── Dockerfile                # API/Worker image
├── .env.example              # Environment template
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── README.md                 # Documentation
```

---

## 🧠 Design Decisions

### Why BullMQ + Redis?
- **Reliability**: Built-in retries, job persistence, and failure handling
- **Scalability**: Supports multiple workers for horizontal scaling
- **Monitoring**: Bull dashboard provides real-time queue insights
- **Performance**: Redis is lightweight and battle-tested

### Why PostgreSQL + JSONB?
- **Flexibility**: `actionConfig` stored as JSONB allows dynamic configurations
- **Relationships**: Clear foreign key relationships between pipelines, jobs, and deliveries
- **Query Power**: Rich querying capabilities for job status and history

### Why Separate Worker Process?
- **Isolation**: API responsiveness isn't affected by processing delays
- **Scalability**: Workers can be scaled independently
- **Reliability**: Worker crashes don't affect API availability

### Exponential Backoff Strategy
- **1st retry**: 1 second delay
- **2nd retry**: 2 second delay
- **3rd retry**: 4 second delay
- **Max attempts**: 3 (configurable)

This approach balances delivery reliability with system load.

---

## 🛡️ Error Handling & Reliability

### Delivery Retry Flow
1. Attempt delivery to subscriber
2. If failed, log attempt and wait (exponential backoff)
3. Retry up to 3 times
4. Mark job as FAILED if all attempts fail
5. Store error details for debugging

### Job States
- `PENDING`: Job queued, waiting for processing
- `PROCESSING`: Worker is currently processing
- `COMPLETED`: Successfully processed and delivered
- `FAILED`: Processing or delivery failed after retries

### Data Integrity
- All database operations wrapped in try-catch blocks
- Failed operations roll back to prevent partial updates
- Job status updated atomically

---

## ⭐ Stretch Goals Implemented

Beyond the core requirements, the project includes:

1. **Bull Dashboard** - Real-time queue monitoring UI
2. **Delivery Attempt Logging** - Complete audit trail for all deliveries
3. **Job Retry API** - Manually retry failed jobs
4. **Statistics Endpoint** - System health metrics
5. **Health Check** - Database and Redis connectivity monitoring
6. **Error Tracking** - Detailed error messages in database
7. **Graceful Shutdown** - Clean connection closing on termination

---

## 🔧 Troubleshooting

### Common Issues & Solutions

**1. Database Connection Error**
```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs postgres_db

# Reset database
npx prisma migrate reset --force
```

**2. Redis Connection Error**
```bash
# Test Redis connection
docker exec -it redis_queue redis-cli ping
# Should return PONG
```

**3. Worker Not Processing Jobs**
```bash
# Check Redis queue
docker exec -it redis_queue redis-cli LRANGE "bull:webhook-handler:wait" 0 -1

# Restart worker
# Ctrl+C then npm run worker
```

**4. Port Already in Use**
```bash
# Change port in .env
PORT=3001

# Or kill process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 🤝 Credits

Built as part of a **Webhook-Driven Task Processing Pipeline** project.

**Architecture & Design:**  
Clean separation of concerns, event-driven processing, reliable delivery with retry logic.

**Technologies Used:**
- Node.js & Express for the API layer
- BullMQ & Redis for reliable job queuing
- PostgreSQL for persistent storage
- TypeScript for type safety
- Docker for containerization

**Inspiration:**  
Simplified Zapier-like workflow automation for event-driven architectures.

---

## 📄 License

This project is for educational purposes as part of the final project submission.

---

## 🎯 Key Takeaways

- ✅ **Scalable Architecture** - Separate API and worker processes
- ✅ **Reliable Delivery** - Automatic retries with exponential backoff
- ✅ **Complete Observability** - Job status, delivery logs, and dashboard
- ✅ **Production-Ready** - Dockerized, type-safe, and well-documented
- ✅ **Extensible** - Easy to add new action types and subscribers

---

**Ready to build your own workflow automation?** 🚀

Start by creating a pipeline and sending your first webhook!

```bash
# Create pipeline
curl -X POST http://localhost:3000/pipelines \
  -H "Content-Type: application/json" \
  -d '{"name":"My First Pipeline","sourceSlug":"my-pipeline","actionType":"TRANSFORM_UPPERCASE","subscriberUrls":[]}'

# Send webhook
curl -X POST http://localhost:3000/webhook/my-pipeline \
  -H "Content-Type: application/json" \
  -d '{"message":"hello world"}'

# Check job status
curl http://localhost:3000/api/jobs
```

Happy building! 🎉
