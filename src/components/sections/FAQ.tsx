import { motion } from 'framer-motion';
import { Accordion } from '../ui/Accordion';

interface FAQProps {
  t: (key: string) => string;
}

const faqItems = [
  {
    question: 'How does the AI operator work?',
    answer: 'Our AI operator uses advanced natural language processing to understand customer inquiries and provide accurate, contextual responses. It learns from your business data, catalog, FAQ, and previous conversations to deliver personalized service that matches your brand voice.',
  },
  {
    question: 'Which messaging platforms are supported?',
    answer: 'We support Telegram, WhatsApp, Viber, website chat widgets, and SMS. You can connect multiple channels simultaneously and manage all conversations from a single dashboard.',
  },
  {
    question: 'Can the AI handle voice messages?',
    answer: 'Yes! Our AI can receive and process voice messages, transcribe them, understand the intent, and respond either with text or synthesized voice. This works across all supported platforms.',
  },
  {
    question: 'How long does setup take?',
    answer: 'Most businesses are up and running within 30 minutes. Simply create an account, add your business information, upload your catalog or FAQ, connect your preferred channels, and you\'re ready to go.',
  },
  {
    question: 'What happens if the AI can\'t answer a question?',
    answer: 'When the AI encounters a question it cannot confidently answer, it gracefully hands off to a human operator or collects the customer\'s contact information for follow-up. You can customize this behavior in your dashboard.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use enterprise-grade encryption for all data in transit and at rest. We\'re GDPR compliant and never share your business data or customer conversations with third parties.',
  },
  {
    question: 'Can I customize the AI\'s personality?',
    answer: 'Yes, you can customize greeting messages, tone of voice, response style, and even specific phrases. The AI adapts to match your brand personality while maintaining professional service quality.',
  },
  {
    question: 'What languages are supported?',
    answer: 'Our AI supports English, Russian, Turkish, and many other languages. It can automatically detect the customer\'s language and respond accordingly, or you can set a default language for your business.',
  },
];

export function FAQ({ t }: FAQProps) {
  return (
    <section id="faq" className="py-24 bg-light-bg-secondary dark:bg-dark-bg-secondary">
      <div className="section-container">
        <div className="max-w-3xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-4">
              FAQ
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-light-text dark:text-dark-text mb-4">
              Frequently asked{' '}
              <span className="gradient-text">questions</span>
            </h2>
            <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary">
              Everything you need to know about iOperator
            </p>
          </motion.div>

          {/* Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-dark-bg rounded-2xl border border-light-border dark:border-dark-border p-6 md:p-8"
          >
            <Accordion items={faqItems} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
