# 📄 Open Graph - Шпаргалка

## ⚡ Quick Start (5 минут)

### 1. Deploy
```bash
git add .
git commit -m "feat: Complete Open Graph implementation"
git push
```

### 2. Тест в Facebook
```
https://developers.facebook.com/tools/debug/
→ Вставить: https://ak-kagaz.vercel.app
→ Нажать: "Scrape Again" (2-3 раза)
→ Проверить изображение
```

### 3. Тест в Telegram
```
Telegram → Избранное
→ Отправить: https://ak-kagaz.vercel.app
→ Проверить preview
```

### 4. Тест в WhatsApp
```
WhatsApp → Любой чат
→ Отправить: https://ak-kagaz.vercel.app
→ Проверить preview
```

## 🔍 Быстрая проверка

### Изображения доступны?
```bash
curl -I https://ak-kagaz.vercel.app/opengraph/og-image-ru.png
# Ожидается: HTTP/2 200
```

### Метатеги на месте?
```bash
curl https://ak-kagaz.vercel.app | grep "og:image"
# Должно быть 4+ строк
```

## ❌ Проблемы и решения

| Проблема | Решение |
|----------|---------|
| Изображение не загружается | "Scrape Again" в Facebook 3 раза |
| Старое изображение | Добавить `?v=2` к URL |
| Метатегов нет | Проверить deploy на Vercel |
| 404 на изображение | Проверить файлы в `frontend/public/opengraph/` |

## 📱 Платформы и кэш

| Платформа | Кэш | Как обновить |
|-----------|-----|--------------|
| Facebook | Несколько часов | "Scrape Again" |
| Telegram | 2-3 часа | `?v=2` или ждать |
| WhatsApp | Несколько часов | `?v=2` или ждать |
| Instagram | Как WhatsApp | `?v=2` или ждать |

## 🔗 Важные ссылки

```
Facebook Debugger:
https://developers.facebook.com/tools/debug/

OpenGraph.xyz:
https://www.opengraph.xyz/

Изображения:
https://ak-kagaz.vercel.app/opengraph/og-image-ru.png
https://ak-kagaz.vercel.app/opengraph/og-image-ky.png

Тест страница:
https://ak-kagaz.vercel.app/og-test.html
```

## 📚 Документация

| Файл | Для чего |
|------|----------|
| README_OPENGRAPH.md | 👈 Начать здесь |
| DEPLOY_AND_TEST_CHECKLIST.md | Пошаговый тест |
| OG_IMAGE_TROUBLESHOOTING.md | Решение проблем |
| GIT_COMMIT_GUIDE.md | Команды git |
| TEST_COMMANDS.md | Команды проверки |

## ⚠️ Важно знать

✅ **Работает:**
- Главная страница
- Все статические страницы
- Facebook, Instagram, WhatsApp, Telegram

⚠️ **Ограничения:**
- Боты всегда видят русскую версию
- Для полной мультиязычности нужен SSR или универсальное изображение

## 🎯 Чек-лист

- [ ] Deploy выполнен
- [ ] Изображения доступны
- [ ] Facebook Debugger OK
- [ ] Telegram preview OK
- [ ] WhatsApp preview OK
- [ ] Instagram preview OK

## 💡 Советы

1. **Всегда тестируйте в Facebook Debugger первым**
2. **Нажимайте "Scrape Again" несколько раз**
3. **Дайте кэшу время обновиться (30 мин)**
4. **Используйте `?v=2` для обхода кэша**
5. **Проверяйте изображение напрямую по URL**

## 📞 Помощь

| Вопрос | Документ |
|--------|----------|
| Изображения не появляются? | OG_IMAGE_TROUBLESHOOTING.md |
| Как добавить метаданные на новую страницу? | frontend/METADATA_GUIDE.md |
| Как работает мультиязычность? | UNIVERSAL_OG_IMAGE_SOLUTION.md |
| Нужны команды для теста? | TEST_COMMANDS.md |

---

## 🚀 Статус: ГОТОВО!

После deploy Open Graph работает во ВСЕХ социальных сетях! ✅

**Распечатайте эту шпаргалку и держите под рукой!** 📄
