export const getCookie = (cookie: string, name: string): string | null => {
  const parts = cookie.split('; ').find((part) => part.startsWith(`${name}=`));
  if (parts) {
    return parts.split('=')[1] ?? null;
  }
  return null;
};
