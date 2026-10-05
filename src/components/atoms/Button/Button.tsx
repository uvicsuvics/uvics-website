import React from 'react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-250 ease-standard';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-600 hover:shadow-primary',
    secondary: 'bg-secondary text-gray-900 hover:bg-[#e6bb00] hover:shadow-md',
    accent: 'bg-accent text-white hover:bg-[#0057db] hover:shadow-accent',
    outline: 'bg-transparent text-primary border-2 border-primary hover:bg-primary-50',
    ghost: 'bg-transparent text-gray-700 hover:bg-muted',
  };

  const sizes = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg rounded-[10px]',
    xl: 'py-5 px-10 text-xl rounded-xl',
  };

  const combinedStyles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedStyles}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedStyles} {...props}>
      {children}
    </button>
  );
}
