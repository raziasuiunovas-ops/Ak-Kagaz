import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { useChat } from '@/hooks';
import styles from './AIAssistant.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Быстрые вопросы
const QUICK_QUESTIONS = {
  ru: [
    'Как оформить заказ?',
    'Какие способы оплаты?',
    'Условия доставки',
    'Как отследить заказ?',
  ],
  ky: [
    'Буюртма кантип берилет?',
    'Төлөө ыкмалары кандай?',
    'Жеткирүү шарттары',
    'Буюртманы кантип көзөмөлдөө?',
  ],
};

const WELCOME_MESSAGE = {
  ru: 'Здравствуйте! 👋\n\nЯ помогу вам с выбором товаров, оформлением заказа и отвечу на ваши вопросы. 😊',
  ky: 'Саламатсызбы! 👋\n\nМен товарларды тандоого, буюртма берүүгө жардам берем жана сиздин суроолоруңузга жооп берем. 😊',
};

export function AIAssistant() {
  const { locale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(() => `chat_${Date.now()}_${Math.random().toString(36).substring(7)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = useChat();
  const quickQuestions = QUICK_QUESTIONS[locale as keyof typeof QUICK_QUESTIONS] || QUICK_QUESTIONS.ru;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Добавляем приветственное сообщение при открытии
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: WELCOME_MESSAGE[locale as keyof typeof WELCOME_MESSAGE] || WELCOME_MESSAGE.ru,
        },
      ]);
    }
  }, [isOpen, locale]);

  const handleSend = async (messageToSend?: string) => {
    const messageText = messageToSend || input.trim();
    
    if (!messageText || chatMutation.isPending) return;

    // Clear input only if sending from input field
    if (!messageToSend) {
      setInput('');
    }

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: messageText }]);

    try {
      const response = await chatMutation.mutateAsync({
        message: messageText,
        sessionId,
        context: {
          page: window.location.pathname,
          locale,
        },
      });

      // Add assistant response
      setMessages((prev) => [...prev, { role: 'assistant', content: response.message }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: locale === 'ru'
            ? 'Извините, произошла ошибка. Попробуйте еще раз. 😔'
            : 'Кечиресиз, ката кетти. Кайра аракет кылыңыз. 😔',
        },
      ]);
    }
  };

  const handleQuickQuestion = async (question: string) => {
    if (chatMutation.isPending) return; // Защита от повторного нажатия
    await handleSend(question);
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: WELCOME_MESSAGE[locale as keyof typeof WELCOME_MESSAGE] || WELCOME_MESSAGE.ru,
      },
    ]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${styles.floatingBtn} ${isOpen ? styles.floatingBtnActive : ''}`}
        aria-label="AI Assistant"
      >
        {isOpen ? (
          <X className={styles.icon} />
        ) : (
          <Sparkles className={styles.icon} />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className={styles.chatPanel}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <Sparkles className={styles.headerIcon} />
              <div>
                <h3 className={styles.title}>
                  {locale === 'ru' ? 'АК КАГАЗ Помощник' : 'АК КАГАЗ Жардамчысы'}
                </h3>
                <p className={styles.subtitle}>
                  {locale === 'ru' ? 'Онлайн' : 'Онлайн'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClearChat}
              className={styles.clearBtn}
              aria-label={locale === 'ru' ? 'Очистить чат' : 'Чатты тазалоо'}
              title={locale === 'ru' ? 'Очистить чат' : 'Чатты тазалоо'}
            >
              <Trash2 className={styles.clearIcon} />
            </button>
          </div>

          <div className={styles.messages}>
            {/* Приветственное сообщение всегда первым */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${styles.message} ${
                  message.role === 'user' ? styles.messageUser : styles.messageAssistant
                }`}
              >
                <div className={styles.messageContent}>
                  {message.content.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < message.content.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Быстрые вопросы после приветствия */}
            {messages.length === 1 && messages[0].role === 'assistant' && (
              <div className={styles.quickQuestionsWrapper}>
                <div className={styles.quickQuestions}>
                  <p className={styles.quickQuestionsTitle}>
                    {locale === 'ru' ? '💬 Популярные вопросы:' : '💬 Популярдуу суроолор:'}
                  </p>
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className={styles.quickQuestionBtn}
                      disabled={chatMutation.isPending}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMutation.isPending && (
              <div className={`${styles.message} ${styles.messageAssistant}`}>
                <div className={styles.messageContent}>
                  <Loader2 className={styles.loader} />
                  <span className={styles.typingText}>
                    {locale === 'ru' ? 'Печатаю...' : 'Жазууда...'}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputContainer}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                locale === 'ru' ? 'Напишите ваш вопрос...' : 'Суроонузду жазыңыз...'
              }
              className={styles.input}
              rows={1}
              disabled={chatMutation.isPending}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              className={styles.sendBtn}
              aria-label="Send"
            >
              <Send className={styles.sendIcon} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
