import type { ButtonHTMLAttributes } from 'react';
import './ui.css';

type Variant = 'accent' | 'ink' | 'lime' | 'outline' | 'danger' | 'danger-outline';
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; size?: 'lg' | 'md' | 'sm'; block?: boolean;
}
export function Button({ variant = 'ink', size, block, className = '', type = 'button', ...rest }: Props) {
  const cls = ['btn', `btn--${variant}`, size && `btn--${size}`, block && 'btn--block', className].filter(Boolean).join(' ');
  return <button type={type} className={cls} {...rest} />;
}
