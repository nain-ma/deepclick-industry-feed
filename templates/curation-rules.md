# DeepClick Radar Curation Rules

信号筛选和优先级排序规则。所有进入 digest 的信号必须通过这套规则的筛选。

---

## 4-View 强制过滤器

**任何信号必须通过至少一个视角，否则直接排除：**

1. **CPA/CVR/ROI 影响** — 是否影响转化成本、转化率或投资回报？
2. **Click-to-Conversion 链路影响** — 是否影响 DeepClick 的 post-click 流程（着陆页、回流链接、转化追踪）？
3. **能力影响** — 是否影响回流（"回流"）、再曝光（"再曝光"）、PWA、推送或风控能力？
4. **战略启示** — 是否影响产品路线、销售话术或客户建议？

四个视角全部不过 → 排除，无论多热门。

---

## 信号优先级（5 级）

### Tier 1 — 紧急：平台与政策风险

影响 DeepClick 运营存续的信号。一个 policy change 或 platform outage 可以让回流链路、归因解释或客户判断一夜失真。

**什么算 Tier 1：**
- Meta/Facebook 广告政策变更，限制再营销 pixel 或自定义着陆页
- 浏览器隐私变更（ITP、Privacy Sandbox、cookie 淘汰）破坏追踪/归因
- 重定向/链接限制影响回流链路
- 账户审核/封禁潮影响客户投放
- Meta / TikTok / Google / Kwai 广告平台 outage、delivery/reporting/login/budget 异常
- attribution / measurement 口径变更，导致平台报表与真实点击后转化解释发生偏移

**排序权重：**
- 已执行 > 已公告有时间表 > 传闻/测试中
- 影响 Meta 的 > 跨平台的
- 无法绕过的 > 有 workaround 的

### Tier 2 — 转化链路优化

直接 inform DeepClick 产品演进和客户建议的 post-click 技术创新。

**什么算 Tier 2：**
- 着陆页个性化、动态内容组装、意图路由等 post-click 新技术
- 再曝光策略突破（push 通知、PWA 复访、一方数据重定向）
- 有量化结果的 CRO 实验（特别是电商、App、Lead Gen）
- Web-to-App 桥接创新（deep linking、deferred deep link）
- 有 CPA 下降数据的 post-click 链路重构案例

**排序权重：**
- 有数据（"CVR 提升 15%"）> 仅定性描述
- Meta 流量适用 > 平台无关 > 其他平台
- DeepClick 核心能力相关 > 相邻 CRO 技术

### Tier 3 — 竞品与市场动态

影响 DeepClick 销售话术和差异化定位的竞争信息。

**什么算 Tier 3：**
- 直接竞品（post-click 优化平台）的产品发布
- 竞品叙事转向（从 "着陆页工具" 转向 "转化优化平台"）
- AdTech/MarTech/Growth Infra 领域的融资、并购、合作
- 进入 DeepClick 空间的新测量/增长工具

**排序权重：**
- 直接竞品 > 相邻竞品 > 远距竞品
- 产品发布 > 融资公告 > 招聘信号
- 瞄准 Meta 广告主的 > 通用的

### Tier 4 — 测量/归因/隐私基础设施

DeepClick 依赖的技术基础设施变化。测量断了，优化就无从证明。

**什么算 Tier 4：**
- 浏览器限制更新（Safari ITP、Chrome Privacy Sandbox API、Firefox ETP）
- 广告平台归因窗口变更（Meta 归因设置、Google 转化建模）
- 移动 SDK/API 能力变更（ATT 执行、Android Privacy Sandbox）
- Server-side 追踪方案、Conversions API 更新
- 隐私法规执法行动

**排序权重：**
- 影响 Meta 测量 > 跨平台测量 > 平台无关隐私变化
- 已发布 > 试验中 > 提案阶段
- 影响 server-side > 影响 client-side

### Tier 5 — 市场叙事与增长信号

塑造 DeepClick GTM 策略和客户成功方向的宏观趋势。

**什么算 Tier 5：**
- 广告成本趋势（Meta CPM/CPC 趋势、行业基准）
- 客户端需求信号（对降 CPA 的诉求、对 post-click 优化的兴趣）
- 行业垂直表现（电商、游戏、Fintech 的再曝光 ROI 数据）
- "增长基础设施" 作为品类的市场接受度信号

**排序权重：**
- 有数据支撑 > 个案传闻
- Meta 生态 > 通用数字广告
- DeepClick 当前垂直 > 新垂直

---

## 跨 Tier 排序

Tier 1 > Tier 2 > ... > Tier 5，但 **影响强度可以覆盖 tier 顺序**：

- 高冲击 Tier 3（"直接竞品被大平台收购"）可排在低冲击 Tier 2（"小工具加了 A/B 功能"）前面
- 高冲击 Tier 4（"Chrome 发布新 API 破坏 pixel"）可排在中冲击 Tier 1（"Meta 更新广告文案字数限制"）前面

