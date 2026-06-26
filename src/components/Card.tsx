import type { HTMLAttributes, ReactNode } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = '', ...rest }: Props) {
  const hasBg = /(^|\s)bg-/.test(className);
  return (
    <div
      className={`rounded-[22px] border border-border p-5 shadow-sm ${hasBg ? '' : 'bg-surface-card'} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
