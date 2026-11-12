# 智能任务管理系统

一个基于 **Node.js（Express）+ React（Vite）+ Supabase** 的全栈任务管理应用。

## 功能

- 输入任务标题 + 选择优先级（高 / 中 / 低）添加任务，支持回车快捷提交
- 任务列表显示标题、优先级、完成状态与创建时间
- 每条任务支持「完成 / 未完成」切换和删除
- 按优先级筛选（全部 / 高 / 中 / 低）
- 任务按创建时间倒序排列，已完成任务标题加删除线并置灰
- 中文界面，数据持久化在 Supabase，刷新或换设备都看到同一份数据

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | React 18 + Vite |
| 后端 | Node.js + Express |
| 数据库 | Supabase（PostgreSQL + PostgREST） |

后端通过 `@supabase/supabase-js` 读写 `public.tasks` 表，前端只访问后端 REST 接口，Supabase 密钥只保存在服务端环境变量里。

## 目录结构

```
smart-task-manager/
├── server/                  # Node.js 后端
│   ├── src/index.js         # Express 入口
│   ├── src/supabase.js      # Supabase 客户端
│   ├── src/routes/tasks.js  # 任务增删改查接口
│   └── .env.example
├── web/                     # React 前端
│   ├── src/App.jsx
│   ├── src/styles.css
│   └── vite.config.js       # /api 代理到后端
├── supabase/schema.sql      # 建表 + RLS 策略
└── README.md
```

## 快速开始

### 1. 准备 Supabase

1. 在 [Supabase](https://supabase.com) 新建项目。
2. 打开 **SQL Editor**，执行 `supabase/schema.sql`，会创建 `public.tasks` 表、索引和 RLS 策略。
3. 打开 **Project Settings → API**，记下 `Project URL` 和 `publishable key`（旧项目里叫 `anon key`）。

### 2. 启动后端

```bash
cd server
cp .env.example .env    # 填入 SUPABASE_URL / SUPABASE_KEY
npm install
npm run dev             # 默认 http://localhost:3000
```

### 3. 启动前端

```bash
cd web
npm install
npm run dev             # 默认 http://localhost:5173
```

前端已配置 `/api` 代理到 `http://localhost:3000`，本地开发无需额外配置密钥。

生产构建：

```bash
cd web && npm run build   # 产物在 web/dist
```

## 接口说明

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/tasks?priority=高` | 获取任务列表，`priority` 可选，按 `created_at` 倒序 |
| POST | `/api/tasks` | 新增任务，body：`{ "title": "写周报", "priority": "高" }` |
| PATCH | `/api/tasks/:id` | 更新任务，body 可含 `completed` / `title` / `priority` |
| DELETE | `/api/tasks/:id` | 删除任务 |
| GET | `/api/health` | 健康检查 |

`priority` 只接受 `高`、`中`、`低`，不是这三个值会返回 `400`。

## 数据库表结构

```sql
create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  priority    text not null default '中' check (priority in ('高', '中', '低')),
  completed   boolean not null default false,
  created_at  timestamptz not null default now()
);
```

## 安全说明

- 项目里**不含任何真实密钥**，`.env` 已被 `.gitignore` 忽略。
- `supabase/schema.sql` 里的 RLS 策略放行了匿名读写，适合个人 demo 或内网场景；如果要给多人正式使用，请换成 Supabase Auth 登录 + 按 `user_id` 限定行级权限。
