# Welcome to Webhook Pipeline Service Wiki

## 📚 Documentation

- [Postman Test Documentation](Postman-Test-Documentation)
- [API Reference](API-Reference)
- [Architecture Overview](Architecture-Overview)
- [Deployment Guide](Deployment-Guide)
- [Troubleshooting](Troubleshooting)

## Quick Links

- [GitHub Repository](https://github.com/JanaDroubi/Webhook-Driven-Task-Processing-Pipeline)
- [Submit Issues](https://github.com/JanaDroubi/Webhook-Driven-Task-Processing-Pipeline/issues)

## Project Overview

Webhook Pipeline Service is a Zapier-like platform that receives webhooks, processes them through configurable pipelines, and delivers results to multiple subscribers.

### Key Features
- ✅ CRUD API for pipeline management
- ✅ Webhook ingestion with async queue
- ✅ Three processing actions (uppercase, issue extraction, sensitive filter)
- ✅ Automatic retry with exponential backoff
- ✅ Job status tracking and delivery logs
- ✅ Bull dashboard for monitoring
- ✅ Docker containerization

## Quick Start

\\\ash
# Clone the repository
git clone https://github.com/JanaDroubi/Webhook-Driven-Task-Processing-Pipeline.git

# Start services
docker-compose up -d

# Run migrations
npx prisma migrate deploy

# Access API
http://localhost:3000
\\\

## Architecture

The service consists of:
- **API Server**: Handles HTTP requests and webhook ingestion
- **BullMQ Queue**: Manages job processing with Redis
- **Worker**: Processes jobs asynchronously
- **PostgreSQL**: Stores pipelines, jobs, and delivery attempts

## Processing Actions

1. **TRANSFORM_UPPERCASE**: Converts all string values to uppercase
2. **EXTRACT_ISSUE_SUMMARY**: Extracts issue details into structured format
3. **FILTER_SENSITIVE**: Removes sensitive fields (password, token, email, etc.)
