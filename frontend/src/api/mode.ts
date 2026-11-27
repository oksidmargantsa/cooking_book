export const isMock = () => {
  const v = localStorage.getItem('use_mock');
  return v !== null ? v === '1' : import.meta.env.VITE_USE_MOCK === 'true';
};
