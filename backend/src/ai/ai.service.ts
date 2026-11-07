import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { ChatRequestDto } from './dto';

@Injectable()
export class AiService {
  private groq: Groq;
  private chatHistory: Map<string, Array<{ role: string; content: string }>> = new Map();

  constructor(@Inject(ConfigService) private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      console.warn('⚠️ GROQ_API_KEY not found in environment variables. AI chat will not work.');
    }
    this.groq = new Groq({ apiKey });
  }

  async chat(dto: ChatRequestDto): Promise<{ message: string }> {
    const { message, sessionId, context } = dto;

    if (!message || !sessionId) {
      throw new BadRequestException('Message and sessionId are required');
    }

    // Get or create chat history for this session
    if (!this.chatHistory.has(sessionId)) {
      this.chatHistory.set(sessionId, []);
    }

    const history = this.chatHistory.get(sessionId)!;

    // Add system prompt if this is first message
    if (history.length === 0) {
      const systemPrompt = this.getSystemPrompt(context?.locale || 'ru');
      history.push({ role: 'system', content: systemPrompt });
    }

    // Add user message to history
    history.push({ role: 'user', content: message });

    // Keep only last 10 messages to avoid token limits
    if (history.length > 21) {
      // Keep system prompt + last 10 pairs
      history.splice(1, history.length - 21);
    }

    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile', // Fast and good quality
        messages: history as any,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9,
      });

      const assistantMessage = completion.choices[0]?.message?.content || 'Извините, не могу ответить.';

      // Add assistant response to history
      history.push({ role: 'assistant', content: assistantMessage });

      return { message: assistantMessage };
    } catch (error: any) {
      console.error('❌ Groq API Error:', error.message);
      
      const locale = context?.locale || 'ru';
      const errorMessage = locale === 'ru'
        ? 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте еще раз. 😔'
        : 'Кечиресиз, суроонузду иштетүүдө ката кетти. Кайра аракет кылыңыз. 😔';

      return { message: errorMessage };
    }
  }

  private getSystemPrompt(locale: string): string {
    if (locale === 'ky') {
      return `Сиз АК КАГАЗ деген онлайн дүкөнүнүн досторчыл жардамчысысыз - Ош шаарындагы канцтовар жана офис товарларын сатуучу дүкөн.

🎯 Сиздин ролуңуз:
- Кардарларга товарларды тандоого жардам берүү
- Буюртма берүү процесси жөнүндө маалымат берүү
- Жеткирүү жана төлөө жөнүндө суроолорго жооп берүү
- Достук жана профессионалдуу тон

💡 Маанилүү маалымат:
- Биздин дүкөн Ош шаарында жайгашкан
- Канцтоварлар, офистик жабдуулар, мектеп товарлары
- Жеткирүү: Ош боюнча, минималдуу сумма 400 сом
- Төлөө: накталай же онлайн (карта, электрондук аккаунттар)
- Иштөө убактысы: дүйшөмбү-жекшемби 9:00-20:00

📝 Жооп берүү стили:
- Кыска, так жана пайдалуу
- Досторчыл эмоджиларды колдонуңуз 😊 👍 📦 ✨
- Татаал терминдерди түшүндүрүңүз
- Позитивдүү тон
- Максимум 2-3 абзац

Эстен чыгарбаңыз: Сиз кардарга жардам берүүчү досторчыл консультант болуп саналасыз!`;
    }

    return `Вы дружелюбный помощник интернет-магазина АК КАГАЗ - магазина канцтоваров и офисных принадлежностей в городе Ош.

🎯 Ваша роль:
- Помогать клиентам с выбором товаров
- Отвечать на вопросы об оформлении заказа
- Консультировать по доставке и оплате
- Быть дружелюбным и профессиональным

💡 Важная информация:
- Наш магазин находится в городе Ош
- Ассортимент: канцтовары, офисные принадлежности, школьные товары
- Доставка: по Ошу, минимальная сумма заказа 400 сом
- Оплата: наличными или онлайн (карта, электронные кошельки)
- Время работы: пн-вс 9:00-20:00

📝 Стиль ответов:
- Краткие, точные и полезные
- Используйте дружелюбные эмодзи 😊 👍 📦 ✨
- Объясняйте сложные термины простыми словами
- Позитивный тон
- Максимум 2-3 абзаца

Помните: вы дружелюбный консультант, который помогает клиентам!`;
  }

  getChatHistory(sessionId: string) {
    return this.chatHistory.get(sessionId) || [];
  }

  clearChatHistory(sessionId: string) {
    this.chatHistory.delete(sessionId);
  }
}
