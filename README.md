# Calendar App - TimeTree类日历应用

一个支持多人实时协作的全栈日历应用，类似TimeTree。

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Material-UI
- **后端**: Node.js + Express + TypeScript
- **数据库**: PostgreSQL + Prisma ORM
- **实时通信**: Socket.IO
- **包管理**: pnpm workspace (Monorepo)

## 核心功能

- ✅ 用户认证系统（注册、登录、JWT）
- ✅ 日历视图（月视图、周视图、日视图）
- ✅ 事件管理（创建、编辑、删除）
- ✅ 多人共享协作
- ✅ 实时同步
- ✅ PWA支持（Web + 移动端）

## 项目结构

```
calendar-app/
├── packages/
│   ├── web/          # React前端应用
│   ├── server/       # Node.js后端API
│   └── shared/       # 共享类型定义
├── docker/           # Docker配置
└── pnpm-workspace.yaml
```

## 快速开始

### 前置要求

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+
- Redis (可选，用于缓存)

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息
```

### 初始化数据库

```bash
cd packages/server
pnpm prisma migrate dev
pnpm prisma generate
```

### 启动开发服务器

```bash
# 同时启动前端和后端
pnpm dev

# 或者分别启动
pnpm dev:web    # 前端: http://localhost:5173
pnpm dev:server # 后端: http://localhost:3000
```

## 开发指南

### 数据库迁移

```bash
cd packages/server
pnpm prisma migrate dev --name migration_name
```

### 构建生产版本

```bash
pnpm build
```

### Docker部署

```bash
docker-compose up -d
```

## API文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/refresh` - 刷新token
- `GET /api/auth/me` - 获取当前用户信息

### 日历相关
- `GET /api/calendars` - 获取用户所有日历
- `POST /api/calendars` - 创建新日历
- `GET /api/calendars/:id` - 获取日历详情
- `PUT /api/calendars/:id` - 更新日历信息
- `DELETE /api/calendars/:id` - 删除日历

### 事件相关
- `GET /api/events` - 获取事件列表
- `POST /api/events` - 创建新事件
- `GET /api/events/:id` - 获取事件详情
- `PUT /api/events/:id` - 更新事件
- `DELETE /api/events/:id` - 删除事件

## License

MIT
