import { createClient } from '@supabase/supabase-js';

const APIFY_TOKEN = 'apify_api_rhSXih5wV4Rdecj4I4fbNA3gK1l8jc0YtTIE';
const SUPABASE_URL = 'https://asftbzhrxmikfubzrily.supabase.co';
const SUPABASE_KEY = 'sb_secret_dSkhix3Uxfn_Z_9LcPI1Ww_lG_wI6j8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CREATORS = [
  { username: 'garyvee',       niche: 'business' },
  { username: 'alexhormozi',   niche: 'business' },
  { username: 'grahamstephan', niche: 'business' },
  { username: 'hubermanlab',   niche: 'fitness' },
  { username: 'kayla_itsines', niche: 'fitness' },
  { username: 'gordonramsay',  niche: 'food' },
  { username: 'tasty',         niche: 'food' },
  { username: 'foodwithsimo',  niche: 'food' },
  { username: 'hudabeauty',    niche: 'beauty' },
  { username: 'hindash',       niche: 'beauty' },
  { username: 'jackharries',   niche: 'travel' },
  { username: 'kara_and_nate', niche: 'travel' },
  { username: 'khaby.lame',    niche: 'general' },
  { username: 'willsmith',     niche: 'general' },
];

async function runApify(profileUrls) {
  console.log(`Запускаю Apify для ${profileUrls.length} профилей...`);

  const runRes = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-scraper/runs?token=${APIFY_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        directUrls: profileUrls,
        resultsType: 'posts',
        resultsLimit: 8,
        addParentData: false,
      }),
    }
  );

  const run = await runRes.json();
  const runId = run.data?.id;
  if (!runId) throw new Error('Не удалось запустить Apify: ' + JSON.stringify(run));
  console.log(`Run ID: ${runId} — жду завершения...`);

  // Ждём завершения
  while (true) {
    await new Promise(r => setTimeout(r, 5000));
    const statusRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`
    );
    const status = await statusRes.json();
    const s = status.data?.status;
    console.log(`Статус: ${s}`);
    if (s === 'SUCCEEDED') break;
    if (s === 'FAILED' || s === 'ABORTED') throw new Error('Apify завершился с ошибкой: ' + s);
  }

  // Получаем данные
  const dataRes = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}&limit=200`
  );
  return dataRes.json();
}

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

async function downloadToStorage(cdnUrl, shortcode) {
  const filename = `${shortcode}.mp4`;
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/videos/videos/${filename}`;

  try {
    const res = await fetch(cdnUrl, { headers: INSTAGRAM_HEADERS });
    if (!res.ok) { console.log(`  ✗ CDN вернул ${res.status}`); return null; }

    const buffer = await res.arrayBuffer();
    const { error } = await supabase.storage
      .from('videos')
      .upload(`videos/${filename}`, new Uint8Array(buffer), { contentType: 'video/mp4', upsert: true });

    if (error) { console.log(`  ✗ Storage: ${error.message}`); return null; }
    return publicUrl;
  } catch (e) {
    console.log(`  ✗ Ошибка загрузки: ${e.message}`);
    return null;
  }
}

function mapToHook(item, niche) {
  if (!item.videoViewCount || item.type !== 'Video') return null;

  return {
    instagram_id: item.id || item.shortCode,
    creator_username: item.ownerUsername,
    video_url: item.videoUrl ?? null, // временно CDN, потом заменим
    thumbnail_url: item.displayUrl ?? null,
    caption: item.caption ? item.caption.slice(0, 500) : null,
    views: item.videoViewCount || 0,
    likes: item.likesCount || 0,
    comments: item.commentsCount || 0,
    niche,
    created_at: item.timestamp || new Date().toISOString(),
  };
}

async function main() {
  const profileUrls = CREATORS.map(c => `https://www.instagram.com/${c.username}/`);
  const nicheMap = Object.fromEntries(CREATORS.map(c => [c.username, c.niche]));

  const items = await runApify(profileUrls);
  console.log(`Получено ${items.length} постов`);

  const hooks = items
    .map(item => mapToHook(item, nicheMap[item.ownerUsername] ?? 'general'))
    .filter(Boolean);

  console.log(`Видео (Reels): ${hooks.length}`);
  if (hooks.length === 0) { console.log('Нет видео для вставки'); return; }

  // Сначала вставляем в БД
  const { error } = await supabase
    .from('hooks')
    .upsert(hooks, { onConflict: 'instagram_id' });

  if (error) { console.error('Ошибка Supabase:', error); return; }
  console.log(`✓ Добавлено ${hooks.length} хуков в Supabase\n`);

  // Сразу скачиваем видео в Storage (CDN URL свежий — скачаем до истечения)
  console.log('Скачиваю видео в Supabase Storage...');
  for (const hook of hooks) {
    if (!hook.video_url || !hook.instagram_id) continue;
    const shortcode = shortcodeFromId(hook.instagram_id);
    console.log(`⬇ ${shortcode}...`);
    const permanentUrl = await downloadToStorage(hook.video_url, shortcode);
    if (permanentUrl) {
      await supabase.from('hooks').update({ video_url: permanentUrl }).eq('instagram_id', hook.instagram_id);
      console.log(`  ✅ Сохранено постоянно`);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\nГотово! Все видео в Supabase Storage — URLs не протухнут.');
}

main().catch(console.error);
