/**
 * refresh-videos.mjs
 *
 * Получает свежие CDN URL через Apify для конкретных рилов,
 * сразу скачивает видео в Supabase Storage.
 *
 * Запуск: node scripts/refresh-videos.mjs
 */

import { createClient } from '@supabase/supabase-js';

const APIFY_TOKEN = 'apify_api_rhSXih5wV4Rdecj4I4fbNA3gK1l8jc0YtTIE';
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
  let n = BigInt(String(id));
  let code = '';
  while (n > 0n) { code = alpha[Number(n % 64n)] + code; n = n / 64n; }
  return code;
}

function idFromShortcode(code) {
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let n = 0n;
  for (const c of code) { n = n * 64n + BigInt(alpha.indexOf(c)); }
  return n.toString();
}

async function apifyFetchReels(reelUrls) {
  console.log(`Запускаю Apify для ${reelUrls.length} рилов...`);
  const res = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-scraper/runs?token=${APIFY_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        directUrls: reelUrls,
        resultsType: 'posts',
        resultsLimit: reelUrls.length,
        addParentData: false,
      }),
    }
  );
  const run = await res.json();
  const runId = run.data?.id;
  if (!runId) throw new Error('Apify не запустился: ' + JSON.stringify(run));
  console.log(`Run ID: ${runId} — жду...`);

  while (true) {
    await new Promise(r => setTimeout(r, 5000));
    const s = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
    const status = (await s.json()).data?.status;
    console.log(`  Статус: ${status}`);
    if (status === 'SUCCEEDED') break;
    if (status === 'FAILED' || status === 'ABORTED') throw new Error('Apify ошибка: ' + status);
  }

  const data = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}&limit=200`
  );
  return data.json();
}

async function downloadToStorage(cdnUrl, shortcode) {
  const filename = `${shortcode}.mp4`;
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/videos/${filename}`;

  console.log(`  ⬇ Скачиваю ${(0).toFixed(0)}MB...`);
  const res = await fetch(cdnUrl, { headers: INSTAGRAM_HEADERS });
  if (!res.ok) { console.log(`  ✗ CDN ${res.status}`); return null; }

  const buffer = await res.arrayBuffer();
  console.log(`  ⬆ Загружаю ${(buffer.byteLength / 1024 / 1024).toFixed(1)}MB в Storage...`);

  const { error } = await supabase.storage
    .from('videos')
    .upload(`videos/${filename}`, new Uint8Array(buffer), { contentType: 'video/mp4', upsert: true });

  if (error) { console.log(`  ✗ Storage: ${error.message}`); return null; }
  return publicUrl;
}

async function main() {
  // Получаем все хуки из БД у которых нет постоянного URL
  const { data: hooks } = await supabase
    .from('hooks')
    .select('id, instagram_id, creator_username, video_url')
    .order('views', { ascending: false });

  const needRefresh = hooks.filter(h =>
    h.instagram_id && (!h.video_url || !h.video_url.includes('supabase.co'))
  );

  console.log(`Нужно обновить: ${needRefresh.length} хуков\n`);
  if (needRefresh.length === 0) { console.log('Все уже в Storage!'); return; }

  // Строим reel URLs для Apify
  const reelUrls = needRefresh.map(h =>
    `https://www.instagram.com/reel/${shortcodeFromId(h.instagram_id)}/`
  );

  // Получаем свежие CDN URL через Apify
  const items = await apifyFetchReels(reelUrls);
  console.log(`\nApify вернул ${items.length} результатов\n`);

  // Строим map: instagram_id → cdnUrl
  const cdnMap = {};
  for (const item of items) {
    if (item.videoUrl && item.id) {
      cdnMap[String(item.id)] = item.videoUrl;
    }
    // также по shortCode если есть
    if (item.videoUrl && item.shortCode) {
      const id = idFromShortcode(item.shortCode);
      cdnMap[id] = item.videoUrl;
    }
  }

  // Скачиваем и сохраняем
  for (const hook of needRefresh) {
    const shortcode = shortcodeFromId(hook.instagram_id);
    const cdnUrl = cdnMap[hook.instagram_id];

    if (!cdnUrl) {
      console.log(`⚠ Нет CDN URL от Apify: ${shortcode}`);
      continue;
    }

    console.log(`\n📹 ${shortcode}`);
    const permanentUrl = await downloadToStorage(cdnUrl, shortcode);

    if (permanentUrl) {
      await supabase.from('hooks').update({ video_url: permanentUrl }).eq('id', hook.id);
      console.log(`  ✅ Сохранено: ${permanentUrl}`);
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n✅ Готово! Все видео теперь в Supabase Storage.');
}

main().catch(console.error);
