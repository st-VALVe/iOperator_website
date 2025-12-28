import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Mic, Image, Loader2 } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { VoiceRecorder } from './VoiceRecorder';
import { telegramProxy, Message } from '../../services/telegramProxy';

interface ChatWidgetProps {
  t: (key: string) => string;
}

export function ChatWidget({ t }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !isConnected) {
      initSession();
    }

    return () => {
      // Cleanup on unmount
    };
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const initSession = async () => {
    try {
      const session = await telegramProxy.createSession();
      telegramProxy.connectWebSocket(session.wsUrl);

      telegramProxy.onMessage((message) => {
        setMessages(prev => [...prev, message]);
        setIsTyping(false);
      });

      telegramProxy.onTyping((typing) => {
        setIsTyping(typing);
      });

      telegramProxy.onConnection((connected) => {
        setIsConnected(connected);
        if (connected) {
          // Add welcome message
          setMessages([{
            id: 'welcome',
            content: 'Здравствуйте! 👋 Я виртуальный оператор iOperator. Чем могу помочь?',
            sender: 'bot',
            timestamp: new Date(),
            type: 'text',
          }]);
        }
      });
    } catch (error) {
      console.error('Failed to init session:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);
    setIsTyping(true);

    try {
      await telegramProxy.sendMessage(inputValue);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceRecorded = async (audioBlob: Blob) => {
    setIsRecording(false);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: '🎤 Голосовое сообщение',
      sender: 'user',
      timestamp: new Date(),
      type: 'voice',
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      await telegramProxy.sendAudio(audioBlob);
    } catch (error) {
      console.error('Failed to send audio:', error);
      setIsTyping(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: '📷 Изображение',
      sender: 'user',
      timestamp: new Date(),
      type: 'image',
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      await telegramProxy.sendImage(file);
    } catch (error) {
      console.error('Failed to send image:', error);
      setIsTyping(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 flex items-center justify-center ${isOpen ? 'hidden' : ''}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] max-h-[80vh] bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-2xl border border-light-border dark:border-dark-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border bg-gradient-to-r from-primary-500 to-primary-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">iOperator Demo</h3>
                  <p className="text-xs text-white/80">
                    {isConnected ? '● Online' : 'Connecting...'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-light-border dark:border-dark-border">
              {isRecording ? (
                <VoiceRecorder
                  onRecorded={handleVoiceRecorded}
                  onCancel={() => setIsRecording(false)}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 transition-colors"
                  >
                    <Image className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsRecording(true)}
                    className="w-10 h-10 rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 transition-colors"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Введите сообщение..."
                    className="flex-1 px-4 py-2 rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border focus:border-primary-500 focus:outline-none text-light-text dark:text-dark-text"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isSending}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
