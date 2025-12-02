import { useState, useEffect } from 'react';
import { MessageSquare, Zap, DollarSign, Star, Bot, TrendingUp, Clock, Users, BarChart3, CheckCircle, X, Mail, Phone, MapPin, Globe, Menu } from 'lucide-react';
import { translations, getTranslation, type Language } from './translations';

function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'demo' | 'question'>('demo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
      if (!target.closest('.language-menu') && !target.closest('.language-button')) {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Direct email configuration
  const RECIPIENT_EMAIL = 'info@ioperator.ai';
  const CONTACT_PHONE = '+905302641313';
  
  const t = (key: keyof typeof translations.en) => getTranslation(language, key);

  const openForm = (type: 'demo' | 'question') => {
    setFormType(type);
    setIsFormOpen(true);
    setIsMobileMenuOpen(false);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData({ name: '', email: '', message: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const subject = encodeURIComponent(
      formType === 'demo' 
        ? t('requestDemoTitle')
        : t('askQuestionTitle')
    );

    const body = encodeURIComponent(
      `${t('requestType')}: ${formType === 'demo' ? t('requestDemo') : t('askQuestion')}\n\n` +
      `${t('name')}: ${formData.name}\n` +
      `${t('email')}: ${formData.email}\n\n` +
      `${t('message')}:\n${formData.message}\n\n` +
      `---\n` +
      `This message was sent from the contact form on iOperator.ai`
    );

    const mailtoLink = `mailto:${RECIPIENT_EMAIL}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;

    setTimeout(() => {
      alert(`${formType === 'demo' ? t('thankYouDemo') : t('thankYouQuestion')}\n\n${t('emailClientOpen')}\n\n${t('willContactSoon')} ${formData.email}.`);
      closeForm();
      setIsSubmitting(false);
    }, 500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 sticky top-0 bg-black/95 backdrop-blur-sm z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
              <span className="text-lg sm:text-xl font-bold">{t('siteName')}</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-4 items-center">
              <div className="relative language-menu">
                <button 
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  className="language-button flex items-center gap-2 px-3 py-2 min-h-[44px] border border-gray-700 rounded-lg hover:border-orange-500 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium uppercase">{language}</span>
                </button>
                {isLanguageMenuOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => { setLanguage('en'); setIsLanguageMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 min-h-[44px] text-sm hover:bg-orange-500 hover:text-black transition-colors rounded-t-lg ${language === 'en' ? 'bg-orange-500/20 text-orange-500' : ''}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => { setLanguage('ru'); setIsLanguageMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 min-h-[44px] text-sm hover:bg-orange-500 hover:text-black transition-colors ${language === 'ru' ? 'bg-orange-500/20 text-orange-500' : ''}`}
                    >
                      Русский
                    </button>
                    <button
                      onClick={() => { setLanguage('tr'); setIsLanguageMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 min-h-[44px] text-sm hover:bg-orange-500 hover:text-black transition-colors rounded-b-lg ${language === 'tr' ? 'bg-orange-500/20 text-orange-500' : ''}`}
                    >
                      Türkçe
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={() => openForm('demo')}
                className="px-6 py-2 min-h-[44px] bg-orange-500 text-black font-semibold rounded-lg hover:bg-orange-600 transition-colors"
              >
                {t('requestDemo')}
              </button>
              <button 
                onClick={() => openForm('question')}
                className="px-6 py-2 min-h-[44px] border border-orange-500 text-orange-500 font-semibold rounded-lg hover:bg-orange-500 hover:text-black transition-colors"
              >
                {t('askQuestion')}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-menu-button md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="mobile-menu md:hidden mt-4 pb-4 border-t border-gray-800">
              <div className="flex flex-col gap-3 mt-4">
                <div className="relative language-menu">
                  <button 
                    onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                    className="language-button w-full flex items-center justify-between px-4 py-3 min-h-[44px] border border-gray-700 rounded-lg hover:border-orange-500 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span className="text-sm font-medium uppercase">{language}</span>
                    </div>
                    <span className="text-sm">{isLanguageMenuOpen ? '▲' : '▼'}</span>
                  </button>
                  {isLanguageMenuOpen && (
                    <div className="mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
                      <button
                        onClick={() => { setLanguage('en'); setIsLanguageMenuOpen(false); }}
                        className={`w-full text-left px-4 py-3 min-h-[44px] text-sm hover:bg-orange-500 hover:text-black transition-colors rounded-t-lg ${language === 'en' ? 'bg-orange-500/20 text-orange-500' : ''}`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => { setLanguage('ru'); setIsLanguageMenuOpen(false); }}
                        className={`w-full text-left px-4 py-3 min-h-[44px] text-sm hover:bg-orange-500 hover:text-black transition-colors ${language === 'ru' ? 'bg-orange-500/20 text-orange-500' : ''}`}
                      >
                        Русский
                      </button>
                      <button
                        onClick={() => { setLanguage('tr'); setIsLanguageMenuOpen(false); }}
                        className={`w-full text-left px-4 py-3 min-h-[44px] text-sm hover:bg-orange-500 hover:text-black transition-colors rounded-b-lg ${language === 'tr' ? 'bg-orange-500/20 text-orange-500' : ''}`}
                      >
                        Türkçe
                      </button>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => openForm('demo')}
                  className="w-full px-6 py-3 min-h-[44px] bg-orange-500 text-black font-semibold rounded-lg hover:bg-orange-600 transition-colors text-center"
                >
                  {t('requestDemo')}
                </button>
                <button 
                  onClick={() => openForm('question')}
                  className="w-full px-6 py-3 min-h-[44px] border border-orange-500 text-orange-500 font-semibold rounded-lg hover:bg-orange-500 hover:text-black transition-colors text-center"
                >
                  {t('askQuestion')}
                </button>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4 sm:mb-6">
                {t('heroTitle')}
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8">
                {t('heroSubtitle')}
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="border border-orange-500 rounded-xl p-4">
                  <div className="text-2xl mb-2">⚡</div>
                  <h3 className="text-base font-semibold mb-1">{t('acceleratesService')}</h3>
                  <p className="text-sm text-gray-300">{t('instantResponses')}</p>
                </div>

                <div className="border border-orange-500 rounded-xl p-4">
                  <div className="text-2xl mb-2">💰</div>
                  <h3 className="text-base font-semibold mb-1">{t('reducesCosts')}</h3>
                  <p className="text-sm text-gray-300">{t('saveUpTo')}</p>
                </div>

                <div className="border border-orange-500 rounded-xl p-4 sm:col-span-2 lg:col-span-1">
                  <div className="text-2xl mb-2">⭐</div>
                  <h3 className="text-base font-semibold mb-1">{t('improvesQuality')}</h3>
                  <p className="text-sm text-gray-300">{t('errorFreeService')}</p>
                </div>
              </div>
            </div>

            <div className="relative lg:pt-12 mt-8 lg:mt-0">
              <img 
                src="/images/hero-restaurant.png" 
                alt="Modern restaurant interior" 
                className="w-full h-auto rounded-2xl"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-black to-gray-900 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 lg:mb-16">{t('whatSystemDoes')}</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-orange-500">{t('smartCommunications')}</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">{t('communicationVia')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">{t('textVoiceRecognition')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">{t('supportLanguages')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">{t('foodPhotoAnalysis')}</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-orange-500">{t('orderAutomationTitle')}</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">{t('menuImport')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">{t('dishSelection')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">{t('addressVerification')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">{t('orderProcessing')}</span>
                  </li>
                </ul>
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-orange-500">{t('personalization')}</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">{t('customerProfiles')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">{t('autoCongratulations')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">{t('orderReminders')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">{t('personalizedOffers')}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 sm:mt-12 bg-orange-900/30 border border-orange-500/50 rounded-xl p-4 sm:p-6">
              <p className="text-base sm:text-lg text-center">
                {t('works247')}
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 lg:py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 lg:mb-16">{t('communicationScenario')}</h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <div className="border border-orange-500 rounded-xl p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-full flex items-center justify-center text-black font-bold text-base sm:text-lg mb-3 sm:mb-4">01</div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">{t('step1Title')}</h3>
                <p className="text-gray-300 text-xs sm:text-sm">{t('step1Desc')}</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-full flex items-center justify-center text-black font-bold text-base sm:text-lg mb-3 sm:mb-4">02</div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">{t('step2Title')}</h3>
                <p className="text-gray-300 text-xs sm:text-sm">{t('step2Desc')}</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-full flex items-center justify-center text-black font-bold text-base sm:text-lg mb-3 sm:mb-4">03</div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">{t('step3Title')}</h3>
                <p className="text-gray-300 text-xs sm:text-sm">{t('step3Desc')}</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-full flex items-center justify-center text-black font-bold text-base sm:text-lg mb-3 sm:mb-4">04</div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">{t('step4Title')}</h3>
                <p className="text-gray-300 text-xs sm:text-sm">{t('step4Desc')}</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-full flex items-center justify-center text-black font-bold text-base sm:text-lg mb-3 sm:mb-4">05</div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">{t('step5Title')}</h3>
                <p className="text-gray-300 text-xs sm:text-sm">{t('step5Desc')}</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-full flex items-center justify-center text-black font-bold text-base sm:text-lg mb-3 sm:mb-4">06</div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">{t('step6Title')}</h3>
                <p className="text-gray-300 text-xs sm:text-sm">{t('step6Desc')}</p>
              </div>
            </div>

            <div className="bg-orange-900/20 border border-orange-500/50 rounded-xl p-4 sm:p-6 text-center">
              <p className="text-base sm:text-lg text-gray-300">{t('allInOneWindow')}</p>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 lg:py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 lg:mb-16">{t('operatorCostSavings')}</h2>

            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
              <div className="border border-gray-700 rounded-2xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">{t('traditionalModel')}</h3>
                <ul className="space-y-3 sm:space-y-4 text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base">
                  <li>• {t('operators247')}</li>
                  <li>• {t('salariesTaxes')}</li>
                  <li>• {t('humanFactor')}</li>
                  <li>• {t('inabilityToScale')}</li>
                </ul>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-orange-500 mb-2">$2,500</div>
                  <p className="text-gray-400 text-sm sm:text-base">{t('costs')}</p>
                </div>
              </div>

              <div className="border border-orange-500 rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-orange-500/10 to-orange-600/5">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">{t('withAIAssistant')}</h3>
                <ul className="space-y-3 sm:space-y-4 text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base">
                  <li>• {t('oneAssistant')}</li>
                  <li>• {t('noDaysOff')}</li>
                  <li>• {t('hundredsInquiries')}</li>
                  <li>• {t('instantScaling')}</li>
                </ul>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-orange-500 mb-2">$50-$200</div>
                  <p className="text-gray-400 text-sm sm:text-base">{t('costsAI')}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 sm:mt-12 lg:mt-16 grid sm:grid-cols-3 gap-6 sm:gap-8 text-center">
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-orange-500 mb-2">95%</div>
                <p className="text-lg sm:text-xl text-gray-300">{t('costReduction')}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">{t('onCallCenter')}</p>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-orange-500 mb-2">$2,500</div>
                <p className="text-lg sm:text-xl text-gray-300">{t('minimumSavings')}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">{t('whenReplacing')}</p>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-orange-500 mb-2">1-3</div>
                <p className="text-lg sm:text-xl text-gray-300">{t('monthsToPayback')}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">{t('savingsFromDayOne')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 lg:mb-16">{t('repeatOrderGrowth')}</h2>

            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12 lg:mb-16">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold">{t('preferenceMemory')}</h3>
                </div>
                <p className="text-gray-300 text-sm sm:text-base">
                  {t('preferenceMemoryDesc')}
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold">{t('personalCongratulations')}</h3>
                </div>
                <p className="text-gray-300 text-sm sm:text-base">
                  {t('personalCongratulationsDesc')}
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold">{t('smartRecommendations')}</h3>
                </div>
                <p className="text-gray-300 text-sm sm:text-base">
                  {t('smartRecommendationsDesc')}
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold">{t('timelyReminders')}</h3>
                </div>
                <p className="text-gray-300 text-sm sm:text-base">
                  {t('timelyRemindersDesc')}
                </p>
              </div>
            </div>

            <div className="bg-orange-900/20 border border-orange-500/50 rounded-xl p-4 sm:p-6 mb-8 sm:mb-12">
              <p className="text-base sm:text-lg text-center">
                {t('createsAttention')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 text-center">
              <div>
                <div className="mb-4 sm:mb-6">
                  <img 
                    src="/images/growth-chart-25-40.png" 
                    alt="25-40% growth chart" 
                    className="w-32 h-32 sm:w-48 sm:h-48 mx-auto object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-orange-500 mb-2">25-40%</div>
                <p className="text-lg sm:text-xl text-gray-300">{t('repeatOrderGrowthPercent')}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">{t('thanksToPersonalization')}</p>
              </div>

              <div>
                <div className="mb-4 sm:mb-6">
                  <img 
                    src="/images/growth-chart-35.png" 
                    alt="35% growth chart" 
                    className="w-32 h-32 sm:w-48 sm:h-48 mx-auto object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-orange-500 mb-2">35%</div>
                <p className="text-lg sm:text-xl text-gray-300">{t('averageCheckIncrease')}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">{t('throughSmartRecommendations')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 lg:mb-16">{t('serviceImprovement')}</h2>

            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 mb-8 sm:mb-12">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-orange-500">{t('clientBenefits')}</h3>
                <div className="space-y-4">
                  <div className="border border-orange-500 rounded-xl p-4">
                    <div className="text-xl mb-2">⚡</div>
                    <h4 className="text-base sm:text-lg font-semibold mb-1">{t('instantAnswers')}</h4>
                    <p className="text-gray-300 text-xs sm:text-sm">{t('instantAnswersDesc')}</p>
                  </div>
                  <div className="border border-orange-500 rounded-xl p-4">
                    <div className="text-xl mb-2">💬</div>
                    <h4 className="text-base sm:text-lg font-semibold mb-1">{t('convenientFormat')}</h4>
                    <p className="text-gray-300 text-xs sm:text-sm">{t('convenientFormatDesc')}</p>
                  </div>
                  <div className="border border-orange-500 rounded-xl p-4">
                    <div className="text-xl mb-2">🎤</div>
                    <h4 className="text-base sm:text-lg font-semibold mb-1">{t('voiceCommands')}</h4>
                    <p className="text-gray-300 text-xs sm:text-sm">{t('voiceCommandsDesc')}</p>
                  </div>
                  <div className="border border-orange-500 rounded-xl p-4">
                    <div className="text-xl mb-2">🌍</div>
                    <h4 className="text-base sm:text-lg font-semibold mb-1">{t('anyLanguage')}</h4>
                    <p className="text-gray-300 text-xs sm:text-sm">{t('anyLanguageDesc')}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-orange-500">{t('ownerBenefits')}</h3>
                <div className="space-y-4">
                  <div className="border border-orange-500 rounded-xl p-4">
                    <div className="text-xl mb-2">✓</div>
                    <h4 className="text-base sm:text-lg font-semibold mb-1">{t('zeroErrors')}</h4>
                    <p className="text-gray-300 text-xs sm:text-sm">{t('zeroErrorsDesc')}</p>
                  </div>
                  <div className="border border-orange-500 rounded-xl p-4">
                    <div className="text-xl mb-2">📊</div>
                    <h4 className="text-base sm:text-lg font-semibold mb-1">{t('structuredData')}</h4>
                    <p className="text-gray-300 text-xs sm:text-sm">{t('structuredDataDesc')}</p>
                  </div>
                  <div className="border border-orange-500 rounded-xl p-4">
                    <div className="text-xl mb-2">📈</div>
                    <h4 className="text-base sm:text-lg font-semibold mb-1">{t('realTimeAnalytics')}</h4>
                    <p className="text-gray-300 text-xs sm:text-sm">{t('realTimeAnalyticsDesc')}</p>
                  </div>
                  <div className="border border-orange-500 rounded-xl p-4">
                    <div className="text-xl mb-2">🎯</div>
                    <h4 className="text-base sm:text-lg font-semibold mb-1">{t('preciseMarketing')}</h4>
                    <p className="text-gray-300 text-xs sm:text-sm">{t('preciseMarketingDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 lg:py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 lg:mb-16">{t('returnOnInvestment')}</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12 lg:mb-16">
              <div className="border border-gray-700 rounded-2xl p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-orange-500">{t('initialExpenses')}</h3>
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-xs sm:text-sm text-gray-400 mb-2">{t('systemSetup')}</p>
                    <p className="text-gray-300 text-sm sm:text-base">{t('oneTimeIntegration')}</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-xs sm:text-sm text-gray-400 mb-2">{t('aiTraining')}</p>
                    <p className="text-gray-300 text-sm sm:text-base">{t('adaptation')}</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-700 rounded-2xl p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-orange-500">{t('monthlyCosts')}</h3>
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-xs sm:text-sm text-gray-400 mb-2">$50-$200</p>
                    <p className="text-gray-300 text-sm sm:text-base">{t('platformSubscription')}</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-xs sm:text-sm text-gray-400 mb-2">{t('technicalSupport')}</p>
                    <p className="text-gray-300 text-sm sm:text-base">{t('includedInCost')}</p>
                  </div>
                </div>
              </div>

              <div className="border border-orange-500 rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-orange-500/10 to-orange-600/5 sm:col-span-2 lg:col-span-1">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-orange-500">{t('revenueAndSavings')}</h3>
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-xs sm:text-sm text-gray-400 mb-2">$2,500+</p>
                    <p className="text-gray-300 text-sm sm:text-base">{t('monthlySavings')}</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-xs sm:text-sm text-gray-400 mb-2">15-25%</p>
                    <p className="text-gray-300 text-sm sm:text-base">{t('salesGrowth')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 text-center">
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-orange-500 mb-2">1-3</div>
                <p className="text-lg sm:text-xl text-gray-300 mb-2">{t('monthsToPaybackROI')}</p>
                <p className="text-xs sm:text-sm text-gray-500">{t('quickReturn')}</p>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-orange-500 mb-2">$30K+</div>
                <p className="text-lg sm:text-xl text-gray-300 mb-2">{t('annualSavings')}</p>
                <p className="text-xs sm:text-sm text-gray-500">{t('perLocation')}</p>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-orange-500 mb-2">300%</div>
                <p className="text-lg sm:text-xl text-gray-300 mb-2">{t('roiFirstYear')}</p>
                <p className="text-xs sm:text-sm text-gray-500">{t('includingGrowth')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8">{t('readyForTransformation')}</h2>
            <p className="text-lg sm:text-xl text-gray-300 text-center mb-8 sm:mb-12 lg:mb-16">
              {t('makesOperations')}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16">
              <div className="border border-orange-500 rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                  <h3 className="text-base sm:text-lg font-bold">{t('reducesExpenses')}</h3>
                </div>
                <p className="text-gray-300 text-sm sm:text-base">{t('saveUpTo95')}</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                  <h3 className="text-base sm:text-lg font-bold">{t('increasesSales')}</h3>
                </div>
                <p className="text-gray-300 text-sm sm:text-base">{t('revenueGrowth')}</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                  <h3 className="text-base sm:text-lg font-bold">{t('works247Title')}</h3>
                </div>
                <p className="text-gray-300 text-sm sm:text-base">{t('noBreaks')}</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                  <h3 className="text-base sm:text-lg font-bold">{t('improvesExperience')}</h3>
                </div>
                <p className="text-gray-300 text-sm sm:text-base">{t('personalizationSpeed')}</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-4 sm:p-6 sm:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                  <h3 className="text-base sm:text-lg font-bold">{t('easyToScale')}</h3>
                </div>
                <p className="text-gray-300 text-sm sm:text-base">{t('fromOneToHundreds')}</p>
              </div>
            </div>

            <div className="bg-gray-900 border border-orange-500/50 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center">{t('nextStep')}</h3>
              <p className="text-gray-300 text-center text-sm sm:text-base mb-4 sm:mb-6">
                {t('readyToConnect')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button 
                onClick={() => openForm('demo')}
                className="px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] bg-orange-500 text-black text-base sm:text-lg font-semibold rounded-lg hover:bg-orange-600 transition-colors"
              >
                Request Demo
              </button>
              <button 
                onClick={() => openForm('question')}
                className="px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] border border-orange-500 text-orange-500 text-base sm:text-lg font-semibold rounded-lg hover:bg-orange-500 hover:text-black transition-colors"
              >
                Ask Question
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Contact Form Modal - Mobile Optimized */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-gray-900 border border-orange-500/50 rounded-2xl p-4 sm:p-6 lg:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-orange-500">
                {formType === 'demo' ? t('requestDemoTitle') : t('askQuestionTitle')}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close form"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('name')} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 min-h-[44px] bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors text-base"
                  placeholder={t('name')}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('email')} *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 min-h-[44px] bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors text-base"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  {formType === 'demo' ? t('tellAboutRestaurant') : t('yourQuestion')} *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors resize-none text-base"
                  placeholder={formType === 'demo' ? t('tellAboutRestaurant') : t('askAboutSystem')}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 min-h-[44px] bg-orange-500 text-black font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {isSubmitting ? t('sending') : (formType === 'demo' ? t('requestDemo') : t('sendQuestion'))}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isSubmitting}
                  className="px-6 py-3 min-h-[44px] border border-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-black border-t border-gray-800 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                <span className="text-base sm:text-lg font-bold">{t('siteName')}</span>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm">
                {t('footerDescription')}
              </p>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('contactUs')}</h3>
              <div className="space-y-2 sm:space-y-3 text-gray-400 text-xs sm:text-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                  <a href={`mailto:${RECIPIENT_EMAIL}`} className="hover:text-orange-500 transition-colors break-all">
                    {RECIPIENT_EMAIL}
                  </a>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                  <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="hover:text-orange-500 transition-colors">
                    {CONTACT_PHONE}
                  </a>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                  <span>{t('globalService')}</span>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('quickLinks')}</h3>
              <div className="space-y-2 text-gray-400 text-xs sm:text-sm">
                <button 
                  onClick={() => openForm('demo')}
                  className="block hover:text-orange-500 transition-colors text-left min-h-[32px]"
                >
                  {t('requestDemo')}
                </button>
                <button 
                  onClick={() => openForm('question')}
                  className="block hover:text-orange-500 transition-colors text-left min-h-[32px]"
                >
                  {t('askQuestion')}
                </button>
                <a href="#features" className="block hover:text-orange-500 transition-colors min-h-[32px]">
                  {t('features')}
                </a>
                <a href="#pricing" className="block hover:text-orange-500 transition-colors min-h-[32px]">
                  {t('pricing')}
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-gray-400 text-xs sm:text-sm">
            <p>&copy; {new Date().getFullYear()} {t('siteName')}. {t('allRightsReserved')}</p>
            <p className="mt-2">{t('aiPoweredAutomation')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
