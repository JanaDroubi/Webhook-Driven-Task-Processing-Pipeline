import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

const worker = new Worker('webhook-handler', async (job) => {
  const { jobId, pipelineId, payload } = job.data;
  console.log(`🛠️ Processing Job: ${jobId}`);

  try {
    // 1. جلب تفاصيل الـ Pipeline والمشتركين
    const pipeline = await prisma.pipeline.findUnique({
      where: { id: pipelineId },
      include: { subscribers: true }
    });

    if (!pipeline) throw new Error('Pipeline not found');

    // 2. تنفيذ "عملية المعالجة" (تأكد من أن الأسماء تطابق ما ترسله في Postman)
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

    // 3. حفظ النتيجة وتحديث الحالة في قاعدة البيانات
    await prisma.jobLog.update({
      where: { id: jobId },
      data: { 
        status: 'COMPLETED',
        result: processedResult 
      }
    });

    // 4. إرسال النتيجة لكل المشتركين (تنسيق خاص لـ Discord)
    const deliveryPromises = pipeline.subscribers.map(sub => 
      axios.post(sub.url, {
        // ديسكورد يحتاج حقل content لكي تظهر الرسالة في القناة
        content: `🚀 **BallanceIT: New Event Processed!**\n**Pipeline:** ${pipeline.name}\n**Result Data:** \`\`\`json\n${JSON.stringify(processedResult, null, 2)}\n\`\`\``
      }).catch(err => {
          // طباعة تفاصيل الخطأ إذا رفض ديسكورد الاستلام
          console.error(`❌ Discord Error (${sub.url}):`, err.response?.data || err.message);
      })
    );

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
  connection: { host: 'localhost', port: 6379 }
});

console.log('👷 Worker is running and waiting for jobs...');