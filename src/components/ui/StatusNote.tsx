import { cn } from '../../lib/utils/cn';

type StatusTone = 'info' | 'warning' | 'success';

interface StatusNoteProps {
  badge: string;
  message: string;
  tone?: StatusTone;
  className?: string;
}

function StatusIcon({ tone }: { tone: StatusTone }) {
  if (tone === 'warning') {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="8.25" />
        <path d="M10 5.3v5.5" />
        <circle cx="10" cy="13.9" r="0.95" />
      </svg>
    );
  }

  if (tone === 'success') {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="8.25" />
        <path d="m6.5 10.1 2.2 2.3 4.8-4.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="8.25" />
      <path d="M10 8.2v5.1" />
      <circle cx="10" cy="5.85" r="0.95" />
    </svg>
  );
}

export function StatusNote({ badge, message, tone = 'info', className }: StatusNoteProps) {
  return (
    <div className={cn('viz-status', `viz-status-${tone}`, className)} role="status" aria-live="polite">
      <span className="viz-status-icon">
        <StatusIcon tone={tone} />
      </span>
      <div className="viz-status-copy">
        <span className="viz-status-badge">{badge}</span>
        <p className="viz-status-text">{message}</p>
      </div>
    </div>
  );
}
