import type { PropsWithChildren, ReactNode } from 'react';
import { cn } from '../../lib/utils/cn';

interface PanelProps {
  title?: string;
  subtitle?: string;
  className?: string;
  headerActions?: ReactNode;
}

export function Panel({
  title,
  subtitle,
  className,
  headerActions,
  children
}: PropsWithChildren<PanelProps>) {
  return (
    <section className={cn('panel', className)}>
      {(title || subtitle || headerActions) && (
        <header className="panel-header">
          <div>
            {title && <h2 className="panel-title">{title}</h2>}
            {subtitle && <p className="panel-subtitle">{subtitle}</p>}
          </div>
          {headerActions && <div className="panel-header-actions">{headerActions}</div>}
        </header>
      )}
      <div className="panel-body">{children}</div>
    </section>
  );
}
