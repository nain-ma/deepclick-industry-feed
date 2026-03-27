import { useState, useEffect, useCallback } from 'react';
import { fetchDigests, fetchDigest, fetchSources, fetchAuthConfig, fetchAuthMe } from './lib/api';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TriageStats from './components/TriageStats';
import ReadyCards from './components/ReadyCards';
import SignalFeed from './components/SignalFeed';
import DigestViewer from './components/DigestViewer';
import FooterStats from './components/FooterStats';

const DIGEST_TYPES = ['4h', 'daily', 'weekly', 'monthly', 'manual'];

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('radar_theme') || 'dark');
  const [digestType, setDigestType] = useState('4h');
  const [digests, setDigests] = useState([]);
  const [selectedDigest, setSelectedDigest] = useState(null);
  const [sources, setSources] = useState([]);
  const [user, setUser] = useState(null);
  const [authEnabled, setAuthEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filters
  const [seoFilter, setSeoFilter] = useState(null); // null = all, 'ready', 'watch', 'fyi'
  const [layerFilter, setLayerFilter] = useState(null); // null = all, 'publish', 'discuss', 'trend'

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('radar_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  // Load initial data
  useEffect(() => {
    async function init() {
      try {
        const [authCfg, digestList, sourceList] = await Promise.all([
          fetchAuthConfig().catch(() => ({ authEnabled: false, publicApiMode: true })),
          fetchDigests({ type: digestType === '4h' ? '8h' : digestType, limit: 20 }),
          fetchSources().catch(() => []),
        ]);
        setAuthEnabled(authCfg.authEnabled);
        setDigests(digestList);
        setSources(sourceList);

        if (authCfg.authEnabled) {
          try {
            const me = await fetchAuthMe();
            setUser(me.user);
          } catch {}
        }
      } catch (e) {
        console.error('Init error:', e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [digestType]);

  const handleSelectDigest = useCallback(async (digest) => {
    if (digest.content) {
      setSelectedDigest(digest);
    } else {
      const full = await fetchDigest(digest.id);
      setSelectedDigest(full);
    }
  }, []);

  const handleBack = useCallback(() => {
    setSelectedDigest(null);
  }, []);

  // Parse signals from latest digest content
  const signals = parseSignals(digests[0]?.content);
  const stats = computeStats(signals);

  return (
    <div className="grid grid-rows-[48px_1fr] grid-cols-[220px_1fr] min-h-screen">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        user={user}
        authEnabled={authEnabled}
        stats={stats}
      />

      <Sidebar
        seoFilter={seoFilter}
        onSeoFilter={setSeoFilter}
        layerFilter={layerFilter}
        onLayerFilter={setLayerFilter}
        sources={sources}
        stats={stats}
      />

      <main className="p-5 overflow-y-auto flex flex-col gap-4">
        {selectedDigest ? (
          <DigestViewer digest={selectedDigest} onBack={handleBack} />
        ) : (
          <>
            <TriageStats stats={stats} />

            {stats.ready > 0 && (
              <>
                <SectionHead title="立即可写" badge="SEO Ready" />
                <ReadyCards signals={signals.filter(s => s.seoReadiness === 'ready')} />
              </>
            )}

            <SectionHead title="信号流" right="按 final_score 排序" />
            <SignalFeed
              signals={signals.filter(s =>
                (!seoFilter || s.seoReadiness === seoFilter) &&
                (!layerFilter || s.layers?.includes(layerFilter))
              )}
            />

            <FooterStats stats={stats} sources={sources} />

            {/* Digest list below feed */}
            {digests.length > 0 && (
              <>
                <SectionHead title="历史 Digest" />
                <div className="border border-border rounded-lg overflow-hidden">
                  {digests.map(d => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleSelectDigest(d)}
                    >
                      <span className="text-sm font-medium">{formatDigestTitle(d)}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(d.created_at?.includes('+') ? d.created_at : d.created_at?.replace(' ', 'T') + '+08:00').toLocaleString('zh-CN', { timeZone: 'Asia/Singapore' })}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function SectionHead({ title, badge, right }) {
  return (
    <div className="flex items-center gap-2 mt-1">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {badge && (
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-destructive/30 text-destructive bg-destructive/10">
          {badge}
        </span>
      )}
      {right && <span className="ml-auto text-xs text-muted-foreground">{right}</span>}
    </div>
  );
}

function formatDigestTitle(d) {
  const labels = { '4h': '8H 简报', daily: '日报', weekly: '周报', monthly: '月报', manual: '手动抓取' };
  const type = d.type_alias || d.type;
  return labels[type] || labels[d.type] || 'Digest';
}

// Parse signal items from digest content (markdown)
function parseSignals(content) {
  if (!content) return [];
  const signals = [];
  const lines = content.split('\n');

  let inSection = null;
  for (const line of lines) {
    if (line.includes('立即可写') || line.includes('SEO Ready')) { inSection = 'ready'; continue; }
    if (line.includes('信号精选')) { inSection = 'feed'; continue; }
    if (line.includes('SEO 题材') || line.includes('行动建议') || line.includes('已过滤')) { inSection = null; continue; }

    if (line.startsWith('•') || line.startsWith('- ')) {
      const text = line.replace(/^[•\-]\s*/, '').trim();
      if (!text || text.length < 10) continue;

      // Try to extract source mentions
      const sourceMatch = text.match(/@(\S+)/);
      const urlMatch = text.match(/(https?:\/\/[^\s)]+)/);
      const heatMatch = text.match(/(\d+)源[·.](\d+)层/);
      const scoreMatch = text.match(/heat[:\s]*(\d+)/i);

      const signal = {
        title: text.replace(/@\S+\s*/, '').replace(/https?:\/\/\S+/g, '').replace(/📡.*$/, '').replace(/[—\-]\s*[💡⚔️🔧📊🔥].*$/, '').trim(),
        source: sourceMatch?.[1],
        url: urlMatch?.[1],
        corroborationCount: heatMatch ? parseInt(heatMatch[1]) : 1,
        layerDiversity: heatMatch ? parseInt(heatMatch[2]) : 1,
        heatScore: scoreMatch ? parseInt(scoreMatch[1]) : (inSection === 'ready' ? 50 : 20),
        seoReadiness: inSection === 'ready' ? 'ready' : 'watch',
        layers: [],
        type: detectSignalType(text),
      };

      // Detect layers from source tags
      if (text.includes('publish') || /AdExchanger|SEJ|Search Engine|TechCrunch|Google Blog|eMarketer|Chromium/i.test(text)) signal.layers.push('publish');
      if (text.includes('discuss') || /Reddit|r\/|HN|Hacker/i.test(text)) signal.layers.push('discuss');
      if (text.includes('trend') || /Trends|GNews|Google News/i.test(text)) signal.layers.push('trend');
      if (signal.layers.length === 0) signal.layers.push('publish');

      signals.push(signal);
    }
  }

  return signals;
}

function detectSignalType(text) {
  if (/CVR|CPA|conversion|转化|post-click|归因/i.test(text)) return 'conversion';
  if (/竞品|收购|competitor|Unbounce|Convertri/i.test(text)) return 'competitor';
  if (/SDK|API|tracking|privacy|隐私|UTM|ITP/i.test(text)) return 'infra';
  if (/趋势|增长|市场|eMarketer|份额/i.test(text)) return 'market';
  if (/故障|延迟|报告|Manager|异常/i.test(text)) return 'outage';
  return 'market';
}

function computeStats(signals) {
  const ready = signals.filter(s => s.seoReadiness === 'ready').length;
  const watch = signals.filter(s => s.seoReadiness === 'watch').length;
  const fyi = signals.filter(s => s.seoReadiness === 'fyi').length;
  return {
    ready,
    watch,
    fyi,
    total: signals.length,
    filtered: 0, // Would need API data to compute
  };
}
