# SEO Signal Radar — Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Source Layers                           │
├──────────────────┬──────────────────┬───────────────────────┤
│  发布层 (现有)    │  讨论层 (新增)    │  趋势层 (新增)        │
│  RSS blogs       │  Reddit (修复)   │  Google Trends RSS    │
│  Official blogs  │  Twitter/X KOL   │  Google News RSS      │
│  HN (改为搜索)   │                  │  Exa AI 语义搜索      │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                    │
         ▼                  ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    raw_items (SQLite)                        │
│  + 新字段: source_layer (publish|discuss|trend)              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Scoring Engine (source-policy.mjs)              │
│                                                             │
│  ┌───────────┐  ┌───────────────┐  ┌──────────────┐        │
│  │ 热度分     │  │ 搜索潜力分     │  │ 相关性门槛   │        │
│  │ (主 50%)  │  │ (辅 30%)      │  │ (门槛 20%)  │        │
│  └───────────┘  └───────────────┘  └──────────────┘        │
│                                                             │
│  ┌──────────────────────────────────────┐                   │
│  │ 已报道惩罚 (digest_history tracker)   │                   │
│  └──────────────────────────────────────┘                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Digest Output                             │
│  + SEO 选题就绪度标记                                         │
│  + 跨源热度指示                                               │
│  + 去重：已报道事件不再重复                                     │
└─────────────────────────────────────────────────────────────┘
```

## 1. Source Layer 分类

给 sources 表新增 `layer` 字段，标记每个源属于哪一层：

| Layer | 含义 | 代表源 |
|-------|------|--------|
| `publish` | 媒体/官方发布 | AdExchanger, Meta Newsroom, SEJ |
| `discuss` | 社区讨论 | Reddit, Twitter/X, HN |
| `trend` | 趋势发现 | Google Trends RSS, Google News RSS, Exa AI |

**热度信号的核心逻辑**：当 `publish` 层和 `discuss` 层同时出现同一话题 → 高热度。当 `trend` 层也命中 → 确认有搜索潜力。

## 2. 新增 Source 配置

### Google Trends Trending RSS

```json
{
  "name": "Google Trends: Business",
  "type": "rss",
  "config": { "url": "https://trends.google.com/trending/rss?geo=US&cat=12" },
  "layer": "trend"
}
```

```json
{
  "name": "Google Trends: Technology",
  "type": "rss",
  "config": { "url": "https://trends.google.com/trending/rss?geo=US&cat=5" },
  "layer": "trend"
}
```

### Google News RSS (关键词监控)

```json
{
  "name": "Google News: Meta Ads",
  "type": "rss",
  "config": { "url": "https://news.google.com/rss/search?q=%22meta+ads%22+OR+%22facebook+ads%22+when:3d&hl=en-US&gl=US&ceid=US:en" },
  "layer": "trend"
}
```

```json
{
  "name": "Google News: TikTok Ads",
  "type": "rss",
  "config": { "url": "https://news.google.com/rss/search?q=%22tiktok+ads%22+OR+%22tiktok+advertising%22+when:3d&hl=en-US&gl=US&ceid=US:en" },
  "layer": "trend"
}
```

```json
{
  "name": "Google News: Ad Tech",
  "type": "rss",
  "config": { "url": "https://news.google.com/rss/search?q=%22attribution%22+OR+%22conversion+api%22+OR+%22privacy+sandbox%22+advertising+when:3d&hl=en-US&gl=US&ceid=US:en" },
  "layer": "trend"
}
```

### HN 关键词搜索（改造现有）

把 HN source 的 config 从 front_page 改为关键词搜索：

```json
{
  "name": "HN: Ad Tech",
  "type": "hackernews",
  "config": {
    "filter": "search",
    "query": "facebook ads OR meta ads OR tiktok ads OR google ads OR attribution OR ad tech",
    "min_score": 20
  },
  "layer": "discuss"
}
```

需要在 `hackernews.mjs` 中支持 `filter: "search"` + `query` 参数，走 Algolia search endpoint。

### Exa AI 语义搜索

```json
{
  "name": "Exa: Ad Platform Changes",
  "type": "custom_api",
  "config": {
    "url": "https://api.exa.ai/search",
    "method": "POST",
    "headers": { "x-api-key": "${EXA_API_KEY}" },
    "body": {
      "query": "recent changes to facebook meta advertising platform affecting advertisers",
      "num_results": 10,
      "use_autoprompt": true,
      "start_published_date": "{{3_days_ago}}"
    },
    "items_path": "results",
    "title_field": "title",
    "url_field": "url",
    "content_field": "text",
    "date_field": "publishedDate"
  },
  "layer": "trend"
}
```

需要在 `custom-api.mjs` 中支持 POST 请求 + 动态日期模板。

### Twitter/X KOL

```json
{
  "name": "X: @jonloomer",
  "type": "twitter_feed",
  "config": { "handle": "jonloomer" },
  "layer": "discuss"
}
```

其他候选 handle：`andrewfoxwell`, `caborowsky`, `Meta4Business`, `TikTokBiz`, `nicholasjberry`

## 3. 评分模型改造

### 当前结构 (source-policy.mjs)

```
evaluateRawItem(item) → { accepted, score, ... }
rankRawItems(items) → sorted & deduped items
```

### 新结构

```
evaluateRawItem(item, { digestHistory }) → {
  accepted,
  heat_score,        // 新: 热度分
  search_potential,  // 新: 搜索潜力分
  relevance_score,   // 改: 降为门槛
  novelty_penalty,   // 新: 已报道惩罚
  final_score,       // 新: 加权总分
  seo_readiness,     // 新: "ready" | "maybe" | "low"
  ...
}
```

### 热度分计算

在 `rankRawItems` 中的聚类阶段计算：

```javascript
heat_score =
  cross_source_count * 8          // 跨源出现次数 (max 40)
  + source_diversity * 6          // 不同来源名 (max 24)
  + layer_diversity * 12          // 跨层出现 (max 36, publish+discuss+trend)
  + time_concentration * 10       // 48h 内集中度 (max 10)
  + engagement_normalized         // 社交互动量归一化 (max 15)
