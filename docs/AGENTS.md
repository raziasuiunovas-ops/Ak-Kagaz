# AGENTS.MD - Development Guidelines for AK KAGAZ

> **ВАЖНО:** Этот документ определяет обязательные правила разработки для проекта AK KAGAZ.
> Все AI-агенты и разработчики должны следовать этим правилам при работе над проектом.

---

## 📋 СОДЕРЖАНИЕ

1. [Обязательный технологический стек](#-обязательный-технологический-стек)
2. [Архитектурные правила](#-архитектурные-правила)
3. [Правила TypeScript](#-правила-typescript)
4. [Правила безопасности](#-правила-безопасности)
5. [Работа с базой данных](#-работа-с-базой-данных)
6. [Тестирование](#-тестирование)
7. [Локализация](#-локализация)
8. [Управление ролями](#-управление-ролями)
9. [PWA и офлайн-режим](#-pwa-и-офлайн-режим)
10. [Git и управление версиями](#-git-и-управление-версиями)

---

## 🛠 ОБЯЗАТЕЛЬНЫЙ ТЕХНОЛОГИЧЕСКИЙ СТЕК

### Frontend

**✅ ОБЯЗАТЕЛЬНО ИСПОЛЬЗОВАТЬ:**
- React 19
- Vite
- TypeScript (strict mode)
- React Router DOM с createBrowserRouter
- CSS Modules (НЕ styled-components, НЕ emotion)
- Lucide React (для иконок)
- TanStack Query (React Query)
- React Hook Form + Zod
- vite-plugin-pwa

**❌ ЗАПРЕЩЕНО:**
- Next.js (не используется в этом проекте)
- JavaScript вместо TypeScript
- Inline styles без CSS Modules
- any без обоснованной необходимости
- Сторонние UI библиотеки без согласования

### Backend

**✅ ОБЯЗАТЕЛЬНО ИСПОЛЬЗОВАТЬ:**
- Node.js
- NestJS
- TypeScript (strict mode)
- REST API
- Modular Architecture
- class-validator и class-transformer

**❌ ЗАПРЕЩЕНО:**
- Express.js без NestJS
- JavaScript вместо TypeScript
- Отсутствие валидации входных данных

### Database

**✅ ОБЯЗАТЕЛЬНО:**
- Neon PostgreSQL
- Prisma ORM
- Prisma Migrate

**❌ ЗАПРЕЩЕНО:**
- Другие базы данных
- Raw SQL без Prisma

---

## 🏗 АРХИТЕКТУРНЫЕ ПРАВИЛА

### Monorepo Structure

Обязательная структура pnpm workspaces:
- `frontend/` - React приложение
- `backend/` - NestJS API
- `prisma/` - Database schema

### Frontend Architecture

```
frontend/
├── src/
│   ├── app/          # Root app component
│   ├── components/   # Reusable UI components
│   ├── features/     # Feature-based modules
│   ├── hooks/        # Custom React hooks
│   ├── layouts/      # Layout components
│   ├── pages/        # Page components
│   ├── router/       # Router configuration
│   ├── services/     # API clients
│   ├── types/        # TypeScript types
│   └── utils/        # Utility functions
```

**✅ ПРАВИЛЬНО:**
- Компоненты с единственной ответственностью
- Feature-based организация
- CSS Modules для стилизации
- API вызовы через TanStack Query

**❌ НЕПРАВИЛЬНО:**
- Бизнес-логика в UI компонентах
- Прямые API вызовы из компонентов
- Глобальные стили без необходимости

### Backend Architecture

```
backend/
├── src/
│   ├── auth/          # Аутентификация
│   ├── users/         # Пользователи
│   ├── products/      # Товары
│   ├── orders/        # Заказы
│   ├── warehouse/     # Склад
│   └── common/        # Общие модули
```

Каждый модуль содержит:
- `module.ts`
- `controller.ts`
- `service.ts`
- `dto/` (Data Transfer Objects)

---

## 📘 ПРАВИЛА TYPESCRIPT

### Strict Mode (ОБЯЗАТЕЛЬНО)

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noImplicitReturns": true,
  "noUncheckedIndexedAccess": true
}
```

### Правильное использование типов

**✅ ПРАВИЛЬНО:**

```typescript
// Интерфейсы для объектов
interface User {
  id: string;
  email: string;
  role: UserRole;
}

// Type для union types
type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'WAREHOUSE' | 'CUSTOMER';

// Типизация функций
function getUser(id: string): Promise<User> {
  // ...
}

// Типизация React компонентов
interface ButtonProps {
  label: string;
  onClick: () => void;
}

export function Button({ label, onClick }: ButtonProps) {
  // ...
}
```

**❌ НЕПРАВИЛЬНО:**

```typescript
// НЕ используйте any
function getData(): any { // ❌
  // ...
}

// НЕ игнорируйте ошибки
// @ts-ignore  // ❌
const result = someFunction();
```

---

## 🔒 ПРАВИЛА БЕЗОПАСНОСТИ

### Секреты и конфиденциальные данные

**✅ ОБЯЗАТЕЛЬНО:**
- Все секреты только в переменных окружения
- Используйте .env файлы (добавлены в .gitignore)
- Предоставьте .env.example без реальных значений

**❌ СТРОГО ЗАПРЕЩЕНО:**
- Коммитить .env файлы
- Хардкодить секреты в коде
- Логировать секреты, пароли, токены
- Хранить данные банковских карт

### Authentication & Authorization

**✅ ПРАВИЛЬНО:**

```typescript
// Backend: проверка роли на каждом endpoint
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Post('products')
async createProduct(@Body() dto: CreateProductDto) {
  // ...
}
```

**❌ НЕПРАВИЛЬНО:**
- Проверка роли только на frontend
- Доверие данным от клиента без проверки
- Незащищенные административные endpoint

### Input Validation

**Всегда валидируйте входные данные на backend:**

```typescript
import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

---

## 🗄 РАБОТА С БАЗОЙ ДАННЫХ

### Prisma Rules

**✅ ОБЯЗАТЕЛЬНО:**
- Используйте Prisma для всех операций с БД
- Создавайте миграции для всех изменений схемы
- Используйте транзакции для связанных операций
- Индексируйте часто запрашиваемые поля

**❌ ЗАПРЕЩЕНО:**
- Raw SQL без обоснованной необходимости
- Изменение БД без миграций
- Прямые изменения production БД
- Удаление миграций

### Транзакции

Используйте транзакции для связанных операций:

```typescript
async createOrder(dto: CreateOrderDto) {
  return this.prisma.$transaction(async (tx) => {
    const order = await tx.order.create({ data: dto });
    
    for (const item of dto.items) {
      await tx.warehouse.update({
        where: { productId: item.productId },
        data: { reserved: { increment: item.quantity } },
      });
    }
    
    return order;
  });
}
```

### Naming Conventions

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([email])
  @@map("users")
}
```

- camelCase для полей
- PascalCase для моделей
- snake_case в БД через @@map

---

## 🧪 ТЕСТИРОВАНИЕ

### Требования

**✅ ОБЯЗАТЕЛЬНО писать тесты для:**
- API endpoints (e2e тесты)
- Бизнес-логика (unit тесты)
- Критичные утилиты

**Frontend: Vitest + React Testing Library**
**Backend: Jest**

### Пример тестирования

```typescript
// Frontend
describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});

// Backend
describe('OrdersService', () => {
  it('should create an order', async () => {
    const result = await service.create(dto);
    expect(result).toHaveProperty('id');
  });
});
```

---

## 🌐 ЛОКАЛИЗАЦИЯ

### Поддерживаемые языки

- **Русский (ru)** - основной
- **Кыргызский (ky)** - обязательный

### Правила локализации

**✅ ОБЯЗАТЕЛЬНО:**
- Переводить весь интерфейс
- Переводить ошибки и уведомления
- Сохранять выбор языка пользователя
- Форматировать дату/время по локали

**❌ ЗАПРЕЩЕНО:**
- Смешивать языки в интерфейсе
- Хардкодить тексты на одном языке
- Игнорировать локализацию ошибок

### Структура переводов

```typescript
// types/locales.ts
export type Locale = 'ru' | 'ky';

export interface Translations {
  common: {
    save: string;
    cancel: string;
    delete: string;
  };
  errors: {
    required: string;
    invalid_email: string;
  };
}
```

---

## 👥 УПРАВЛЕНИЕ РОЛЯМИ

### Роли системы

```typescript
type UserRole = 
  | 'SUPER_ADMIN'  // Полный доступ
  | 'ADMIN'        // Товары, заказы, клиенты
  | 'MANAGER'      // Заказы, клиенты
  | 'WAREHOUSE'    // Склад, остатки
  | 'CUSTOMER';    // Покупатель
```

### RBAC Rules

**✅ ОБЯЗАТЕЛЬНО:**
- Проверяйте роль на КАЖДОМ защищенном endpoint
- Не доверяйте проверкам на frontend
- Логируйте действия уполномоченных ролей
- Используйте guards в NestJS

**❌ ЗАПРЕЩЕНО:**
- Проверка роли только на frontend
- Повышение роли без аудита
- Доступ к закупочным ценам для неуполномоченных

### Пример RBAC

```typescript
// Backend Guard
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get('roles', context.getHandler());
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}

// Usage
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Post('products')
async createProduct() { }
```

---

## 📱 PWA И ОФЛАЙН-РЕЖИМ

### PWA Requirements

**✅ ОБЯЗАТЕЛЬНО:**
- Web App Manifest настроен
- Service Worker для кэширования
- Offline fallback страница
- Обновление контента при восстановлении соединения

**❌ ЗАПРЕЩЕНО кэшировать:**
- API с заказами
- Персональные данные
- Административные операции
- Данные авторизации
- Актуальные цены без пометки

### Manifest Configuration

```typescript
{
  name: 'AK KAGAZ',
  short_name: 'AK KAGAZ',
  theme_color: '#ffffff',
  background_color: '#ffffff',
  display: 'standalone',
  start_url: '/',
}
```

### Service Worker Rules

```typescript
// НЕ кэшируйте:
navigateFallbackDenylist: [/^\/api/, /^\/admin/]

// Кэшируйте статику:
- Шрифты
- Изображения товаров (с ограничением)
- CSS/JS бандлы
```

---

## 🔄 GIT И УПРАВЛЕНИЕ ВЕРСИЯМИ

### Commit Messages

Используйте conventional commits:

```
feat: добавлена регистрация пользователя
fix: исправлена ошибка валидации email
docs: обновлена документация API
style: форматирование кода
refactor: рефакторинг OrdersService
test: добавлены тесты для ProductsController
chore: обновлены зависимости
```

### Branch Strategy

```
main           # Production-ready код
develop        # Development ветка
feature/*      # Новые функции
fix/*          # Исправления
hotfix/*       # Критические исправления
```

### Pull Request Rules

**✅ ОБЯЗАТЕЛЬНО:**
- Описание изменений
- Прохождение всех тестов
- Линтинг без ошибок
- TypeScript проверка без ошибок
- Код-ревью перед merge

**❌ ЗАПРЕЩЕНО:**
- Коммитить напрямую в main
- Merge без прохождения тестов
- Игнорировать конфликты
- Коммитить файлы с секретами

---

## ⚠️ КРИТИЧЕСКИЕ ОГРАНИЧЕНИЯ

### НИКОГДА НЕ ДЕЛАЙТЕ

1. **НЕ коммитьте секреты**
   - Нет паролей в коде
   - Нет API ключей в коде
   - Нет токенов в коде

2. **НЕ игнорируйте валидацию**
   - Всегда валидируйте на backend
   - Не доверяйте данным от клиента

3. **НЕ изменяйте несвязанные модули**
   - Один PR = одна функция
   - Не смешивайте изменения

4. **НЕ создавайте таблицы БД без миграций**
   - Всегда через Prisma Migrate
   - Никаких прямых изменений

5. **НЕ пропускайте тестирование**
   - Критичная функциональность должна быть протестирована
   - E2E тесты для важных потоков

---

## 📞 ВОПРОСЫ И УТОЧНЕНИЯ

Если требования неясны или противоречивы:

1. Обратитесь к [ТЗ](./docs/TZ.md)
2. Проверьте этот документ
3. Запросите уточнение у владельца проекта
4. Документируйте принятые решения

---

## 📝 CHANGELOG

- **2026-11-06**: Создан первоначальный AGENTS.md
- Версия: 1.0.0

---

**ВАЖНО:** Этот документ является обязательным для всех участников разработки. Отклонения от этих правил должны быть явно согласованы и документированы.
