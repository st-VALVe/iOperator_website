import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className = '',
  hover = true,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      onClick={onClick}
      className={`
        bg-white/80 dark:bg-dark-bg-secondary/80
        backdrop-blur-lg
        border border-light-border dark:border-dark-border
        rounded-2xl
        shadow-lg shadow-black/5 dark:shadow-black/20
        ${hover ? 'cursor-pointer' : ''}
        ${className}
      `}
      whileHover={hover ? { 
        y: -4,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

interface GlassCard3DProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard3D({ children, className = '' }: GlassCard3DProps) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        bg-white/80 dark:bg-dark-bg-secondary/80
        backdrop-blur-lg
        border border-light-border dark:border-dark-border
        rounded-2xl
        shadow-lg shadow-black/5 dark:shadow-black/20
        transition-all duration-200 ease-out
        ${className}
      `}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}
