import { SessionManager } from './sessionManager.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `Ты — виртуальный оператор iOperator.ai. Ты помогаешь посетителям сайта узнать больше о сервисе и отвечаешь на их вопросы.

## О сервисе iOperator.ai

iOperator.ai — это платформа для создания AI-операторов для бизнеса. Мы помогаем компаниям автоматизировать общение с клиентами через:
- Telegram боты
- WhatsApp (скоро)
- Веб-виджеты на сайте

### Что умеет AI-оператор:
- Отвечать на вопросы клиентов 24/7
- Принимать заказы и бронирования
- Консультировать по меню/услугам/товарам
- Обрабатывать голосовые сообщения
- Работать на нескольких языках

### Тарифы:
- **Starter** (бесплатно): до 100 сообщений/месяц, базовые функции
- **Pro** ($49/месяц): до 5000 сообщений, голосовые сообщения, приоритетная поддержка
- **Enterprise** (индивидуально): безлимит, кастомизация, выделенный менеджер

### Как начать:
1. Зарегистрироваться на сайте
2. Заполнить профиль бизнеса (название, описание, меню/услуги)
3. Подключить Telegram бота
4. AI-оператор готов к работе!

## Твои правила:
- Отвечай дружелюбно и профессионально
- Будь краток, но информативен
- Если не знаешь ответ — предложи связаться с поддержкой
- Отвечай на том языке, на котором пишет пользователь
- Не выдумывай информацию, которой нет выше`;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenAIService {
  private sessionManager: SessionManager;
  private conversationHistory: Map<string, ChatMessage[]> = new Map();

  constructor(sessionManager: SessionManager) {
    this.sessionManager = sessionManager;
  }

  async chat(sessionId: string, userMessage: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('OPENAI_API_KEY not set');
      return 'Извините, сервис временно недоступен. Попробуйте позже.';
    }

    // Get or create conversation history
    let history = this.conversationHistory.get(sessionId);
    if (!history) {
      history = [{ role: 'system', content: SYSTEM_PROMPT }];
      this.conversationHistory.set(sessionId, history);
    }

    // Add user message
    history.push({ role: 'user', content: userMessage });

    // Keep only last 20 messages + system prompt to avoid token limits
    if (history.length > 21) {
      history = [history[0], ...history.slice(-20)];
      this.conversationHistory.set(sessionId, history);
    }

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: history,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenAI API error:', error);
        return 'Извините, произошла ошибка. Попробуйте ещё раз.';
      }

      const data = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content || 'Извините, не удалось получить ответ.';

      // Add assistant response to history
      history.push({ role: 'assistant', content: assistantMessage });

      return assistantMessage;
    } catch (error) {
      console.error('OpenAI request failed:', error);
      return 'Извините, произошла ошибка соединения. Попробуйте позже.';
    }
  }

  async handleVoice(sessionId: string): Promise<string> {
    // For now, just acknowledge voice messages
    // In future, can integrate Whisper API for transcription
    return this.chat(sessionId, '[Пользователь отправил голосовое сообщение]');
  }

  async handleImage(sessionId: string, caption?: string): Promise<string> {
    const message = caption 
      ? `[Пользователь отправил изображение с подписью: ${caption}]`
      : '[Пользователь отправил изображение]';
    return this.chat(sessionId, message);
  }

  clearHistory(sessionId: string): void {
    this.conversationHistory.delete(sessionId);
  }
}
