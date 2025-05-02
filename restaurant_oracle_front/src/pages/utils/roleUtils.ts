export const getUserRole = (): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; role=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export const isWaiter = (): boolean => {
  const role = getUserRole();
  return role === 'waiter';
};

export const isAdmin = (): boolean => {
  const role = getUserRole();
  return role === 'admin';
}; 