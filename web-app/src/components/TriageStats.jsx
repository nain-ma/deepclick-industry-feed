import { cn } from '../lib/utils';

const CARDS = [
  { key: 'ready', label: '立即可写', color: 'text-destructive', borderColor: 'border-t-destructive', desc: 'heat ≥ 30 & search ≥ 20' },
  { key: 'watch', label: '值得关注', color: 'text-warning', borderColor: 'border-t-warning', desc: 'heat ≥ 15 或 search ≥ 15' },
  { key: 'fyi', label: '仅参考', color: 'text-info', borderColor: 'border-t-info', desc: '通过门槛但热度不足' },
  { key: 'total', label: '总计', color: 'text-foreground', borderColor: 'border-t-muted-foreground', desc: '' },
];

export default function TriageStats({ stats }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {CARDS.map(c => (
        <div
          key={c.key}
          className={cn(
            'p-4 border border-border rounded-lg bg-card border-t-[3px]',
            c.borderColor
          )}
        >
          <div className={cn('text-[11px] font-semibold uppercase tracking-wide mb-1', c.color)}>
            {c.label}
          </div>
          <div className={cn('text-3xl font-bold font-mono tracking-tighter leading-none', c.color)}>
            {stats[c.key] ?? 0}
          </div>
          {c.desc && (
            <div className="text-[11px] text-muted-foreground mt-1">{c.desc}</div>
          )}
          {c.key === 'total' && stats.filtered > 0 && (
            <div className="text-[11px] text-muted-foreground mt-1">
              过滤了 {stats.filtered} 条噪音
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
