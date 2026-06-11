# HookedAI — Документация проекта

## Что за проект

HookedAI — это SaaS-инструмент для Instagram-креаторов. Помогает делать сильные хуки в Reels. Два главных инструмента:

1. **ИИ Анализатор** — загружаешь своё видео, Claude анализирует кадры, находит слабые места (где зритель уходит) и пишет готовые скрипты хука.
2. **Библиотека хуков** — коллекция вирусных Reels от топ-креаторов, разбитых по типу хука. Можно смотреть как образец.

---

## Стек

| Слой | Технология |
|------|-----------|
| Frontend | Next.js App Router, Tailwind CSS v4, TypeScript |
| Auth | Clerk |
| БД | Supabase (PostgreSQL) |
| Storage | Supabase Storage (S3-compatible) |
| ИИ анализ | Claude claude-haiku-4-5-20251001 (через Anthropic SDK) |
| Скрапинг Instagram | Apify — `apify~instagram-scraper` |
| Payments | Polar |
| Deploy | Vercel (auto-deploy из GitHub `main`) |
| i18n | Самодельная система через `lib/translations.ts` |

---

## Структура файлов

```
app/
  app/
    page.tsx                  — главная страница
    library/page.tsx          — библиотека хуков
    pricing/page.tsx          — тарифы
    api/
      analyze-video/route.ts  — ГЛАВНЫЙ API: принимает кадры → Claude → слабые зоны + примеры
      analyze/route.ts        — старый (не используется)
      proxy-video/route.ts    — прокси для видео (не работает — Instagram блочит Vercel)
      auth/, webhook/, ...    — Clerk/Polar хуки

  components/
    VideoAnalyzer.tsx         — загрузка видео, UI анализа, показ результатов
    HookPlayer.tsx            — плеер хука (thumbnail → 1 клик → видео из Supabase)
    HookCard.tsx              — карточка в библиотеке
    LibraryContent.tsx        — библиотека с фильтрами
    HomeContent.tsx           — главная страница
    Nav.tsx                   — навигация
    Footer.tsx                — футер
    LanguageSwitcher.tsx      — переключатель языков
    PricingContent.tsx        — страница тарифов

  lib/
    translations.ts           — все переводы (12 языков), функция tr(section, key, lang)
    supabase.ts               — клиент Supabase
    analyze.ts                — вспомогательные функции анализа

  scripts/                   — запускаются локально через node
    seed-hooks.mjs            — добавить новые хуки через Apify → сразу скачать в Storage
    refresh-videos.mjs        — обновить протухшие CDN URL через Apify → Storage
    download-videos.mjs       — скачать видео с уже имеющихся CDN URL (если не протухли)
    upload-thumbnails.mjs     — загрузить превью в Storage
    HOW_IT_WORKS.md           — детальная документация системы хуков
```

---

## Главная боль: Instagram CDN URL протухают

Instagram CDN URL (`scontent-*.cdninstagram.com`) содержат параметр `oe=XXXXXXXX` — это Unix timestamp истечения. **Через ~2-3 дня URL становится 403**.

**Решение:** сразу после получения URL через Apify — скачать видео в Supabase Storage. Оттуда URL никогда не протухает.

### Правильный путь в Supabase Storage

Bucket: `videos`
Path внутри bucket: `videos/{shortcode}.mp4`
Публичный URL: `https://asftbzhrxmikfubzrily.supabase.co/storage/v1/object/public/videos/videos/{shortcode}.mp4`

**ВАЖНО:** путь включает `videos/` дважды — один раз это имя bucket, второй раз папка внутри.

### Shortcode ↔ Instagram ID

Instagram ID (число) → Shortcode (строка в URL): base64url с алфавитом `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_`

```js
function shortcodeFromId(id) {
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let n = BigInt(String(id));
  let code = '';
  while (n > 0n) { code = alpha[Number(n % 64n)] + code; n = n / 64n; }
  return code;
}
```

---

## Как работает анализ видео

### Поток данных

```
Пользователь загружает видео
  → VideoAnalyzer.tsx извлекает ~12 кадров (через canvas)
  → POST /api/analyze-video {frames: base64[], timestamps: number[], lang: 'ru'}
  → Claude claude-haiku-4-5-20251001 анализирует кадры
  → Находит 2-3 слабые зоны (timestamp, проблема, тип хука, скрипт)
  → Для каждой зоны: находит пример из библиотеки (hooks в Supabase)
  → Возвращает {hookScore, videoTopic, weakZones[]}
  → VideoAnalyzer.tsx рендерит результат
```

### Пример ответа API

