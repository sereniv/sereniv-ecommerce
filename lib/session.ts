import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: string;
  isVerified: boolean;
}

export function setAuthToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, { expires: 7, secure: true, sameSite: 'strict' });
}

export function getAuthToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function removeAuthToken(): void {
  Cookies.remove(TOKEN_KEY);
}

export function setUserData(user: UserSession): void {
  Cookies.set(USER_KEY, JSON.stringify(user), { expires: 7, secure: true, sameSite: 'strict' });
}

export function getUserData(): UserSession | null {
  const userData = Cookies.get(USER_KEY);
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
}

export function removeUserData(): void {
  Cookies.remove(USER_KEY);
}

export function clearAuth(): void {
  removeAuthToken();
  removeUserData();
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function isAdmin(): boolean {
  const user = getUserData();
  return user?.role === 'ADMIN';
} 