import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "px-4 py-2 font-bold transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-black";
  
  const variants = {
    primary: "bg-givd-blue text-white shadow-neo hover:bg-blue-600",
    secondary: "bg-givd-green text-black shadow-neo hover:bg-green-400",
    danger: "bg-givd-orange text-black shadow-neo hover:bg-orange-400",
    ghost: "bg-transparent text-gray-300 border-gray-600 hover:bg-gray-800 shadow-none border-dashed"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};