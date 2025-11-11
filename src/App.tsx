import { useState } from 'react';
import { MessageSquare, Zap, DollarSign, Star, Bot, TrendingUp, Clock, Users, BarChart3, CheckCircle, X, Mail, Phone, MapPin } from 'lucide-react';

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'demo' | 'question'>('demo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // FormSubmit configuration - free service, no registration needed
  // First email requires confirmation, then it works automatically
  const FORM_SUBMIT_URL = 'https://formsubmit.co/ajax/st-valve@mail.ru';

  const openForm = (type: 'demo' | 'question') => {
    setFormType(type);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData({ name: '', email: '', message: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create a hidden form and submit it to FormSubmit
      // This approach is more reliable than AJAX for FormSubmit
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://formsubmit.co/st-valve@mail.ru';
      form.target = '_blank'; // Open in new tab to avoid page reload
      form.style.display = 'none';

      // Add form fields
      const fields = {
        name: formData.name,
        email: formData.email,
        _subject: formType === 'demo' ? 'Demo Request from AI Operator Website' : 'Question from AI Operator Website',
        message: `Request Type: ${formType === 'demo' ? 'Demo Request' : 'Question'}\n\nFrom: ${formData.name} (${formData.email})\n\nMessage:\n${formData.message}`,
        _replyto: formData.email,
        _captcha: 'false',
        _template: 'box',
        _next: window.location.href
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      // Show success message
      alert(`Thank you for your ${formType === 'demo' ? 'demo request' : 'question'}! We will contact you soon at ${formData.email}.`);
      closeForm();
    } catch (error) {
      console.error('Email sending failed:', error);
      // Fallback: use mailto link as backup
      const mailtoSubject = encodeURIComponent(formType === 'demo' ? 'Demo Request from AI Operator Website' : 'Question from AI Operator Website');
      const mailtoBody = encodeURIComponent(`Request Type: ${formType === 'demo' ? 'Demo Request' : 'Question'}\n\nFrom: ${formData.name} (${formData.email})\n\nMessage:\n${formData.message}`);
      const mailtoLink = `mailto:st-valve@mail.ru?subject=${mailtoSubject}&body=${mailtoBody}`;
      
      const useMailto = confirm('Sorry, there was an error sending your message automatically. Would you like to open your email client to send it manually?');
      if (useMailto) {
        window.location.href = mailtoLink;
      }
    } finally {
      setIsSubmitting(false);
    }
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
            <span className="text-xl font-bold">AI Operator</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => openForm('demo')}
              className="px-6 py-2 bg-orange-500 text-black font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              Request Demo
            </button>
            <button 
              onClick={() => openForm('question')}
              className="px-6 py-2 border border-orange-500 text-orange-500 font-semibold rounded-lg hover:bg-orange-500 hover:text-black transition-colors"
            >
              Ask Question
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold leading-tight mb-6">
                AI Operator for Restaurants
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Automating customer service and communications via Telegram and WhatsApp
              </p>

              <div className="space-y-6">
                <div className="border border-orange-500 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <Zap className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Accelerates Service</h3>
                      <p className="text-gray-300">Instant responses 24/7</p>
                    </div>
                  </div>
                </div>

                <div className="border border-orange-500 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <DollarSign className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Reduces Costs</h3>
                      <p className="text-gray-300">Save up to $7,000/month</p>
                    </div>
                  </div>
                </div>

                <div className="border border-orange-500 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <Star className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Improves Quality</h3>
                      <p className="text-gray-300">Error-free service</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-2xl p-8 border border-orange-500/30">
                <div className="space-y-4">
                  <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
                    <MessageSquare className="w-8 h-8 text-orange-500 mb-2" />
                    <p className="text-sm text-gray-300">Communication via Telegram and WhatsApp</p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
                    <Bot className="w-8 h-8 text-orange-500 mb-2" />
                    <p className="text-sm text-gray-300">Support for 50+ languages</p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
                    <CheckCircle className="w-8 h-8 text-orange-500 mb-2" />
                    <p className="text-sm text-gray-300">Order automation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-black to-gray-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-16">What the System Does</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-6 text-orange-500">Smart Communications</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Communication via Telegram and WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Text and voice recognition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Support for 50+ languages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Food photo analysis</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-6 text-orange-500">Order Automation</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Menu import from Syrve</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Help with dish selection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Delivery address verification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Order processing</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-6 text-orange-500">Personalization</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Customer profiles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Auto congratulations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Order reminders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Personalized offers</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 bg-orange-900/30 border border-orange-500/50 rounded-xl p-6">
              <p className="text-lg text-center">
                <span className="font-semibold">Works 24/7.</span> Never gets tired, never makes mistakes, never takes days off.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-16">Operator Cost Savings</h2>

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="border border-gray-700 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-6 text-center">Traditional Model</h3>
                <ul className="space-y-4 text-gray-300 mb-8">
                  <li>• 5-7 operators for 24/7 operation</li>
                  <li>• Salaries, taxes, training</li>
                  <li>• Human factor and errors</li>
                  <li>• Inability to scale</li>
                </ul>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-500 mb-2">$2,500</div>
                  <p className="text-gray-400">Costs: $2,500–$7,000/month</p>
                </div>
              </div>

              <div className="border border-orange-500 rounded-2xl p-8 bg-gradient-to-br from-orange-500/10 to-orange-600/5">
                <h3 className="text-2xl font-bold mb-6 text-center">With AI Assistant</h3>
                <ul className="space-y-4 text-gray-300 mb-8">
                  <li>• One assistant = entire team</li>
                  <li>• Works without days off or vacations</li>
                  <li>• Hundreds of inquiries simultaneously</li>
                  <li>• Instant scaling</li>
                </ul>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-500 mb-2">$50-$200</div>
                  <p className="text-gray-400">Costs: $50–$200/month</p>
                </div>
              </div>
            </div>

            <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-orange-500 mb-2">95%</div>
                <p className="text-xl text-gray-300">Cost Reduction</p>
                <p className="text-sm text-gray-500 mt-2">on call center staff</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-orange-500 mb-2">$2,500</div>
                <p className="text-xl text-gray-300">Minimum Savings</p>
                <p className="text-sm text-gray-500 mt-2">when replacing 5 operators</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-orange-500 mb-2">1-3</div>
                <p className="text-xl text-gray-300">Months to Payback</p>
                <p className="text-sm text-gray-500 mt-2">savings start from day one</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-16">Repeat Order Growth</h2>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold">Preference Memory</h3>
                </div>
                <p className="text-gray-300">
                  The system remembers each customer's favorite dishes and suggests them on the next order
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold">Personal Congratulations</h3>
                </div>
                <p className="text-gray-300">
                  Automatic birthday greetings and special holiday offers
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold">Smart Recommendations</h3>
                </div>
                <p className="text-gray-300">
                  AI analyzes history and suggests new dishes based on taste preferences
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold">Timely Reminders</h3>
                </div>
                <p className="text-gray-300">
                  Notifications about seasonal menus, promotions, and weekly favorites
                </p>
              </div>
            </div>

            <div className="bg-orange-900/20 border border-orange-500/50 rounded-xl p-6 mb-12">
              <p className="text-lg text-center">
                This creates a <span className="font-bold text-orange-500">sense of attention and care</span>. Customers return more often and order more.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 text-center">
              <div>
                <div className="mb-6">
                  <svg className="w-48 h-48 mx-auto" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="8"
                            strokeDasharray="75 251" strokeLinecap="round" transform="rotate(-90 50 50)" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-orange-500 mb-2">25-40%</div>
                <p className="text-xl text-gray-300">Repeat Order Growth</p>
                <p className="text-sm text-gray-500 mt-2">thanks to personalization</p>
              </div>

              <div>
                <div className="mb-6">
                  <svg className="w-48 h-48 mx-auto" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="8"
                            strokeDasharray="88 251" strokeLinecap="round" transform="rotate(-90 50 50)" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-orange-500 mb-2">35%</div>
                <p className="text-xl text-gray-300">Average Check Increase</p>
                <p className="text-sm text-gray-500 mt-2">through smart recommendations</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-16">Return on Investment</h2>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="border border-gray-700 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-6 text-orange-500">Initial Expenses</h3>
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">System Setup</p>
                    <p className="text-gray-300">One-time integration with your infrastructure</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">AI Training</p>
                    <p className="text-gray-300">Adaptation to your menu and processes</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-700 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-6 text-orange-500">Monthly Costs</h3>
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">$50-$200</p>
                    <p className="text-gray-300">AI platform subscription based on volume</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Technical Support</p>
                    <p className="text-gray-300">Included in subscription cost</p>
                  </div>
                </div>
              </div>

              <div className="border border-orange-500 rounded-2xl p-8 bg-gradient-to-br from-orange-500/10 to-orange-600/5">
                <h3 className="text-xl font-bold mb-6 text-orange-500">Revenue and Savings</h3>
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">$2,500+</p>
                    <p className="text-gray-300">Monthly savings on operators</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">15-25%</p>
                    <p className="text-gray-300">Sales growth through service quality</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-orange-500 mb-2">1-3</div>
                <p className="text-xl text-gray-300 mb-2">Months to Payback</p>
                <p className="text-sm text-gray-500">quick return on investment</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-orange-500 mb-2">$30K+</div>
                <p className="text-xl text-gray-300 mb-2">Annual Savings</p>
                <p className="text-sm text-gray-500">per location for average restaurant</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-orange-500 mb-2">300%</div>
                <p className="text-xl text-gray-300 mb-2">ROI in First Year</p>
                <p className="text-sm text-gray-500">including sales growth and savings</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-8">Ready for Transformation?</h2>
            <p className="text-xl text-gray-300 text-center mb-16">
              AI Operator makes restaurant operations <span className="text-orange-500 font-semibold">faster, smarter, and more profitable</span>. Technology that pays for itself from the first month.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-16">
              <div className="border border-orange-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-6 h-6 text-orange-500" />
                  <h3 className="text-lg font-bold">Reduces Costs</h3>
                </div>
                <p className="text-gray-300">Save up to 95% on operators</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                  <h3 className="text-lg font-bold">Increases Sales</h3>
                </div>
                <p className="text-gray-300">15-25% revenue growth</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-6 h-6 text-orange-500" />
                  <h3 className="text-lg font-bold">Works 24/7</h3>
                </div>
                <p className="text-gray-300">No breaks or days off</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="w-6 h-6 text-orange-500" />
                  <h3 className="text-lg font-bold">Improves Experience</h3>
                </div>
                <p className="text-gray-300">Personalization and speed</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-6 md:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="w-6 h-6 text-orange-500" />
                  <h3 className="text-lg font-bold">Easy to Scale</h3>
                </div>
                <p className="text-gray-300">From one to hundreds of locations</p>
              </div>
            </div>

            <div className="bg-gray-900 border border-orange-500/50 rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-bold mb-4 text-center">Next Step</h3>
              <p className="text-gray-300 text-center mb-6">
                Ready to connect a <span className="text-orange-500 font-semibold">demo</span> and test the system at your restaurant. You'll see results in the first week.
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
                {formType === 'demo' ? 'Request Demo' : 'Ask a Question'}
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
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
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
                  {formType === 'demo' ? 'Tell us about your restaurant' : 'Your question'} *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  placeholder={formType === 'demo' ? 'Tell us about your restaurant and we will prepare a personalized demo...' : 'Ask us anything about the AI Operator system...'}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-orange-500 text-black font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : (formType === 'demo' ? 'Request Demo' : 'Send Question')}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
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
                <span className="text-lg font-bold">AI Operator</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered customer service automation for restaurants. Streamline operations and boost customer satisfaction.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <div className="space-y-3 text-gray-400 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-orange-500" />
                  <a href="mailto:info@ioperator.ai" className="hover:text-orange-500 transition-colors">
                    info@ioperator.ai
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-orange-500" />
                  <a href="tel:+1234567890" className="hover:text-orange-500 transition-colors">
                    +1 (234) 567-890
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <span>Global Service</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2 text-gray-400 text-sm">
                <button 
                  onClick={() => openForm('demo')}
                  className="block hover:text-orange-500 transition-colors"
                >
                  Request Demo
                </button>
                <button 
                  onClick={() => openForm('question')}
                  className="block hover:text-orange-500 transition-colors"
                >
                  Ask Question
                </button>
                <a href="#features" className="block hover:text-orange-500 transition-colors">
                  Features
                </a>
                <a href="#pricing" className="block hover:text-orange-500 transition-colors">
                  Pricing
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} AI Operator. All rights reserved.</p>
            <p className="mt-2">AI-powered restaurant customer service automation</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
