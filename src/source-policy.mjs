const CORE_SOURCE_NAMES = new Set([
  'r/facebookads',
  'r/ppc',
  'r/adops',
  'r/programmatic',
  'r/adtech',
  'adexchanger',
  'meta ads manager outages',
  'meta marketing api outages',
  'meta business suite outages',
  'meta newsroom rss',
  'meta for developers blog',
  'appsflyer blog',
  'search engine journal (ppc)',
  'search engine land (ppc)',
]);

const WATCHLIST_SOURCE_NAMES = new Set([
  'martech.org',
  'adweek',
  'the information (public posts)',
  'techcrunch',
  'talkwalker: master feed',
  'niemanlab (platform/media trends)',
  'search engine journal',
  'google ads & commerce blog',
  'iab tech lab',
  'webkit blog',
  'tiktok for business blog',
  'r/tiktokads',
]);

const EXCLUDED_SOURCE_NAMES = new Set([
  'r/marketing',
  'r/growthhacking',
  'r/privacy',
  'r/digital_marketing',
  'r/socialmedia',
  'r/entrepreneur',
  'r/startups',
  'r/ecommerce',
  'r/tiktokhelp',
  'r/tiktokshop',
  'social media examiner',
  'hacker news',
]);

const STRONG_INCLUDE_PATTERNS = [
  /\bmeta\b/i,
  /\bfacebook\b/i,
  /\binstagram\b/i,
  /\btiktok\b/i,
  /\bkwai\b/i,
  /\bkuaishou\b/i,
  /\bunity\b/i,
  /\bgoogle ads\b/i,
  /\bads manager\b/i,
  /\bbusiness manager\b/i,
  /\bmarketing api\b/i,
  /\boutage\b/i,
  /\bincident\b/i,
  /\bdisruption(?:s)?\b/i,
  /\bdegraded\b/i,
  /\bnot working\b/i,
  /\bsite issue\b/i,
  /\bdelivery issue\b/i,
  /\breporting issue\b/i,
  /\brejected\b/i,
  /\bdisapproved?\b/i,
  /\breview queue\b/i,
  /\badvertis(?:e|er|ing|ement)?\b/i,
  /\bcampaign\b/i,
  /\bpaid media\b/i,
  /\bppc\b/i,
  /\battribution\b/i,
  /\bprivacy sandbox\b/i,
  /\btracking\b/i,
  /\bpixel\b/i,
  /\bconversion(?:s)?\b/i,
  /\bcvr\b/i,
  /\bcpa\b/i,
  /\broi\b/i,
  /\broas\b/i,
  /\bctr\b/i,
  /\blanding page\b/i,
  /\bpost-?click\b/i,
  /\bre-?engagement\b/i,
  /\bpwa\b/i,
  /\bpush\b/i,
  /\bcreative\b/i,
  /\bremarketing\b/i,
  /\bretarget/i,
  /\bmeasurement\b/i,
  /\bconsent\b/i,
  /\bad policy\b/i,
];

const WEAK_INCLUDE_PATTERNS = [
  /\bshop(ping)?\b/i,
  /\becommerce\b/i,
  /\blead gen\b/i,
  /\bperformance\b/i,
  /\bdemand gen\b/i,
  /\bmedia buy/i,
  /\bfirst[- ]party\b/i,
  /\bprivacy\b/i,
  /\bga4\b/i,
  /\bmmm\b/i,
  /\bexperiment\b/i,
  /\bab test\b/i,
  /\bstatus\b/i,
  /\brecovery\b/i,
];

