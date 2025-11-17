import { useState } from 'react';
import { MessageSquare, Zap, DollarSign, Star, Bot, TrendingUp, Clock, Users, BarChart3, CheckCircle, X, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { translations, getTranslation, type Language } from './translations';

function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'demo' | 'question'>('demo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Direct email configuration
  // Using mailto: link as primary method - always works, no external services needed
  const RECIPIENT_EMAIL = 'info@ioperator.ai';
  const CONTACT_PHONE = '+905302641313';
  
  const t = (key: keyof typeof translations.en) => getTranslation(language, key);

  const openForm = (type: 'demo' | 'question') => {
    setFormType(type);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData({ name: '', email: '', message: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Prepare email content
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

    // Create mailto link
    const mailtoLink = `mailto:${RECIPIENT_EMAIL}?subject=${subject}&body=${body}`;

    // Open email client
    window.location.href = mailtoLink;

    // Show success message
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
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-orange-500" />
            <span className="text-xl font-bold">{t('siteName')}</span>
          </div>
          <div className="flex gap-4 items-center">
            {/* Language Switcher */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-700 rounded-lg hover:border-orange-500 transition-colors">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium uppercase">{language}</span>
              </button>
              <div className="absolute right-0 mt-2 w-32 bg-gray-900 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <button
                  onClick={() => setLanguage('en')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-500 hover:text-black transition-colors rounded-t-lg ${language === 'en' ? 'bg-orange-500/20 text-orange-500' : ''}`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('ru')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-500 hover:text-black transition-colors ${language === 'ru' ? 'bg-orange-500/20 text-orange-500' : ''}`}
                >
                  Русский
                </button>
                <button
                  onClick={() => setLanguage('tr')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-500 hover:text-black transition-colors rounded-b-lg ${language === 'tr' ? 'bg-orange-500/20 text-orange-500' : ''}`}
                >
                  Türkçe
                </button>
              </div>
            </div>
            <button 
              onClick={() => openForm('demo')}
              className="px-6 py-2 bg-orange-500 text-black font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              {t('requestDemo')}
            </button>
            <button 
              onClick={() => openForm('question')}
              className="px-6 py-2 border border-orange-500 text-orange-500 font-semibold rounded-lg hover:bg-orange-500 hover:text-black transition-colors"
            >
              {t('askQuestion')}
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold leading-tight mb-6">
                {t('heroTitle')}
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                {t('heroSubtitle')}
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
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

                <div className="border border-orange-500 rounded-xl p-4 md:col-span-3 lg:col-span-1">
                  <div className="text-2xl mb-2">⭐</div>
                  <h3 className="text-base font-semibold mb-1">{t('improvesQuality')}</h3>
                  <p className="text-sm text-gray-300">{t('errorFreeService')}</p>
                </div>
              </div>
            </div>

            <div className="relative lg:pt-12">
              <img 
                src="/images/hero-restaurant.png" 
                alt="Modern restaurant interior" 
                className="w-full h-auto rounded-2xl"
              />
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-black to-gray-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-16">{t('whatSystemDoes')}</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-6 text-orange-500">{t('smartCommunications')}</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>{t('communicationVia')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>{t('textVoiceRecognition')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>{t('supportLanguages')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>{t('foodPhotoAnalysis')}</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-6 text-orange-500">{t('orderAutomationTitle')}</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>{t('menuImport')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>{t('dishSelection')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>{t('addressVerification')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>{t('orderProcessing')}</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-6 text-orange-500">{t('personalization')}</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>{t('customerProfiles')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>{t('autoCongratulations')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>{t('orderReminders')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>{t('personalizedOffers')}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 bg-orange-900/30 border border-orange-500/50 rounded-xl p-6">
              <p className="text-lg text-center">
                {t('works247')}
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-16">{t('communicationScenario')}</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="border border-orange-500 rounded-xl p-6">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-black font-bold text-lg mb-4">01</div>
                <h3 className="text-lg font-semibold mb-2">{t('step1Title')}</h3>
                <p className="text-gray-300 text-sm">{t('step1Desc')}</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-6">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-black font-bold text-lg mb-4">02</div>
                <h3 className="text-lg font-semibold mb-2">{t('step2Title')}</h3>
                <p className="text-gray-300 text-sm">{t('step2Desc')}</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-6">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-black font-bold text-lg mb-4">03</div>
                <h3 className="text-lg font-semibold mb-2">{t('step3Title')}</h3>
                <p className="text-gray-300 text-sm">{t('step3Desc')}</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-6">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-black font-bold text-lg mb-4">04</div>
                <h3 className="text-lg font-semibold mb-2">{t('step4Title')}</h3>
                <p className="text-gray-300 text-sm">{t('step4Desc')}</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-6">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-black font-bold text-lg mb-4">05</div>
                <h3 className="text-lg font-semibold mb-2">{t('step5Title')}</h3>
                <p className="text-gray-300 text-sm">{t('step5Desc')}</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-6">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-black font-bold text-lg mb-4">06</div>
                <h3 className="text-lg font-semibold mb-2">{t('step6Title')}</h3>
                <p className="text-gray-300 text-sm">{t('step6Desc')}</p>
              </div>
            </div>

            <div className="bg-orange-900/20 border border-orange-500/50 rounded-xl p-6 text-center">
              <p className="text-lg text-gray-300">{t('allInOneWindow')}</p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-16">{t('operatorCostSavings')}</h2>

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="border border-gray-700 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-6 text-center">{t('traditionalModel')}</h3>
                <ul className="space-y-4 text-gray-300 mb-8">
                  <li>• {t('operators247')}</li>
                  <li>• {t('salariesTaxes')}</li>
                  <li>• {t('humanFactor')}</li>
                  <li>• {t('inabilityToScale')}</li>
                </ul>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-500 mb-2">$2,500</div>
                  <p className="text-gray-400">{t('costs')}</p>
                </div>
              </div>

              <div className="border border-orange-500 rounded-2xl p-8 bg-gradient-to-br from-orange-500/10 to-orange-600/5">
                <h3 className="text-2xl font-bold mb-6 text-center">{t('withAIAssistant')}</h3>
                <ul className="space-y-4 text-gray-300 mb-8">
                  <li>• {t('oneAssistant')}</li>
                  <li>• {t('noDaysOff')}</li>
                  <li>• {t('hundredsInquiries')}</li>
                  <li>• {t('instantScaling')}</li>
                </ul>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-500 mb-2">$50-$200</div>
                  <p className="text-gray-400">{t('costsAI')}</p>
                </div>
              </div>
            </div>

            <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-orange-500 mb-2">95%</div>
                <p className="text-xl text-gray-300">{t('costReduction')}</p>
                <p className="text-sm text-gray-500 mt-2">{t('onCallCenter')}</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-orange-500 mb-2">$2,500</div>
                <p className="text-xl text-gray-300">{t('minimumSavings')}</p>
                <p className="text-sm text-gray-500 mt-2">{t('whenReplacing')}</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-orange-500 mb-2">1-3</div>
                <p className="text-xl text-gray-300">{t('monthsToPayback')}</p>
                <p className="text-sm text-gray-500 mt-2">{t('savingsFromDayOne')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-16">{t('repeatOrderGrowth')}</h2>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold">{t('preferenceMemory')}</h3>
                </div>
                <p className="text-gray-300">
                  {t('preferenceMemoryDesc')}
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold">{t('personalCongratulations')}</h3>
                </div>
                <p className="text-gray-300">
                  {t('personalCongratulationsDesc')}
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold">{t('smartRecommendations')}</h3>
                </div>
                <p className="text-gray-300">
                  {t('smartRecommendationsDesc')}
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold">{t('timelyReminders')}</h3>
                </div>
                <p className="text-gray-300">
                  {t('timelyRemindersDesc')}
                </p>
              </div>
            </div>

            <div className="bg-orange-900/20 border border-orange-500/50 rounded-xl p-6 mb-12">
              <p className="text-lg text-center">
                {t('createsAttention')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 text-center">
              <div>
                <div className="mb-6">
                  <img 
                    src="/images/growth-chart-25-40.png" 
                    alt="25-40% growth chart" 
                    className="w-48 h-48 mx-auto object-contain"
                  />
                </div>
                <div className="text-4xl font-bold text-orange-500 mb-2">25-40%</div>
                <p className="text-xl text-gray-300">{t('repeatOrderGrowthPercent')}</p>
                <p className="text-sm text-gray-500 mt-2">{t('thanksToPersonalization')}</p>
              </div>

              <div>
                <div className="mb-6">
                  <img 
                    src="/images/growth-chart-35.png" 
                    alt="35% growth chart" 
                    className="w-48 h-48 mx-auto object-contain"
                  />
                </div>
                <div className="text-4xl font-bold text-orange-500 mb-2">35%</div>
                <p className="text-xl text-gray-300">{t('averageCheckIncrease')}</p>
                <p className="text-sm text-gray-500 mt-2">{t('throughSmartRecommendations')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-16">{t('serviceImprovement')}</h2>

            <div className="grid lg:grid-cols-2 gap-12 mb-12">
              <div>
                <h3 className="text-2xl font-bold mb-8 text-orange-500">{t('clientBenefits')}</h3>
                <div className="space-y-4">
                  <div className="border border-orange-500 rounded-xl p-4">
                    <div className="text-xl mb-2">⚡</div>
                    <h4 className="text-lg font-semibold mb-1">{t('instantAnswers')}</h4>
                    <p className="text-gray-300 text-sm">{t('instantAnswersDesc')}</p>
                  </div>
                  <div className="border border-orange-500 rounded-xl p-4">
                    <div className="text-xl mb-2">💬</div>
                    <h4 className="text-lg font-semibold mb-1">{t('convenientFormat')}</h4>
                    <p className="text-gray-300 text-sm">{t('convenientFormatDesc')}</p>
                  </div>
                  <div className="border border-orange-500 rounded-xl p-4">
                    <div className="text-xl mb-2">🎤</div>
                    <h4 className="text-lg font-semibold mb-1">{t('voiceCommands')}</h4>
                    <p className="text-gray-300 text-sm">{t('voiceCommandsDesc')}</p>
                  </div>
                  <div className="border border-orange-500 rounded-xl p-4">
                    <div className="text-xl mb-2">🌍</div>
                    <h4 className="text-lg font-semibold mb-1">{t('anyLanguage')}</h4>
                    <p className="text-gray-300 text-sm">{t('anyLanguageDesc')}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-8 text-orange-500">{t('ownerBenefits')}</h3>
                <div className="space-y-4">
                  <div className="border border-orange-500 rounded-xl p-4">
                    <div className="text-xl mb-2">✓</div>
                    <h4 className="text-lg font-semibold mb-1">{t('zeroErrors')}</h4>
                    <p className="text-gray-300 text-sm">{t('zeroErrorsDesc')}</p>
                  </div>
                  <div className="border border-orange-500 rounded-xl p-4">
                    <div className="text-xl mb-2">📊</div>
                    <h4 className="text-lg font-semibold mb-1">{t('structuredData')}</h4>
                    <p className="text-gray-300 text-sm">{t('structuredDataDesc')}</p>
                  </div>
                  <div className="border border-orange-500 rounded-xl p-4">
                    <div className="text-xl mb-2">📈</div>
                    <h4 className="text-lg font-semibold mb-1">{t('realTimeAnalytics')}</h4>
                    <p className="text-gray-300 text-sm">{t('realTimeAnalyticsDesc')}</p>
                  </div>
                  <div className="border border-orange-500 rounded-xl p-4">
                    <div className="text-xl mb-2">🎯</div>
                    <h4 className="text-lg font-semibold mb-1">{t('preciseMarketing')}</h4>
                    <p className="text-gray-300 text-sm">{t('preciseMarketingDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-16">{t('returnOnInvestment')}</h2>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="border border-gray-700 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-6 text-orange-500">{t('initialExpenses')}</h3>
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">{t('systemSetup')}</p>
                    <p className="text-gray-300">{t('oneTimeIntegration')}</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">{t('aiTraining')}</p>
                    <p className="text-gray-300">{t('adaptation')}</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-700 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-6 text-orange-500">{t('monthlyCosts')}</h3>
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">$50-$200</p>
                    <p className="text-gray-300">{t('platformSubscription')}</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">{t('technicalSupport')}</p>
                    <p className="text-gray-300">{t('includedInCost')}</p>
                  </div>
                </div>
              </div>

              <div className="border border-orange-500 rounded-2xl p-8 bg-gradient-to-br from-orange-500/10 to-orange-600/5">
                <h3 className="text-xl font-bold mb-6 text-orange-500">{t('revenueAndSavings')}</h3>
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">$2,500+</p>
                    <p className="text-gray-300">{t('monthlySavings')}</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">15-25%</p>
                    <p className="text-gray-300">{t('salesGrowth')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-orange-500 mb-2">1-3</div>
                <p className="text-xl text-gray-300 mb-2">{t('monthsToPaybackROI')}</p>
                <p className="text-sm text-gray-500">{t('quickReturn')}</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-orange-500 mb-2">$30K+</div>
                <p className="text-xl text-gray-300 mb-2">{t('annualSavings')}</p>
                <p className="text-sm text-gray-500">{t('perLocation')}</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-orange-500 mb-2">300%</div>
                <p className="text-xl text-gray-300 mb-2">{t('roiFirstYear')}</p>
                <p className="text-sm text-gray-500">{t('includingGrowth')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-8">{t('readyForTransformation')}</h2>
            <p className="text-xl text-gray-300 text-center mb-16">
              {t('makesOperations')}
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-16">
              <div className="border border-orange-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-6 h-6 text-orange-500" />
                  <h3 className="text-lg font-bold">{t('reducesExpenses')}</h3>
                </div>
                <p className="text-gray-300">{t('saveUpTo95')}</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                  <h3 className="text-lg font-bold">{t('increasesSales')}</h3>
                </div>
                <p className="text-gray-300">{t('revenueGrowth')}</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-6 h-6 text-orange-500" />
                  <h3 className="text-lg font-bold">{t('works247Title')}</h3>
                </div>
                <p className="text-gray-300">{t('noBreaks')}</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="w-6 h-6 text-orange-500" />
                  <h3 className="text-lg font-bold">{t('improvesExperience')}</h3>
                </div>
                <p className="text-gray-300">{t('personalizationSpeed')}</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-6 md:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="w-6 h-6 text-orange-500" />
                  <h3 className="text-lg font-bold">{t('easyToScale')}</h3>
                </div>
                <p className="text-gray-300">{t('fromOneToHundreds')}</p>
              </div>
            </div>

            <div className="bg-gray-900 border border-orange-500/50 rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-bold mb-4 text-center">{t('nextStep')}</h3>
              <p className="text-gray-300 text-center mb-6">
                {t('readyToConnect')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => openForm('demo')}
                className="px-8 py-4 bg-orange-500 text-black text-lg font-semibold rounded-lg hover:bg-orange-600 transition-colors"
              >
                Request Demo
              </button>
              <button 
                onClick={() => openForm('question')}
                className="px-8 py-4 border border-orange-500 text-orange-500 text-lg font-semibold rounded-lg hover:bg-orange-500 hover:text-black transition-colors"
              >
                Ask Question
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Contact Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-orange-500/50 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-orange-500">
                {formType === 'demo' ? t('requestDemoTitle') : t('askQuestionTitle')}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
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
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
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
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  placeholder={formType === 'demo' ? t('tellAboutRestaurant') : t('askAboutSystem')}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-orange-500 text-black font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t('sending') : (formType === 'demo' ? t('requestDemo') : t('sendQuestion'))}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-6 h-6 text-orange-500" />
                <span className="text-lg font-bold">{t('siteName')}</span>
              </div>
              <p className="text-gray-400 text-sm">
                {t('footerDescription')}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('contactUs')}</h3>
              <div className="space-y-3 text-gray-400 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-orange-500" />
                  <a href={`mailto:${RECIPIENT_EMAIL}`} className="hover:text-orange-500 transition-colors">
                    {RECIPIENT_EMAIL}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-orange-500" />
                  <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="hover:text-orange-500 transition-colors">
                    {CONTACT_PHONE}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <span>{t('globalService')}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('quickLinks')}</h3>
              <div className="space-y-2 text-gray-400 text-sm">
                <button 
                  onClick={() => openForm('demo')}
                  className="block hover:text-orange-500 transition-colors"
                >
                  {t('requestDemo')}
                </button>
                <button 
                  onClick={() => openForm('question')}
                  className="block hover:text-orange-500 transition-colors"
                >
                  {t('askQuestion')}
                </button>
                <a href="#features" className="block hover:text-orange-500 transition-colors">
                  {t('features')}
                </a>
                <a href="#pricing" className="block hover:text-orange-500 transition-colors">
                  {t('pricing')}
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} {t('siteName')}. {t('allRightsReserved')}</p>
            <p className="mt-2">{t('aiPoweredAutomation')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
