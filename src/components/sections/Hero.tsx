import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { GradientButton, AnimatedCounter } from '../ui';
import { HeroChat } from '../chat/HeroChat';

interface HeroProps {
  t: (key: string) => string;
  onRequestDemo: () => void;
}

export function Hero({ t, onRequestDemo }: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-50/50 dark:from-dark-bg dark:via-dark-bg-secondary dark:to-dark-bg" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-primary-500/20 via-primary-500/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-primary-400/10 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Floating elements */}
      <motion.div
        className="absolute top-20 right-20 w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 opacity-20 blur-xl"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-40 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 opacity-10 blur-2xl"
        animate={{
          y: [0, 20, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="section-container py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            AI-Powered Virtual Operators
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            <span className="text-light-text dark:text-dark-text">
              {t('heroTitle').split(' ').slice(0, -2).join(' ')}{' '}
            </span>
            <span className="gradient-text">
              {t('heroTitle').split(' ').slice(-2).join(' ')}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-light-text-secondary dark:text-dark-text-secondary mb-10 max-w-2xl mx-auto"
          >
            {t('heroSubtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <GradientButton onClick={onRequestDemo} size="lg">
              {t('requestDemo')}
              <ArrowRight className="inline-block ml-2 w-5 h-5" />
            </GradientButton>
          </motion.div>

          {/* Embedded Chat Demo - Updated */}
          <HeroChat t={t} />

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-1">
                <AnimatedCounter value={50000} suffix="+" />
              </div>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                Messages Processed
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-1">
                <AnimatedCounter value={95} suffix="%" />
              </div>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                Cost Reduction
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-1">
                <AnimatedCounter value={24} suffix="/7" />
              </div>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                Availability
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-1">
                <AnimatedCounter value={3} suffix="+" />
              </div>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                Languages
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