```

### 搜索潜力分计算

```javascript
search_potential =
  question_pattern * 10           // 标题含 how/why/what/怎么/为什么 (0 or 10)
  + platform_named * 8            // 标题含平台名 (0 or 8)
  + expandable_structure * 6      // 可展开为 "变化→影响→应对" (0 or 6)
  + from_trend_layer * 12         // 来自趋势层源 (0 or 12)
  + has_quant_data * 8            // 含量化数据 (0 or 8)
```

### 已报道惩罚

```javascript
// 查最近 5 期 digest 的 cluster_key
novelty_penalty =
  appeared_in_last_digest ? -60   // 上一期出过：几乎排除
  : appeared_in_recent_3 ? -30   // 最近 3 期出过：大幅降分
  : 0

// 例外：有"新进展"标记时减半
if (has_new_development) novelty_penalty *= 0.5
```

### 最终得分

```javascript
final_score = heat_score * 0.5
            + search_potential * 0.3
            + relevance_score * 0.2
            + novelty_penalty
```

### SEO 就绪度

```javascript
seo_readiness =
  (heat_score >= 30 && search_potential >= 20) ? 'ready'
  : (heat_score >= 15 || search_potential >= 15) ? 'maybe'
  : 'low'
```

## 4. DB Schema Changes

### Migration 011: source layer + digest history

```sql
-- Source layer classification
ALTER TABLE sources ADD COLUMN layer TEXT DEFAULT 'publish'
  CHECK(layer IN ('publish', 'discuss', 'trend'));

-- Digest history for novelty tracking
CREATE TABLE IF NOT EXISTS digest_item_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  digest_id INTEGER NOT NULL REFERENCES digests(id),
  cluster_key TEXT NOT NULL,
  item_title TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_dih_cluster ON digest_item_history(cluster_key);
CREATE INDEX IF NOT EXISTS idx_dih_created ON digest_item_history(created_at DESC);
```

## 5. Fetcher Changes

### hackernews.mjs

新增 `filter: "search"` 支持：

```javascript
const ALGOLIA_ENDPOINTS = {
  front_page: 'https://hn.algolia.com/api/v1/search?tags=front_page',
  top: 'https://hn.algolia.com/api/v1/search?tags=front_page',
  new: 'https://hn.algolia.com/api/v1/search_by_date?tags=story',
  search: 'https://hn.algolia.com/api/v1/search?tags=story', // NEW
};

// When filter=search, append &query=... from config.query
```

### custom-api.mjs

支持 POST 请求 + 动态日期模板：

- `config.method` — 支持 GET (默认) 和 POST
- `config.body` — POST body (JSON)
- `config.headers` — 自定义 headers，支持 `${ENV_VAR}` 替换
- 日期模板 `{{3_days_ago}}` → 替换为 ISO 日期

### reddit.mjs

诊断并修复（可能的原因）：
- Reddit 403/429 限速 → 加 retry + backoff
- old.reddit.com JSON 返回 HTML → 检测并切换 User-Agent
- 需要 cookie 或 OAuth → 考虑 Reddit API token

## 6. Digest Prompt 更新

在 `templates/digest-prompt.md` 中调整：

- 主排序标准改为热度，不再是 DeepClick 相关性
- 每条信号显示"热度来源"（例：`📡 3 源 · 2 层`）
- 新增 `🎯 立即可写` 标记
- 已报道事件除非有新进展，否则不出现
- digest 允许精简（5 条高质量 > 12 条低质量）
