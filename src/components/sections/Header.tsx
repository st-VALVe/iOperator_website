import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Globe, Menu, X } from 'lucide-react';
import { ThemeToggle, GradientButton } from '../ui';
import { Language } from '../../translations';

interface HeaderProps {
  t: (key: string) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
  onRequestDemo: () => void;
  onAskQuestion: () => void;
}

export function Header({
  t,
  language,
  setLanguage,
  onRequestDemo,
  onAskQuestion,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'tr', name: 'Türkçe' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-lg border-b border-light-border dark:border-dark-border">
      <nav className="section-container py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="/"
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-light-text dark:text-dark-text">
              {t('siteName')}
            </span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 transition-colors">
              FAQ
            </a>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <motion.button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border hover:border-primary-500 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Globe className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                <span className="text-sm font-medium uppercase text-light-text dark:text-dark-text">
                  {language}
                </span>
              </motion.button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-36 bg-white dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-xl shadow-lg overflow-hidden"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          language === lang.code
                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                            : 'text-light-text dark:text-dark-text hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* CTA Buttons */}
            <GradientButton variant="secondary" size="sm" onClick={onAskQuestion}>
              {t('askQuestion')}
            </GradientButton>
            <GradientButton size="sm" onClick={onRequestDemo}>
              {t('requestDemo')}
            </GradientButton>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl bg-light-bg-tertiary dark:bg-dark-bg-tertiary"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-light-text dark:text-dark-text" />
              ) : (
                <Menu className="w-6 h-6 text-light-text dark:text-dark-text" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4 border-t border-light-border dark:border-dark-border pt-4"
            >
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-light-text dark:text-dark-text">Features</a>
                <a href="#pricing" className="text-light-text dark:text-dark-text">Pricing</a>
                <a href="#faq" className="text-light-text dark:text-dark-text">FAQ</a>
                <div className="flex gap-2 pt-4">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        language === lang.code
                          ? 'bg-primary-500 text-white'
                          : 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text dark:text-dark-text'
                      }`}
                    >
                      {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <GradientButton onClick={onRequestDemo}>
                    {t('requestDemo')}
                  </GradientButton>
                  <GradientButton variant="outline" onClick={onAskQuestion}>
                    {t('askQuestion')}
                  </GradientButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
