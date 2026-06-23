import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold';

const base =
  'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2';

const sizes = {
  md: 'px-5 py-3 text-base',
  lg: 'px-6 py-4 text-lg',
  sm: 'px-4 py-2 text-sm',
} as const;

const variants: Record<Variant, string> = {
  primary: 'bg-teal-700 text-white shadow-sm hover:bg-teal-800',
  secondary: 'bg-teal-100 text-teal-900 hover:bg-teal-200',
  ghost: 'bg-transparent text-teal-800 hover:bg-teal-50',
  gold: 'bg-gold-400 text-ink shadow-sm hover:bg-gold-500',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: keyof typeof sizes;
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: Props) {
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
