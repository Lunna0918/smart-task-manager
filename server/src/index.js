import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import tasksRouter from './routes/tasks.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'smart-task-manager-api' });
});

app.use('/api/tasks', tasksRouter);

app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[API 错误]', err?.message || err);
  res.status(500).json({ error: err?.message || '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`智能任务管理系统 API 已启动：http://localhost:${PORT}`);
});
