import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Mic, Image, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { VoiceRecorder } from './VoiceRecorder';
import { telegramProxy, Message } from '../../services/telegramProxy';

interface ChatWidgetProps {
  t: (key: string) => string;
}

interface ErrorState {
  message: string;
  retryAction?: () => void;
}

export function ChatWidget({ t }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const clearError = useCallback(() => setError(null), []);

  const initSession = useCallback(async () => {
    setError(null);
    setIsReconnecting(true);
    
    try {
      const session = await telegramProxy.createSession();
      telegramProxy.connectWebSocket(session.wsUrl);

      telegramProxy.onMessage((message) => {
        setMessages(prev => [...prev, message]);
        setIsTyping(false);
        setError(null);
      });

      telegramProxy.onTyping((typing) => {
        setIsTyping(typing);
      });

      telegramProxy.onConnection((connected) => {
        setIsConnected(connected);
        setIsReconnecting(false);
        if (connected) {
          setError(null);
          // Add welcome message
          setMessages([{
            id: 'welcome',
            content: 'Здравствуйте! 👋 Я виртуальный оператор iOperator. Чем могу помочь?',
            sender: 'bot',
            timestamp: new Date(),
            type: 'text',
          }]);
        } else {
          setError({
            message: 'Соединение потеряно. Пытаемся переподключиться...',
            retryAction: initSession,
          });
        }
      });
    } catch (err) {
      console.error('Failed to init session:', err);
      setIsReconnecting(false);
      setError({
        message: 'Не удалось подключиться к серверу. Проверьте интернет-соединение.',
        retryAction: initSession,
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen && !isConnected && !isReconnecting && !telegramProxy.isConnected()) {
      initSession();
    }

    return () => {
      // Don't disconnect on unmount - keep session alive
    };
  }, [isOpen, isConnected, isReconnecting, initSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Keyboard navigation for chat window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    const messageText = inputValue;
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);
    setIsTyping(true);
    clearError();

    try {
      const success = await telegramProxy.sendMessage(messageText);
      if (!success) {
        throw new Error('Failed to send');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setIsTyping(false);
      setError({
        message: 'Не удалось отправить сообщение. Попробуйте ещё раз.',
        retryAction: () => {
          setInputValue(messageText);
          setMessages(prev => prev.filter(m => m.id !== userMessage.id));
        },
      });
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
    clearError();
    
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
      const success = await telegramProxy.sendAudio(audioBlob);
      if (!success) {
        throw new Error('Failed to send audio');
      }
    } catch (err) {
      console.error('Failed to send audio:', err);
      setIsTyping(false);
      setError({
        message: 'Не удалось отправить голосовое сообщение.',
        retryAction: () => {
          setMessages(prev => prev.filter(m => m.id !== userMessage.id));
          setIsRecording(true);
        },
      });
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    clearError();

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
      const success = await telegramProxy.sendImage(file);
      if (!success) {
        throw new Error('Failed to send image');
      }
    } catch (err) {
      console.error('Failed to send image:', err);
      setIsTyping(false);
      setError({
        message: 'Не удалось отправить изображение.',
      });
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
        aria-label="Открыть чат с виртуальным оператором"
        aria-expanded={isOpen}
        aria-controls="chat-window"
      >
        <MessageCircle className="w-6 h-6" aria-hidden="true" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chat-window"
            ref={chatWindowRef}
            role="dialog"
            aria-label="Чат с виртуальным оператором"
            aria-modal="true"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] max-h-[80vh] bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border bg-gradient-to-r from-primary-500 to-primary-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center" aria-hidden="true">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold" id="chat-title">iOperator Demo</h3>
                  <p className="text-xs text-white/80" aria-live="polite">
                    {isReconnecting ? '⟳ Подключение...' : isConnected ? '● Online' : '○ Offline'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Закрыть чат"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800"
                  role="alert"
                  aria-live="assertive"
                >
                  <div className="flex items-center gap-2 p-3 text-sm text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    <span className="flex-1">{error.message}</span>
                    {error.retryAction && (
                      <button
                        onClick={error.retryAction}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 transition-colors text-xs font-medium"
                        aria-label="Повторить попытку"
                      >
                        <RefreshCw className="w-3 h-3" aria-hidden="true" />
                        Повторить
                      </button>
                    )}
                    <button
                      onClick={clearError}
                      className="p-1 hover:bg-red-200 dark:hover:bg-red-800 rounded transition-colors"
                      aria-label="Закрыть уведомление об ошибке"
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-4"
              role="log"
              aria-label="История сообщений"
              aria-live="polite"
              aria-relevant="additions"
            >
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
                <div className="flex items-center gap-2" role="group" aria-label="Отправка сообщения">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label="Прикрепить изображение"
                    disabled={!isConnected}
                  >
                    <Image className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => setIsRecording(true)}
                    className="w-10 h-10 rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label="Записать голосовое сообщение"
                    disabled={!isConnected}
                  >
                    <Mic className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Введите сообщение..."
                    className="flex-1 px-4 py-2 rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border dark:border-dark-border focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-light-text dark:text-dark-text"
                    aria-label="Текст сообщения"
                    disabled={!isConnected}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isSending || !isConnected}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label={isSending ? 'Отправка...' : 'Отправить сообщение'}
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Send className="w-5 h-5" aria-hidden="true" />
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
