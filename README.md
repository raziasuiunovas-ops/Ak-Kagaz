# AK KAGAZ - Интернет-магазин канцтоваров

> PWA приложение для оптово-розничного магазина канцтоваров в Оше, Кыргызстан

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-10-e0234e)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169e1)](https://neon.tech/)

---

## 📋 О проекте

**AK KAGAZ** — полнофункциональная платформа электронной коммерции для продажи канцелярских товаров с поддержкой:

- 🛍 Оптовых и розничных продаж
- 📱 Progressive Web App (PWA)
- 🌐 Двуязычный интерфейс (Русский/Кыргызский)
- 📦 Складской учет
- 👥 RBAC система управления ролями
- 🚚 Доставка и самовывоз
- 💳 Множественные способы оплаты

---

## 🛠 Технологический стек

### Frontend
- **React 19** - UI библиотека
- **Vite** - Build tool
- **TypeScript** - Типизация (strict mode)
- **React Router DOM** - Маршрутизация
- **TanStack Query** - Управление серверным состоянием
- **React Hook Form + Zod** - Формы и валидация
- **CSS Modules** - Стилизация
- **Lucide React** - Иконки
- **vite-plugin-pwa** - PWA поддержка

### Backend
- **NestJS** - Backend framework
- **TypeScript** - Типизация (strict mode)
- **Prisma** - ORM
- **Swagger** - API документация
- **class-validator** - Валидация

### Database
- **Neon PostgreSQL** - Serverless PostgreSQL
- **Prisma Migrate** - Migrations

### DevOps & Tools
- **pnpm** - Package manager
- **ESLint + Prettier** - Code quality
- **Vitest** - Frontend testing
- **Jest** - Backend testing

---

## 📁 Структура проекта

```
ak-kagaz/
├── frontend/              # React PWA приложение
│   ├── src/
│   │   ├── app/          # Root application
│   │   ├── components/   # Reusable components
│   │   ├── features/     # Feature modules
│   │   ├── hooks/        # Custom hooks
│   │   ├── layouts/      # Layout components
│   │   ├── pages/        # Page components
│   │   ├── router/       # Router configuration
│   │   ├── services/     # API clients
│   │   ├── styles/       # Global styles
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets
│
├── backend/              # NestJS API
│   ├── src/
│   │   ├── auth/        # Authentication
│   │   ├── users/       # User management
│   │   ├── roles/       # Roles & permissions
│   │   ├── products/    # Product catalog
│   │   ├── categories/  # Categories
│   │   ├── orders/      # Order management
│   │   ├── warehouse/   # Warehouse operations
│   │   ├── payments/    # Payment processing
│   │   ├── notifications/ # Notification service
│   │   └── common/      # Shared modules
│   └── test/            # E2E tests
│
├── prisma/              # Database schema
│   └── schema.prisma    # Prisma schema
│
├── docs/                # Documentation
│   └── TZ.md           # Technical specification
│
├── AGENTS.md           # Development guidelines
└── README.md           # This file
```

---

## 🚀 Быстрый старт

### Требования

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Установка

1. **Клонируйте репозиторий**

```bash
git clone <repository-url>
cd ak-kagaz
```

2. **Установите зависимости**

```bash
npm install
```

3. **Настройте переменные окружения**

Frontend:
```bash
cd frontend
cp .env.example .env
# Отредактируйте .env
```

Backend:
```bash
cd backend
cp .env.example .env
# Добавьте DATABASE_URL и другие переменные
```

4. **Настройте базу данных** (когда будет готова схема)

```bash
# Создайте миграции
npm run prisma:migrate --workspace=@ak-kagaz/backend

# Сгенерируйте Prisma Client
npm run prisma:generate --workspace=@ak-kagaz/backend
```

---

## 🎯 Команды разработки

### Запуск в режиме разработки

```bash
# Запустить всё (frontend + backend)
npm run dev

# Только frontend (порт 3000)
npm run dev:frontend

# Только backend (порт 4000)
npm run dev:backend
```

### Сборка для production

```bash
# Собрать всё
npm run build

# Собрать frontend
npm run build:frontend

# Собрать backend
npm run build:backend
```

### Тестирование

```bash
# Запустить все тесты
npm test

# Frontend тесты
npm test --workspace=@ak-kagaz/frontend

# Backend тесты
npm test --workspace=@ak-kagaz/backend

# E2E тесты
npm run test:e2e --workspace=@ak-kagaz/backend
```

### Проверка кода

```bash
# ESLint
npm run lint

# TypeScript проверка
npm run type-check

# Форматирование
npm run format
```

### Prisma команды

```bash
# Prisma Studio (GUI для БД)
npm run prisma:studio --workspace=@ak-kagaz/backend

# Создать миграцию
npm run prisma:migrate --workspace=@ak-kagaz/backend -- --name <name>

# Применить миграции
npm run prisma:deploy --workspace=@ak-kagaz/backend

# Сгенерировать Prisma Client
npm run prisma:generate --workspace=@ak-kagaz/backend

# Форматировать schema
npm run prisma:format --workspace=@ak-kagaz/backend
```

---

## 🔐 Конфигурация окружения

### Frontend (.env)

```env
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=<your-client-id>
```

### Backend (.env)

```env
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# JWT
JWT_SECRET=<your-secret>
JWT_EXPIRES_IN=7d

# OAuth
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-secret>

# CORS
FRONTEND_URL=http://localhost:3000
```

⚠️ **ВАЖНО:** Никогда не коммитьте файлы .env в репозиторий!

---

## 👥 Роли пользователей

- **SUPER_ADMIN** - Полный доступ к системе
- **ADMIN** - Управление товарами, заказами, клиентами
- **MANAGER** - Управление заказами и клиентами
- **WAREHOUSE** - Складской учет
- **CUSTOMER** - Покупатель

---

## 📱 PWA Features

- ✅ Установка на устройства
- ✅ Offline fallback
- ✅ Service Worker кэширование
- ✅ Web App Manifest
- ✅ Адаптивный дизайн

---

## 🌐 Локализация

Поддерживаемые языки:
- 🇷🇺 Русский (ru)
- 🇰🇬 Кыргызский (ky)

---

## 📚 Документация

- [Техническое задание](./docs/TZ.md) - Полное ТЗ проекта
- [AGENTS.MD](./AGENTS.md) - Правила разработки
- [Prisma README](./prisma/README.md) - Database setup
- [API документация](http://localhost:4000/api/docs) - Swagger UI (после запуска backend)

---

## 🧪 Текущий статус

### ✅ Настроено

- [x] Monorepo структура с pnpm workspaces
- [x] Frontend: React 19 + Vite + TypeScript
- [x] Backend: NestJS + TypeScript
- [x] Routing с React Router DOM
- [x] PWA конфигурация
- [x] Prisma ORM настройка
- [x] ESLint + Prettier
- [x] Testing infrastructure
- [x] Development guidelines (AGENTS.md)

### 🔄 В разработке

- [ ] ER-диаграмма базы данных
- [ ] Схема Prisma с моделями
- [ ] Аутентификация (Google OAuth)
- [ ] RBAC система
- [ ] Модули функциональности

### 📋 Следующие шаги

1. **Согласование ТЗ** с владельцем
2. **Проектирование БД** - ER-диаграмма
3. **Настройка Neon PostgreSQL** - Production database
4. **Разработка аутентификации** - Google OAuth + JWT
5. **Реализация бизнес-логики** - Согласно ТЗ

---

## 🤝 Участие в разработке

### Workflow

1. Создайте feature ветку: `git checkout -b feature/my-feature`
2. Внесите изменения
3. Запустите тесты: `pnpm test`
4. Проверьте код: `pnpm lint` и `pnpm type-check`
5. Закоммитьте: `git commit -m "feat: добавлена функция"`
6. Создайте Pull Request

### Правила

- Следуйте [AGENTS.MD](./AGENTS.md)
- Пишите типизированный TypeScript (strict mode)
- Добавляйте тесты для новой функциональности
- Используйте conventional commits
- Не коммитьте секреты

---

## 📄 Лицензия

UNLICENSED - Частный коммерческий проект

---

## 📞 Контакты

**AK KAGAZ**
- Адрес: ул. Аскара Шакирова, 258, Ош, Кыргызстан
- Режим работы: Ежедневно 08:00-20:00

---

## 🙏 Acknowledgments

- React Team
- NestJS Team
- Prisma Team
- Neon Team

---

**Разработано с ❤️ для AK KAGAZ**
