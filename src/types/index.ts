// Main types for CineHub movie booking system
export interface User {
  id: string;
  username: string;
  role: 'USER' | 'STAFF' | 'ADMIN';
}



