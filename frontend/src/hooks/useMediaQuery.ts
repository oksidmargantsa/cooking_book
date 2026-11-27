import { useEffect, useState } from 'react';

export const BREAKPOINTS = { tablet: 768, desktop: 1100 } as const;

export function useMediaQuery(query: string) {
  const [m, setM] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const h = () => setM(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [query]);
  return m;
}
export const useIsDesktop = () => useMediaQuery(`(min-width: ${BREAKPOINTS.desktop}px)`);
