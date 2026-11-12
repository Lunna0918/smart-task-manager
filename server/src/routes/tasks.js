import { Router } from 'express';
import { supabase, TASKS_TABLE, TASK_COLUMNS, PRIORITIES } from '../supabase.js';

const router = Router();

const MAX_TITLE_LENGTH = 200;

function validateTitle(title) {
  if (typeof title !== 'string') return '任务标题不能为空';
  const trimmed = title.trim();
  if (!trimmed) return '任务标题不能为空';
  if (trimmed.length > MAX_TITLE_LENGTH) return `任务标题不能超过 ${MAX_TITLE_LENGTH} 个字符`;
  return null;
}

/** GET /api/tasks?priority=高  获取任务列表（按创建时间倒序） */
router.get('/', async (req, res, next) => {
  try {
    const { priority } = req.query;

    let query = supabase
      .from(TASKS_TABLE)
      .select(TASK_COLUMNS)
      .order('created_at', { ascending: false });

    if (priority) {
      if (!PRIORITIES.includes(priority)) {
        return res.status(400).json({ error: '优先级只能是 高 / 中 / 低' });
      }
      query = query.eq('priority', priority);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    next(err);
  }
});

/** POST /api/tasks  新增任务 */
router.post('/', async (req, res, next) => {
  try {
    const { title, priority = '中' } = req.body || {};

    const titleError = validateTitle(title);
    if (titleError) return res.status(400).json({ error: titleError });
    if (!PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: '优先级只能是 高 / 中 / 低' });
    }

    const { data, error } = await supabase
      .from(TASKS_TABLE)
      .insert({ title: title.trim(), priority, completed: false })
      .select(TASK_COLUMNS)
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

/** PATCH /api/tasks/:id  更新任务（完成状态 / 标题 / 优先级） */
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, priority, completed } = req.body || {};

    const payload = {};
    if (typeof completed === 'boolean') payload.completed = completed;

    if (title !== undefined) {
      const titleError = validateTitle(title);
      if (titleError) return res.status(400).json({ error: titleError });
      payload.title = title.trim();
    }

    if (priority !== undefined) {
      if (!PRIORITIES.includes(priority)) {
        return res.status(400).json({ error: '优先级只能是 高 / 中 / 低' });
      }
      payload.priority = priority;
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段' });
    }

    const { data, error } = await supabase
      .from(TASKS_TABLE)
      .update(payload)
      .eq('id', id)
      .select(TASK_COLUMNS)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: '任务不存在' });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/tasks/:id  删除任务 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from(TASKS_TABLE)
      .delete()
      .eq('id', id)
      .select(TASK_COLUMNS)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: '任务不存在' });

    res.json({ success: true, removed: data });
  } catch (err) {
    next(err);
  }
});

export default router;
