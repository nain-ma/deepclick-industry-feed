# SEO Signal Radar: 从运营雷达到选题雷达

## Status: draft

## Problem

当前 radar 围绕"对 DeepClick 运营的影响"设计，输出信息单调重复，每天看到差不多的内容。核心问题：

1. **源太少且大量挂掉** — 23 个 source 中 15 个 0 数据（Reddit 全挂、多个 blog RSS 失效），有效源只有 8 个，总计 143 条 raw_items
2. **缺少讨论层** — 全是媒体发布层（RSS blog），无法感知"市场正在热议什么"
3. **过滤模型以相关性为主** — STRONG_INCLUDE_PATTERNS 全是 DeepClick 产品词，导致同类信号反复出现
4. **无热度维度** — 不知道一个话题是 1 个人在说还是 100 个人在说
5. **无已报道去重** — 同一事件反复出现在每期 digest 中

## Goal

把 radar 从"DeepClick 运营影响雷达"转变为 **SEO 选题雷达**：

> 在 48h 窗口内发现"市场正在搜的问题"，快速出 SEO blog 抢排名

## Non-goals

- 不做故障预警（分钟级时效性）— 弱化 outage 监控优先级
- 不做垂直竞品情报 — 当前无直接竞品
- 不做 Google Trends API alpha 申请对接
- 不改 web dashboard UI — 只改数据采集和评分层

## Approach

### 1. 扩源：补讨论层 + 趋势层

**修复现有源（P0）**
- 诊断并修复 Reddit fetcher（4 个 subreddit 全挂）
- 诊断并修复失效的 RSS 源（Jon Loomer、CXL、VWO、AppsFlyer 等）
- HN 从 front_page 改为关键词搜索（用 Algolia `query` 参数限定 ad tech 领域）

**新增趋势发现层（P0）**
- Google Trends Trending RSS — 按 Business & Industry、Technology 品类订阅，捕捉爆发性话题
- Google News RSS — 用关键词（"meta ads", "tiktok ads", "facebook advertising"）构造 RSS，监控全网新文章

**新增语义搜索层（P1）**
- Exa AI — 用 custom_api fetcher 接入，语义搜索 ad tech 领域热门话题（免费 1000 次/月）
- 查询示例："facebook ads policy changes", "meta attribution update", "tiktok ads new features"

**配置 Twitter/X 源（P1）**
- 利用已有的 x-proxy fetcher，配置 5-10 个投放圈 KOL handle
- 候选：@jonloomer, @andrewfoxwell, @Meta4Business, @TikTokBiz 等

### 2. 评分模型：从相关性为主改为热度为主

当前：`score = 来源权重 + 关键词匹配 + 事件类型 + 新鲜度 - 排除惩罚`

改为三维评分：

```
score = 热度分（主）
      + 搜索潜力分（辅）
      + 相关性分（门槛）
      - 已报道惩罚
```

**热度分（新增，权重最大）**
- 跨源出现次数：同一话题在 N 个独立源出现，N 越大分越高
- 时间集中度：48h 内集中爆发 vs 细水长流
- 社交互动量：Reddit score/comments, HN points, Twitter engagement

**搜索潜力分（新增）**
- 标题含疑问模式（how/why/what/怎么/为什么 + 平台名）
- 话题可展开为 "平台变化 → 受影响人群 → 应对方式" 结构
- 来自 Google Trends RSS 的话题自带搜索潜力信号

**相关性分（弱化为门槛）**
- 保留 STRONG/WEAK_INCLUDE_PATTERNS 作为最低门槛
- 不再让相关性主导排序，改为：过门槛即可，排序靠热度

**已报道惩罚（新增）**
- 跟踪最近 N 期 digest 中已出现的 cluster_key
- 同一事件再次出现时大幅降分，除非有"新进展"标记（如新的官方回应、量化数据更新）

### 3. 输出优化

- digest 增加"SEO 选题就绪度"标记：热度高 + 搜索潜力高 + 竞争窗口开 = 标记为 "🔥 立即可写"
- 每条信号附 "搜索热度指示"（跨源出现次数、来源多样性）
- 去重后如无新内容，digest 可以更短而非硬凑

## Risks

- Reddit API 可能持续被限，需要考虑代理或备用方案
- Exa AI 免费额度（1000 次/月）可能不够，需要控制调用频率
- Google Trends RSS 数据粒度较粗，可能需要额外过滤才能聚焦 ad tech
- 评分模型改动较大，需要 A/B 对比确认质量提升

## Success Criteria

- 每日 digest 中 ≥ 50% 信号来自 2 个以上独立源（热度验证）
- 每周至少产出 2-3 个"立即可写"的 SEO 选题
- 连续 3 天 digest 内容不再高度重复
- 有效数据源从 8 个提升到 15+ 个
