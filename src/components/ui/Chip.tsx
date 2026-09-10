import type { ReactNode } from 'react';

// Drop-in replacement for @heroui/react's Chip.
// HeroUI v3 requires React 19 (it renders <Context> directly, which React 18
// treats as a Context.Consumer and crashes with "r is not a function").
// This app is on React 18, so the chip is rendered with plain Tailwind instead.

type ChipColor = 'default' | 'warning' | 'success' | 'accent' | 'danger';
type ChipSize = 'sm' | 'md';

type Props = {
  children: ReactNode;
  color?: ChipColor;
  variant?: 'soft' | 'solid';
  size?: ChipSize;
  className?: string;
};

const SOFT: Record<ChipColor, string> = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  warning: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  accent: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const SOLID: Record<ChipColor, string> = {
  default: 'bg-gray-700 text-white',
  warning: 'bg-orange-500 text-white',
  success: 'bg-green-600 text-white',
  accent: 'bg-purple-600 text-white',
  danger: 'bg-red-600 text-white',
};

const SIZE: Record<ChipSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
};

export default function Chip({ children, color = 'default', variant = 'soft', size = 'sm', className = '' }: Props) {
  const palette = variant === 'solid' ? SOLID : SOFT;
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full font-medium ${SIZE[size]} ${palette[color]} ${className}`}>
      {children}
    </span>
  );
}
