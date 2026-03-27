export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr.includes('+') ? dateStr : dateStr.replace(' ', 'T') + '+08:00');
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}
