---
name: deepclick-radar
description: "AI-powered news digest tool with DeepClick industry intelligence extensions. Collects from RSS, websites, Reddit, X proxy, and custom APIs."
metadata: { "requires": { "bins": ["node"], "env": [] } }
user-invokable: false
disable-model-invocation: false
---

# ClawFeed

AI-powered news digest tool. Automatically generates structured summaries (4H/daily/weekly/monthly) from Twitter and RSS feeds.

## Credentials & Dependencies

ClawFeed runs in **read-only mode** with zero credentials — browse digests, view feeds, switch languages. Authentication features (bookmarks, sources, packs) require additional credentials.

| Credential | Purpose | Required |
|-----------|---------|----------|
| `GOOGLE_CLIENT_ID` | Google OAuth login | For auth features |
| `GOOGLE_CLIENT_SECRET` | Google OAuth login | For auth features |
| `SESSION_SECRET` | Session cookie encryption | For auth features |
| `API_KEY` | Digest creation endpoint protection | For write API |

**Runtime dependency:** SQLite via `better-sqlite3` (native addon, bundled). No external database server required.

## Setup

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env
# Edit .env with your settings

# Start API server
npm start
```

## Environment Variables

Configure in `.env` file:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DIGEST_PORT` | Server port | No | 8767 |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | For auth | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | For auth | - |
| `SESSION_SECRET` | Session cookie encryption key | For auth | - |
| `API_KEY` | Digest creation API key | For write API | - |
| `AI_DIGEST_DB` | SQLite database path | No | `data/digest.db` |
| `ALLOWED_ORIGINS` | CORS allowed origins | No | localhost |

## API Server

Runs on port `8767` by default. Set `DIGEST_PORT` env to change.

### Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/digests | List digests (?type=4h\|daily\|weekly&limit=20&offset=0) | - |
| GET | /api/digests/:id | Get single digest | - |
| POST | /api/digests | Create digest (internal) | - |
| GET | /api/auth/google | Start Google OAuth flow | - |
| GET | /api/auth/callback | OAuth callback endpoint | - |
| GET | /api/auth/me | Get current user info | Yes |
| POST | /api/auth/logout | Logout user | Yes |
| GET | /api/marks | List user bookmarks | Yes |
| POST | /api/marks | Add bookmark | Yes |
| DELETE | /api/marks/:id | Remove bookmark | Yes |
| GET | /api/config | Get configuration | - |
| PUT | /api/config | Update configuration | - |

## Web Dashboard

Serve `web/index.html` via your reverse proxy or any static file server.

## Templates

- `templates/curation-rules.md` — Customize feed curation rules
- `templates/digest-prompt.md` — Customize the AI summarization prompt

## Configuration

Copy `config.example.json` to `config.json` and edit. See README for details.

## Reverse Proxy (Caddy example)

```
handle /digest/api/* {
    uri strip_prefix /digest/api
    reverse_proxy localhost:8767
}
handle_path /digest/* {
    root * /path/to/clawfeed/web
    file_server
}
```


## 当前输出规范（2026-03）

- 摘要与结论默认使用**中文**输出。
- 每条信号使用来源前缀：`@来源名 - 描述`（例如 `@TechCrunch - ...`、`@r/FacebookAds - ...`）。
- 每条信号末尾单独一行：`原文链接：<url>`。
- Feed 正文**不展示** `Content Pool (JSON)`。

## 调试与模板迭代（给老板快速看样）

当需要“先看当前模板长什么样，再改版”时，使用工作区调试脚本：

```bash
cd /Users/qiqian/.openclaw/workspace-blogger-lumi
python3 feed_template_debug.py   --config feed_debug.config.json   --items feed_debug.items.sample.json   --out feed_preview.md
```

可调参数：
- `top_n` / `signals_n`：控制 Top 与 Signals 数量
- `max_main_chars`：控制主文长度（0 为不截断）
- `include_content_pool`：是否在调试输出中附结构化池（仅调试用）

> 生产环境按老板口径：由 Agent 主动执行调试并回传预览，不要求老板手动跑脚本。

## Blog 结构化数据源（CLI）

Feed 页面不展示 Content Pool，但可通过 CLI 导出用于自动写作的结构化数据：

```bash
cd /Users/qiqian/.openclaw/workspace-blogger-lumi
python3 scripts/export_blog_pool.py --date 2026-03-02 --type all --out outputs/blog_pool_2026-03-02.json
```

参数说明：
- `--date`：按 Asia/Shanghai 本地日期筛选（必填）
- `--type`：`all|4h|daily|weekly|monthly`
- `--limit`：最多读取多少条 digest（默认 20）
- `--out`：导出文件路径（`-` 表示打印到 stdout）

典型场景：
- 需要生成热点 Blog 时，先导出当天/近几天结构化素材，再进入选题与成稿流程。

## 手动抓取跨会话规则（强制）

- 任何来自聊天对话的“抓取/检索/专题拉取”请求，统一按**手动抓取**处理。
- 手动抓取结果必须写入 `manual` panel（与定时 8H/日报看板隔离）。
- 完成后必须返回可访问深链：`https://radar.qiliangjia.one/#manual/<digest_id>`。
- 不允许将手动抓取结果混入定时看板。
