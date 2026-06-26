import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'accent';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold transition active:translate-y-[2px] active:shadow-none disabled:opacity-40 disabled:active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2';

const sizes = {
  md: 'px-6 py-3 text-base',
  lg: 'px-7 py-4 text-lg',
  sm: 'px-4 py-2 text-sm',
} as const;

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white shadow-[0_5px_0_var(--color-primary-deep)] hover:brightness-105',
  secondary: 'bg-primary-soft text-primary-deep shadow-[0_4px_0_var(--color-border)] hover:brightness-95',
  ghost: 'bg-transparent text-primary-deep hover:bg-primary-soft',
  gold: 'bg-secondary text-ink shadow-[0_5px_0_var(--color-secondary-deep)] hover:brightness-105',
  accent: 'bg-accent text-white shadow-[0_5px_0_var(--color-accent-deep)] hover:brightness-105',
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
