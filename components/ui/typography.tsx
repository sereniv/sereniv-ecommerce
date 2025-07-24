import React from "react";
import { cn } from "@/lib/utils";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function H1({ className, children, ...props }: HeadingProps) {
  return (
    <h1 
      className={cn(
        "scroll-m-20 font-bold tracking-tight text-3xl md:text-4xl",
        className
      )} 
      {...props}
    >
      {children}
    </h1>
  );
}

export function H2({ className, children, ...props }: HeadingProps) {
  return (
    <h2 
      className={cn(
        "scroll-m-20 font-semibold tracking-tight text-2xl md:text-3xl",
        className
      )} 
      {...props}
    >
      {children}
    </h2>
  );
}

export function H3({ className, children, ...props }: HeadingProps) {
  return (
    <h3 
      className={cn(
        "scroll-m-20 font-semibold tracking-tight text-xl md:text-2xl",
        className
      )} 
      {...props}
    >
      {children}
    </h3>
  );
}

export function H4({ className, children, ...props }: HeadingProps) {
  return (
    <h4 
      className={cn(
        "scroll-m-20 font-semibold tracking-tight text-lg md:text-xl",
        className
      )} 
      {...props}
    >
      {children}
    </h4>
  );
}

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function P({ className, children, ...props }: TextProps) {
  return (
    <p 
      className={cn(
        "leading-7 [&:not(:first-child)]:mt-6",
        className
      )} 
      {...props}
    >
      {children}
    </p>
  );
}

export function Small({ className, children, ...props }: TextProps) {
  return (
    <p 
      className={cn(
        "text-sm text-muted-foreground",
        className
      )} 
      {...props}
    >
      {children}
    </p>
  );
}

interface TypographyProps extends Omit<React.HTMLAttributes<HTMLElement>, 'as'> {
  children: React.ReactNode;
  as?: React.ElementType;
}

export function Large({ children, className, as, ...props }: TypographyProps) {
  const Component = as || "p";
  return (
    <Component 
      className={cn(
        "text-lg font-semibold text-foreground", 
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Muted({ children, className, as, ...props }: TypographyProps) {
  const Component = as || "p";
  return (
    <Component 
      className={cn(
        "text-sm text-muted-foreground", 
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Lead({ children, className, as, ...props }: TypographyProps) {
  const Component = as || "p";
  return (
    <Component 
      className={cn(
        "text-xl text-muted-foreground", 
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Subtle({ children, className, as, ...props }: TypographyProps) {
  const Component = as || "p";
  return (
    <Component 
      className={cn(
        "text-sm text-muted-foreground/80", 
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
} 