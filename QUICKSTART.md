# 快速开始指南

## 前置要求

在开始之前，请确保你的系统已安装以下软件：

- **Node.js** 18+ ([下载地址](https://nodejs.org/))
- **pnpm** 8+ (运行 `npm install -g pnpm` 安装)
- **PostgreSQL** 14+ ([下载地址](https://www.postgresql.org/download/))
- **Git** ([下载地址](https://git-scm.com/))

可选：
- **Redis** (用于缓存，可选)
- **Docker** 和 **Docker Compose** (用于容器化部署)

## 安装步骤

### 1. 克隆项目（如果从Git仓库）

```bash
git clone <repository-url>
cd firstClaudeProject
```

### 2. 安装依赖

```bash
pnpm install
```

这将安装所有包（web、server、shared）的依赖。

### 3. 配置环境变量

复制环境变量模板并编辑：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下关键变量：

```env
# 数据库连接（必需）
DATABASE_URL="postgresql://calendar_user:your_password@localhost:5432/calendar_db"

# JWT密钥（必需，生产环境请使用强密码）
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# 其他配置
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

### 4. 创建数据库

使用PostgreSQL创建数据库：

```bash
# 登录PostgreSQL
psql -U postgres

# 创建数据库和用户
CREATE DATABASE calendar_db;
CREATE USER calendar_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE calendar_db TO calendar_user;
\q
```

### 5. 运行数据库迁移

```bash
cd packages/server
pnpm prisma migrate dev --name init
pnpm prisma generate
cd ../..
```

### 6. 启动开发服务器

```bash
# 同时启动前端和后端
pnpm dev
```

或者分别启动：

```bash
# 终端1：启动后端
pnpm dev:server

# 终端2：启动前端
pnpm dev:web
```

### 7. 访问应用

- **前端**: http://localhost:5173
- **后端API**: http://localhost:3000
- **健康检查**: http://localhost:3000/health

## 首次使用

1. 打开浏览器访问 http://localhost:5173
2. 点击"立即注册"创建账户
3. 填写邮箱、用户名和密码
4. 登录后即可开始使用日历功能

## 常用命令

```bash
# 开发
pnpm dev              # 启动所有服务
pnpm dev:web          # 只启动前端
pnpm dev:server       # 只启动后端

# 构建
pnpm build            # 构建所有包

# 数据库
cd packages/server
pnpm prisma studio    # 打开数据库管理界面
pnpm prisma migrate dev --name <name>  # 创建新迁移
pnpm prisma generate  # 生成Prisma客户端

# 测试
pnpm test             # 运行测试（如果有）
```

## Docker部署

如果你想使用Docker部署：

```bash
# 启动所有服务（PostgreSQL + Redis + 后端 + 前端）
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止并删除数据
docker-compose down -v
```

访问 http://localhost 即可使用应用。

## 故障排除

### 数据库连接失败

- 检查PostgreSQL是否正在运行
- 验证 `.env` 文件中的 `DATABASE_URL` 是否正确
- 确保数据库用户有足够的权限

### 前端无法连接后端

- 确保后端服务正在运行（http://localhost:3000/health 应该返回 `{"status":"ok"}`）
- 检查 `packages/web/.env` 中的 `VITE_API_URL` 配置
- 查看浏览器控制台是否有CORS错误

### 端口被占用

如果端口3000或5173被占用，可以修改：

- 后端端口：修改 `.env` 中的 `PORT`
- 前端端口：修改 `packages/web/vite.config.ts` 中的 `server.port`

### Prisma迁移失败

```bash
# 重置数据库（警告：会删除所有数据）
cd packages/server
pnpm prisma migrate reset

# 重新生成客户端
pnpm prisma generate
```

## 下一步

- 查看 [API文档](./API.md) 了解后端接口
- 阅读 [架构说明](./ARCHITECTURE.md) 了解项目结构
- 查看 [开发指南](./DEVELOPMENT.md) 学习如何贡献代码

## 获取帮助

如果遇到问题：

1. 查看项目的 [GitHub Issues](https://github.com/your-repo/issues)
2. 阅读完整的 [README.md](./README.md)
3. 检查日志文件查找错误信息

祝你使用愉快！🎉
