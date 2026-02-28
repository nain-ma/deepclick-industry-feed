# DeepClick Industry Curation Rules

This file configures how AI curates industry signals for DeepClick's growth lead. Every signal must be evaluated through the lens of CPA/CVR/ROI impact and the click-to-conversion chain. The rules below replace generic news curation with a structured signal prioritization framework anchored to DeepClick's business positioning.

---

## Signal Priority Framework

Signals are classified into 5 tiers, each mapping directly to a signal category from DeepClick's positioning ("对行业情报系统的直接要求"). Tier 1 is the highest priority; Tier 5 is the lowest. Within each tier, signals are further ranked by immediacy, breadth, and actionability.

---

## Tier 1 (HIGHEST): Platform & Policy Risk

**What this tier covers:** Changes to advertising platforms, policies, tracking mechanisms, and browser privacy features that directly threaten DeepClick's ability to operate its re-engagement links, landing page delivery, and conversion attribution.

### What Qualifies

- A Meta/Facebook ad policy change that restricts re-engagement pixel firing on custom landing pages
- Account-level enforcement changes (review criteria, ad account suspension waves, content restriction policies) that affect DeepClick clients' ability to run campaigns
- Browser or OS privacy changes (ITP updates, Privacy Sandbox milestones, third-party cookie deprecation timelines) that disrupt tracking or attribution links
- Redirect/link restrictions imposed by Meta, Google, or Apple that affect DeepClick's re-engagement flow ("回流") link chains
- Changes to ad auction mechanics or bidding algorithms that alter the cost baseline for click acquisition

### Why It Matters to CPA/CVR/ROI

Platform and policy changes are existential risks. A single policy update can break DeepClick's re-engagement links overnight, making previously optimized post-click flows non-functional. This directly raises CPA (broken flows = wasted clicks) and drops CVR (users cannot complete the conversion path). The growth lead must know about these before they hit production.

### Priority Weight Guidance

