import express from 'express';
import { PrismaClient } from '@prisma/client';
import { redisConnection } from './config/redis';
import { Queue } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

const app = express();
const prisma = new PrismaClient();

// Redis connection
const webhookQueue = new Queue('webhook-handler', {
  connection: redisConnection
});

// Bull Dashboard setup
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(webhookQueue)],
  serverAdapter: serverAdapter,
});

app.use(express.json());
app.use('/admin/queues', serverAdapter.getRouter());

// ============ EXISTING ENDPOINTS ============

// Create pipeline
app.post('/pipelines', async (req, res) => {
  const { name, sourceSlug, actionType, subscriberUrls } = req.body;
  
  try {
    const pipeline = await prisma.pipeline.create({
      data: {
        name,
        sourceSlug,
        actionType: actionType || "DEFAULT", 
        subscribers: {
          create: subscriberUrls ? subscriberUrls.map((url: string) => ({ url })) : []
        }
      },
      include: { subscribers: true }
    });
    res.status(201).json(pipeline);
  } catch (error) {
    console.error("Prisma Error:", error);
    res.status(400).json({ error: "Failed to create pipeline. Slug might be taken." });
  }
});

// Get all pipelines
app.get('/pipelines', async (req, res) => {
  try {
    const pipelines = await prisma.pipeline.findMany({
      include: {
        subscribers: true,
        _count: {
          select: { jobs: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(pipelines);
  } catch (error) {
    console.error('Error fetching pipelines:', error);
    res.status(500).json({ error: 'Failed to fetch pipelines' });
  }
});

// Get single pipeline
app.get('/pipelines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pipeline = await prisma.pipeline.findUnique({
      where: { id },
      include: {
        subscribers: true,
        jobs: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });
    
    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }
    
    res.json(pipeline);
  } catch (error) {
    console.error('Error fetching pipeline:', error);
    res.status(500).json({ error: 'Failed to fetch pipeline' });
  }
});

// Delete pipeline
app.delete('/pipelines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.pipeline.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting pipeline:', error);
    res.status(500).json({ error: 'Failed to delete pipeline' });
  }
});

// Webhook ingestion
app.post('/webhook/:sourceSlug', async (req, res) => {
  const { sourceSlug } = req.params;
  const payload = req.body;

  try {
    const pipeline = await prisma.pipeline.findUnique({ 
        where: { sourceSlug },
        include: { subscribers: true } 
    });

    if (!pipeline) return res.status(404).json({ error: 'Pipeline not found' });

    const job = await prisma.jobLog.create({
      data: { 
        pipelineId: pipeline.id, 
        payload, 
        status: 'PENDING' 
      }
    });

    await webhookQueue.add('process-webhook', {
      jobId: job.id,
      pipelineId: pipeline.id,
      payload
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    });

    res.status(202).json({ message: 'Queued', jobId: job.id });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get job by ID (original endpoint)
app.get('/jobs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const jobLog = await prisma.jobLog.findUnique({
      where: { id },
      include: { pipeline: true }
    });

    if (!jobLog) return res.status(404).json({ error: 'Job not found' });

    res.json({
      jobId: jobLog.id,
      status: jobLog.status,
      pipeline: jobLog.pipeline.name,
      result: jobLog.result,
      receivedAt: jobLog.createdAt,
      payload: jobLog.payload
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Error fetching job status' });
  }
});

// ============ NEW ENDPOINTS ============

// Get all jobs with filters
app.get('/api/jobs', async (req, res) => {
  try {
    const { pipelineId, status, limit = 50 } = req.query;
    
    const where: any = {};
    if (pipelineId) where.pipelineId = pipelineId;
    if (status) where.status = status;
    
    const jobs = await prisma.jobLog.findMany({
      where,
      include: {
        pipeline: {
          select: { 
            id: true,
            name: true, 
            sourceSlug: true,
            actionType: true
          }
        },
        deliveries: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string)
    });
    
    const total = await prisma.jobLog.count({ where });
    
    res.json({
      data: jobs,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: 0
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get specific job
app.get('/api/jobs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const jobLog = await prisma.jobLog.findUnique({
      where: { id },
      include: { 
        pipeline: {
          select: {
            id: true,
            name: true,
            sourceSlug: true,
            actionType: true,
            actionConfig: true
          }
        },
        deliveries: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!jobLog) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(jobLog);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Error fetching job status' });
  }
});

// Retry failed job
app.post('/api/jobs/:id/retry', async (req, res) => {
  const { id } = req.params;
  try {
    const job = await prisma.jobLog.findUnique({
      where: { id },
      include: { pipeline: true }
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    if (job.status !== 'FAILED') {
      return res.status(400).json({ error: 'Only failed jobs can be retried' });
    }
    
    await prisma.jobLog.update({
      where: { id },
      data: {
        status: 'PENDING',
        error: null,
        processedAt: null,
        completedAt: null
      }
    });
    
    await webhookQueue.add('process-webhook', {
      jobId: job.id,
      pipelineId: job.pipelineId,
      payload: job.payload
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    });
    
    res.json({ 
      message: 'Job requeued for retry', 
      jobId: job.id,
      status: 'PENDING'
    });
  } catch (error) {
    console.error('Error retrying job:', error);
    res.status(500).json({ error: 'Failed to retry job' });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const [totalPipelines, totalJobs, completedJobs, failedJobs, recentJobs] = await Promise.all([
      prisma.pipeline.count(),
      prisma.jobLog.count(),
      prisma.jobLog.count({ where: { status: 'COMPLETED' } }),
      prisma.jobLog.count({ where: { status: 'FAILED' } }),
      prisma.jobLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          pipeline: {
            select: { name: true, sourceSlug: true }
          }
        }
      })
    ]);
    
    res.json({
      totalPipelines,
      totalJobs,
      completedJobs,
      failedJobs,
      successRate: totalJobs > 0 ? ((completedJobs / totalJobs) * 100).toFixed(2) : 0,
      recentJobs
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: 'Database connection failed'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Webhook Pipeline Service',
    version: '1.0.0',
    endpoints: {
      pipelines: {
        create: 'POST /pipelines',
        list: 'GET /pipelines',
        get: 'GET /pipelines/:id',
        delete: 'DELETE /pipelines/:id'
      },
      webhooks: {
        send: 'POST /webhook/:sourceSlug'
      },
      jobs: {
        list: 'GET /api/jobs',
        get: 'GET /api/jobs/:id',
        retry: 'POST /api/jobs/:id/retry'
      },
      stats: 'GET /api/stats',
      health: 'GET /health',
      dashboard: 'GET /admin/queues'
    }
  });
});

// Start server
app.listen(3000, () => {
  console.log('ðŸš€ Webhook Pipeline Service on port 3000');
  console.log('ðŸ“Š Dashboard: http://localhost:3000/admin/queues');
  console.log('ðŸ“– API Docs: http://localhost:3000');
});





