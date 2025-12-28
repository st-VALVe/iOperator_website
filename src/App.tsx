import { useState, useEffect } from 'react';
import { translations, getTranslation, type Language } from './translations';
import { Header } from './components/sections/Header';
import { Hero } from './components/sections/Hero';

function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'demo' | 'question'>('demo');

  const t = (key: string) => getTranslation(language, key as keyof typeof translations.en);

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const openForm = (type: 'demo' | 'question') => {
    setFormType(type);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300">
      <Header
        t={t}
        language={language}
        setLanguage={setLanguage}
        onRequestDemo={() => openForm('demo')}
        onAskQuestion={() => openForm('question')}
      />

      <main>
        <Hero
          t={t}
          onRequestDemo={() => openForm('demo')}
        />

        {/* Placeholder for other sections - will be added in next tasks */}
        <section className="section-container py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">More sections coming soon...</h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Features, Pricing, FAQ, Testimonials, and more will be added here.
            </p>
          </div>
        </section>
      </main>

      {/* Contact Form Modal - simplified for now */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">
              {formType === 'demo' ? t('requestDemoTitle') : t('askQuestionTitle')}
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
              Contact form will be implemented in a later phase.
            </p>
            <button
              onClick={() => setIsFormOpen(false)}
              className="w-full btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
