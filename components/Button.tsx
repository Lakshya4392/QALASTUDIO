import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'fill' | 'outline' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  accentColor?: boolean; // Use gold accent for outline style
}

const Button: React.FC<ButtonProps> = ({
  variant = 'fill',
  size = 'md',
  children,
  accentColor = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-display font-medium tracking-wider transition-all duration-500 ease-out';

  const variantStyles = {
    fill: 'bg-black text-white hover:bg-neutral-800',
    outline: accentColor
      ? 'border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white'
      : 'border border-black text-black hover:bg-black hover:text-white',
    minimal: 'text-black border-b border-black/30 hover:border-black hover:text-black pb-1'
  };

  const sizeStyles = {
    sm: 'px-6 py-3 text-[10px]',
    md: 'px-10 py-4 text-xs',
    lg: 'px-16 py-5 text-sm'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
