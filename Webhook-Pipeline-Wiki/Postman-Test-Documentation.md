# 📋 Postman Test Documentation

## Test Environment Setup

**Base URL:** http://localhost:3000  
**Content-Type:** pplication/json (for POST/PUT requests)

---

## Test Suite 1: Pipeline Management (CRUD Operations)

### Test 1.1: Create Pipeline (TRANSFORM_UPPERCASE)

**Method:** POST  
**URL:** {{base_url}}/pipelines

**Request Body:**
\\\json
{
    "name": "Uppercase Transformer",
    "sourceSlug": "uppercase-test-001",
    "actionType": "TRANSFORM_UPPERCASE",
    "subscriberUrls": ["https://webhook.site/your-test-url"]
}
\\\

**Expected Response:** Status 201 Created with pipeline details

---

### Test 1.2: Create Pipeline (EXTRACT_ISSUE_SUMMARY)

**Method:** POST  
**URL:** {{base_url}}/pipelines

**Request Body:**
\\\json
{
    "name": "Issue Extractor",
    "sourceSlug": "issue-extractor-001",
    "actionType": "EXTRACT_ISSUE_SUMMARY",
    "subscriberUrls": []
}
\\\

**Expected Response:** Status 201 Created

---

### Test 1.3: Create Pipeline (FILTER_SENSITIVE)

**Method:** POST  
**URL:** {{base_url}}/pipelines

**Request Body:**
\\\json
{
    "name": "Sensitive Data Filter",
    "sourceSlug": "sensitive-filter-001",
    "actionType": "FILTER_SENSITIVE",
    "subscriberUrls": ["https://discord.com/api/webhooks/your-webhook-url"]
}
\\\

**Expected Response:** Status 201 Created

---

### Test 1.4: Duplicate Slug (Negative Test)

**Method:** POST  
**URL:** {{base_url}}/pipelines

**Request Body:**
\\\json
{
    "name": "Duplicate Test",
    "sourceSlug": "uppercase-test-001",
    "actionType": "TRANSFORM_UPPERCASE",
    "subscriberUrls": []
}
\\\

**Expected Response:** Status 400 or 409 with error message

---

### Test 1.5: Get All Pipelines

**Method:** GET  
**URL:** {{base_url}}/pipelines

**Expected Response:** Status 200 OK, array of pipelines

---

### Test 1.6: Get Specific Pipeline

**Method:** GET  
**URL:** {{base_url}}/pipelines/{{pipeline_id}}

**Expected Response:** Status 200 OK with pipeline details

---

### Test 1.7: Delete Pipeline

**Method:** DELETE  
**URL:** {{base_url}}/pipelines/{{pipeline_id}}

**Expected Response:** Status 204 No Content

---

## Test Suite 2: Webhook Ingestion

### Test 2.1: Send Webhook to Uppercase Pipeline

**Method:** POST  
**URL:** {{base_url}}/webhook/uppercase-test-001

**Request Body:**
\\\json
{
    "message": "hello world",
    "user": "john doe",
    "priority": "high",
    "data": {
        "action": "test",
        "value": 123
    }
}
\\\

**Expected Response:**
\\\json
{
    "message": "Queued",
    "jobId": "uuid-here"
}
\\\

---

### Test 2.2: Send Webhook to Issue Extractor

**Method:** POST  
**URL:** {{base_url}}/webhook/issue-extractor-001

**Request Body:**
\\\json
{
    "issue": {
        "title": "Database connection timeout",
        "priority": "critical",
        "description": "Unable to connect to PostgreSQL after 30 seconds",
        "assignee": "oncall@example.com"
    },
    "user": "system",
    "environment": "production"
}
\\\

**Expected Response:** Status 202 Accepted with jobId

---

### Test 2.3: Send Webhook with Sensitive Data

**Method:** POST  
**URL:** {{base_url}}/webhook/sensitive-filter-001

**Request Body:**
\\\json
{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "secret123",
    "token": "abc123xyz",
    "credit_card": "4111-1111-1111-1111",
    "message": "User logged in successfully"
}
\\\

**Expected Response:** Status 202 Accepted

---

### Test 2.4: Non-existent Pipeline (Negative Test)

**Method:** POST  
**URL:** {{base_url}}/webhook/non-existent-slug

**Request Body:** {"test": "data"}

**Expected Response:** Status 404 Not Found

---

## Test Suite 3: Job Status & Monitoring

### Test 3.1: Get All Jobs

**Method:** GET  
**URL:** {{base_url}}/api/jobs

**Query Parameters:**
- pipelineId - Filter by pipeline
- status - Filter by status (PENDING, PROCESSING, COMPLETED, FAILED)
- limit - Results limit (default: 50)

**Expected Response:** Status 200 OK with jobs array

---

### Test 3.2: Get Specific Job

**Method:** GET  
**URL:** {{base_url}}/api/jobs/{{job_id}}

**Expected Response:** Status 200 OK with job details

---

### Test 3.3: Get Jobs by Pipeline

**Method:** GET  
**URL:** {{base_url}}/api/jobs?pipelineId={{pipeline_id}}

**Expected Response:** Status 200 OK

---

### Test 3.4: Get Completed Jobs

**Method:** GET  
**URL:** {{base_url}}/api/jobs?status=COMPLETED

**Expected Response:** Status 200 OK

---

### Test 3.5: Retry Failed Job

**Method:** POST  
**URL:** {{base_url}}/api/jobs/{{job_id}}/retry

**Expected Response:** Status 200 OK

---

## Test Suite 4: Health & Monitoring

### Test 4.1: Health Check

**Method:** GET  
**URL:** {{base_url}}/health

**Expected Response:**
\\\json
{
    "status": "healthy",
    "timestamp": "2026-03-26T13:00:00.000Z",
    "services": {
        "database": "connected",
        "redis": "connected"
    }
}
\\\

---

### Test 4.2: Statistics

**Method:** GET  
**URL:** {{base_url}}/api/stats

**Expected Response:**
\\\json
{
    "totalPipelines": 5,
    "totalJobs": 100,
    "completedJobs": 95,
    "failedJobs": 5,
    "successRate": "95.00",
    "recentJobs": [...]
}
\\\

---

### Test 4.3: Bull Dashboard

**Method:** GET  
**URL:** {{base_url}}/admin/queues

**Expected Response:** HTML dashboard page

---

## Postman Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| base_url | http://localhost:3000 | API base URL |
| pipeline_id | [from response] | ID of created pipeline |
| job_id | [from response] | ID of created job |

---

## Test Execution Checklist

- [ ] Test Suite 1: Pipeline Management (1.1-1.7)
- [ ] Test Suite 2: Webhook Ingestion (2.1-2.4)
- [ ] Test Suite 3: Job Status (3.1-3.5)
- [ ] Test Suite 4: Health & Monitoring (4.1-4.3)

## Success Criteria

✅ All endpoints return expected status codes  
✅ Jobs are queued and processed successfully  
✅ Data transformations work correctly  
✅ Webhooks are delivered to subscribers  
✅ Retry logic works on failures  
✅ Database stores all job information  
✅ Bull dashboard shows accurate metrics
