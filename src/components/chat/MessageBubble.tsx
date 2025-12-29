import { motion } from 'framer-motion';
import { Message } from '../../services/telegramProxy';
import { Mic, Image } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getIcon = () => {
    switch (message.type) {
      case 'voice':
        return <Mic className="w-4 h-4 inline mr-1" />;
      case 'image':
        return <Image className="w-4 h-4 inline mr-1" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isUser
            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-md'
            : 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text dark:text-dark-text rounded-bl-md'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">
          {getIcon()}
          {message.content}
        </p>
        <p
          className={`text-xs mt-1 ${
            isUser ? 'text-white/70' : 'text-light-text-muted dark:text-dark-text-muted'
          }`}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>
    </motion.div>
  );
}
