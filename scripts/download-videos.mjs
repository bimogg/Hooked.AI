/**
 * download-videos.mjs
 *
 * Скачивает видео из Instagram CDN и заливает в Supabase Storage.
 * Обновляет video_url в БД на постоянный URL (не протухает).
 *
 * Запуск: node scripts/download-videos.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://asftbzhrxmikfubzrily.supabase.co';
const SUPABASE_KEY = 'sb_secret_dSkhix3Uxfn_Z_9LcPI1Ww_lG_wI6j8';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const INSTAGRAM_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Referer': 'https://www.instagram.com/',
  'Origin': 'https://www.instagram.com',
};

function shortcodeFromId(id) {
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let n = BigInt(id);
  let code = '';
  while (n > 0n) { code = alpha[Number(n % 64n)] + code; n = n / 64n; }
  return code;
}

async function downloadAndStore(hook) {
  const shortcode = hook.instagram_id ? shortcodeFromId(hook.instagram_id) : hook.creator_username;
  const filename = `${shortcode}.mp4`;
  const storagePath = `videos/${filename}`;
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/videos/${filename}`;

  // Уже загружено — пропускаем
  if (hook.video_url && hook.video_url.includes('supabase.co')) {
    console.log(`✓ Уже в Storage: ${shortcode}`);
    return;
  }

  if (!hook.video_url) {
    console.log(`⚠ Нет video_url: ${shortcode} — пропускаем`);
    return;
  }

  console.log(`⬇ Скачиваю: ${shortcode}...`);

  try {
    const res = await fetch(hook.video_url, { headers: INSTAGRAM_HEADERS });
    if (!res.ok) {
      console.log(`✗ Не удалось скачать (${res.status}): ${shortcode}`);
      return;
    }

    const buffer = await res.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    console.log(`⬆ Загружаю в Storage: ${shortcode} (${(bytes.length / 1024 / 1024).toFixed(1)}MB)...`);

    const { error } = await supabase.storage
      .from('videos')
      .upload(storagePath, bytes, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (error) {
      console.log(`✗ Ошибка Storage: ${shortcode} — ${error.message}`);
      return;
    }

    // Обновляем video_url в БД на постоянный
    const { error: dbError } = await supabase
      .from('hooks')
      .update({ video_url: publicUrl })
      .eq('id', hook.id);

    if (dbError) {
      console.log(`✗ Ошибка обновления БД: ${shortcode} — ${dbError.message}`);
    } else {
      console.log(`✅ Готово: ${shortcode}`);
    }
  } catch (e) {
    console.log(`✗ Ошибка: ${shortcode} — ${e.message}`);
  }
}

async function main() {
  console.log('Получаю хуки из БД...');

  const { data: hooks, error } = await supabase
    .from('hooks')
    .select('id, instagram_id, creator_username, video_url')
    .order('views', { ascending: false });

  if (error) { console.error('Ошибка БД:', error); return; }

  console.log(`Найдено ${hooks.length} хуков\n`);

  for (const hook of hooks) {
    await downloadAndStore(hook);
    await new Promise(r => setTimeout(r, 500)); // пауза между запросами
  }

  console.log('\nГотово!');
}

main().catch(console.error);