三维评估：
1. **紧迫度** — 正在发生 > 近期（周/月）> 远期（提案/讨论）
2. **波及面** — 全客户 > 特定垂直 > 边缘场景
3. **可行动性** — 可直接行动 > 战略输入 > 仅知晓

---

## 排除规则

以下内容 **直接过滤**，无论多热门：

1. **无 CPA/CVR/ROI 角度的通用营销技巧** — "提升社媒影响力的 10 个方法"
2. **纯社交媒体八卦** — 平台高管争议、网红纠纷
3. **非核心广告平台独占内容** — 与 Meta / TikTok / Google / Kwai paid traffic 生态无关的专属新闻
4. **无数据的纯观点** — 没有具体信号的 hot take 和预测
5. **与广告无关的开发者工具** — 新 JS 框架、通用 SaaS、与广告/归因/转化无关的基础设施
6. **历史回顾** — "数字广告发展史" 无可行动情报
7. **招聘/职业内容** — 除非招聘模式本身是竞品情报信号
8. **系统运维信息** — 采集状态、error 计数、源健康等工程指标

---

## 事件优先，不是帖子优先

digest 的基本单位应该是“事件”而不是“帖子”。

先做这一步，再决定写什么：

0. 先判断是不是“事件型信号”
   默认重点识别 6 类：
   - outage / incident / 宕机 / delivery-reporting-login 异常
   - policy / 下架 / 限制 / 停止支持
   - measurement / attribution / 回传 / tracking 变化
   - security / CVE / 强制修复
   - deal / 出售 / 收购 / 估值 / 战略剥离
   - feature / rollout / 产品更新
1. 把同平台、同时间窗口、同症状的帖子聚成一簇
2. 给每个事件簇选一条主证据
3. 只把“事件结论”写进 digest
4. 计算“事件成立度”
   满足任一条件即可视为高质量热点：
   - 官方源 1 条
   - 2 个以上独立来源在 12 小时内描述同一变化
   - 社区集中反馈 + 状态页 / Downdetector / 帮助页佐证
   - 带量化影响（CPA/CVR/ROAS/消耗/回传）并有至少 1 条外部佐证

典型例子：

- 6 条 `Meta down / Ads Manager broken / reporting issue / budget overspend` 社区帖
  正确处理：聚成 1 个 `Meta Ads Manager outage` 事件
- 3 个来源在写同一个 `Meta attribution update`
  正确处理：写 1 条主信号，其他来源只作为佐证

---

## 社区帖子硬过滤

以下帖子默认排除，除非正文包含明确量化数据或官方链接：

1. 情绪帖
   例如：`FUCK META`、`Waiting...`
2. 入门问答
   例如：`How do I start Meta ads?`
3. 泛求助
   例如：`Need help`、`Please help`
4. 职业/成长讨论
   例如：`Feeling stuck in PPC`
5. 买卖/租售/黑产边缘内容
   例如：account for sale、agency account for rent

社区帖只有在下面情况下才能升格：

1. 同类异常有 2 条以上独立帖子互相印证
2. 正文包含明确异常症状
   例如：超额花费、无法保存草稿、登录验证失败、Pixel 停止触发
3. 正文包含量化指标
   例如：CPA/ROAS/CTR/CVR 明显变化
4. 帖子指向官方公告、帮助页或状态页

---

## Source Trust Ladder

默认信任顺序：

1. 官方状态页 / 官方产品公告 / 官方帮助中心 / 官方开发者博客
2. Search Engine Land / AdExchanger / Jon Loomer / AppsFlyer 这类专业媒体与专家源
3. Reddit / X / 社区讨论

冲突处理：

- 官方源和社区源冲突时，以官方源为主
- 官方源缺位时，可先用聚类后的社区事件，但要明确标注“社区侧已出现集中反馈”

---

## SEO 题材映射

当用户后续要写 SEO blog，优先把热点事件映射成下面的标题结构：

1. `平台变化是什么`
2. `会影响哪些广告主/开发者`
3. `立刻怎么排查或规避`

示例：

- `TikTok Ads 回传异常` ->
  `TikTok Ads 回传异常怎么办：3 步排查消耗起不来的问题`
- `Unity Asset Store 中国区限制` ->
  `Unity 中国资源商店调整意味着什么：中小团队如何处理旧项目素材依赖`
- `Meta attribution 变化` ->
  `Meta Attribution 变了以后，为什么你的 CPA 看起来更差了？`

---

## 噪音透明度

digest 的 "⚡ 已过滤" section 应如实报告：
- 被过滤的内容数量和类型
- 过滤原因（对应上方排除规则编号）
- 示例（各类型举一个被过滤的标题）

这是建立信任的关键。让增长负责人知道你审阅了全部原始信号、做了严格筛选，而不是随便塞内容。

---

## 语言说明

本文件供 AI 模型消费。中文撰写，保留以下英文术语原样：
- CPA, CVR, ROI, PWA, CRO, post-click, re-engagement, click-to-conversion
- ITP, Privacy Sandbox, SDK, API, ATT, ETP
- "回流"（re-engagement flow）、"再曝光"（re-exposure）、"增长基础设施"（growth infrastructure）
