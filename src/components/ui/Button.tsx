import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils/cn';
import { IconSpinner } from './icons';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  loading?: boolean;
}

export function Button({
  children,
  className,
  variant = 'secondary',
  size = 'sm',
  iconOnly = false,
  loading = false,
  onClick,
  disabled,
  ...props
}: PropsWithChildren<ButtonProps>) {
  const [flash, setFlash] = useState(false);
  const [done, setDone] = useState(false);
  const timersRef = useRef<number[]>([]);
  const isDisabled = disabled || loading;
  const content = loading
    ? iconOnly
      ? <IconSpinner className="btn-spinner" />
      : (
          <>
            <IconSpinner className="btn-spinner" />
            {children}
          </>
        )
    : children;

  useEffect(() => {
    return () => {
      for (const timer of timersRef.current) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  const handleClick: ButtonHTMLAttributes<HTMLButtonElement>['onClick'] = (event) => {
    if (isDisabled) {
      return;
    }

    setFlash(false);
    setDone(false);

    for (const timer of timersRef.current) {
      window.clearTimeout(timer);
    }
    timersRef.current = [];

    const flashOn = window.setTimeout(() => {
      setFlash(true);
      const flashOff = window.setTimeout(() => {
        setFlash(false);
      }, 180);
      timersRef.current.push(flashOff);
    }, 0);

    const doneOn = window.setTimeout(() => {
      setDone(true);
      const doneOff = window.setTimeout(() => {
        setDone(false);
      }, 420);
      timersRef.current.push(doneOff);
    }, 120);

    timersRef.current.push(flashOn, doneOn);
    onClick?.(event);
  };

  return (
    <button
      type="button"
      className={cn(
        'btn',
        iconOnly && 'btn-icon-only',
        loading && 'btn-loading',
        flash && 'btn-flash',
        done && 'btn-done',
        `btn-${variant}`,
        `btn-${size}`,
        className
      )}
      onClick={handleClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </button>
  );
}
