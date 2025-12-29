import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { GradientButton } from '../ui';

interface CTAProps {
  t: (key: string) => string;
  onRequestDemo: () => void;
}

export function CTA({ t, onRequestDemo }: CTAProps) {
  return (
    <section className="py-24 bg-light-bg dark:bg-dark-bg">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700" />
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          {/* Content */}
          <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Start your free trial today
            </motion.div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Ready to transform your<br />customer service?
            </h2>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
              Join hundreds of businesses already using AI-powered operators to deliver exceptional customer experiences 24/7.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onRequestDemo}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-primary-600 font-semibold hover:bg-white/90 transition-colors"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors border border-white/20">
                Schedule a Demo
              </button>
            </div>

            <p className="mt-6 text-white/60 text-sm">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
