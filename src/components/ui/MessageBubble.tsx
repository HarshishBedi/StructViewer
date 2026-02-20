import type { PropsWithChildren } from 'react';
import { cn } from '../../lib/utils/cn';

type MessageVariant = 'info' | 'success' | 'warning' | 'error';

interface MessageBubbleProps {
  variant?: MessageVariant;
  title?: string;
  compact?: boolean;
  className?: string;
}

function iconForVariant(variant: MessageVariant): string {
  if (variant === 'success') {
    return '✓';
  }

  if (variant === 'warning') {
    return '!';
  }

  if (variant === 'error') {
    return '!';
  }

  return 'i';
}

export function MessageBubble({
  variant = 'info',
  title,
  compact = false,
  className,
  children
}: PropsWithChildren<MessageBubbleProps>) {
  return (
    <div className={cn('message-bubble', `message-${variant}`, compact && 'message-compact', className)}>
      <span className="message-icon" aria-hidden="true">
        {iconForVariant(variant)}
      </span>
      <div className="message-content">
        {title && <p className="message-title">{title}</p>}
        <div className="message-body">{children}</div>
      </div>
    </div>
  );
}
