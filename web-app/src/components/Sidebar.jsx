import { Lightbulb, Swords, Wrench, TrendingUp, Flame } from 'lucide-react';
import { cn } from '../lib/utils';

const SEO_FILTERS = [
  { key: 'ready', label: '立即可写', color: 'bg-destructive' },
  { key: 'watch', label: '值得关注', color: 'bg-warning' },
  { key: 'fyi', label: '仅参考', color: 'bg-info' },
];

const LAYER_FILTERS = [
  { key: 'publish', label: 'Publish', color: 'bg-publish' },
  { key: 'discuss', label: 'Discuss', color: 'bg-discuss' },
  { key: 'trend', label: 'Trend', color: 'bg-trend' },
];

const SIGNAL_TYPES = [
  { icon: Lightbulb, label: '转化链路' },
  { icon: Swords, label: '竞品动态' },
  { icon: Wrench, label: '基础设施' },
  { icon: TrendingUp, label: '市场趋势' },
  { icon: Flame, label: '平台异常' },
];

export default function Sidebar({ seoFilter, onSeoFilter, layerFilter, onLayerFilter, sources, stats }) {
  const activeSources = sources.filter(s => s.is_active !== 0);

  return (
    <aside className="border-r border-border p-3 flex flex-col gap-5 overflow-y-auto bg-background">
      <NavGroup label="SEO 就绪度">
        {SEO_FILTERS.map(f => (
          <NavItem
            key={f.key}
            active={seoFilter === f.key}
            onClick={() => onSeoFilter(seoFilter === f.key ? null : f.key)}
          >
            <span className={cn('w-2 h-2 rounded-full shrink-0', f.color)} />
            {f.label}
            <span className={cn(
              'ml-auto font-mono text-[11px]',
              seoFilter === f.key ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {stats[f.key] || 0}
            </span>
          </NavItem>
        ))}
      </NavGroup>

      <NavGroup label="源层级">
        {LAYER_FILTERS.map(f => (
          <NavItem
            key={f.key}
            active={layerFilter === f.key}
            onClick={() => onLayerFilter(layerFilter === f.key ? null : f.key)}
          >
            <span className={cn('w-2 h-2 rounded-full shrink-0', f.color)} />
            {f.label}
          </NavItem>
        ))}
      </NavGroup>

      <NavGroup label="信号类型">
        {SIGNAL_TYPES.map(t => (
          <NavItem key={t.label}>
            <t.icon size={14} className="shrink-0 text-muted-foreground" />
            {t.label}
          </NavItem>
        ))}
      </NavGroup>

      {/* Stats footer */}
      <div className="mt-auto p-3 border border-border rounded-lg text-xs space-y-1.5">
        <StatRow label="信号" value={stats.total} valueClass="text-success" />
        <StatRow label="已过滤" value={stats.filtered} valueClass="text-warning" />
        <StatRow label="活跃源" value={`${activeSources.length}/${sources.length}`} />
      </div>
    </aside>
  );
}

function NavGroup({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-1">
        {label}
      </label>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function NavItem({ children, active, onClick }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] cursor-pointer transition-colors',
        active
          ? 'bg-muted text-foreground font-medium'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function StatRow({ label, value, valueClass }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-mono font-semibold text-[11px]', valueClass)}>{value}</span>
    </div>
  );
}