```json
{
  "hookScore": 4,
  "videoTopic": "как правильно делать планку",
  "weakZones": [
    {
      "timestamp": "0–3s",
      "whatIsWrong": "Видео начинается молча, без текста — зритель не понимает что будет",
      "hookType": "Question Hook",
      "script": "Ты делаешь планку неправильно — и это убивает твою спину",
      "example": {
        "video_url": "https://...supabase.co/.../videos/DRCJ2DLkd-V.mp4",
        "thumbnail_url": "...",
        "reelUrl": "https://instagram.com/reel/DRCJ2DLkd-V/",
        "caption": "...",
        "views": 1200000
      }
    }
  ]
}
```

### Лимиты

- **Бесплатно:** 20 анализов (хранится в localStorage)
- **Pro:** без лимита
- Константа: `FREE_LIMIT = 20` в `components/VideoAnalyzer.tsx:9`

---

## Как работает HookPlayer

`components/HookPlayer.tsx` — плеер в карточке примера:

1. Показывает `thumbnail_url` как превью
2. Пользователь кликает → `video.play()` напрямую из Supabase Storage URL
3. Видео зацикливается на первых `hookDuration` секундах (только хук-часть)
4. Маленькая кнопка ExternalLink → открывает рил в Instagram

**1 клик → видео играет.** Без модалок, без переходов в Instagram.

---

## Библиотека хуков (таблица `hooks` в Supabase)

| Поле | Описание |
|------|----------|
| `id` | UUID |
| `instagram_id` | Числовой ID рила |
| `creator_username` | Юзернейм автора |
| `video_url` | Supabase Storage URL — **ВСЕГДА должен быть Storage, не CDN** |
| `thumbnail_url` | URL превью |
| `caption` | Подпись к рилу |
| `views` | Просмотры |
| `niche` | Тип хука: `Visual Hook`, `Question Hook`, `Tutorial Hook`, `Curiosity Hook`, `Warning Hook`, `Challenge Hook`, `Engagement Hook`, `Mistake Hook` |

### Как добавить новые хуки

```bash
# 1. Добавь аккаунт в массив CREATORS в scripts/seed-hooks.mjs
# 2. Запусти:
node scripts/seed-hooks.mjs
# Скрипт сам: Apify → скачать видео → Supabase Storage → обновить URL в БД
```

### Как починить протухшие видео

```bash
node scripts/refresh-videos.mjs
# Находит все хуки без Supabase URL → Apify → скачать → Storage → обновить БД
```

---

## i18n (переводы)

Файл: `lib/translations.ts`

**12 языков:** ru, en, es, fr, de, pt, it, tr, ar, ko, zh, ja

Использование:
```tsx
import { tr } from '@/lib/translations';
// в компоненте:
{tr('home', 'heroSub', lang)}
```

`lang` приходит из `LanguageProvider` через `useLanguage()` хук.

**Правило:** весь UI-текст должен идти через `tr()`. Никаких хардкодных английских строк.

---

## Deploy

**GitHub:** `bimogg/Hooked.AI` (private)
**Vercel:** автодеплой из `main`

Push через IP (DNS issue):
```bash
GIT_SSL_NO_VERIFY=true git push https://140.82.121.4/bimogg/Hooked.AI.git main
```

Env переменные в Vercel: `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, Clerk ключи, Polar ключи.

---

## Что было сделано в сессии 10-11 июня 2026

### Проблема
Видео в библиотеке хуков не играло при клике — Instagram CDN URL в БД уже протухли (2-3 дня жизни). При клике либо редиректило в Instagram, либо требовало 2 клика.

### Что сделали

1. **Нашли корень проблемы** — `oe=` параметр в CDN URL = Unix expiry timestamp. Все URL в БД уже протухли.

2. **Создали скрипты:**
   - `scripts/refresh-videos.mjs` — берёт все хуки без Supabase URL, запускает Apify для свежих CDN URL, сразу скачивает в Storage
   - `scripts/download-videos.mjs` — скачивает с уже имеющихся CDN URL (если свежие)
   - `scripts/seed-hooks.mjs` — обновлён: теперь сразу скачивает видео в Storage после Apify

3. **Скачали все 19 видео** в Supabase Storage bucket `videos/`

4. **Нашли баг с путём** — файлы загружались как `videos/videos/filename.mp4` (bucket=`videos`, path=`videos/filename`), но URL в БД записывался без вложенной папки → 400 ошибка. Исправили все 19 URL в БД + поправили скрипты.

5. **Переписали HookPlayer** — убрали прокси, модалку, embed iframe. Теперь просто `<video src={videoUrl}>` → 1 клик → играет.

6. **Исправили [object Object] ошибку** в VideoAnalyzer — когда API возвращал не-строку как error, `new Error(obj)` давал `[object Object]`. Добавили проверку `typeof data.error === 'string'`.

7. **Перевели весь UI** — все хардкодные строки в HomeContent, Footer, Nav заменены на `tr()`.

8. **Увеличили лимит** бесплатного анализа до 20.
