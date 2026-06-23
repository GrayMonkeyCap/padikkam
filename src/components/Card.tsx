import type { HTMLAttributes, ReactNode } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = '', ...rest }: Props) {
  // Only apply the default white background when the caller hasn't set one,
  // otherwise Tailwind's `bg-white` and an override like `bg-teal-700` conflict.
  const hasBg = /(^|\s)bg-/.test(className);
  return (
    <div
      className={`rounded-3xl border border-teal-100 p-5 shadow-sm ${hasBg ? '' : 'bg-white'} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
