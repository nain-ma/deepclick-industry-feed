import { ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ReadyCards({ signals }) {
  if (!signals.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {signals.slice(0, 4).map((signal, i) => (
        <ReadyCard key={i} signal={signal} />
      ))}
    </div>
  );
}

function ReadyCard({ signal }) {
  return (
    <div className="p-5 border border-destructive/20 rounded-lg bg-card cursor-pointer transition-all hover:border-destructive/40 hover:bg-muted group relative overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-destructive/5 to-transparent pointer-events-none" />

      <div className="relative">
        {/* Top row */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-destructive text-white uppercase tracking-wide">
            Ready
          </span>
          <LayerDots layers={signal.layers} />
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium leading-relaxed mb-3">{signal.title}</h3>

        {/* Scores */}
        <div className="flex items-center gap-4 mb-3">
          <ScoreBar label="heat" value={signal.heatScore} max={100} color="bg-destructive" />
          <ScoreBar label="search" value={signal.searchPotential || Math.round(signal.heatScore * 0.6)} max={100} color="bg-warning" />
          <span className="text-[11px] text-muted-foreground font-mono">
            {signal.corroborationCount}源 · {signal.layerDiversity}层
          </span>
        </div>

        {/* Source pills */}
        {signal.sourcePills && (
          <div className="flex gap-1 flex-wrap mb-3">
            {signal.sourcePills.map((s, i) => (
              <SourcePill key={i} name={s.name} layer={s.layer} />
            ))}
          </div>
        )}

        {/* SEO suggestion */}
        {signal.seoTitle && (
          <div className="p-2 border border-border rounded bg-muted text-xs text-muted-foreground">
            <span className="text-foreground font-medium">建议:</span> {signal.seoTitle}
          </div>
        )}

        {/* Link */}
        {signal.url && (
          <a
            href={signal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink size={12} />
            原文链接
          </a>
        )}
      </div>
    </div>
  );
}

function ScoreBar({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <span className="font-medium">{label}</span>
      <div className="w-14 h-1 bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className={cn('font-mono font-semibold text-[11px]', value >= 50 ? 'text-destructive' : 'text-warning')}>
        {value}
      </span>
    </div>
  );
}

function LayerDots({ layers = [] }) {
  const allLayers = ['publish', 'discuss', 'trend'];
  const colors = { publish: 'bg-publish', discuss: 'bg-discuss', trend: 'bg-trend' };
  return (
    <div className="flex gap-1 ml-1">
      {allLayers.map(l => (
        <span
          key={l}
          className={cn(
            'w-2 h-2 rounded-full border',
            layers.includes(l)
              ? cn(colors[l], 'border-transparent')
              : 'border-muted-foreground/30 bg-transparent'
          )}
        />
      ))}
    </div>
  );
}

function SourcePill({ name, layer }) {
  const styles = {
    publish: 'border-publish/25 text-publish bg-publish/10',
    discuss: 'border-discuss/25 text-discuss bg-discuss/10',
    trend: 'border-trend/25 text-trend bg-trend/10',
  };
  return (
    <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full border', styles[layer] || styles.publish)}>
      {name}
    </span>
  );
}
