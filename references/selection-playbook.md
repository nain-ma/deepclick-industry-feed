# DeepClick Radar Selection Playbook

这个文件定义默认的“高质量行业雷达”选材策略。任何安装了 `deepclick-radar` 的 Agent，在没有用户给出额外规则时，都按这套 playbook 处理候选池。

## 目标

不是做“广告社区热帖搬运”，而是做“付费流量行业雷达”。

输出应优先回答这 4 个问题：

1. 哪个平台出故障了？
2. 哪个平台改规则了？
3. 哪个平台改产品了？
4. 这些变化会如何影响广告主的转化、归因或 post-click 链路？

## Source Trust Ladder

默认信任顺序：

1. 官方状态页、官方产品公告、官方帮助中心、官方开发者博客
2. 行业媒体和专业博客
   例如：Search Engine Land、AdExchanger、Jon Loomer、AppsFlyer
3. 社区讨论
   例如：r/FacebookAds、r/PPC、r/TikTokAds

使用规则：

- 如果官方源和社区源同时存在，优先写官方源，社区源只用来补“影响体感”。
- 如果只有社区源，必须满足“事件聚类规则”后才可升为主信号。
- 单条社区帖子默认不是热点事件。

## 事件聚类规则

把候选池先聚成“事件”，再决定写不写。

默认先识别 6 类事件：

1. `outage`
   平台宕机、delivery/reporting/login/审核/消耗异常
2. `policy`
   下架、停止支持、组织或区域限制、商店限制
3. `measurement`
   attribution、回传、tracking、pixel、Conversions API 变化
4. `security`
   CVE、漏洞、强制更新
5. `deal`
   出售、收购、估值、战略剥离
6. `feature`
   官方产品更新、rollout、新能力发布

以下情况视为同一事件：

- 同一平台在同一时间窗口内出现多个 outage / down / high disruption / site issue 帖子
- 同一 attribution / policy / product update 被多个来源重复描述
- 同一广告异常被多个广告主报告，且症状一致

每个事件簇只保留 1-2 条代表性证据：

- 首选官方源
- 没有官方源时，保留“信息最完整”或“互动最高”的社区帖
- 不要把 6 条“Meta down”写成 6 条信号

## 多源确认规则

优先按事件成立度来决定是否入选，而不是按单条帖子热度。

高置信事件：
- 1 条官方源
- 或 2 个以上独立来源在 12 小时内描述同一事件
- 或 社区集中报障 + 状态页 / Downdetector / 帮助页佐证

中置信事件：
- 2 条以上社区或媒体来源，症状一致
- 或 单条高互动社区帖且含明确量化影响

低置信事件：
- 单条社区吐槽或单条转载，且没有量化数据、没有佐证

低置信事件默认不写进摘要，除非用户明确要求“把疑似信号也列出来”。

## 社区帖子准入规则

社区帖子只有在下面三类情况下才值得进入 digest：

1. 异常事件
   例如：预算异常消耗、Ads Manager 无法保存、报表失真、Pixel 失灵、审核异常
2. 规则/口径变化的真实影响
   例如：广告主在讨论 attribution update 之后 ROAS/CPA 如何重解释
3. 高价值实操问题
   例如：低量转化优化、离线回传失效、跨平台 tracking 断裂

以下社区帖默认过滤：

- 情绪发泄
- 单纯求助
- 入门问答
- 职业吐槽
- 代理开户、账号租售、spam

## 标题级红旗

出现以下模式，默认判为低质量，除非正文里有明确数据或官方链接：

- `FUCK META`
- `Waiting...`
- `Need help`
- `Please help`
- `How do I start`
- `Worth it?`
- `Feeling stuck`
- `DM for more`
- `account for sale`
- `agency accounts for rent`

## 紧急警报准入标准

`🔥 紧急警报` 只放真正需要老板当天感知的东西：

- 平台 outage / disruption
- 审核 / 账户 / budget / delivery 异常
- attribution / measurement / privacy 口径变化
- 会让客户错误解读数据的重大变化

如果只是“一个广告主投放效果差”，不要放进紧急警报。

## SEO Blog 友好改写

当用户后续要基于 digest 写 SEO blog，优先保留这类话题：

- `平台变化 -> 为什么广告主数据突然变差`
- `outage / attribution change -> 如何识别平台问题还是落地页问题`
- `平台新功能 -> 为什么 post-click optimization 反而更重要`
- `tracking / policy / budget rule -> 广告主应该怎么调整`

不优先保留：

- 单条求助帖
- 纯经验分享
- 无法外扩成行业命题的小问题
