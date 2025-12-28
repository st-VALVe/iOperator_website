import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Mail, 
  Globe, 
  MessageSquare,
  Smartphone,
  Headphones
} from 'lucide-react';

interface IntegrationsProps {
  t: (key: string) => string;
}

const integrations = [
  { name: 'Telegram', icon: Send, color: '#0088cc' },
  { name: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
  { name: 'Viber', icon: Phone, color: '#7360F2' },
  { name: 'Email', icon: Mail, color: '#EA4335' },
  { name: 'Website Chat', icon: Globe, color: '#FF6B35' },
  { name: 'SMS', icon: MessageSquare, color: '#5C6BC0' },
  { name: 'Mobile App', icon: Smartphone, color: '#00BCD4' },
  { name: 'Call Center', icon: Headphones, color: '#9C27B0' },
];

// Duplicate for seamless infinite scroll
const allIntegrations = [...integrations, ...integrations];

export function Integrations({ t }: IntegrationsProps) {
  return (
    <section className="py-16 overflow-hidden bg-light-bg-secondary dark:bg-dark-bg-secondary">
      <div className="section-container mb-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-light-text-muted dark:text-dark-text-muted text-sm uppercase tracking-wider font-medium"
        >
          {t('integrationsTitle') || 'Seamless Integrations'}
        </motion.p>
      </div>

      {/* Infinite scroll container */}
      <div className="relative">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-light-bg-secondary dark:from-dark-bg-secondary to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-light-bg-secondary dark:from-dark-bg-secondary to-transparent z-10" />

        {/* Scrolling logos */}
        <motion.div
          className="flex gap-12 py-4"
          animate={{
            x: [0, -50 * integrations.length * 8],
          }}
          transition={{
            x: {
              duration: 30,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
        >
          {allIntegrations.map((integration, index) => (
            <div
              key={`${integration.name}-${index}`}
              className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border min-w-fit hover:border-primary-500/50 transition-colors group"
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${integration.color}15` }}
              >
                <integration.icon 
                  className="w-5 h-5" 
                  style={{ color: integration.color }}
                />
              </div>
              <span className="text-light-text dark:text-dark-text font-medium whitespace-nowrap">
                {integration.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
