# DeepClick Radar Curation Rules

信号筛选和优先级排序规则。核心原则：**热度优先，搜索潜力驱动。**

---

## 三层源架构

信号来自三个层次，跨层确认是热度的核心指标：

| 层 | 含义 | 代表源 |
|---|------|--------|
| **publish** | 媒体/官方发布 | AdExchanger, Meta Newsroom, SEJ, Google Ads Blog |
| **discuss** | 社区讨论 | Reddit, HN, Twitter/X |
| **trend** | 趋势发现 | Google Trends RSS, Google News RSS, Exa AI |

**核心逻辑**：当 publish + discuss 同时出现同一话题 → 高热度。当 trend 层也命中 → 确认有搜索潜力。

---

## 评分模型

### 最终得分公式

```
final_score = heat_score × 0.5 + search_potential × 0.3 + relevance_score × 0.2 + novelty_penalty
```

### 热度分（主维度，50% 权重）

| 维度 | 计算 | 上限 |
|------|------|------|
| 跨源出现次数 | count × 8 | 40 |
| 来源多样性 | (unique_sources - 1) × 6 | 24 |
| 层多样性 | (unique_layers - 1) × 12 | 36 |
| 时间集中度 | 48h 内 = 10, 7d 内 = 5, 其他 = 2 | 10 |
| 互动量 | 归一化的 score/comments | 15 |

### 搜索潜力分（辅维度，30% 权重）

| 维度 | 条件 | 分值 |
|------|------|------|
| 疑问模式 | 标题含 how/why/what/怎么/为什么 | +10 |
| 平台名 | 标题含 meta/facebook/tiktok/google ads | +8 |
| 可展开结构 | 可写成 "变化→影响→应对" | +6 |
| 趋势层来源 | 来自 Google Trends/News | +12 |
| 量化数据 | 含百分比或 CPA/CVR/ROI | +8 |

### 相关性分（门槛，20% 权重）

保留原有的 STRONG/WEAK_INCLUDE_PATTERNS 和 EXCLUDE_PATTERNS。
相关性现在是**入选门槛**，不是排序主键。通过门槛即可，排序靠热度和搜索潜力。

### 已报道惩罚

| 条件 | 惩罚 |
|------|------|
| 上一期 digest 出过 | -60 |
| 最近 3 期出过 | -30 |
| 更早出过 | -10 |

---

## 硬过滤规则（保留）

以下内容直接排除，不论热度：

1. **EXCLUDE_PATTERNS 命中且无 STRONG 匹配** — openai, anthropic, github, macbook, iphone 等
2. **低质量社区标题** — FUCK, Waiting, Need help, How do I start, account for sale
3. **低质量内容** — DM for more, I just wanna start（除非有量化数据）

### 放宽的规则

以下原有硬过滤已放宽：
- ~~来自 watchlist 源且无 STRONG 匹配~~ → 如果热度高（多源讨论），仍可入选
- ~~来自 core 源但无 STRONG/WEAK 匹配~~ → 如果热度高，仍可入选
- 趋势层（trend）来源的信号免除 EXCLUDE 过滤

---

## SEO 就绪度分级

| 级别 | 条件 | 含义 |
|------|------|------|
| **ready** | heat ≥ 30 且 search_potential ≥ 20 | 立即可写，进入 🔥 区域 |
| **maybe** | heat ≥ 15 或 search_potential ≥ 15 | 值得关注，可能值得写 |
| **low** | 其他 | 仅供参考 |

---

## 信号优先级（简化为 3 级）

### 🔥 立即可写

`seo_readiness: "ready"` 的信号。多源讨论 + 有搜索潜力 + 可展开为 SEO blog。

### 📋 值得关注

`seo_readiness: "maybe"` 的信号。有一定热度或搜索潜力，但还不够立即行动。

### 仅记录

`seo_readiness: "low"` 的信号。通过了基本过滤但热度和搜索潜力都不高。一般不进 digest。

---

## 事件优先，不是帖子优先

digest 的基本单位仍然是"事件"而不是"帖子"。保留原有的聚类逻辑。

新增：**层多样性**作为事件质量指标。跨层事件（publish + discuss）比单层事件更有价值。

---

## SEO 题材映射

优先把热点事件映射成以下标题结构：

1. `平台变化是什么`
2. `会影响哪些广告主/开发者`
3. `立刻怎么排查或规避`

**新增**：每个建议题材附热度证据（"N 个来源在讨论"、"Google Trends 上升"）。

---

## 噪音透明度

"⚡ 已过滤" section 应如实报告，**新增**：
- 被过滤的已报道重复事件数量
- 因热度不足被降级的信号数量

---

## 语言说明

本文件供 AI 模型消费。中文撰写，保留以下英文术语原样：
- CPA, CVR, ROI, PWA, CRO, post-click, re-engagement, click-to-conversion
- ITP, Privacy Sandbox, SDK, API, ATT, ETP
- heat_score, search_potential, seo_readiness, final_score