- **Immediate enforcement** (already rolling out) > **Announced with timeline** > **Rumored or beta-tested**
- Changes affecting Meta/Facebook specifically rank higher than cross-platform changes (DeepClick's primary channel is Meta)
- Policy changes with workarounds rank lower than hard blocks

---

## Tier 2: Conversion Chain Optimization

**What this tier covers:** Innovations, methodologies, and experiments in post-click optimization, re-engagement strategies, PWA/Web-to-App practices, push re-engagement, and CRO that directly inform DeepClick's core product capability evolution.

### What Qualifies

- New post-click optimization techniques (landing page personalization at scale, dynamic content assembly, intent-based routing)
- Re-engagement ("再曝光") strategy breakthroughs (push notification best practices, PWA re-visit flow optimizations, retargeting via first-party data)
- CRO experiment results with published CVR lift data (especially in e-commerce, app install, or lead gen verticals)
- Web-to-App bridging innovations (deep linking improvements, deferred deep links, app clip / instant app patterns)
- Case studies showing measurable CPA reduction through post-click chain redesign

### Why It Matters to CPA/CVR/ROI

DeepClick's entire value proposition is turning wasted clicks into conversions. Every advancement in post-click methodology is a potential product feature or client recommendation. A new re-engagement pattern that lifts CVR by 5% translates directly into lower CPA for every client using DeepClick's flow.

### Priority Weight Guidance

- Signals with **published quantitative results** (e.g., "15% CVR lift") > Signals with qualitative claims only
- Techniques applicable to **Meta/Facebook ad traffic** > Platform-agnostic techniques > Techniques for other platforms
- Innovations in DeepClick's core capabilities (re-engagement links, landing pages, push, PWA) > Adjacent CRO techniques

---

## Tier 3: Competitor & Market Dynamics

**What this tier covers:** Competitor product updates, narrative shifts, funding/M&A activity, and new tools entering the growth/measurement space that shape DeepClick's sales narrative and product differentiation.

### What Qualifies

- Direct competitors (post-click optimization platforms, landing page builders with optimization features) releasing new capabilities
- Competitor narrative changes visible in marketing copy, case studies, or conference talks (e.g., a competitor pivoting from "landing page builder" to "conversion optimization platform")
- Funding rounds, acquisitions, or partnerships involving companies in AdTech, MarTech, or Growth Infrastructure that signal market direction
- New measurement tools, attribution platforms, or growth infrastructure products that could become partners or competitors
- Industry analyst reports or benchmark studies comparing tools in DeepClick's space

### Why It Matters to CPA/CVR/ROI

The growth lead sells against competitors daily. Knowing that a competitor just raised $50M and is pivoting to post-click optimization changes the sales conversation. Competitor capability gaps become DeepClick selling points. Market consolidation signals which capabilities will become table-stakes vs. differentiators.

### Priority Weight Guidance

- **Direct competitors** (same problem space: post-click optimization, re-engagement) > **Adjacent competitors** (landing page builders, general CRO tools) > **Distant competitors** (full-stack ad platforms)
- Product launches > Funding announcements > Hiring signals
- Moves targeting Meta/Facebook advertiser segment specifically rank highest

---

## Tier 4: Measurement, Attribution & Privacy Infrastructure

**What this tier covers:** Changes to the technical infrastructure that DeepClick's post-click optimization depends on -- browser capabilities, attribution windows, SDK/API changes, data collection strategies, and privacy regulations that affect measurement fidelity.

### What Qualifies

- Browser restriction updates (Safari ITP iterations, Chrome Privacy Sandbox API changes, Firefox Enhanced Tracking Protection updates) that affect cookie or pixel-based measurement
- Attribution window changes by ad platforms (Meta's attribution settings, Google's conversion modeling changes) that affect how DeepClick's impact is measured
- Mobile SDK or API capability changes (App Tracking Transparency enforcement changes, Android Privacy Sandbox progress) that affect DeepClick's data pipeline
- New server-side tracking approaches, Conversions API updates, or first-party data collection frameworks
- Privacy regulation enforcement actions (GDPR fines for tracking, new state privacy laws in the US) that constrain data collection strategies

### Why It Matters to CPA/CVR/ROI

DeepClick's post-click optimization is only as good as its ability to measure what happens after the click. If attribution breaks, DeepClick cannot prove CVR lift. If tracking pixels are blocked, re-engagement flows lose their feedback loop. Measurement infrastructure is the foundation that makes CPA/CVR/ROI optimization possible.

### Priority Weight Guidance

- Changes affecting **Meta/Facebook measurement** specifically > Cross-platform measurement changes > Platform-agnostic privacy changes
- **Already shipping** browser changes > **In origin trial / beta** > **Proposed / spec-stage**
- Changes that affect **server-side** measurement (harder to work around) > **Client-side** changes (more mitigation options)

---

## Tier 5: Market Narrative & Growth Signals

**What this tier covers:** Broader market trends, customer demand signals, ad cost shifts, and industry narratives that influence DeepClick's go-to-market strategy, customer success approach, and product roadmap priorities.

### What Qualifies

- Customer-side demand signals: growing complaints about rising CPA, interest in post-click optimization, demand for "growth infrastructure" solutions
- Ad cost trend data (Meta CPM/CPC trend reports, seasonal cost spikes, vertical-specific cost benchmarks) that create urgency for conversion optimization
- Industry verticals showing increased reliance on re-engagement and post-click flows (e-commerce, gaming, fintech, subscription apps)
- Market acceptance signals for "growth infrastructure" as a category (analyst reports, conference themes, job postings mentioning the category)
- Customer success patterns: which industries or campaign types benefit most from post-click optimization, enabling better targeting of DeepClick's sales efforts

### Why It Matters to CPA/CVR/ROI

These signals do not affect DeepClick's product directly, but they shape the environment in which DeepClick is sold and used. Rising ad costs make post-click optimization more urgent. A vertical showing high re-engagement ROI becomes a target market. Market narratives that validate "growth infrastructure" make DeepClick's pitch easier.

### Priority Weight Guidance

- **Data-backed trends** (published benchmarks, survey results) > **Anecdotal signals** (individual complaints, forum posts)
- Signals about **Meta/Facebook ad ecosystem** specifically > General digital advertising trends
- Signals affecting **DeepClick's current target verticals** > Signals about new verticals

---

## Exclusion Rules

The following types of content should be **filtered out** regardless of how trending or popular they are:

1. **Generic marketing tips** without a CPA/CVR/ROI angle -- "10 Tips to Improve Your Social Media Presence" is not actionable intelligence
2. **Pure social media drama** -- Platform executive controversy, influencer feuds, or viral moments without business impact
3. **Platform-irrelevant content** -- News about TikTok, Snapchat, Pinterest, or other platforms DeepClick does not operate on, UNLESS the policy change has cross-platform implications (e.g., a privacy regulation affecting all platforms)
4. **Opinion pieces without data or concrete impact** -- Hot takes, predictions without evidence, thought leadership that lacks specific signals
5. **Developer tooling unrelated to ad-tech** -- New JavaScript frameworks, general SaaS updates, or infrastructure news that does not touch advertising, attribution, or conversion optimization
6. **Historical retrospectives** -- "The History of Digital Advertising" provides no actionable intelligence
7. **Job postings and career content** -- Unless the hiring pattern itself is a competitive intelligence signal (e.g., a competitor hiring 20 post-click optimization engineers)

---

## Scoring Guidance

### Cross-Tier Ranking

Tier 1 signals always outrank Tier 5 signals when both are present. However, impact intensity matters within and across tiers:

- A **HIGH-impact Tier 3** signal (e.g., "Direct competitor acquired by major ad platform") can outrank a **LOW-impact Tier 2** signal (e.g., "Minor CRO tool adds A/B test feature")
- A **HIGH-impact Tier 4** signal (e.g., "Chrome ships Privacy Sandbox API that breaks conversion pixel") can outrank a **MEDIUM-impact Tier 1** signal (e.g., "Meta updates ad copy length limits")

### Scoring Factors

For each signal, evaluate across three dimensions:

1. **Immediacy** -- How soon does this affect DeepClick or its clients?
   - Immediate (happening now, already enforced): HIGH
   - Near-term (announced, shipping in weeks/months): MEDIUM
   - Long-term (proposed, in discussion, speculative): LOW

2. **Breadth** -- How many DeepClick clients are affected?
   - All clients (platform-wide changes): HIGH
   - Specific verticals (e-commerce only, gaming only): MEDIUM
   - Edge cases (specific account types, specific regions): LOW

3. **Actionability** -- Can the growth lead do something with this information?
   - Direct action possible (notify clients, adjust flows, update product): HIGH
   - Strategic input (inform roadmap, adjust sales pitch): MEDIUM
   - Awareness only (good to know, no immediate action): LOW

### Combined Score

A signal's effective priority = Tier weight x (Immediacy + Breadth + Actionability). Use this to determine ordering within a digest. When two signals from different tiers have similar combined scores, the higher tier wins.

---

## 4-View Mandatory Filter

Before including ANY signal in the curated output, it must pass at least one of these four lenses (derived from DeepClick's default output perspective / "行业情报系统的默认输出视角"):

1. **CPA/CVR/ROI Impact** -- Does this signal affect the cost, rate, or return of conversions?
2. **Click-to-Conversion Chain Impact** -- Does this signal affect any part of DeepClick's post-click flow (landing page, re-engagement link, conversion tracking)?
3. **Capability Implications** -- Does this signal have implications for re-engagement ("回流"), re-exposure ("再曝光"), PWA, push, or risk control capabilities?
4. **Strategic Inspiration** -- Does this signal inspire changes to product roadmap, sales narrative, or client recommendations?

**If a signal passes NONE of these four lenses, exclude it** -- regardless of general industry interest, trending status, or source authority. The intelligence system exists to serve DeepClick's business context, not to provide general industry news.

---

## Language Note

This file is consumed by AI models. It is written in English with Chinese business terms preserved where they add semantic precision:

- "回流" (huiliU) -- re-engagement flow, bringing lost users back to conversion path
- "再曝光" (zai baoguang) -- re-exposure, showing the product/page again to users who did not convert
- "增长基础设施" (zengzhang jichu sheshi) -- growth infrastructure, the underlying capability layer for growth outcomes

These terms should be understood and preserved in analysis output.
