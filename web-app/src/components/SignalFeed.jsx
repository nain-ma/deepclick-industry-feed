import { Lightbulb, Swords, Wrench, TrendingUp, Flame } from 'lucide-react';
import { cn } from '../lib/utils';

const TYPE_ICONS = {
  conversion: Lightbulb,
  competitor: Swords,
  infra: Wrench,
  market: TrendingUp,
  outage: Flame,
};

const LAYER_STYLES = {
  publish: 'bg-publish/10 text-publish',
  discuss: 'bg-discuss/10 text-discuss',
  trend: 'bg-trend/10 text-trend',
};

export default function SignalFeed({ signals }) {
  if (!signals.length) {
    return (
      <div className="border border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
        暂无信号
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {signals.map((signal, i) => {
        const Icon = TYPE_ICONS[signal.type] || TrendingUp;
        const heatColor = signal.heatScore >= 50 ? 'text-warning' : 'text-info';
        const barColor = signal.heatScore >= 50 ? 'bg-warning' : 'bg-info';
        const pct = Math.min((signal.heatScore / 100) * 100, 100);

        return (
          <div
            key={i}
            className="grid items-center gap-3 px-3.5 py-2.5 border-b border-border last:border-0 cursor-pointer hover:bg-muted transition-colors"
            style={{ gridTemplateColumns: '24px 1fr auto auto auto' }}
          >
            <Icon size={15} className="text-muted-foreground" />

            <span className="text-[13px] font-normal truncate">
              {signal.title}
            </span>

            <div className="flex gap-1">
              {signal.layers?.map(l => (
                <span key={l} className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded-full', LAYER_STYLES[l])}>
                  {l === 'publish' ? signal.source || 'Pub' : l === 'discuss' ? 'Disc' : 'Trend'}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-1 min-w-[70px] justify-end">
              <div className="w-10 h-[3px] bg-muted rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full', barColor)} style={{ width: `${pct}%` }} />
              </div>
              <span className={cn('font-mono text-[11px] font-medium min-w-[20px] text-right', heatColor)}>
                {signal.heatScore}
              </span>
            </div>

            <span className="font-mono text-[11px] text-muted-foreground min-w-[48px] text-right">
              {signal.timeAgo || ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}
