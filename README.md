# DeepClick Radar

> **行业信号，一网打尽。**

基于 [ClawFeed](https://github.com/kevinho/clawfeed) 构建的 DeepClick 行业情报系统。自动从 RSS、网站、Reddit、X 代理、自定义 API 等渠道采集信号，生成面向增长负责人的结构化简报，每条信号都解释其对 CPA/CVR 和 click-to-conversion 链路的影响。

## 能力概览

### 采集管线 (Collection Pipeline)

5 种 fetcher，覆盖主流信息源类型：

| Fetcher | 说明 | 源类型 |
|---------|------|--------|
| RSS | 支持 RSS 2.0 / Atom 1.0 / RDF / JSON Feed | `rss`, `digest_feed` |
| Website | HTML 页面 RSS 自动发现 + 正文提取回退 | `website` |
| Reddit | 公开 JSON API，获取帖子及评分/评论数 | `reddit` |
| X Proxy | 通过可配置 RSS 代理桥接 X/Twitter 内容 | `twitter_feed`, `twitter_list` |
| Custom API | 通用 JSON API，支持 dot-path 字段映射 | `custom_api`, `hackernews`, `github_trending` |

自动特性：
- **去重** — 基于 `UNIQUE(source_id, dedup_key)` 约束 + SHA-256，同一内容不会重复入库
- **健康追踪** — 记录每个源的成功/失败次数和最后抓取时间
- **自动暂停** — 连续失败 5 次的源自动暂停，不再浪费请求

### API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/collect/run` | 手动触发一次采集，返回处理摘要 |
| GET | `/api/raw-items/stats` | 管线健康概览（条目数、源状态、最近采集时间） |
| GET | `/api/raw-items/for-digest` | 获取可用于生成简报的过滤内容 |

所有新端点均需 Bearer API_KEY 认证。原有 ClawFeed 端点（digests, packs, marks, auth）保持不变。

### 内容层 (Content Layer)

- **`templates/curation-rules.md`** — 5 级信号优先级体系
  - Tier 1: 平台与政策风险（最高优先级）
  - Tier 2: 转化链路优化
  - Tier 3: 竞争与市场动态
  - Tier 4: 归因、度量与隐私基础设施
  - Tier 5: 市场叙事与增长信号

- **`templates/digest-prompt.md`** — 6 段式增长负责人简报结构
  - 警报、转化机会、竞争情报、基础设施观察、市场背景、行动建议

- **DeepClick Industry Radar 源包** — 23 个精选源覆盖 AdTech、MarTech、Post-click/CRO、归因/隐私、增长等垂直领域

## 安装

### 在其他电脑上部署

```bash
# 克隆仓库（使用 deepclick 分支）
git clone -b codex/deepclick-industry-feed https://github.com/kevinho/clawfeed.git deepclick-radar
cd deepclick-radar
npm install
```

### 作为 OpenClaw Skill 安装

```bash
cd ~/.openclaw/skills/
git clone -b codex/deepclick-industry-feed https://github.com/kevinho/clawfeed.git deepclick-radar
cd deepclick-radar && npm install
```

OpenClaw 会自动识别 `SKILL.md` 并加载。

### 作为 Zylos Skill 安装

```bash
cd ~/.zylos/skills/
git clone -b codex/deepclick-industry-feed https://github.com/kevinho/clawfeed.git deepclick-radar
cd deepclick-radar && npm install
```

## 快速开始

```bash
# 1. 安装依赖（如果上面安装步骤已执行则跳过）
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，至少设置 API_KEY

# 3. 导入 DeepClick 源包
node scripts/seed-source-pack.mjs

# 4. 启动服务
npm start
# 默认运行在 http://localhost:8767

# 5. 手动触发一次采集
curl -X POST http://localhost:8767/api/collect/run \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"

# 6. 查看采集状态
curl http://localhost:8767/api/raw-items/stats \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## 环境变量

| 变量 | 说明 | 必填 | 默认值 |
|------|------|------|--------|
| `DIGEST_PORT` | 服务端口 | 否 | 8767 |
| `API_KEY` | API 认证密钥（采集/统计端点） | 是 | - |
| `AI_DIGEST_DB` | SQLite 数据库路径 | 否 | `data/digest.db` |
| `GOOGLE_CLIENT_ID` | Google OAuth（用户登录） | 否 | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | 否 | - |
| `SESSION_SECRET` | Session 加密密钥 | 否 | - |
| `ALLOWED_ORIGINS` | CORS 允许的源 | 否 | localhost |

## 项目结构

```
src/
├── server.mjs          # HTTP 服务器 + 所有 API 路由
├── db.mjs              # SQLite 数据库 + 迁移 + 查询函数
├── http.mjs            # 共享 HTTP 工具 + SSRF 防护
├── collector.mjs       # 采集编排器（调度 + 健康追踪）
└── fetchers/
    ├── rss.mjs         # RSS/Atom/RDF/JSON Feed 解析
    ├── website.mjs     # RSS 自动发现 + 正文提取
    ├── reddit.mjs      # Reddit JSON API
    ├── x-proxy.mjs     # X/Twitter RSS 代理桥接
    └── custom-api.mjs  # 通用 JSON API + dot-path 导航

templates/
├── curation-rules.md   # DeepClick 5 级信号筛选规则
└── digest-prompt.md    # 6 段式增长简报生成提示词

scripts/
├── deepclick-industry-radar.json  # 23 个精选行业源
└── seed-source-pack.mjs           # 幂等源包导入脚本

migrations/
└── 010_raw_items.sql   # raw_items 表 + 源健康字段

web/
└── index.html          # SPA 前端（DeepClick Radar 品牌）
```

## 基于 ClawFeed

DeepClick Radar 是 [ClawFeed v0.8.1](https://github.com/kevinho/clawfeed) 的定制分支，保留了所有原有功能（多频简报、Source Packs、Mark & Deep Dive、Google OAuth、多语言），并新增了行业情报采集管线和 DeepClick 业务定制内容层。

## License

MIT
