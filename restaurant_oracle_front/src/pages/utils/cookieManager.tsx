export const getCookie = (cookie: string, name: string): string | null => {
  const parts = cookie.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() ?? null;
  }
  return null;
};
