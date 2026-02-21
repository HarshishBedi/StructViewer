import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconPlay(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 6.8L17.2 12L8 17.2V6.8Z" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function IconSparkles(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3.5L13.8 8.2L18.5 10L13.8 11.8L12 16.5L10.2 11.8L5.5 10L10.2 8.2L12 3.5Z" />
      <path d="M18.3 15.6L19 17.5L20.9 18.2L19 18.9L18.3 20.8L17.6 18.9L15.7 18.2L17.6 17.5L18.3 15.6Z" />
    </IconBase>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.8 7.4H19.2" />
      <path d="M9.2 3.9H14.8" />
      <path d="M7.1 7.4L7.8 19C7.86 20.05 8.73 20.88 9.78 20.88H14.22C15.27 20.88 16.14 20.05 16.2 19L16.9 7.4" />
      <path d="M10.1 10.5V17" />
      <path d="M13.9 10.5V17" />
    </IconBase>
  );
}

export function IconSpinner(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8.1" opacity="0.28" />
      <path d="M12 3.9A8.1 8.1 0 0 1 20.1 12" />
    </IconBase>
  );
}

export function IconSun(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="3.8" />
      <path d="M12 2.8V5" />
      <path d="M12 19V21.2" />
      <path d="M2.8 12H5" />
      <path d="M19 12H21.2" />
      <path d="M5.5 5.5L7.1 7.1" />
      <path d="M16.9 16.9L18.5 18.5" />
      <path d="M5.5 18.5L7.1 16.9" />
      <path d="M16.9 7.1L18.5 5.5" />
    </IconBase>
  );
}

export function IconMoon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M16.6 14.7A6.3 6.3 0 1 1 10 7.4A5.3 5.3 0 0 0 16.6 14.7Z" />
    </IconBase>
  );
}

export function IconMonitor(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3.2" y="4.2" width="17.6" height="12" rx="2.1" />
      <path d="M9.2 19.8H14.8" />
      <path d="M12 16.2V19.8" />
    </IconBase>
  );
}

export function IconPause(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8.6 6.2V17.8" />
      <path d="M15.4 6.2V17.8" />
    </IconBase>
  );
}

export function IconChevronLeft(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14.8 6.7L9.5 12L14.8 17.3" />
    </IconBase>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9.2 6.7L14.5 12L9.2 17.3" />
    </IconBase>
  );
}

export function IconKeyboard(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3.4" y="6.2" width="17.2" height="11.6" rx="2.2" />
      <path d="M6.7 10.2H6.72" />
      <path d="M9.9 10.2H9.92" />
      <path d="M13.1 10.2H13.12" />
      <path d="M16.3 10.2H16.32" />
      <path d="M6.7 13.4H6.72" />
      <path d="M9.9 13.4H16.3" />
    </IconBase>
  );
}

export function IconCommand(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="8.2" cy="8.2" r="2.5" />
      <circle cx="15.8" cy="8.2" r="2.5" />
      <circle cx="8.2" cy="15.8" r="2.5" />
      <circle cx="15.8" cy="15.8" r="2.5" />
      <path d="M10.7 8.2H13.3" />
      <path d="M8.2 10.7V13.3" />
      <path d="M15.8 10.7V13.3" />
      <path d="M10.7 15.8H13.3" />
    </IconBase>
  );
}

export function IconSidebarRight(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3.2" y="4.2" width="17.6" height="15.6" rx="2.2" />
      <path d="M15.2 4.2V19.8" />
      <path d="M11.7 12L9.4 9.7" />
      <path d="M11.7 12L9.4 14.3" />
    </IconBase>
  );
}
