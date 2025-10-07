import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  sub: string;
  role: 'USER' | 'STAFF' | 'ADMIN';
  exp: number;
  iat: number;
  [key: string]: any;
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getUserRole = (token: string): 'USER' | 'STAFF' | 'ADMIN' | null => {
  const decoded = decodeToken(token);
  return decoded?.role || null;
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

export const getRoleBasedRedirectPath = (): string => {
  // DashboardWrapper will handle rendering the appropriate component
  return '/dashboard';
};