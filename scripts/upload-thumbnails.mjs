import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://asftbzhrxmikfubzrily.supabase.co';
const SUPABASE_KEY = 'sb_secret_dSkhix3Uxfn_Z_9LcPI1Ww_lG_wI6j8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const { data: hooks, error } = await supabase
    .from('hooks')
    .select('id, instagram_id, thumbnail_url')
    .not('thumbnail_url', 'is', null);

  if (error) { console.error(error); return; }
  console.log(`Найдено ${hooks.length} хуков с thumbnail`);

  for (const hook of hooks) {
    try {
      const res = await fetch(hook.thumbnail_url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (!res.ok) { console.log(`Пропуск ${hook.id}: ${res.status}`); continue; }

      const buffer = await res.arrayBuffer();
      const filename = `${hook.instagram_id}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(filename, buffer, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) { console.log(`Ошибка загрузки ${hook.id}:`, uploadError.message); continue; }

      const { data: { publicUrl } } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(filename);

      await supabase.from('hooks').update({ thumbnail_url: publicUrl }).eq('id', hook.id);
      console.log(`✓ ${hook.instagram_id}`);
    } catch (e) {
      console.log(`Ошибка ${hook.id}:`, e.message);
    }
  }

  console.log('Готово');
}

main().catch(console.error);
