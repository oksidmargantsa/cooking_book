import type { SVGProps } from 'react';

const P = {
  back: 'M19 12H5M12 19l-7-7 7-7',
  forward: 'M5 12h14M12 5l7 7-7 7',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  filters: 'M4 8h10M18 8h2M4 16h2M10 16h10M14 5v6M8 13v6',
  heart: 'M12 20s-7.5-4.6-9.2-9.4C1.6 7 3.7 4 6.8 4c2 0 3.3 1 5.2 3 1.9-2 3.2-3 5.2-3 3.1 0 5.2 3 4 6.6C19.500 15.400 12 20 12 20z',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  home: 'M3 11l9-8 9 8M5 9.500V20h5v-6h4v6h5V9.500',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12.500l4.500 4.500L19 7.500',
  chevronRight: 'M9 6l6 6-6 6',
  chevronLeft: 'M15 6l-6 6 6 6',
  chevronDown: 'M6 9l6 6 6-6',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3',
  pencil: 'M4 20h4L19 9a2.800 2.800 0 0 0-4-4L4 16v4zM13.500 6.500l4 4',
  menu: 'M4 7h16M4 12h16M4 17h16',
  logout: 'M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M16 8l4 4-4 4M20 12H9',
  camera: 'M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM12 17a3.500 3.500 0 1 0 0-7 3.500 3.500 0 0 0 0 7z',
  eye: 'M2 12s3.500-7 10-7 10 7 10 7-3.500 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  eyeOff: 'M3 3l18 18M10.600 5.100A9.600 9.600 0 0 1 12 5c6.500 0 10 7 10 7a17 17 0 0 1-3.200 4M6.600 6.600A16 16 0 0 0 2 12s3.500 7 10 7c1.600 0 3-.4 4.300-1M9.900 9.900a3 3 0 0 0 4.200 4.200',
  alert: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v5M12 16.500v.01',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.500v.01',
  lock: 'M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V8a4 4 0 0 1 8 0v3',
  leaf: 'M5 19c0-9 5-14 15-14 0 10-5 15-14 15M5 19l8-8',
  more: 'M12 6v.01M12 12v.01M12 18v.01',
  utensils: 'M7 3v8a2 2 0 0 0 2 2v8M5 3v6M9 3v6M17 21V3c-2.500 1-4 4-4 8v2h4',
} as const;
export type IconName = keyof typeof P;

interface Props extends Omit<SVGProps<SVGSVGElement>, 'name'> { name: IconName; size?: number }

export function Icon({ name, size = 20, ...rest }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      <path d={P[name]} />
    </svg>
  );
}
