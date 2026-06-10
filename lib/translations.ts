export const LANGUAGES = [
  { code: 'ru', label: 'RU', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'EN', name: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'ES', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'FR', name: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', label: 'PT', name: 'Português', flag: '🇧🇷' },
  { code: 'it', label: 'IT', name: 'Italiano', flag: '🇮🇹' },
  { code: 'tr', label: 'TR', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ar', label: 'AR', name: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'ko', label: 'KO', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', label: 'ZH', name: '中文', flag: '🇨🇳' },
  { code: 'ja', label: 'JA', name: '日本語', flag: '🇯🇵' },
];

export type LangCode = typeof LANGUAGES[number]['code'];

const t = {
  nav: {
    cta: { ru: 'Анализировать видео', en: 'Analyze My Video', es: 'Analizar mi video', fr: 'Analyser ma vidéo', de: 'Video analysieren', pt: 'Analisar vídeo', it: 'Analizza video', tr: 'Videomu analiz et', ar: 'تحليل الفيديو', ko: '영상 분석하기', zh: '分析视频', ja: '動画を分析' },
  },
  upload: {
    title: { ru: 'Загрузи своё видео', en: 'Upload your video', es: 'Sube tu video', fr: 'Télécharge ta vidéo', de: 'Video hochladen', pt: 'Envie seu vídeo', it: 'Carica il tuo video', tr: 'Videonuzu yükleyin', ar: 'ارفع الفيديو', ko: '영상 업로드', zh: '上传你的视频', ja: '動画をアップロード' },
    subtitle: { ru: 'MP4, MOV · до 300MB', en: 'MP4, MOV · up to 300MB', es: 'MP4, MOV · hasta 300MB', fr: 'MP4, MOV · jusqu\'à 300MB', de: 'MP4, MOV · bis 300MB', pt: 'MP4, MOV · até 300MB', it: 'MP4, MOV · fino a 300MB', tr: 'MP4, MOV · 300MB\'a kadar', ar: 'MP4, MOV · حتى 300MB', ko: 'MP4, MOV · 최대 300MB', zh: 'MP4, MOV · 最大300MB', ja: 'MP4, MOV · 最大300MB' },
    badge: { ru: '1 анализ бесплатно', en: '1 free analysis', es: '1 análisis gratis', fr: '1 analyse gratuite', de: '1 kostenlose Analyse', pt: '1 análise grátis', it: '1 analisi gratis', tr: '1 ücretsiz analiz', ar: 'تحليل واحد مجاناً', ko: '무료 분석 1회', zh: '1次免费分析', ja: '1回無料分析' },
  },
  loading: {
    frames: { ru: 'Читаем видео...', en: 'Reading video...', es: 'Leyendo video...', fr: 'Lecture de la vidéo...', de: 'Video wird gelesen...', pt: 'Lendo vídeo...', it: 'Lettura video...', tr: 'Video okunuyor...', ar: 'جارٍ قراءة الفيديو...', ko: '영상 읽는 중...', zh: '读取视频...', ja: '動画を読み込み中...' },
    analyzing: { ru: 'ИИ ищет слабые места...', en: 'AI finding weak spots...', es: 'IA buscando puntos débiles...', fr: 'IA cherche les points faibles...', de: 'KI sucht schwache Stellen...', pt: 'IA encontrando pontos fracos...', it: 'IA cerca i punti deboli...', tr: 'Yapay zeka zayıf noktaları arıyor...', ar: 'الذكاء الاصطناعي يبحث عن نقاط الضعف...', ko: 'AI가 약점 찾는 중...', zh: 'AI正在寻找弱点...', ja: 'AIが弱点を探しています...' },
    hooks: { ru: 'Подбираем примеры хуков...', en: 'Selecting hook examples...', es: 'Seleccionando ejemplos de hooks...', fr: 'Sélection des exemples de hooks...', de: 'Hook-Beispiele werden ausgewählt...', pt: 'Selecionando exemplos de hooks...', it: 'Selezione esempi di hook...', tr: 'Hook örnekleri seçiliyor...', ar: 'اختيار أمثلة الخطافات...', ko: '훅 예시 선택 중...', zh: '选择钩子示例...', ja: 'フック例を選んでいます...' },
  },
  result: {
    outOf: { ru: 'из 10', en: 'out of 10', es: 'de 10', fr: 'sur 10', de: 'von 10', pt: 'de 10', it: 'su 10', tr: '10 üzerinden', ar: 'من 10', ko: '10점 중', zh: '满10分', ja: '10点中' },
    weakZone: { ru: 'Слабая зона', en: 'Weak spot', es: 'Punto débil', fr: 'Point faible', de: 'Schwache Stelle', pt: 'Ponto fraco', it: 'Punto debole', tr: 'Zayıf nokta', ar: 'نقطة ضعف', ko: '약점 구간', zh: '薄弱环节', ja: '弱いスポット' },
    yourVideo: { ru: 'Твоё видео', en: 'Your video', es: 'Tu video', fr: 'Ton vidéo', de: 'Dein Video', pt: 'Seu vídeo', it: 'Il tuo video', tr: 'Senin videon', ar: 'فيديوك', ko: '내 영상', zh: '你的视频', ja: 'あなたの動画' },
    howTo: { ru: 'Как надо', en: 'How it should be', es: 'Cómo debe ser', fr: 'Comment ça devrait être', de: 'Wie es sein sollte', pt: 'Como deve ser', it: 'Come dovrebbe essere', tr: 'Nasıl olmalı', ar: 'كيف يجب أن يكون', ko: '이렇게 하세요', zh: '应该这样做', ja: 'こうすべき' },
    script: { ru: 'Скрипт — скажи так вместо этого', en: 'Script — say this instead', es: 'Guión — di esto en su lugar', fr: 'Script — dis plutôt ça', de: 'Skript — sag stattdessen das', pt: 'Script — diga isso em vez disso', it: 'Script — di\' invece questo', tr: 'Senaryo — bunun yerine bunu söyle', ar: 'السيناريو — قل هذا بدلاً من ذلك', ko: '스크립트 — 이렇게 말하세요', zh: '脚本 — 改说这个', ja: 'スクリプト — 代わりにこう言って' },
    copy: { ru: 'Скопировать', en: 'Copy', es: 'Copiar', fr: 'Copier', de: 'Kopieren', pt: 'Copiar', it: 'Copia', tr: 'Kopyala', ar: 'نسخ', ko: '복사', zh: '复制', ja: 'コピー' },
    copied: { ru: 'Скопировано', en: 'Copied', es: 'Copiado', fr: 'Copié', de: 'Kopiert', pt: 'Copiado', it: 'Copiato', tr: 'Kopyalandı', ar: 'تم النسخ', ko: '복사됨', zh: '已复制', ja: 'コピー済み' },
    tryThis: { ru: 'Попробуй', en: 'Try this', es: 'Prueba esto', fr: 'Essaie ça', de: 'Probier das', pt: 'Tente isso', it: 'Prova questo', tr: 'Bunu dene', ar: 'جرّب هذا', ko: '이거 해봐', zh: '试试这个', ja: 'これを試して' },
    library: { ru: 'Смотреть все хуки в библиотеке →', en: 'Browse all hooks in library →', es: 'Ver todos los hooks en la biblioteca →', fr: 'Voir tous les hooks dans la bibliothèque →', de: 'Alle Hooks in der Bibliothek →', pt: 'Ver todos os hooks na biblioteca →', it: 'Tutti gli hook nella libreria →', tr: 'Kütüphanedeki tüm hooklar →', ar: 'تصفح جميع الخطافات →', ko: '라이브러리에서 모든 훅 보기 →', zh: '浏览库中所有钩子 →', ja: 'ライブラリで全フックを見る →' },
    upsellTitle: { ru: 'Хочешь анализировать все видео?', en: 'Want to analyze all your videos?', es: '¿Quieres analizar todos tus videos?', fr: 'Tu veux analyser toutes tes vidéos?', de: 'Möchtest du alle Videos analysieren?', pt: 'Quer analisar todos os seus vídeos?', it: 'Vuoi analizzare tutti i tuoi video?', tr: 'Tüm videolarını analiz etmek ister misin?', ar: 'هل تريد تحليل جميع مقاطعك؟', ko: '모든 영상을 분석하고 싶나요?', zh: '想分析所有视频吗？', ja: 'すべての動画を分析したいですか？' },
    upsellCta: { ru: 'Смотреть Pro →', en: 'See Pro plans →', es: 'Ver planes Pro →', fr: 'Voir les plans Pro →', de: 'Pro-Pläne ansehen →', pt: 'Ver planos Pro →', it: 'Vedi piani Pro →', tr: 'Pro planlarını gör →', ar: 'عرض خطط Pro →', ko: 'Pro 플랜 보기 →', zh: '查看Pro计划 →', ja: 'Proプランを見る →' },
    another: { ru: '← Загрузить другое видео', en: '← Upload another video', es: '← Subir otro video', fr: '← Télécharger une autre vidéo', de: '← Anderes Video hochladen', pt: '← Enviar outro vídeo', it: '← Carica un altro video', tr: '← Başka bir video yükle', ar: '← تحميل فيديو آخر', ko: '← 다른 영상 업로드', zh: '← 上传另一个视频', ja: '← 別の動画をアップロード' },
    locked: { ru: 'Бесплатный анализ использован', en: 'Free analysis used', es: 'Análisis gratuito usado', fr: 'Analyse gratuite utilisée', de: 'Kostenlose Analyse verwendet', pt: 'Análise gratuita usada', it: 'Analisi gratuita utilizzata', tr: 'Ücretsiz analiz kullanıldı', ar: 'تم استخدام التحليل المجاني', ko: '무료 분석 사용됨', zh: '免费分析已使用', ja: '無料分析を使用済み' },
    lockedSub: { ru: 'Купи Pro чтобы анализировать без ограничений', en: 'Buy Pro to analyze without limits', es: 'Compra Pro para analizar sin límites', fr: 'Achète Pro pour analyser sans limites', de: 'Kauf Pro, um ohne Grenzen zu analysieren', pt: 'Compre Pro para analisar sem limites', it: 'Acquista Pro per analizzare senza limiti', tr: 'Sınırsız analiz için Pro satın al', ar: 'اشترِ Pro للتحليل بلا حدود', ko: '제한 없이 분석하려면 Pro 구매', zh: '购买Pro无限分析', ja: '無制限分析のためにProを購入' },
    lockedCta: { ru: 'Купить Pro →', en: 'Buy Pro →', es: 'Comprar Pro →', fr: 'Acheter Pro →', de: 'Pro kaufen →', pt: 'Comprar Pro →', it: 'Acquista Pro →', tr: 'Pro satın al →', ar: 'شراء Pro →', ko: 'Pro 구매 →', zh: '购买Pro →', ja: 'Proを購入 →' },
  },
} as const;

export type TranslationKey = keyof typeof t;

export function tr(section: keyof typeof t, key: string, lang: string): string {
  const s = t[section] as Record<string, Record<string, string>>;
  return s[key]?.[lang] ?? s[key]?.['en'] ?? key;
}

export function langName(code: string): string {
  return LANGUAGES.find(l => l.code === code)?.name ?? code.toUpperCase();
}

export function isRTL(code: string): boolean {
  return LANGUAGES.find(l => l.code === code)?.rtl === true;
}

// Language name for Claude prompts
export function langForPrompt(code: string): string {
  const map: Record<string, string> = {
    ru: 'Russian', en: 'English', es: 'Spanish', fr: 'French',
    de: 'German', pt: 'Portuguese', it: 'Italian', tr: 'Turkish',
    ar: 'Arabic', ko: 'Korean', zh: 'Chinese (Simplified)', ja: 'Japanese',
  };
  return map[code] ?? 'English';
}
