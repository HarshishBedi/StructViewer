import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  children,
  className,
  variant = 'secondary',
  size = 'md',
  onClick,
  ...props
}: PropsWithChildren<ButtonProps>) {
  const [flash, setFlash] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleClick: ButtonHTMLAttributes<HTMLButtonElement>['onClick'] = (event) => {
    setFlash(false);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setFlash(true);
      timerRef.current = window.setTimeout(() => {
        setFlash(false);
      }, 180);
    }, 0);
    onClick?.(event);
  };

  return (
    <button
      type="button"
      className={cn('btn', flash && 'btn-flash', `btn-${variant}`, `btn-${size}`, className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}
