import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { redisConnection } from './config/redis';
import axios from 'axios';

const prisma = new PrismaClient();

const worker = new Worker('webhook-handler', async (job) => {
  const { jobId, pipelineId, payload } = job.data;
  console.log(`ðŸ› ï¸ Processing Job: ${jobId}`);

  try {
    // 1. Ø¬Ù„Ø¨ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù€ Pipeline ÙˆØ§Ù„Ù…Ø´ØªØ±ÙƒÙŠÙ†
    const pipeline = await prisma.pipeline.findUnique({
      where: { id: pipelineId },
      include: { subscribers: true }
    });

    if (!pipeline) throw new Error('Pipeline not found');

    // 2. ØªÙ†ÙÙŠØ° "Ø¹Ù…Ù„ÙŠØ© Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø©" (ØªØ£ÙƒØ¯ Ù…Ù† Ø£Ù† Ø§Ù„Ø£Ø³Ù…Ø§Ø¡ ØªØ·Ø§Ø¨Ù‚ Ù…Ø§ ØªØ±Ø³Ù„Ù‡ ÙÙŠ Postman)
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

    // 3. Ø­ÙØ¸ Ø§Ù„Ù†ØªÙŠØ¬Ø© ÙˆØªØ­Ø¯ÙŠØ« Ø§Ù„Ø­Ø§Ù„Ø© ÙÙŠ Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª
    await prisma.jobLog.update({
      where: { id: jobId },
      data: { 
        status: 'COMPLETED',
        result: processedResult 
      }
    });

    // 4. Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ù†ØªÙŠØ¬Ø© Ù„ÙƒÙ„ Ø§Ù„Ù…Ø´ØªØ±ÙƒÙŠÙ† (ØªÙ†Ø³ÙŠÙ‚ Ø®Ø§Øµ Ù„Ù€ Discord)
    const deliveryPromises = pipeline.subscribers.map(sub => 
      axios.post(sub.url, {
        // Ø¯ÙŠØ³ÙƒÙˆØ±Ø¯ ÙŠØ­ØªØ§Ø¬ Ø­Ù‚Ù„ content Ù„ÙƒÙŠ ØªØ¸Ù‡Ø± Ø§Ù„Ø±Ø³Ø§Ù„Ø© ÙÙŠ Ø§Ù„Ù‚Ù†Ø§Ø©
        content: `ðŸš€ **BallanceIT: New Event Processed!**\n**Pipeline:** ${pipeline.name}\n**Result Data:** \`\`\`json\n${JSON.stringify(processedResult, null, 2)}\n\`\`\``
      }).catch(err => {
          // Ø·Ø¨Ø§Ø¹Ø© ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø®Ø·Ø£ Ø¥Ø°Ø§ Ø±ÙØ¶ Ø¯ÙŠØ³ÙƒÙˆØ±Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…
          console.error(`âŒ Discord Error (${sub.url}):`, err.response?.data || err.message);
      })
    );

    await Promise.all(deliveryPromises);
    console.log(`âœ… Job ${jobId} processed & delivered to ${pipeline.subscribers.length} subscribers`);

  } catch (error) {
    console.error(`âŒ Error processing job ${jobId}:`, error);
    await prisma.jobLog.update({
      where: { id: jobId },
      data: { status: 'FAILED' }
    });
  }
}, {
  connection: redisConnection
});

console.log('ðŸ‘· Worker is running and waiting for jobs...');





