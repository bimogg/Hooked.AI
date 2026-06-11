# Как работает система хуков HookedAI

## Проблема которую решаем
Instagram CDN видео URL (`scontent-*.cdninstagram.com`) **протухают через ~2-3 дня**.
Они содержат параметр `oe=XXXXXXXX` (Unix timestamp истечения).
Если видео в БД хранится с CDN URL — через несколько дней оно перестаёт играть.

**Решение:** скачать видео сразу после скрапинга и хранить в Supabase Storage.
Supabase Storage URL **никогда не протухает**.

---

## Структура БД (таблица `hooks`)

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | uuid | Первичный ключ |
| `instagram_id` | text | Числовой ID рила из Instagram |
| `creator_username` | text | Юзернейм автора |
| `video_url` | text | **Должен быть Supabase Storage URL** (не CDN!) |
| `thumbnail_url` | text | URL превью из Supabase Storage |
| `caption` | text | Подпись к рилу |
| `views` | int | Количество просмотров |
| `niche` | text | Тип хука (Visual Hook, Question Hook, и т.д.) |

---

## Supabase Storage

Два публичных bucket:
- `thumbnails/` — превью изображения (JPG)
- `videos/` — видеофайлы (MP4)

Формат имени файла: `{shortcode}.mp4` или `{shortcode}.jpg`
Shortcode = base64url кодировка `instagram_id` (функция `shortcodeFromId`)

Публичный URL формат:
```
https://asftbzhrxmikfubzrily.supabase.co/storage/v1/object/public/videos/{shortcode}.mp4
```

---

## Скрипты

### `seed-hooks.mjs` — основной скрипт добавления хуков
1. Запускает Apify Instagram Scraper для списка аккаунтов
2. Вставляет данные в таблицу `hooks`
3. **Сразу скачивает видео** в Supabase Storage пока CDN URL ещё свежий
4. Обновляет `video_url` в БД на постоянный Supabase URL

**Запуск:**
```bash
node scripts/seed-hooks.mjs
```

### `download-videos.mjs` — починка существующих хуков
Используй если в БД есть записи с протухшими/CDN video_url.
Скачивает видео и заменяет URL на постоянный Supabase.

**Запуск:**
```bash
node scripts/download-videos.mjs
```

### `upload-thumbnails.mjs` — загрузка превью
Скачивает thumbnail изображения и загружает в Supabase Storage.

---

## Как добавить новые хуки

1. Добавь аккаунт в массив `CREATORS` в `seed-hooks.mjs`
2. Запусти `node scripts/seed-hooks.mjs`
3. Скрипт автоматически скачает видео в Storage

**НЕ добавляй хуки вручную через Supabase Dashboard** с CDN URL — они протухнут.

---

## Как работает видеоплеер (HookPlayer)

`components/HookPlayer.tsx`:
- Показывает `thumbnail_url` как превью
- При клике на плей: пробует воспроизвести `video_url` напрямую в `<video>` теге
- Если `video_url` — Supabase Storage URL → **работает всегда, 1 клик**
- Если `video_url` — CDN Instagram URL → может не работать если протух
- При ошибке загрузки: открывает рил в Instagram (`reelUrl`)
- `reelUrl` строится из `instagram_id` через функцию `idToShortcode`

---

## Apify

Токен: `apify_api_rhSXih5wV4Rdecj4I4fbNA3gK1l8jc0YtTIE`
Актор: `apify~instagram-scraper`
Лимит: 8 рилов на аккаунт
Важно: запускать скрипт сразу скачивает видео пока токен свежий (~2-3 часа после скрапинга)

---

## Типы хуков (niche)

Используются для подбора примера в анализе:
- `Visual Hook`
- `Question Hook`
- `Tutorial Hook`
- `Curiosity Hook`
- `Warning Hook`
- `Challenge Hook`
- `Engagement Hook`
- `Mistake Hook`
- `Hook Tutorial`