const EXCLUDE_PATTERNS = [
  /\bopenai\b/i,
  /\banthropic\b/i,
  /\bgithub\b/i,
  /\bmacbook\b/i,
  /\biphone\b/i,
  /\bandroid users can now share tracker tag info with airlines\b/i,
  /\bnato\b/i,
  /\bpentagon\b/i,
  /\bengineering manager\b/i,
  /\blinux\b/i,
  /\bdiscord\b/i,
  /\bgame\b/i,
  /\bvc\b/i,
  /\bfund(?:ing|raise)?\b/i,
  /\bshare buyback\b/i,
  /\bstake in\b/i,
  /\bqwen\b/i,
  /\bclaude(?:'s)? cycles\b/i,
  /\bcrdt\b/i,
  /\bwordpress\b/i,
  /\bseo\b/i,
];

const LOW_SIGNAL_TITLE_PATTERNS = [
  /^\s*f+u+c*k\b/i,
  /^\s*waiting[.!…\s]*$/i,
  /^\s*need help\b/i,
  /\bplease help\b/i,
  /^\s*help\b/i,
  /^\s*how do i start\b/i,
  /\bwhat are the cost\b/i,
  /\bworth it\??$/i,
  /\bfeeling stuck\b/i,
  /\bfor sale\b/i,
  /\bfor rent\b/i,
  /\bavailable dm\b/i,
  /\bdm for more\b/i,
  /\baccount.*for sale\b/i,
  /\bagency accounts? for rent\b/i,
];

const LOW_SIGNAL_CONTENT_PATTERNS = [
  /\bdm for more information\b/i,
  /\baccount for sale\b/i,
  /\bagency accounts? for rent\b/i,
  /\bi just wanna start\b/i,
];

const OUTAGE_PATTERNS = [
  /\boutage\b/i,
  /\bdown\b/i,
  /\bdisruption(?:s)?\b/i,
  /\bsite issue\b/i,
  /\bnot working\b/i,
  /\bbugged?\b/i,
  /\bbroken\b/i,
  /\bnot spending\b/i,
  /\bspend not moving\b/i,
];

const POLICY_PATTERNS = [
  /\bpolicy\b/i,
  /\bdeprecat(?:e|ed|ion)\b/i,
  /\bretir(?:e|ing|ed)\b/i,
  /\bsunset\b/i,
  /\bno longer available\b/i,
  /\bcan(?:not|'t) continue\b/i,
  /\bunable to continue using\b/i,
  /\bstop(?:ped|ping)? support\b/i,
  /限制/,
  /下架/,
  /停止支持/,
  /无法继续使用/,
];

const SECURITY_PATTERNS = [
  /\bcve-\d{4}-\d+\b/i,
  /\bvulnerabilit(?:y|ies)\b/i,
  /\bsecurity flaw\b/i,
  /\bexploit\b/i,
  /\bemergency update\b/i,
];

const SALE_PATTERNS = [
  /\bacqui(?:re|sition)\b/i,
  /\bsale\b/i,
  /\bvaluation\b/i,
  /\bstrategic review\b/i,
  /\bseeking buyers?\b/i,
  /\b出售\b/,
  /\b估值\b/,
  /\b收购\b/,
];

const MEASUREMENT_PATTERNS = [
  /\battribution\b/i,
  /\bmeasurement\b/i,
  /\bpixel\b/i,
  /\bconversion(?:s)? api\b/i,
  /\breporting\b/i,
  /\btracking\b/i,
  /\b回传\b/,
  /\b归因\b/,
  /\b转化追踪\b/,
];

const FEATURE_PATTERNS = [
  /\blaunch(?:ed|es)?\b/i,
  /\broll(?:ing)? out\b/i,
  /\bnew feature\b/i,
  /\bintroduc(?:e|es|ed)\b/i,
  /\bupdate\b/i,
  /\bopen beta\b/i,
];

function normalizedName(source) {
  return String(source?.name || '').trim().toLowerCase();
}

function textBlob(item) {
  return [
    item.title || '',
    item.content || '',
    item.url || '',
    item.source_name || '',
  ].join(' ');
}

function countMatches(patterns, text) {
  let count = 0;
  for (const pattern of patterns) {
    if (pattern.test(text)) count++;
  }
  return count;
}

function normalizeTitle(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, ' ')
    .replace(/\b(via|community|discussion|update|news)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasPattern(patterns, text) {
  return patterns.some((pattern) => pattern.test(text));
}

function platformKey(text) {
  if (/\bmeta\b|\bfacebook\b|\binstagram\b/i.test(text)) return 'meta';
  if (/\btiktok\b/i.test(text)) return 'tiktok';
  if (/\bgoogle ads\b|\bgoogle\b/i.test(text)) return 'google';
  if (/\bkwai\b|\bkuaishou\b/i.test(text)) return 'kwai';
  if (/\bunity\b/i.test(text)) return 'unity';
  if (/\bthe trade desk\b|\bttd\b/i.test(text)) return 'ttd';
  return 'generic';
}

function issueKey(text) {
  if (/\basset store\b|\bresource store\b|\bmy assets\b/i.test(text)) return 'asset-store';
  if (/\bapi\b/i.test(text)) return 'api';
  if (/\bads manager\b|\bmanager\b/i.test(text)) return 'manager';
  if (/\bdelivery\b/i.test(text)) return 'delivery';
  if (/\breporting\b|\breport\b/i.test(text)) return 'reporting';
  if (/\blogin\b|\bverify\b|\bverification\b/i.test(text)) return 'login';
  if (/\battribution\b/i.test(text)) return 'attribution';
  if (/\bbudget\b|\bspend\b/i.test(text)) return 'budget';
  if (/\bpolicy\b|\bstrike\b|\bsuspension\b|\brejected\b|\bdisapproved?\b/i.test(text)) return 'policy';
  return 'general';
}

function detectEventType(text) {
  if (hasPattern(OUTAGE_PATTERNS, text) || /\b异常\b|\b宕机\b|\b消耗起不来\b|\b起量\b|\b服务异常\b|\b回传数据.*异常\b/.test(text)) {
    return 'outage';
  }
  if (hasPattern(POLICY_PATTERNS, text)) return 'policy';
  if (hasPattern(MEASUREMENT_PATTERNS, text)) return 'measurement';
  if (hasPattern(SECURITY_PATTERNS, text)) return 'security';
  if (hasPattern(SALE_PATTERNS, text)) return 'deal';
  if (hasPattern(FEATURE_PATTERNS, text)) return 'feature';
  return 'general';
}

function eventTypeBonus(eventType) {
  switch (eventType) {
    case 'outage':
      return 18;
    case 'policy':
      return 16;
    case 'measurement':
      return 14;
    case 'security':
      return 14;
    case 'deal':
      return 10;
    case 'feature':
      return 6;
    default:
      return 0;
  }
}

function seoAnglesForEvent(platform, eventType, issue) {
  const readablePlatform = platform === 'generic' ? '平台' : platform;
  switch (eventType) {
    case 'outage':
      return [
        `${readablePlatform} ads 宕机/异常排查`,
        `${readablePlatform} 广告消耗或回传异常怎么办`,
        `${readablePlatform} outage 对广告主投放的影响`,
      ];
    case 'policy':
      return [
        `${readablePlatform} 政策或资源限制变化解读`,
        `${readablePlatform} ${issue} 调整后如何应对`,
        `${readablePlatform} 变化对团队迁移与维护成本的影响`,
      ];
    case 'measurement':
      return [
        `${readablePlatform} 归因或回传异常解读`,
        `${readablePlatform} measurement 变化对 CPA/ROAS 的影响`,
        `${readablePlatform} 转化追踪波动的排查流程`,
      ];
    case 'security':
      return [
        `${readablePlatform} 安全漏洞影响评估`,
        `${readablePlatform} 紧急修复与版本升级指南`,
      ];
    case 'deal':
      return [
        `${readablePlatform} 业务出售/并购对生态的影响`,
        `${readablePlatform} 平台战略变化对开发者和广告主意味着什么`,
      ];
    default:
      return [
        `${readablePlatform} 最新变化对广告主的影响`,
        `${readablePlatform} 变化后的应对策略`,
      ];
  }
}

function evidenceSignals(text, item) {
  const signals = [];
  if (hasPattern(OUTAGE_PATTERNS, text) || /\b异常\b|\b宕机\b|\b消耗起不来\b|\b服务异常\b|\b回传数据.*异常\b/.test(text)) signals.push('outage-keyword');
  if (hasPattern(POLICY_PATTERNS, text)) signals.push('policy-keyword');
  if (hasPattern(MEASUREMENT_PATTERNS, text)) signals.push('measurement-keyword');
  if (/\b\d+%|\b(cpa|cvr|roi|roas|ctr)\b/i.test(text)) signals.push('quant-data');
  if (officialSignalBonus(item) > 0) signals.push('official-source');
  if (engagementScore(item) >= 6) signals.push('community-traction');
  return signals;
}

function buildClusterKey(item, evaluation) {
  const normalized = evaluation.normalizedTitle || normalizeTitle(item.title);
  const text = textBlob(item);
  const eventType = evaluation.eventType || detectEventType(text);
  const platform = evaluation.eventPlatform || platformKey(text);
  const issue = evaluation.eventIssue || issueKey(text);

  if (eventType !== 'general') {
    if (eventType === 'outage') {
      const outageIssue = issue === 'api' ? 'api' : 'operations';
      return `${eventType}:${platform}:${outageIssue}`;
    }
    return `${eventType}:${platform}:${issue}`;
  }

  return normalized;
}

function officialSignalBonus(item) {
  const sourceName = normalizedName(item);
  if (/\boutages?\b|\bstatus\b/.test(sourceName)) return 18;
  if (/\bnewsroom\b|\bdevelopers?\b|\bblog\b/.test(sourceName) && item.type !== 'reddit') return 8;
  return 0;
}

function engagementScore(item) {
  try {
    const meta = JSON.parse(item.metadata || '{}');
    const score = Number(meta.score || meta.points || 0);
    const comments = Number(meta.num_comments || 0);
    return Math.min(12, Math.floor(score / 20) + Math.floor(comments / 10));
  } catch {
    return 0;
  }
}

function freshnessScore(item) {
  const raw = item.published_at || item.fetched_at;
  const ts = raw ? Date.parse(raw) : NaN;
  if (Number.isNaN(ts)) return 0;
  const ageHours = Math.max(0, (Date.now() - ts) / (1000 * 60 * 60));
  if (ageHours <= 6) return 10;
  if (ageHours <= 24) return 7;
  if (ageHours <= 72) return 4;
  return 1;
}

export function classifySource(source) {
  const name = normalizedName(source);
  if (EXCLUDED_SOURCE_NAMES.has(name)) {
    return { tier: 'excluded', weight: 0, reason: 'excluded-source' };
  }
  if (CORE_SOURCE_NAMES.has(name)) {
    return { tier: 'core', weight: 70, reason: 'core-source' };
  }
  if (WATCHLIST_SOURCE_NAMES.has(name)) {
    return { tier: 'watchlist', weight: 38, reason: 'watchlist-source' };
  }
  if (source?.type === 'twitter_feed' || source?.type === 'twitter_list') {
    return { tier: 'watchlist', weight: 42, reason: 'social-watchlist' };
  }
  if (source?.type === 'reddit') {
    return { tier: 'watchlist', weight: 25, reason: 'reddit-default' };
  }
  return { tier: 'watchlist', weight: 30, reason: 'default-watchlist' };
}

export function evaluateRawItem(item, options = {}) {
  const sourcePolicy = classifySource(item);
  const text = textBlob(item);
  const title = String(item.title || '');
  const eventPlatform = platformKey(text);
  const eventIssue = issueKey(text);
  const eventType = detectEventType(text);
  const strongMatches = countMatches(STRONG_INCLUDE_PATTERNS, text);
  const weakMatches = countMatches(WEAK_INCLUDE_PATTERNS, text);
  const excludeMatches = countMatches(EXCLUDE_PATTERNS, text);
  const lowSignalTitle = hasPattern(LOW_SIGNAL_TITLE_PATTERNS, title);
  const lowSignalContent = hasPattern(LOW_SIGNAL_CONTENT_PATTERNS, text);
  const communityNoisePenalty = (lowSignalTitle ? 40 : 0) + (lowSignalContent ? 30 : 0);
  const quantitativeSignal = /\b\d+%|\b(cpa|cvr|roi|roas|ctr)\b/i.test(text) ? 8 : 0;
  const eventBonus = eventTypeBonus(eventType);
  const eventSignals = evidenceSignals(text, item);
  const score = sourcePolicy.weight +
    Math.min(30, strongMatches * 12) +
    Math.min(12, weakMatches * 4) +
    quantitativeSignal +
    eventBonus +
    officialSignalBonus(item) +
    engagementScore(item) +
    freshnessScore(item) -
    Math.min(45, excludeMatches * 15) -
    communityNoisePenalty;

  const mode = options.mode || 'scheduled';

  if (mode === 'scheduled') {
    if (sourcePolicy.tier === 'excluded') {
      return { accepted: false, score, sourcePolicy, rejectReason: 'excluded-source' };
    }
    if (excludeMatches > 0 && strongMatches === 0) {
      return { accepted: false, score, sourcePolicy, rejectReason: 'excluded-topic' };
    }
    if ((sourcePolicy.tier === 'core' || sourcePolicy.tier === 'watchlist') && lowSignalTitle && strongMatches < 3) {
      return { accepted: false, score, sourcePolicy, rejectReason: 'low-signal-title' };
    }
    if (sourcePolicy.tier !== 'core' && lowSignalContent && quantitativeSignal === 0) {
      return { accepted: false, score, sourcePolicy, rejectReason: 'low-signal-content' };
    }
    if (sourcePolicy.tier === 'core' && strongMatches === 0 && weakMatches === 0) {
      return { accepted: false, score, sourcePolicy, rejectReason: 'core-without-signal' };
    }
    if (sourcePolicy.tier === 'watchlist' && strongMatches === 0) {
      return { accepted: false, score, sourcePolicy, rejectReason: 'weak-watchlist-signal' };
    }
    if (score < (sourcePolicy.tier === 'core' ? 55 : 62)) {
      return { accepted: false, score, sourcePolicy, rejectReason: 'low-score' };
    }
  }

  return {
    accepted: true,
    score,
    sourcePolicy,
    normalizedTitle: normalizeTitle(item.title),
    strongMatches,
    weakMatches,
    excludeMatches,
    lowSignalTitle,
    lowSignalContent,
    eventType,
    eventPlatform,
    eventIssue,
    eventSignals,
    seoTopicAngles: seoAnglesForEvent(eventPlatform, eventType, eventIssue),
  };
}

export function rankRawItems(items, options = {}) {
  const accepted = [];

  for (const item of items) {
    const evaluation = evaluateRawItem(item, options);
    if (!evaluation.accepted) continue;
    accepted.push({
      ...item,
      cluster_key: buildClusterKey(item, evaluation),
      relevance_score: evaluation.score,
      source_tier: evaluation.sourcePolicy.tier,
      source_weight: evaluation.sourcePolicy.weight,
      source_reason: evaluation.sourcePolicy.reason,
      event_type: evaluation.eventType,
      event_platform: evaluation.eventPlatform,
      event_issue: evaluation.eventIssue,
      event_signals: JSON.stringify(evaluation.eventSignals),
      seo_topic_angles: JSON.stringify(evaluation.seoTopicAngles),
      policy_metrics: JSON.stringify({
        strong_matches: evaluation.strongMatches,
        weak_matches: evaluation.weakMatches,
        exclude_matches: evaluation.excludeMatches,
        low_signal_title: evaluation.lowSignalTitle,
        low_signal_content: evaluation.lowSignalContent,
        event_type: evaluation.eventType,
        event_platform: evaluation.eventPlatform,
        event_issue: evaluation.eventIssue,
        event_signals: evaluation.eventSignals,
      }),
    });
  }

  const clusters = new Map();
  for (const item of accepted) {
    const key = item.cluster_key || normalizeTitle(item.title);
    const current = clusters.get(key) || {
      count: 0,
      sourceNames: new Set(),
      sourceTypes: new Set(),
      hasOfficial: false,
      latestPublishedAt: '',
    };
    current.count += 1;
    current.sourceNames.add(normalizedName(item));
    current.sourceTypes.add(String(item.type || 'unknown'));
    if (officialSignalBonus(item) > 0) current.hasOfficial = true;
    const publishedAt = String(item.published_at || item.fetched_at || '');
    if (publishedAt > current.latestPublishedAt) current.latestPublishedAt = publishedAt;
    clusters.set(key, current);
  }

  for (const item of accepted) {
    const cluster = clusters.get(item.cluster_key || normalizeTitle(item.title));
    const corroborationScore =
      Math.min(18, Math.max(0, cluster.count - 1) * 6) +
      Math.min(10, Math.max(0, cluster.sourceNames.size - 1) * 4) +
      Math.min(8, Math.max(0, cluster.sourceTypes.size - 1) * 3) +
      (cluster.hasOfficial ? 12 : 0);
    const eventConfidence =
      item.event_type === 'general'
        ? 'low'
        : (cluster.hasOfficial || corroborationScore >= 18)
          ? 'high'
          : corroborationScore >= 8
            ? 'medium'
            : 'low';
    item.corroboration_count = cluster.count;
    item.corroboration_sources = cluster.sourceNames.size;
    item.corroboration_score = corroborationScore;
    item.event_confidence = eventConfidence;
    item.relevance_score += corroborationScore;
    item.policy_metrics = JSON.stringify({
      ...JSON.parse(item.policy_metrics),
      corroboration_count: cluster.count,
      corroboration_sources: cluster.sourceNames.size,
      corroboration_score: corroborationScore,
      event_confidence: eventConfidence,
    });
  }

  accepted.sort((a, b) => {
    if (b.relevance_score !== a.relevance_score) return b.relevance_score - a.relevance_score;
    return String(b.published_at || b.fetched_at).localeCompare(String(a.published_at || a.fetched_at));
  });

  const seenTitles = new Set();
  const ranked = [];
  for (const item of accepted) {
    const key = item.cluster_key || normalizeTitle(item.title);
    if (key && seenTitles.has(key)) continue;
    if (key) seenTitles.add(key);
    ranked.push(item);
  }

  return ranked;
}
