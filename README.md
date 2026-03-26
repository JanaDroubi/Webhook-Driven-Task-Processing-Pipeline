
---

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

# 🔄 Webhook Pipeline Service  
### Event-Driven Task Processing Platform

**Webhook Pipeline Service** is a Zapier-like platform that receives webhooks, processes them through configurable pipelines, and delivers results to multiple subscribers.

Perfect for:
- Event-driven workflows  
- Data transformation pipelines  
- Notification systems  

> ⚡ Built with scalability, reliability, and clean architecture in mind.

---

## 📚 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#️-architecture)
- [Tech Stack](#️-tech-stack)
- [Features](#-features)
- [Processing Actions](#-processing-actions)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Testing](#-testing-with-postman)
- [Project Structure](#-project-structure)
- [Design Decisions](#-design-decisions)
- [Error Handling](#️-error-handling--reliability)
- [Troubleshooting](#-troubleshooting)
- [Credits](#-credits)

---

## 🌍 Project Overview

This service allows you to:

- 🔧 Create and manage pipelines  
- 📥 Receive webhooks via unique endpoints  
- ⚙️ Process data using configurable actions  
- 📤 Deliver results to subscribers  
- 🔁 Automatically retry failed deliveries  
- 📊 Track jobs and delivery attempts  

---

## 🏗️ Architecture

```

API Server → Queue (Redis/BullMQ) → Worker → Subscribers
↓
PostgreSQL

````

### Key Components

- **API Server** – Handles requests & webhook ingestion  
- **Queue (BullMQ + Redis)** – Manages async jobs  
- **Worker** – Processes pipelines  
- **PostgreSQL** – Stores data  
- **Delivery Engine** – Handles retries & delivery  

---

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- Redis + BullMQ
- Prisma ORM

### Infrastructure
- Docker & Docker Compose
- GitHub Actions (CI/CD)

### Tools
- Postman
- Bull Dashboard
- Nodemon

---

## ✨ Features

### Core
- ✅ Pipeline CRUD API  
- ✅ Webhook ingestion  
- ✅ Async job processing  
- ✅ Multiple action types  
- ✅ Subscriber delivery  
- ✅ Job tracking  

### Reliability
- 🔁 Automatic retries (exponential backoff)  
- 📜 Delivery logging  
- ⚠️ Error tracking  
- 🧯 Graceful shutdown  

### Monitoring
- 📊 Bull Dashboard  
- 📈 Stats endpoint  
- ❤️ Health check  

---

## 🔧 Processing Actions

### 🔹 TRANSFORM_UPPERCASE
```json
Input:  {"message": "hello"}
Output: {"MESSAGE": "HELLO"}
````

### 🔹 EXTRACT_ISSUE_SUMMARY

```json
Input:  {"issue": {"title": "Error"}}
Output: {"summary": "Issue: Error"}
```

### 🔹 FILTER_SENSITIVE

```json
Input:  {"password": "123", "user": "jana"}
Output: {"user": "jana"}
```

---

## 🚀 Getting Started

### Prerequisites

* Docker & Docker Compose
* Node.js 18+
* Git

---

### 1️⃣ Clone

```bash
git clone https://github.com/JanaDroubi/Webhook-Driven-Task-Processing-Pipeline.git
cd Webhook-Driven-Task-Processing-Pipeline
```

---

### 2️⃣ Run with Docker

```bash
docker-compose up -d
docker-compose logs -f
```

---

### 3️⃣ Environment

Create `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/webhook_db"
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3000
WORKER_CONCURRENCY=5
```

---

### 4️⃣ Database

```bash
npx prisma generate
npx prisma migrate dev
```

---

### 5️⃣ Start Services

```bash
npm run dev      # API
npm run worker   # Worker
```

---

### 6️⃣ Test

```bash
curl http://localhost:3000/health
```

---

## 📡 API Documentation

### Base URL

```
http://localhost:3000
```

### Pipelines

| Method | Endpoint       |
| ------ | -------------- |
| POST   | /pipelines     |
| GET    | /pipelines     |
| GET    | /pipelines/:id |
| DELETE | /pipelines/:id |

### Webhooks

```
POST /webhook/:sourceSlug
```

### Jobs

```
GET /api/jobs
GET /api/jobs/:id
POST /api/jobs/:id/retry
```

---

## 🧪 Testing with Postman

Try:

1. Create pipeline
2. Send webhook
3. Check jobs

📎 Postman Docs:
[https://documenter.getpostman.com/view/49389411/2sBXikoBHp](https://documenter.getpostman.com/view/49389411/2sBXikoBHp)

---

## 📁 Project Structure

```
src/
 ├── api/
 ├── services/
 ├── workers/
 ├── config/
 ├── types/
 └── index.ts
```

---

## 🧠 Design Decisions

* **BullMQ + Redis** → reliable queue system
* **PostgreSQL + JSONB** → flexible data storage
* **Separate worker** → scalable architecture

---

## 🛡️ Error Handling & Reliability

* Retry with exponential backoff
* Job states: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`
* Full logging & audit trail

---

## 🔧 Troubleshooting

### DB issues

```bash
docker logs postgres_db
```

### Redis issues

```bash
redis-cli ping
```

### Port conflicts

```bash
netstat -ano | findstr :3000
```

---

## 🤝 Credits

Built as part of a **Webhook Processing Pipeline** project.

Inspired by tools like Zapier.

---

## 🎯 Key Takeaways

* ⚡ Scalable architecture
* 🔁 Reliable delivery
* 📊 Full observability
* 🐳 Docker-ready
* 🧩 Easily extensible

---

## 🚀 Quick Demo

```bash
# Create pipeline
curl -X POST http://localhost:3000/pipelines \
  -H "Content-Type: application/json" \
  -d '{"name":"My Pipeline","sourceSlug":"my-pipeline","actionType":"TRANSFORM_UPPERCASE","subscriberUrls":[]}'

# Send webhook
curl -X POST http://localhost:3000/webhook/my-pipeline \
  -H "Content-Type: application/json" \
  -d '{"message":"hello world"}'
```

---

✨ **Happy building!**

```

---

If you want, I can next:
- make it **look like top GitHub trending READMEs (Stripe/Next.js style)**  
- or add **architecture diagram image + badges animation + demo GIF** 🚀
```
