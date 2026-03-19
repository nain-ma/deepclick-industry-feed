# SEO Signal Radar — Tasks

## Phase 1: 修复 + 快速扩源（让数据先流起来）

### Task 1.1: 诊断并修复 Reddit fetcher
- [x] 手动运行 Reddit fetcher，记录错误信息
- [x] 判断是 403/429/HTML 响应中的哪种
- [x] 修复 `reddit.mjs`（加 retry/backoff，或切换 UA/endpoint）
- [x] 验证 4 个 subreddit 都能正常拉数据

> 结论：fetcher 代码无问题，是 TLS 临时网络错误。已重置 last_fetched_at 让 collector 重试。

### Task 1.2: 诊断并修复失效 RSS 源
- [x] 逐个检查 0 数据的 RSS 源 URL 是否还有效
- [x] 修复或替换失效的 RSS URL
- [x] 清理确认已死的源（标记 is_active=0）

> CXL (Cloudflare挡), Adjust (404), TechCrunch Ads (404) 已标记 inactive。
> Jon Loomer, Instapage, VWO, Chromium Blog 已重置待重试。

### Task 1.3: HN 改为关键词搜索
- [x] `hackernews.mjs` 新增 `filter: "search"` + `query` 参数支持
- [x] 更新 HN source config：关键词限定 ad tech 领域，降低 min_score 到 5
- [x] 验证搜索结果质量

> Algolia 不支持 OR 语法，改为拆分成多个 HN source（advertising, facebook ads, google ads, privacy tracking）。

### Task 1.4: 新增 Google Trends Trending RSS 源
- [x] 验证 Google Trends RSS URL 格式可用（Business, Technology 品类）
- [x] 在 sources 表中插入 Google Trends RSS source
- [ ] 运行 collector 验证数据入库

### Task 1.5: 新增 Google News RSS 关键词监控源
- [x] 构造 Google News RSS URL（meta ads, tiktok ads, ad tech 关键词）
- [x] 在 sources 表中插入 4 个 Google News RSS source
- [ ] 运行 collector 验证数据入库

### Task 1.6: 配置 Twitter/X KOL 源
- [ ] 确定 5-10 个 ad tech KOL handle
- [ ] 在 sources 表中插入 twitter_feed source
- [ ] 验证 x-proxy fetcher 能正常拉取

> BLOCKED: 所有 X proxy（RSSHub, rss-bridge, twiiit, nitter, xcancel）均返回 403/空。
> 需要自建 proxy 或等公共实例恢复。

## Phase 2: DB + Source Layer

### Task 2.1: Migration 011 — source layer + digest history
- [x] 创建 `migrations/011_source_layer.sql`
- [x] sources 表加 `layer` 字段
- [x] 新建 `digest_item_history` 表
- [x] 运行 migration 验证

### Task 2.2: 给现有源标记 layer
- [x] 更新所有现有 source 的 layer 字段
- [x] 新增的趋势源标记为 `trend`
- [x] Reddit/Twitter/HN 标记为 `discuss`
- [x] 其余标记为 `publish`

## Phase 3: 评分模型改造

### Task 3.1: 热度分计算
- [x] 在 `source-policy.mjs` 的 `rankRawItems` 聚类阶段计算 `heat_score`
- [x] 维度：跨源出现次数、来源多样性、层多样性、时间集中度、互动量
- [x] 单元测试验证

### Task 3.2: 搜索潜力分计算
- [x] 新增 `searchPotentialScore(item)` 函数
- [x] 维度：疑问模式、平台名、可展开结构、趋势层来源、量化数据
- [x] 单元测试验证

### Task 3.3: 已报道惩罚
- [x] 在 `rankRawItems` 中接收 `digestHistory` 参数
- [x] 查询 `digest_item_history` 获取最近 5 期 cluster_key（db.mjs: getRecentDigestHistory）
- [x] 实现惩罚逻辑（上期 -60, 近 3 期 -30）
- [x] digest 生成后写入 `digest_item_history`（db.mjs: insertDigestHistory）

### Task 3.4: 最终得分 + SEO 就绪度
- [x] 改 `evaluateRawItem` 输出新字段：searchPotential
- [x] `rankRawItems` 输出：heat_score, search_potential, novelty_penalty, final_score, seo_readiness
- [x] 改排序逻辑：`final_score` 为主排序键
- [x] 保留相关性作为门槛（不过门槛的仍然 reject），但放宽过滤条件

## Phase 4: Exa AI 接入

### Task 4.1: custom-api.mjs 增强
- [x] 支持 `config.method: "POST"`
- [x] 支持 `config.body` (JSON POST body)
- [x] 支持 `config.headers` 中的 `${ENV_VAR}` 替换
- [x] 支持日期模板 `{{3_days_ago}}` 等

### Task 4.2: 配置 Exa AI 源
- [ ] 注册 Exa AI，获取 API key
- [ ] 配置 2-3 个 Exa 语义搜索 source
- [ ] 验证数据入库

> BLOCKED: 需要用户注册 Exa AI 获取 API key 后配置。

## Phase 5: 输出优化

### Task 5.1: 更新 digest-prompt.md
- [x] 主排序改为热度
- [x] 每条信号显示热度来源指示
- [x] 新增 SEO 就绪度标记
- [x] 已报道事件默认不出现
- [x] digest 允许精简

### Task 5.2: 更新 curation-rules.md
- [x] 反映新的评分模型权重
- [x] 明确"热度优先"原则
- [x] 更新社区帖子准入规则（配合讨论层角色）

### Task 5.3: 更新 selection-playbook.md
- [x] 反映三层源架构
- [x] 更新事件聚类规则（考虑层多样性）
- [x] 更新 SEO blog 选题映射规则
