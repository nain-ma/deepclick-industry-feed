import { Moon, Sun, Radio, Settings } from 'lucide-react';

export default function Header({ theme, onToggleTheme, user, authEnabled, stats }) {
  return (
    <header className="col-span-full flex items-center gap-4 px-4 border-b border-border bg-background h-12">
      {/* Brand */}
      <div className="flex items-center gap-2 shrink-0">
        <svg width="20" height="18" viewBox="0 0 76 65" fill="none" className="text-foreground">
          <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor" />
        </svg>
        <span className="text-sm font-semibold tracking-tight">DeepClick</span>
        <span className="w-px h-5 bg-border rotate-12 mx-1" />
        <span className="text-sm text-muted-foreground">Radar</span>
      </div>

      {/* AI Summary Bar */}
      <div className="flex-1 max-w-xl mx-auto px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground text-center bg-gradient-to-r from-destructive/5 via-warning/5 to-info/5">
        {stats.ready > 0 ? (
          <>
            <span className="inline-flex items-center justify-center bg-destructive text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full px-1 mr-1">
              {stats.ready}
            </span>
            <span className="text-foreground font-medium">条立即可写</span>
            {' · '}
            共 {stats.total} 条信号
          </>
        ) : (
          <span>共 {stats.total} 条信号</span>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-success bg-success/10">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          在线
        </div>
        <button
          onClick={onToggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Radio size={15} />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Settings size={15} />
        </button>
        {user && (
          <div className="w-7 h-7 rounded-full bg-muted border border-border overflow-hidden">
            {user.avatar && <img src={user.avatar} alt="" className="w-full h-full" />}
          </div>
        )}
      </div>
    </header>
  );
}
