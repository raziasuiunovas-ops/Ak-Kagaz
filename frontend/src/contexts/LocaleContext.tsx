import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Locale = 'ru' | 'ky';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
}

const LOCALE_STORAGE_KEY = 'ak-kagaz-locale';

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    return (saved === 'ru' || saved === 'ky') ? saved : 'ru';
  });

  useEffect(() => {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const t = (key: string): string => {
    const translations = locale === 'ru' ? translationsRu : translationsKy;
    return translations[key] || key;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}

// Translations
const translationsRu: Record<string, string> = {
  // Common
  'common.save': 'Сохранить',
  'common.cancel': 'Отмена',
  'common.delete': 'Удалить',
  'common.edit': 'Редактировать',
  'common.back': 'Назад',
  'common.close': 'Закрыть',
  'common.search': 'Поиск',
  'common.loading': 'Загрузка...',
  'common.error': 'Ошибка',
  'common.tryAgain': 'Попробовать снова',
  'common.noResults': 'Ничего не найдено',
  'common.showMore': 'Показать ещё',
  'common.showLess': 'Скрыть',
  'common.total': 'Итого',
  'common.price': 'Цена',
  'common.quantity': 'Количество',
  
  // Navigation
  'nav.home': 'Главная',
  'nav.catalog': 'Каталог',
  'nav.favorites': 'Избранное',
  'nav.cart': 'Корзина',
  'nav.profile': 'Профиль',
  'nav.about': 'О магазине',
  'nav.contacts': 'Контакты',
  'nav.delivery': 'Доставка',
  'nav.installment': 'Рассрочка',
  
  // Header
  'header.search': 'Поиск товаров...',
  'header.menu': 'Меню',
  
  // Footer
  'footer.shopName': 'АК КАГАЗ',
  'footer.description': 'Интернет-магазин канцелярских товаров в Оше',
  'footer.categories': 'Категории',
  'footer.information': 'Информация',
  'footer.contacts': 'Контакты',
  'footer.followUs': 'Мы в соцсетях',
  'footer.copyright': '© 2026 АК КАГАЗ. Все права защищены.',
  
  // Home page
  'home.hero.title': 'Добро пожаловать в АК КАГАЗ',
  'home.hero.subtitle': 'Канцелярские товары для работы и творчества',
  'home.hero.cta': 'Перейти в каталог',
  'home.hero.badge': 'Канцелярия с заботой о вас',
  'home.hero.subtitle.full': 'Качественная канцелярия, стильные товары и вдохновение в каждой детали — всё необходимое для учёбы, работы и творчества в одном месте.',
  'home.hero.learnMore': 'Узнать больше',
  'home.hero.phrase1': 'учёбы',
  'home.hero.phrase2': 'творчества',
  'home.hero.phrase3': 'работы',
  'home.hero.phrase4': 'вдохновения',
  'home.hero.benefit.quality': 'Высокое качество',
  'home.hero.benefit.delivery': 'Удобная доставка',
  'home.hero.benefit.care': 'Забота о клиентах',
  'home.categories.title': 'Категории товаров',
  'home.popular.title': 'Популярные товары',
  'home.new.title': 'Новинки',
  'home.about.title': 'О магазине АК КАГАЗ',
  'home.reviews.title': 'Отзывы покупателей',
  
  // Catalog
  'catalog.title': 'Каталог товаров',
  'catalog.filters': 'Фильтры',
  'catalog.sort': 'Сортировка',
  'catalog.sort.popular': 'По популярности',
  'catalog.sort.priceAsc': 'Цена: по возрастанию',
  'catalog.sort.priceDesc': 'Цена: по убыванию',
  'catalog.sort.newest': 'Новинки',
  'catalog.empty': 'Товары не найдены',
  
  // Product
  'product.addToCart': 'Добавить в корзину',
  'product.addToFavorites': 'В избранное',
  'product.removeFromFavorites': 'Удалить из избранного',
  'product.inStock': 'В наличии',
  'product.outOfStock': 'Нет в наличии',
  'product.description': 'Описание',
  'product.specifications': 'Характеристики',
  'product.reviews': 'Отзывы',
  'product.related': 'Похожие товары',
  
  // Cart
  'cart.title': 'Корзина',
  'cart.empty': 'Корзина пуста',
  'cart.continueShopping': 'Продолжить покупки',
  'cart.checkout': 'Оформить заказ',
  'cart.subtotal': 'Сумма',
  'cart.delivery': 'Доставка',
  'cart.total': 'Итого',
  'cart.minOrder': 'Минимальная сумма заказа — 400 сом',
  'cart.remove': 'Удалить',
  
  // Checkout
  'checkout.title': 'Оформление заказа',
  'checkout.contacts': 'Контактные данные',
  'checkout.delivery': 'Доставка',
  'checkout.deliveryType': 'Способ получения',
  'checkout.deliveryType.delivery': 'Доставка',
  'checkout.deliveryType.pickup': 'Самовывоз',
  'checkout.address': 'Адрес доставки',
  'checkout.payment': 'Оплата',
  'checkout.orderSummary': 'Ваш заказ',
  'checkout.placeOrder': 'Оформить заказ',
  
  // Auth
  'auth.login': 'Вход',
  'auth.register': 'Регистрация',
  'auth.logout': 'Выйти',
  'auth.email': 'Email',
  'auth.password': 'Пароль',
  'auth.confirmPassword': 'Подтвердите пароль',
  'auth.firstName': 'Имя',
  'auth.lastName': 'Фамилия',
  'auth.phone': 'Телефон',
  'auth.signIn': 'Войти',
  'auth.signUp': 'Зарегистрироваться',
  'auth.forgotPassword': 'Забыли пароль?',
  'auth.noAccount': 'Нет аккаунта?',
  'auth.haveAccount': 'Уже есть аккаунт?',
  'auth.passwordMismatch': 'Пароли не совпадают',
  'auth.passwordTooShort': 'Пароль должен содержать минимум 8 символов',
  'auth.passwordHint': 'Минимум 8 символов',
  
  // Profile
  'profile.title': 'Профиль',
  'profile.orders': 'Мои заказы',
  'profile.personalInfo': 'Личные данные',
  'profile.addresses': 'Адреса',
  'profile.favorites': 'Избранное',
  'profile.settings': 'Настройки',
  
  // Orders
  'orders.title': 'История заказов',
  'orders.empty': 'У вас пока нет заказов',
  'orders.orderNumber': 'Заказ №',
  'orders.status': 'Статус',
  'orders.date': 'Дата',
  'orders.total': 'Сумма',
  'orders.details': 'Детали заказа',
  
  // Favorites
  'favorites.title': 'Избранное',
  'favorites.empty': 'Список избранного пуст',
  
  // Info pages
  'about.title': 'О магазине',
  'contacts.title': 'Контакты',
  'delivery.title': 'Доставка и оплата',
  'installment.title': 'Рассрочка',
  
  // Errors
  'error.404': 'Страница не найдена',
  'error.404.description': 'Запрашиваемая страница не существует',
  'error.goHome': 'Вернуться на главную',
  'error.network': 'Ошибка сети',
  'error.server': 'Ошибка сервера',
  'error.unknown': 'Неизвестная ошибка',
  
  // Recommendations
  'recommendations.loading': 'Загрузка рекомендаций...',
  'recommendations.forYou': 'Рекомендуем для вас',
  'recommendations.popular': 'Популярные товары',
  'recommendations.trending': 'В тренде',
  'recommendations.recent': 'Недавно просмотренные',
  'recommendations.repeat': 'Купить снова',
  'recommendations.similar': 'Похожие товары',
  'recommendations.frequentlyBought': 'Часто покупают вместе',
  'recommendations.empty': 'Нет рекомендаций',
  
  // Bundles
  'bundles.title': 'Готовые наборы',
  'bundles.viewAll': 'Все наборы',
  'bundles.customize': 'Настроить набор',
  'bundles.items': 'товаров',
  'bundles.savings': 'Экономия',
  'bundles.composition': 'Состав набора',
  'bundles.modified': 'Набор изменён',
  
  // Campaigns
  'campaigns.title': 'Акции и специальные предложения',
  'campaigns.active': 'Активные акции',
  'campaigns.endingSoon': 'Заканчивается скоро',
  'campaigns.viewProducts': 'Смотреть товары',
};

const translationsKy: Record<string, string> = {
  // Common
  'common.save': 'Сактоо',
  'common.cancel': 'Жокко чыгаруу',
  'common.delete': 'Өчүрүү',
  'common.edit': 'Түзөтүү',
  'common.back': 'Артка',
  'common.close': 'Жабуу',
  'common.search': 'Издөө',
  'common.loading': 'Жүктөлүүдө...',
  'common.error': 'Ката',
  'common.tryAgain': 'Кайра аракет кылуу',
  'common.noResults': 'Эч нерсе табылган жок',
  'common.showMore': 'Дагы көрсөтүү',
  'common.showLess': 'Жашыруу',
  'common.total': 'Жалпы',
  'common.price': 'Баасы',
  'common.quantity': 'Саны',
  
  // Navigation
  'nav.home': 'Башкы бет',
  'nav.catalog': 'Каталог',
  'nav.favorites': 'Тандалмалар',
  'nav.cart': 'Себет',
  'nav.profile': 'Профиль',
  'nav.about': 'Дүкөн жөнүндө',
  'nav.contacts': 'Байланыштар',
  'nav.delivery': 'Жеткирүү',
  'nav.installment': 'Бөлүп төлөө',
  
  // Header
  'header.search': 'Товарларды издөө...',
  'header.menu': 'Меню',
  
  // Footer
  'footer.shopName': 'АК КАГАЗ',
  'footer.description': 'Ош шаарындагы кеңсе буюмдарынын онлайн дүкөнү',
  'footer.categories': 'Категориялар',
  'footer.information': 'Маалымат',
  'footer.contacts': 'Байланыштар',
  'footer.followUs': 'Биз социалдык тармактарда',
  'footer.copyright': '© 2026 АК КАГАЗ. Бардык укуктар корголгон.',
  
  // Home page
  'home.hero.title': 'АК КАГАЗ дүкөнүнө кош келиңиз',
  'home.hero.subtitle': 'Иш жана чыгармачылык үчүн кеңсе буюмдары',
  'home.hero.cta': 'Каталогго өтүү',
  'home.hero.badge': 'Сиз үчүн кеңсе буюмдары',
  'home.hero.subtitle.full': 'Сапаттуу кеңсе буюмдары, стилдүү товарлар жана ар бир деталда шыктануу — окуу, иш жана чыгармачылык үчүн керектүү баары бир жерде.',
  'home.hero.learnMore': 'Көбүрөөк билүү',
  'home.hero.phrase1': 'окуу үчүн',
  'home.hero.phrase2': 'чыгармачылык үчүн',
  'home.hero.phrase3': 'иш үчүн',
  'home.hero.phrase4': 'шыктануу үчүн',
  'home.hero.benefit.quality': 'Жогорку сапат',
  'home.hero.benefit.delivery': 'Ыңгайлуу жеткирүү',
  'home.hero.benefit.care': 'Кардарларга камкордук',
  'home.categories.title': 'Товар категориялары',
  'home.popular.title': 'Популярдуу товарлар',
  'home.new.title': 'Жаңылыктар',
  'home.about.title': 'АК КАГАЗ дүкөнү жөнүндө',
  'home.reviews.title': 'Сатып алуучулардын пикирлери',
  
  // Catalog
  'catalog.title': 'Товарлар каталогу',
  'catalog.filters': 'Фильтрлер',
  'catalog.sort': 'Сорттоо',
  'catalog.sort.popular': 'Популярдуулугу боюнча',
  'catalog.sort.priceAsc': 'Баасы: өсүү боюнча',
  'catalog.sort.priceDesc': 'Баасы: кемүү боюнча',
  'catalog.sort.newest': 'Жаңылыктар',
  'catalog.empty': 'Товарлар табылган жок',
  
  // Product
  'product.addToCart': 'Себетке кошуу',
  'product.addToFavorites': 'Тандалмаларга',
  'product.removeFromFavorites': 'Тандалмалардан өчүрүү',
  'product.inStock': 'Бар',
  'product.outOfStock': 'Жок',
  'product.description': 'Сүрөттөмө',
  'product.specifications': 'Мүнөздөмөлөр',
  'product.reviews': 'Пикирлер',
  'product.related': 'Окшош товарлар',
  
  // Cart
  'cart.title': 'Себет',
  'cart.empty': 'Себет бош',
  'cart.continueShopping': 'Сатып алууну улантуу',
  'cart.checkout': 'Буюртма берүү',
  'cart.subtotal': 'Сумма',
  'cart.delivery': 'Жеткирүү',
  'cart.total': 'Жалпы',
  'cart.minOrder': 'Минималдуу буюртма суммасы — 400 сом',
  'cart.remove': 'Өчүрүү',
  
  // Checkout
  'checkout.title': 'Буюртма берүү',
  'checkout.contacts': 'Байланыш маалыматтары',
  'checkout.delivery': 'Жеткирүү',
  'checkout.deliveryType': 'Алуу ыкмасы',
  'checkout.deliveryType.delivery': 'Жеткирүү',
  'checkout.deliveryType.pickup': 'Өзү алуу',
  'checkout.address': 'Жеткирүү дареги',
  'checkout.payment': 'Төлөм',
  'checkout.orderSummary': 'Сиздин буюртма',
  'checkout.placeOrder': 'Буюртма берүү',
  
  // Auth
  'auth.login': 'Кирүү',
  'auth.register': 'Катталуу',
  'auth.logout': 'Чыгуу',
  'auth.email': 'Email',
  'auth.password': 'Сырсөз',
  'auth.confirmPassword': 'Сырсөздү ырастоо',
  'auth.firstName': 'Аты',
  'auth.lastName': 'Фамилиясы',
  'auth.phone': 'Телефон',
  'auth.signIn': 'Кирүү',
  'auth.signUp': 'Каттоо',
  'auth.forgotPassword': 'Сырсөздү унутуп калдыңызбы?',
  'auth.noAccount': 'Аккаунт жокпу?',
  'auth.haveAccount': 'Аккаунт барбы?',
  'auth.passwordMismatch': 'Сырсөздөр дал келбейт',
  'auth.passwordTooShort': 'Сырсөз кеминде 8 символдон турушу керек',
  'auth.passwordHint': 'Кеминде 8 символ',
  
  // Profile
  'profile.title': 'Профиль',
  'profile.orders': 'Менин буюртмаларым',
  'profile.personalInfo': 'Жеке маалыматтар',
  'profile.addresses': 'Дареги',
  'profile.favorites': 'Тандалмалар',
  'profile.settings': 'Тууралоолор',
  
  // Orders
  'orders.title': 'Буюртмалар тарыхы',
  'orders.empty': 'Учурда буюртмаларыңыз жок',
  'orders.orderNumber': 'Буюртма №',
  'orders.status': 'Статус',
  'orders.date': 'Дата',
  'orders.total': 'Сумма',
  'orders.details': 'Буюртма толук',
  
  // Favorites
  'favorites.title': 'Тандалмалар',
  'favorites.empty': 'Тандалмалар тизмеси бош',
  
  // Info pages
  'about.title': 'Дүкөн жөнүндө',
  'contacts.title': 'Байланыштар',
  'delivery.title': 'Жеткирүү жана төлөм',
  'installment.title': 'Бөлүп төлөө',
  
  // Errors
  'error.404': 'Бет табылган жок',
  'error.404.description': 'Сиз издеген бет жок',
  'error.goHome': 'Башкы бетке кайтуу',
  'error.network': 'Тармак катасы',
  'error.server': 'Сервер катасы',
  'error.unknown': 'Белгисиз ката',
  
  // Recommendations
  'recommendations.loading': 'Сунуштамалар жүктөлүүдө...',
  'recommendations.forYou': 'Сизге сунуштайбыз',
  'recommendations.popular': 'Популярдуу товарлар',
  'recommendations.trending': 'Трендде',
  'recommendations.recent': 'Акыркы көрүлгөндөр',
  'recommendations.repeat': 'Кайра сатып алуу',
  'recommendations.similar': 'Окшош товарлар',
  'recommendations.frequentlyBought': 'Көп учурда чогуу сатып алышат',
  'recommendations.empty': 'Сунуштамалар жок',
  
  // Bundles
  'bundles.title': 'Даяр топтомдор',
  'bundles.viewAll': 'Бардык топтомдор',
  'bundles.customize': 'Топтомду тууралоо',
  'bundles.items': 'товар',
  'bundles.savings': 'Үнөмдөө',
  'bundles.composition': 'Топтомдун курамы',
  'bundles.modified': 'Топтом өзгөртүлдү',
  
  // Campaigns
  'campaigns.title': 'Акциялар жана атайын сунуштар',
  'campaigns.active': 'Активдүү акциялар',
  'campaigns.endingSoon': 'Жакында бүтөт',
  'campaigns.viewProducts': 'Товарларды көрүү',
};
