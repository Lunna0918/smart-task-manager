import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;

if (!url || !key) {
  throw new Error('缺少 SUPABASE_URL 或 SUPABASE_KEY，请参考 .env.example 配置 server/.env');
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

export const TASKS_TABLE = 'tasks';
export const TASK_COLUMNS = 'id, title, priority, completed, created_at';
export const PRIORITIES = ['高', '中', '低'];
