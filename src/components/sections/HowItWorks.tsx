import { motion } from 'framer-motion';
import {
  UserPlus,
  Building2,
  Upload,
  Bot,
  Plug,
  Rocket
} from 'lucide-react';
import { GlassCard } from '../ui';

interface HowItWorksProps {
  t: (key: string) => string;
}

const steps = [
  {
    number: '01',
    icon: UserPlus,
    titleKey: 'step1Title',
    descKey: 'step1Desc',
    defaultTitle: 'Create Account',
    defaultDesc: 'Sign up in seconds with email or Google authentication',
  },
  {
    number: '02',
    icon: Building2,
    titleKey: 'step2Title',
    descKey: 'step2Desc',
    defaultTitle: 'Setup Business Profile',
    defaultDesc: 'Tell us about your business, services, and target audience',
  },
  {
    number: '03',
    icon: Upload,
    titleKey: 'step3Title',
    descKey: 'step3Desc',
    defaultTitle: 'Upload Your Data',
    defaultDesc: 'Add your catalog, FAQ, pricing, and other business information',
  },
  {
    number: '04',
    icon: Bot,
    titleKey: 'step4Title',
    descKey: 'step4Desc',
    defaultTitle: 'Train Your AI',
    defaultDesc: 'Our AI learns your business and creates personalized responses',
  },
  {
    number: '05',
    icon: Plug,
    titleKey: 'step5Title',
    descKey: 'step5Desc',
    defaultTitle: 'Connect Channels',
    defaultDesc: 'Link Telegram, WhatsApp, or embed chat on your website',
  },
  {
    number: '06',
    icon: Rocket,
    titleKey: 'step6Title',
    descKey: 'step6Desc',
    defaultTitle: 'Go Live',
    defaultDesc: 'Start handling customer inquiries automatically 24/7',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export function HowItWorks({ t }: HowItWorksProps) {
  const getText = (key: string, defaultText: string) => {
    const translated = t(key);
    return translated !== key ? translated : defaultText;
  };

  return (
    <section className="py-24 bg-light-bg-secondary dark:bg-dark-bg-secondary overflow-hidden">
      <div className="section-container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-light-text dark:text-dark-text mb-4">
            Get started in{' '}
            <span className="gradient-text">6 simple steps</span>
          </h2>
          <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">
            From signup to live AI operator in minutes, not days
          </p>
        </motion.div>

        {/* Steps grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {steps.map((step, index) => (
            <motion.div key={step.number} variants={itemVariants}>
              <GlassCard className="h-full p-6 group hover:border-primary-500/50 transition-colors">
                {/* Step number */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-light-bg dark:bg-dark-bg border-2 border-primary-500 flex items-center justify-center text-xs font-bold text-primary-500">
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
                  {getText(step.titleKey, step.defaultTitle)}
                </h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm leading-relaxed">
                  {getText(step.descKey, step.defaultDesc)}
                </p>

                {/* Connector line (hidden on last item in row) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary-500/50 to-transparent" />
                )}
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
