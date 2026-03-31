import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

const worker = new Worker('webhook-handler', async (job) => {
  const { jobId, pipelineId, payload } = job.data;
  console.log(`🛠️ Processing Job: ${jobId}`);

  try {
    // 1. Fetch Pipeline details and subscribers
    const pipeline = await prisma.pipeline.findUnique({
      where: { id: pipelineId },
      include: { subscribers: true }
    });

    if (!pipeline) throw new Error('Pipeline not found');

    // 2. Execute Processing Logic
    let processedResult = payload;

    switch (pipeline.actionType) {
      case 'TRANSFORM_UPPERCASE':
        processedResult = JSON.parse(JSON.stringify(payload).toUpperCase());
        break;

      case 'EXTRACT_ISSUE_SUMMARY':
        processedResult = {
          summary: `Issue: ${payload.issue?.title || 'N/A'}`,
          priority: payload.issue?.priority || 'low',
          timestamp: new Date().toISOString()
        };
        break;

      case 'FILTER_SENSITIVE':
        const filtered = { ...payload };
        delete filtered.email;
        delete filtered.password;
        processedResult = filtered;
        break;

      default:
        processedResult = payload;
    }

    // 3. Save result and update status in Database
    await prisma.jobLog.update({
      where: { id: jobId },
      data: { 
        status: 'COMPLETED',
        result: processedResult 
      }
    });

    // 4. Send result to all subscribers (Discord format)
// 4. Send result to all subscribers (Discord embed format)
const deliveryPromises = pipeline.subscribers.map(sub => {
  const formattedData = JSON.stringify(processedResult, null, 2);

  const shortData =
    formattedData.length > 1000
      ? formattedData.slice(0, 1000) + "\n... (truncated)"
      : formattedData;

  return axios.post(sub.url, {
    embeds: [
      {
        title: "🚀 New Event Processed!",
        description: `Pipeline: **${pipeline.name}**`,
        color: 3447003,
        fields: [
          {
            name: "📦 Result Data",
            value: `\`\`\`json\n${shortData}\n\`\`\``
          }
        ],
        footer: {
          text: "Webhook Pipeline System"
        },
        timestamp: new Date().toISOString()
      }
    ]
  }).catch(err => {
    console.error(`❌ Discord Error (${sub.url}):`, err.response?.data || err.message);
  });
});

await Promise.all(deliveryPromises);
    await Promise.all(deliveryPromises);
    console.log(`✅ Job ${jobId} processed & delivered to ${pipeline.subscribers.length} subscribers`);

  } catch (error) {
    console.error(`❌ Error processing job ${jobId}:`, error);
    await prisma.jobLog.update({
      where: { id: jobId },
      data: { status: 'FAILED' }
    });
  }
}, {
  // Use the service name defined in docker-compose.yml
  connection: { 
    host: process.env.REDIS_HOST || 'localhost', 
    port: parseInt(process.env.REDIS_PORT || '6379') 
  }
});

console.log('👷 Worker is running and waiting for jobs...');