export default function FooterStats({ stats, sources }) {
  const activeSources = sources.filter(s => s.is_active !== 0);

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border border-border rounded-lg text-xs text-muted-foreground flex-wrap">
      <span>本期信号 <strong className="font-mono font-semibold text-foreground">{stats.total}</strong></span>
      <Divider />
      <span>已过滤 <strong className="font-mono font-semibold text-warning">{stats.filtered}</strong></span>
      <Divider />
      <span>
        源健康{' '}
        <strong className="font-mono font-semibold text-success">
          {activeSources.length}/{sources.length}
        </strong>
      </span>
    </div>
  );
}

function Divider() {
  return <span className="w-px h-3.5 bg-border" />;
}
