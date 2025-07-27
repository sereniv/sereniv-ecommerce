import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import getConfig from 'next/config';
import crypto from 'crypto';

let publicRuntimeConfig: any = null
try{
  publicRuntimeConfig = getConfig().publicRuntimeConfig
}catch(error){
  publicRuntimeConfig = {
    basePath: ''
  }
  console.error("Error getting config:", error)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getApiUrl(path: string) {
  if (process.env.NEXT_PUBLIC_API_URL) {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    return `${process.env.NEXT_PUBLIC_API_URL}/api/${cleanPath}`
  }
  return `${publicRuntimeConfig.basePath}/api/${path}`
}

export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function generateForgotPasswordToken(expiryHours: number = 1): {
  forgotPasswordToken: string;
  forgotPasswordTokenExpiry: Date;
} {
  const token = generateToken();
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + expiryHours);
  
  return {
    forgotPasswordToken: token,
    forgotPasswordTokenExpiry: expiry
  };
}

export function generateVerifyToken(expiryHours: number = 24): {
  verifyToken: string;
  verifyTokenExpiry: Date;
} {
  const token = generateToken();
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + expiryHours);
  
  return {
    verifyToken: token,
    verifyTokenExpiry: expiry
  };
}

export function isTokenExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate;
}