export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER"
}

export interface User {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  isVerified: boolean;
  isActive: boolean;
  forgotPasswordToken?: string;
  forgotPasswordTokenExpiry?: Date;
  verifyToken?: string;
  verifyTokenExpiry?: Date;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

