import { motion } from 'framer-motion';
import { 
  Bot, 
  MessageSquare, 
  Clock, 
  Globe, 
  Zap, 
  Shield,
  BarChart3,
  Mic,
  Settings
} from 'lucide-react';
import { BentoGrid, BentoCard } from '../ui/BentoGrid';

interface FeaturesProps {
  t: (key: string) => string;
}

const features = [
  {
    icon: <Bot className="w-6 h-6 text-white" />,
    titleKey: 'feature1Title',
    descKey: 'feature1Desc',
    gradient: 'from-blue-500/10 to-blue-600/5',
    className: 'md:col-span-2 lg:col-span-1',
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-white" />,
    titleKey: 'feature2Title',
    descKey: 'feature2Desc',
    gradient: 'from-green-500/10 to-green-600/5',
  },
  {
    icon: <Clock className="w-6 h-6 text-white" />,
    titleKey: 'feature3Title',
    descKey: 'feature3Desc',
    gradient: 'from-purple-500/10 to-purple-600/5',
  },
  {
    icon: <Globe className="w-6 h-6 text-white" />,
    titleKey: 'feature4Title',
    descKey: 'feature4Desc',
    gradient: 'from-orange-500/10 to-orange-600/5',
  },
  {
    icon: <Zap className="w-6 h-6 text-white" />,
    titleKey: 'feature5Title',
    descKey: 'feature5Desc',
    gradient: 'from-yellow-500/10 to-yellow-600/5',
  },
  {
    icon: <Shield className="w-6 h-6 text-white" />,
    titleKey: 'feature6Title',
    descKey: 'feature6Desc',
    gradient: 'from-red-500/10 to-red-600/5',
  },
];

// Default translations for features
const defaultFeatures = {
  feature1Title: 'AI-Powered Conversations',
  feature1Desc: 'Natural language processing that understands context and intent, providing human-like responses to your customers.',
  feature2Title: 'Multi-Channel Support',
  feature2Desc: 'Connect with customers on Telegram, WhatsApp, website chat, and more from a single dashboard.',
  feature3Title: '24/7 Availability',
  feature3Desc: 'Never miss a customer inquiry. Our AI operators work around the clock without breaks.',
  feature4Title: 'Multilingual',
  feature4Desc: 'Communicate with customers in their preferred language with automatic translation support.',
  feature5Title: 'Instant Responses',
  feature5Desc: 'Reduce wait times to zero. Customers get immediate answers to their questions.',
  feature6Title: 'Secure & Private',
  feature6Desc: 'Enterprise-grade security with end-to-end encryption and GDPR compliance.',
};

export function Features({ t }: FeaturesProps) {
  const getFeatureText = (key: string) => {
    const translated = t(key);
    return translated !== key ? translated : defaultFeatures[key as keyof typeof defaultFeatures] || key;
  };

  return (
    <section id="features" className="py-24 bg-light-bg dark:bg-dark-bg">
      <div className="section-container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-light-text dark:text-dark-text mb-4">
            Everything you need to{' '}
            <span className="gradient-text">automate support</span>
          </h2>
          <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">
            Powerful features designed to transform your customer service experience
          </p>
        </motion.div>

        {/* Bento Grid */}
        <BentoGrid>
          {features.map((feature, index) => (
            <BentoCard
              key={index}
              icon={feature.icon}
              title={getFeatureText(feature.titleKey)}
              description={getFeatureText(feature.descKey)}
              gradient={feature.gradient}
              className={feature.className}
            />
          ))}
        </BentoGrid>

        {/* Additional highlight cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white"
          >
            <BarChart3 className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
            <p className="text-white/80 text-sm">
              Track conversations, measure satisfaction, and optimize performance with detailed insights.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border"
          >
            <Mic className="w-8 h-8 mb-4 text-primary-500" />
            <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">Voice Support</h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
              Accept voice messages and respond with natural speech synthesis.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border"
          >
            <Settings className="w-8 h-8 mb-4 text-primary-500" />
            <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">Easy Setup</h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
              Get started in minutes with our intuitive configuration wizard.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
