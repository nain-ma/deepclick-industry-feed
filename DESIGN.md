# Design System — DeepClick Radar

## Product Context
- **What this is:** SEO 信号雷达，捕捉市场热点信号用于快速写 SEO blog 引流
- **Who it's for:** 增长团队，每天 2 分钟扫描 digest
- **Space/industry:** Ad tech / SEO intelligence / market signal monitoring
- **Project type:** Information-dense dashboard (信号分诊台)

## Aesthetic Direction
- **Direction:** Vercel/shadcn — 极简、克制、高对比度、功能优先
- **Decoration level:** Minimal — 无渐变装饰、无阴影堆砌，只用边框和背景色建立层次
- **Mood:** 专业、干净、信息密集但不拥挤。像 Bloomberg Terminal 的克制 + Vercel Dashboard 的优雅
- **Reference:** Vercel Dashboard, shadcn/ui, Linear

## Typography
- **Display/Hero:** Geist Sans Variable — Vercel 官方字体，紧凑现代，极佳的 letter-spacing
- **Body:** Geist Sans Variable — 同一字体族统一视觉
- **UI/Labels:** Geist Sans Variable (weight 500)
- **Data/Tables:** Geist Mono Variable — tabular-nums, 数据对齐
- **Code:** Geist Mono Variable
- **Loading:** `@fontsource-variable/geist-sans` + `@fontsource-variable/geist-mono` (npm 包，自托管)
- **Scale:**
  - xs: 11px (badges, timestamps)
  - sm: 12px (labels, meta)
  - base: 13px (body, feed items)
  - md: 14px (section titles, card titles)
  - lg: 16px (page section headers)
  - xl: 30px (stat values, Geist Mono)

## Icons
- **Library:** Lucide React (`lucide-react`)
- **Size convention:** 16px default, 14px in compact contexts, 20px for emphasis
- **Stroke width:** 1.75 (shadcn default)
- **Usage rules:**
  - 所有 UI 图标必须使用 Lucide，禁止使用 emoji
  - 信号类型图标映射:
    - 转化链路: `Lightbulb`
    - 竞品动态: `Swords`
    - 基础设施: `Wrench`
    - 市场趋势: `TrendingUp`
    - 平台异常: `Flame`
  - 通用图标: `Settings`, `Radio` (源管理), `ChevronRight`, `ExternalLink`, `Bookmark`, `Filter`, `Clock`, `Search`
  - 状态图标: `Check`, `AlertTriangle`, `X`, `Info`

## Color
- **Approach:** Restrained — shadcn/ui zinc 灰阶为主，语义色只在信号分级时使用
- **System:** HSL CSS variables (shadcn convention)

### Dark Mode (default)
| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| background | 240 10% 3.9% | #09090B | Page bg |
| card | 240 10% 3.9% | #09090B | Card bg (same as page) |
| muted | 240 3.7% 15.9% | #27272A | Hover states, secondary bg |
| border | 240 3.7% 15.9% | #27272A | All borders |
| foreground | 0 0% 98% | #FAFAFA | Primary text |
| muted-foreground | 240 5% 64.9% | #A1A1AA | Secondary text |

### Light Mode
| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| background | 0 0% 100% | #FFFFFF | Page bg |
| card | 0 0% 100% | #FFFFFF | Card bg |
| muted | 240 4.8% 95.9% | #F4F4F5 | Hover, secondary bg |
| border | 240 5.9% 90% | #E4E4E7 | All borders |
| foreground | 240 10% 3.9% | #09090B | Primary text |
| muted-foreground | 240 3.8% 46.1% | #71717A | Secondary text |

### Semantic Colors (both modes)
| Token | Hex | Usage |
|-------|-----|-------|
| destructive | #EF4444 | SEO Ready / Act Now / errors |
| warning | #EAB308 | Watch / warnings |
| info | #3B82F6 | FYI / info |
| success | #22C55E | Healthy / success |
| accent-publish | #3B82F6 | Publish layer tag |
| accent-discuss | #A855F7 | Discuss layer tag |
| accent-trend | #F97316 | Trend layer tag |

### Semantic Color Surface (for badges/backgrounds)
- 使用 `rgba(color, 0.08-0.12)` 作为 badge 背景
- 使用 `rgba(color, 0.25-0.3)` 作为 badge 边框
- 不使用纯色背景，保持和 shadcn badge variant 一致

## Spacing
- **Base unit:** 4px
- **Density:** Compact — 信息密集型仪表盘
- **Scale:** 1(4) 2(8) 3(12) 4(16) 5(20) 6(24) 8(32) 10(40) 12(48)
- **Card padding:** 16px-18px
- **Feed row padding:** 10px 14px
- **Section gap:** 16px

## Layout
- **Approach:** Grid-disciplined
- **Structure:** Header (48px) + Sidebar (220px) + Main content
- **Grid:** `grid-template-columns: 220px 1fr`
- **Max content width:** None (fluid)
- **Responsive:** Sidebar collapses below 900px
- **Border radius:**
  - Cards/panels: 8px (var(--radius))
  - Buttons/inputs: 6px
  - Badges/pills: 9999px (full round)
  - Small elements: 4px

## Motion
- **Approach:** Minimal-functional — 只有辅助理解的过渡动画
- **Transitions:** `all 0.15s` for hover states
- **No:** page transitions, entrance animations, scroll-driven effects
- **Only exception:** Status dot pulse animation (2.5s ease-in-out infinite)

## Component Patterns

### Signal Card (Ready)
- Border: `1px solid rgba(239,68,68,0.2)`
- Hover: border intensifies to `rgba(239,68,68,0.4)`
- Contains: ready badge, layer dots, title, score bars, source pills, SEO suggestion box

### Signal Feed Row
- Grid: `24px 1fr auto auto auto` (icon, title, source pills, heat bar, time)
- Border bottom separator
- Hover: muted background

### Stat Card
- Border: `1px solid hsl(var(--border))`
- Contains: label, large mono value, description
- Accent: stat value color matches triage level

### Source Pills
- `border-radius: 9999px`, `border: 1px solid`
- Color-coded by layer: publish(blue), discuss(purple), trend(orange)

### Badges
- SEO readiness: `Ready`(red), `Watch`(amber), `FYI`(blue)
- All use pill shape with semi-transparent bg + matching border

## Tech Stack (for rewrite)
- **Framework:** React (or Preact for bundle size)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Icons:** lucide-react
- **Fonts:** @fontsource-variable/geist-sans, @fontsource-variable/geist-mono
- **Build:** Vite
- **State:** React hooks (no external state management needed)

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-27 | Vercel/shadcn aesthetic | User preference: clean, minimal, professional |
| 2026-03-27 | Geist Sans + Geist Mono | Vercel's typeface, pairs with shadcn |
| 2026-03-27 | Lucide icons, no emoji | Consistent visual language, professional feel |
| 2026-03-27 | Zinc gray scale (shadcn default) | Matches shadcn/ui conventions exactly |
| 2026-03-27 | Red/Amber/Blue triage system | Maps to seo_readiness: ready/maybe/low |
| 2026-03-27 | Blue/Purple/Orange for source layers | Distinct hues for publish/discuss/trend |
| 2026-03-27 | 信号分诊台 layout | Competitive gap: no product does urgency-based triage |
