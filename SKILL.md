---
name: deepclick-radar
description: "AI-powered industry radar skill for DeepClick-style paid traffic intelligence. Use this whenever the user wants ad platform hot news, outages, policy changes, attribution updates, community hot discussions, or SEO topic mining around Meta Ads, TikTok Ads, Google Ads, Kwai/Kuaishou ads, post-click conversion, attribution, or paid media operations. Collects from RSS, websites, Reddit, X proxy, and custom APIs."
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
- `references/selection-playbook.md` — Default event clustering and source trust playbook for high-quality digests

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

## 默认执行流程

安装这个 skill 的 Agent 在生成任何 `4h / daily / weekly / monthly / manual` 报告时，默认按下列顺序执行，不要只看最新几条标题后直接写结论。

1. 先从 `/api/raw-items/for-digest` 拉取一个够大的候选池。
   建议：`4h/8h` 读 `40-80` 条，`daily` 读 `80-150` 条。
2. 先做事件聚类，再做摘要。
   同一个 outage、同一个 attribution update、同一个 policy 变化，不要把 Reddit 多条抱怨逐条写进 digest。
3. 优先官方源，其次行业媒体，最后才是社区帖子。
   官方状态页 / 官方产品更新 / 官方政策页 > Search Engine Land / AdExchanger > Reddit/X 社区讨论。
4. 社区帖子默认当“佐证信号”，不是默认主角。
   只有在出现以下任一情况时，社区帖子才可以升到主信号：
   - 官方源还没发，但 2 条以上独立社区帖子在描述同类异常
   - 帖子包含明确量化影响，如预算异常、CVR/CPA 明显变化、审批/归因口径变化
   - 社区帖子本身指向官方公告、状态页或帮助文档
5. 任何报告都要显式过滤低价值帖子。
   包括：纯求助、入门问答、情绪发泄、账号买卖、职业吐槽、泛技巧贴。

## 默认选材边界

这个 skill 的“高质量”默认不是“抓最多”，而是“尽快发现能影响广告投放、归因解释、post-click 转化链路、客户决策的话题”。

默认优先关注：
- 平台 outage、delivery/reporting/login/审核异常
- 归因、tracking、pixel、Conversions API、Privacy Sandbox、ATT 类变化
- Meta / TikTok / Google / Kwai 官方产品更新，尤其是定向、预算、投放位、measurement
- 广告主大面积讨论的异常波动，前提是能形成事件级聚类
- 能直接转成 SEO blog 的“平台变化 -> 广告主影响 -> 应对策略”题目

默认不把这些当成主输出：
- 单人求助帖
- 没有证据的怒骂帖
- “how do I start / worth it / please help” 类入门问题
- 账号租售、代理开户、spam
- 泛营销或职业发展讨论

## 手动生成简报

当用户让 Agent “跑一版报告看看效果”时：

1. 先拉候选池。
2. 依据 `templates/curation-rules.md` 和 `references/selection-playbook.md` 做聚类与过滤。
3. 再按 `templates/digest-prompt.md` 产出。
4. 如果系统可写，优先写入 `/api/digests`，然后返回深链。
5. 如果系统不可写，直接在对话里返回完整 digest，但仍然保持相同结构。

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
