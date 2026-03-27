import { ArrowLeft } from 'lucide-react';

export default function DigestViewer({ digest, onBack }) {
  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-4 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted transition-colors"
      >
        <ArrowLeft size={14} />
        返回列表
      </button>

      <div className="border border-border rounded-lg p-6 bg-card">
        <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed font-sans">
          {linkifyContent(digest.content || '')}
        </pre>
      </div>
    </div>
  );
}

function linkifyContent(text) {
  // Split text on URLs and return mixed text/link elements
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-info hover:underline break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}
