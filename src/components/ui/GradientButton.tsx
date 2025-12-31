import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';

interface GradientButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export function GradientButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
}: GradientButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/25',
    secondary: 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border',
    outline: 'bg-transparent border-2 border-primary-500',
  };

  const textColors = {
    primary: {
      normal: 'text-white',
      hover: 'text-white',
    },
    secondary: {
      normal: 'text-light-text dark:text-dark-text',
      hover: 'text-white',
    },
    outline: {
      normal: 'text-primary-500',
      hover: 'text-white',
    },
  };

  const wipeColors = {
    primary: 'bg-primary-700',
    secondary: 'bg-dark-bg dark:bg-light-bg',
    outline: 'bg-primary-500',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        font-semibold rounded-xl
        disabled:opacity-50 disabled:cursor-not-allowed
        relative overflow-hidden
        ${className}
      `}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {/* Wipe background effect */}
      <motion.div
        className={`absolute inset-0 ${wipeColors[variant]} rounded-xl`}
        initial={{ scaleX: 0 }}
        animate={{ 
          scaleX: isHovered ? 1 : 0,
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ 
          duration: 0.4, 
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        style={{ transformOrigin: 'left center' }}
      />
      
      {/* Текст */}
      <span
        className={`relative z-10 block transition-colors duration-300 ${
          isHovered ? textColors[variant].hover : textColors[variant].normal
        }`}
      >
        {children}
      </span>
    </motion.button>
  );
}
