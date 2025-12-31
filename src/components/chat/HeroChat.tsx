import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, MessageSquare } from 'lucide-react';
import { telegramProxy, Message } from '../../services/telegramProxy';

interface HeroChatProps {
  t: (key: string) => string;
}

const quickActions = [
  { icon: Sparkles, label: 'Create Workflow', message: 'Как создать workflow для моего бизнеса?' },
  { icon: Bot, label: 'Setup Bot', message: 'Как настроить AI-бота?' },
  { icon: MessageSquare, label: 'Schedule Message', message: 'Как запланировать рассылку?' },
];

interface DemoMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  delay: number;
}

const demoSequence: DemoMessage[] = [
  {
    id: '1',
    content: 'Привет! Мне нужна помощь с настройкой AI-оператора для моего ресторана.',
    sender: 'user',
    delay: 500,
  },
  {
    id: '2',
    content: 'Конечно! Я подготовлю персонализированного AI-оператора для вашего ресторана. Он сможет принимать заказы, бронировать столики и отвечать на вопросы 24/7.',
    sender: 'bot',
    delay: 1500,
  },
  {
    id: '3',
    content: 'Отлично! Можешь настроить это сейчас?',
    sender: 'user',
    delay: 3500,
  },
];

function TypeWriter({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 15 + Math.random() * 25);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return <>{displayedText}{currentIndex < text.length && <span className="animate-pulse">|</span>}</>;
}


export function HeroChat({ }: HeroChatProps) {
  console.log('HeroChat rendering...');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [demoIndex, setDemoIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (demoIndex >= demoSequence.length) return;
    
    const msg = demoSequence[demoIndex];
    const timeout = setTimeout(() => {
      if (msg.sender === 'bot') {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setTypingMessageId(msg.id);
          setMessages(prev => [...prev, {
            id: msg.id,
            content: msg.content,
            sender: msg.sender,
            timestamp: new Date(),
            type: 'text',
          }]);
          setDemoIndex(prev => prev + 1);
        }, 800);
      } else {
        setMessages(prev => [...prev, {
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: new Date(),
          type: 'text',
        }]);
        setDemoIndex(prev => prev + 1);
      }
    }, msg.delay);
    
    return () => clearTimeout(timeout);
  }, [demoIndex]);

  useEffect(() => {
    // Only scroll if the chat container is visible and has messages
    if (messages.length > 0 && messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.closest('.space-y-4');
      if (chatContainer) {
        const rect = chatContainer.getBoundingClientRect();
        // Only scroll if chat is in viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
  }, [messages, isTyping]);

  const handleTypingComplete = (messageId: string) => {
    if (typingMessageId === messageId) {
      setTypingMessageId(null);
    }
  };

  const initConnection = async () => {
    if (isConnected || hasInteracted) return;
    try {
      const session = await telegramProxy.createSession();
      telegramProxy.connectWebSocket(session.wsUrl);
      telegramProxy.onMessage((message) => {
        setTypingMessageId(message.id);
        setMessages(prev => [...prev, message]);
        setIsTyping(false);
      });
      telegramProxy.onConnection((connected) => {
        setIsConnected(connected);
      });
      setHasInteracted(true);
    } catch (err) {
      console.error('Failed to connect:', err);
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;
    if (!hasInteracted) await initConnection();

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      await telegramProxy.sendMessage(messageText);
    } catch (err) {
      setTimeout(() => {
        const responseId = Date.now().toString();
        setTypingMessageId(responseId);
        setMessages(prev => [...prev, {
          id: responseId,
          content: 'Спасибо за вопрос! Свяжитесь с нами для настройки демо.',
          sender: 'bot',
          timestamp: new Date(),
          type: 'text',
        }]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="w-full max-w-3xl mx-auto p-6 bg-white dark:bg-dark-bg-secondary rounded-3xl shadow-lg"
    >
      <div className="relative mb-6">
        <div className="space-y-4 min-h-[180px] max-h-[300px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
                  className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-br from-pink-400 to-pink-600' 
                      : 'bg-gradient-to-br from-primary-500 to-primary-700'
                  }`}
                >
                  {message.sender === 'user' 
                    ? <User className="w-5 h-5 text-white" />
                    : <Bot className="w-5 h-5 text-white" />
                  }
                </motion.div>
                <motion.div 
                  className={`max-w-[75%] px-5 py-3.5 shadow-lg ${
                    message.sender === 'user'
                      ? 'bg-white dark:bg-dark-bg-secondary rounded-2xl rounded-tr-md'
                      : 'bg-white dark:bg-dark-bg-secondary rounded-2xl rounded-tl-md'
                  } text-light-text dark:text-dark-text`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.05, type: 'spring', stiffness: 400 }}
                >
                  <p className="text-[15px] leading-relaxed text-left">
                    {typingMessageId === message.id && message.sender === 'bot' ? (
                      <TypeWriter text={message.content} onComplete={() => handleTypingComplete(message.id)} />
                    ) : message.content}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="px-5 py-4 rounded-2xl rounded-tl-md bg-white dark:bg-dark-bg-secondary shadow-lg">
                  <div className="flex gap-1.5">
                    <motion.span className="w-2 h-2 bg-primary-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                    <motion.span className="w-2 h-2 bg-primary-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                    <motion.span className="w-2 h-2 bg-primary-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-white/90 dark:bg-dark-bg-secondary/90 backdrop-blur-xl rounded-2xl shadow-xl border border-light-border/50 dark:border-dark-border/50 p-4"
      >
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-light-border/50 dark:border-dark-border/50">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-light-bg-tertiary dark:bg-dark-bg-tertiary">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-light-text dark:text-dark-text">GPT-4o</span>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors">
            <MessageSquare className="w-4 h-4 text-light-text-muted" />
            <span className="text-sm text-light-text-muted">Search</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything ..."
            className="flex-1 px-2 py-2 bg-transparent text-light-text dark:text-dark-text placeholder:text-light-text-muted focus:outline-none text-[15px]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim()}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center disabled:opacity-30 hover:shadow-lg hover:shadow-primary-500/30 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-3 pt-3 border-t border-light-border/50 dark:border-dark-border/50">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleSend(action.message)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <action.icon className="w-3.5 h-3.5" />
              {action.label}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
