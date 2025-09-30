export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER"
}

export interface User {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  password: string;
  isVerified: boolean;
  isActive: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

