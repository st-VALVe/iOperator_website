import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { GradientButton } from '../ui';

interface PricingProps {
  t: (key: string) => string;
  onSelectPlan: (plan: string) => void;
}

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for small businesses',
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      '1,000 messages/month',
      '1 AI operator',
      'Telegram integration',
      'Basic analytics',
      'Email support',
    ],
    popular: false,
  },
  {
    name: 'Pro',
    description: 'For growing businesses',
    monthlyPrice: 79,
    yearlyPrice: 790,
    features: [
      '10,000 messages/month',
      '3 AI operators',
      'All integrations',
      'Advanced analytics',
      'Voice messages',
      'Priority support',
      'Custom branding',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    monthlyPrice: 199,
    yearlyPrice: 1990,
    features: [
      'Unlimited messages',
      'Unlimited operators',
      'All integrations',
      'Full analytics suite',
      'Voice & video support',
      '24/7 dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
    popular: false,
  },
];

export function Pricing({ t, onSelectPlan }: PricingProps) {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-light-bg dark:bg-dark-bg">
      <div className="section-container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-light-text dark:text-dark-text mb-4">
            Simple, transparent{' '}
            <span className="gradient-text">pricing</span>
          </h2>
          <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">
            Choose the plan that fits your business needs
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <span className={`text-sm font-medium ${!isYearly ? 'text-light-text dark:text-dark-text' : 'text-light-text-muted dark:text-dark-text-muted'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              isYearly ? 'bg-primary-500' : 'bg-light-border dark:bg-dark-border'
            }`}
          >
            <motion.div
              className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
              animate={{ left: isYearly ? '32px' : '4px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`text-sm font-medium ${isYearly ? 'text-light-text dark:text-dark-text' : 'text-light-text-muted dark:text-dark-text-muted'}`}>
            Yearly
          </span>
          {isYearly && (
            <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium">
              Save 17%
            </span>
          )}
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white scale-105 shadow-2xl shadow-primary-500/25'
                  : 'bg-white dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-white text-primary-600 text-sm font-medium shadow-lg">
                    <Sparkles className="w-4 h-4" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${
                  plan.popular ? 'text-white' : 'text-light-text dark:text-dark-text'
                }`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${
                  plan.popular ? 'text-white/80' : 'text-light-text-secondary dark:text-dark-text-secondary'
                }`}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className={`text-5xl font-bold ${
                    plan.popular ? 'text-white' : 'text-light-text dark:text-dark-text'
                  }`}>
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className={`text-sm ${
                    plan.popular ? 'text-white/70' : 'text-light-text-muted dark:text-dark-text-muted'
                  }`}>
                    /{isYearly ? 'year' : 'month'}
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      plan.popular 
                        ? 'bg-white/20' 
                        : 'bg-primary-100 dark:bg-primary-900/30'
                    }`}>
                      <Check className={`w-3 h-3 ${
                        plan.popular ? 'text-white' : 'text-primary-500'
                      }`} />
                    </div>
                    <span className={`text-sm ${
                      plan.popular ? 'text-white/90' : 'text-light-text-secondary dark:text-dark-text-secondary'
                    }`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {plan.popular ? (
                <button
                  onClick={() => onSelectPlan(plan.name)}
                  className="w-full py-3 px-6 rounded-xl bg-white text-primary-600 font-semibold hover:bg-white/90 transition-colors"
                >
                  Get Started
                </button>
              ) : (
                <GradientButton
                  variant="outline"
                  className="w-full"
                  onClick={() => onSelectPlan(plan.name)}
                >
                  Get Started
                </GradientButton>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
