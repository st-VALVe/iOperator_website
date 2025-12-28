import { useState, useEffect } from 'react';
import { translations, getTranslation, type Language } from './translations';
import {
  Header,
  Hero,
  Integrations,
  Features,
  HowItWorks,
  Pricing,
  FAQ,
  Testimonials,
  CTA,
  Footer,
} from './components/sections';

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

  const handleSelectPlan = (plan: string) => {
    console.log('Selected plan:', plan);
    openForm('demo');
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
        <Hero t={t} onRequestDemo={() => openForm('demo')} />
        <Integrations t={t} />
        <Features t={t} />
        <HowItWorks t={t} />
        <Pricing t={t} onSelectPlan={handleSelectPlan} />
        <Testimonials t={t} />
        <FAQ t={t} />
        <CTA t={t} onRequestDemo={() => openForm('demo')} />
      </main>

      <Footer t={t} />

      {/* Contact Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 text-light-text dark:text-dark-text">
              {formType === 'demo' ? t('requestDemoTitle') : t('askQuestionTitle')}
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
              Contact form will be implemented in Phase 2.
            </p>
            <button
              onClick={() => setIsFormOpen(false)}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold hover:opacity-90 transition-opacity"
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
