import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface TestimonialsProps {
  t: (key: string) => string;
}

const testimonials = [
  {
    quote: "iOperator transformed our customer service. We now handle 3x more inquiries without adding staff. The AI understands our business perfectly and customers love the instant responses.",
    author: "Maria K.",
    role: "Business Owner",
    company: "Bella Italia",
    avatar: "MK",
  },
  {
    quote: "Setup was incredibly easy. Within an hour, our Telegram bot was answering customer questions about our services. It's like having a 24/7 receptionist.",
    author: "Alex P.",
    role: "Clinic Manager",
    company: "DentaCare",
    avatar: "AP",
  },
  {
    quote: "The voice message feature is a game-changer. Our customers can just speak their requests and the AI handles everything. Reduced our errors by 90%.",
    author: "Dmitry S.",
    role: "Delivery Service Owner",
    company: "SpeedServe Logistics",
    avatar: "DS",
  },
  {
    quote: "We were skeptical about AI handling our luxury brand inquiries, but iOperator exceeded expectations. It maintains our brand voice perfectly.",
    author: "Elena V.",
    role: "Marketing Director",
    company: "LuxStyle Boutique",
    avatar: "EV",
  },
];

export function Testimonials({ t }: TestimonialsProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const navigate = (dir: number) => {
    setDirection(dir);
    setCurrent((prev) => {
      if (dir === 1) return (prev + 1) % testimonials.length;
      return prev === 0 ? testimonials.length - 1 : prev - 1;
    });
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <section className="py-24 bg-light-bg dark:bg-dark-bg overflow-hidden">
      <div className="section-container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-light-text dark:text-dark-text mb-4">
            Loved by{' '}
            <span className="gradient-text">businesses</span>
          </h2>
          <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary">
            See what our customers have to say
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Quote icon */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center z-10">
            <Quote className="w-6 h-6 text-white" />
          </div>

          {/* Testimonial card */}
          <div className="relative bg-white dark:bg-dark-bg-secondary rounded-2xl border border-light-border dark:border-dark-border p-8 md:p-12 min-h-[300px] flex items-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="w-full text-center"
              >
                <p className="text-xl md:text-2xl text-light-text dark:text-dark-text leading-relaxed mb-8">
                  "{testimonials[current].quote}"
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
                    {testimonials[current].avatar}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-light-text dark:text-dark-text">
                      {testimonials[current].author}
                    </p>
                    <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                      {testimonials[current].role}, {testimonials[current].company}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border flex items-center justify-center hover:border-primary-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-light-text dark:text-dark-text" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > current ? 1 : -1);
                    setCurrent(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${index === current
                      ? 'w-6 bg-primary-500'
                      : 'bg-light-border dark:bg-dark-border hover:bg-primary-300'
                    }`}
                />
              ))}
            </div>

            <button
              onClick={() => navigate(1)}
              className="w-10 h-10 rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border flex items-center justify-center hover:border-primary-500 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-light-text dark:text-dark-text" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
