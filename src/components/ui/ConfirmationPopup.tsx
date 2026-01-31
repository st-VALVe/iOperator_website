import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  redirectTo?: string;
}

export default function ConfirmationPopup({
  isOpen,
  onClose,
  title = 'Регистрация подтверждена!',
  message = 'Ваш аккаунт успешно активирован. Теперь вы можете войти в личный кабинет.',
  buttonText = 'Перейти в личный кабинет',
  redirectTo = '/dashboard',
}: ConfirmationPopupProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAction = () => {
    onClose();
    navigate(redirectTo);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-dark-bg-secondary rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-3 text-gray-900 dark:text-white">
          {title}
        </h2>

        {/* Message */}
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          {message}
        </p>

        {/* Action button */}
        <button
          onClick={handleAction}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold hover:opacity-90 transition-opacity"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
