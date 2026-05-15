#!/bin/bash
set -e

# ============================================================
# Calendar App — 一键部署 (使用系统 PostgreSQL)
# 用法: ./deploy.sh [--start]
#   --start   部署后启动开发服务器
# ============================================================

cd "$(dirname "$0")"
PROJECT_ROOT="$(pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

START=false
[[ "$1" = "--start" ]] && START=true

echo ""
echo "  Calendar App 一键部署"
echo "  ====================="
echo ""

# ---- 1. 检查 ----
command -v node >/dev/null 2>&1 || err "未找到 Node.js，请安装 Node.js 18+"
command -v pnpm >/dev/null 2>&1 || { warn "安装 pnpm..."; npm install -g pnpm; }
command -v psql >/dev/null 2>&1 || err "未找到 psql，请安装 PostgreSQL 客户端"

log "Node.js $(node -v)"
log "pnpm   $(pnpm -v)"

# ---- 2. PostgreSQL ----
if pg_isready -q 2>/dev/null; then
  log "PostgreSQL 已运行"
else
  warn "启动 PostgreSQL..."
  sudo systemctl start postgresql 2>/dev/null || sudo service postgresql start 2>/dev/null || err "无法启动 PostgreSQL"
  sleep 1
  pg_isready -q || err "PostgreSQL 启动失败"
  log "PostgreSQL 已启动"
fi

# ---- 3. 创建数据库和用户 ----
DB_NAME="calendar_db"; DB_USER="calendar_user"; DB_PASS="password"

sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" 2>/dev/null | grep -q 1 || {
  warn "创建用户 $DB_USER..."
  sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS' CREATEDB;"
  log "用户已创建"
}

sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null | grep -q 1 || {
  warn "创建数据库 $DB_NAME..."
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
  log "数据库已创建"
}

# ---- 4. .env ----
if [ -f .env ]; then
  log ".env 已存在"
else
  cp .env.example .env
  log ".env 已从 .env.example 创建"
fi

# ---- 5. 确保 Prisma schema 使用 PostgreSQL ----
SCHEMA_FILE="packages/server/prisma/schema.prisma"
if grep -q 'provider\s*=\s*"sqlite"' "$SCHEMA_FILE" 2>/dev/null; then
  warn "检测到 SQLite provider，修复为 PostgreSQL..."
  sed -i 's/provider = "sqlite"/provider = "postgresql"/' "$SCHEMA_FILE"
  log "已修复"
else
  log "Schema provider = PostgreSQL"
fi

# ---- 6. 安装依赖 ----
warn "安装依赖..."
pnpm install --frozen-lockfile 2>/dev/null || { warn "lockfile 版本不兼容，重试..."; rm -f pnpm-lock.yaml; pnpm install; }
log "依赖安装完成"

# ---- 7. Prisma 迁移 ----
warn "初始化数据库..."
cd packages/server
# Prisma 需要 DATABASE_URL 环境变量 (从根 .env 加载)
set -a; source ../../.env; set +a
npx prisma generate
npx prisma migrate deploy || { warn "创建初始迁移..."; npx prisma migrate dev --name init; }
cd ../..
log "数据库已就绪"

# ---- 8. 输出 ----
echo ""
echo "  ┌─────────────────────────────────────────────┐"
echo "  │              ✅ 部署完成                     │"
echo "  ├─────────────────────────────────────────────┤"
echo "  │  后端 API:   http://localhost:3000           │"
echo "  │  前端 Web:   http://localhost:5173           │"
echo "  │  健康检查:   http://localhost:3000/health    │"
echo "  ├─────────────────────────────────────────────┤"
echo "  │  启动开发环境:  pnpm dev                     │"
echo "  │  (或重新运行:    ./deploy.sh --start)        │"
echo "  └─────────────────────────────────────────────┘"
echo ""

# ---- 9. 可选：启动开发服务器 ----
if $START; then
  warn "启动开发服务..."
  pnpm dev &
  DEV_PID=$!
  sleep 3

  curl -s http://localhost:3000/health >/dev/null 2>&1 && log "后端 API 已就绪" || warn "后端 API 启动中..."
  curl -s -o /dev/null http://localhost:5173 2>/dev/null    && log "前端 Web 已就绪" || warn "前端启动中..."

  echo ""
  echo "  按 Ctrl+C 停止"
  echo ""
  wait $DEV_PID
fi
