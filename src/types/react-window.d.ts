declare module 'react-window' {
  import type { CSSProperties, JSX } from 'react';

  export interface ListChildComponentProps<TData = unknown> {
    index: number;
    style: CSSProperties;
    data: TData;
    isScrolling?: boolean;
  }

  export interface FixedSizeListProps<TData = unknown> {
    className?: string;
    height: number;
    width: number | string;
    itemCount: number;
    itemSize: number;
    itemData?: TData;
    children: (props: ListChildComponentProps<TData>) => JSX.Element;
  }

  export function FixedSizeList<TData = unknown>(props: FixedSizeListProps<TData>): JSX.Element;
}
