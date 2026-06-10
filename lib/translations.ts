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
  library: {
    subtitle: { ru: 'Хуки топ-креаторов с реальными просмотрами. Найди что работает до съёмки.', en: 'Hooks from top creators with real views data. Find what works before you record.', es: 'Hooks de los mejores creadores con datos reales. Encuentra lo que funciona antes de grabar.', fr: 'Hooks des meilleurs créateurs avec de vraies données. Trouve ce qui marche avant de filmer.', de: 'Hooks von Top-Creators mit echten Daten. Finde heraus, was funktioniert, bevor du aufnimmst.', pt: 'Hooks dos melhores criadores com dados reais. Descubra o que funciona antes de gravar.', it: 'Hook dai migliori creator con dati reali. Trova cosa funziona prima di girare.', tr: 'Gerçek verilerle top içerik üreticilerinin hooklarını keşfet. Çekmeden önce ne işe yaradığını bul.', ar: 'هوكات من أبرز المبدعين مع بيانات مشاهدات حقيقية. اكتشف ما يصلح قبل التصوير.', ko: '실제 조회수 데이터로 검증된 훅. 촬영 전에 무엇이 효과적인지 찾아보세요.', zh: '来自顶级创作者的钩子，附真实观看数据。拍摄前找到有效的方式。', ja: 'トップクリエイターのフックと実際の視聴データ。撮影前に何が効くか見つけよう。' },
    sorted: { ru: 'по просмотрам', en: 'sorted by views', es: 'ordenado por vistas', fr: 'trié par vues', de: 'nach Aufrufen sortiert', pt: 'ordenado por visualizações', it: 'ordinato per visualizzazioni', tr: 'görüntülemeye göre sıralı', ar: 'مرتب حسب المشاهدات', ko: '조회수 순', zh: '按观看量排序', ja: '視聴数順' },
    updated: { ru: 'Новые хуки добавляются регулярно. Заглядывай почаще.', en: 'New hooks are added regularly. Check back often.', es: 'Se añaden nuevos hooks regularmente. Vuelve pronto.', fr: 'De nouveaux hooks sont ajoutés régulièrement. Reviens souvent.', de: 'Neue Hooks werden regelmäßig hinzugefügt. Schau öfter vorbei.', pt: 'Novos hooks são adicionados regularmente. Volte sempre.', it: 'Nuovi hook vengono aggiunti regolarmente. Torna spesso.', tr: 'Düzenli olarak yeni hooklar ekleniyor. Sık sık kontrol et.', ar: 'تُضاف هوكات جديدة بانتظام. تفقّد الموقع كثيراً.', ko: '새로운 훅이 정기적으로 추가됩니다. 자주 확인하세요.', zh: '定期添加新钩子。常来看看。', ja: '定期的に新しいフックが追加されます。こまめにチェックして。' },
  },
  hookCard: {
    attention: { ru: 'внимания', en: 'retention', es: 'retención', fr: 'rétention', de: 'Bindung', pt: 'retenção', it: 'retention', tr: 'tutma', ar: 'احتفاظ', ko: '유지율', zh: '留存', ja: '維持率' },
    visual: { ru: 'Захватывает без слов', en: 'Grabs attention without words', es: 'Engancha sin palabras', fr: 'Accroche sans mots', de: 'Packt ohne Worte', pt: 'Prende sem palavras', it: 'Cattura senza parole', tr: 'Kelimesiz dikkat çeker', ar: 'يجذب بلا كلام', ko: '말 없이 시선 사로잡기', zh: '无需言语抓住注意力', ja: '言葉なしで引きつける' },
    question: { ru: 'Заставляет досмотреть до ответа', en: 'Makes viewers watch to the end', es: 'Hace que vean hasta el final', fr: 'Pousse à regarder jusqu\'à la fin', de: 'Lässt bis zum Ende schauen', pt: 'Faz assistir até o fim', it: 'Fa guardare fino alla fine', tr: 'Sona kadar izletir', ar: 'يجعل المشاهد يكمل حتى النهاية', ko: '끝까지 보게 만드는 훅', zh: '让观众看到最后', ja: '最後まで見させるフック' },
    warning: { ru: 'Создаёт ощущение срочности', en: 'Creates urgency to watch', es: 'Crea urgencia para ver', fr: 'Crée une urgence à regarder', de: 'Erzeugt Dringlichkeit', pt: 'Cria urgência para assistir', it: 'Crea urgenza di guardare', tr: 'İzleme aciliyeti yaratır', ar: 'يخلق إحساساً بالإلحاح', ko: '긴박감을 만드는 훅', zh: '制造紧迫感', ja: '緊迫感を生むフック' },
    curiosity: { ru: 'Невозможно не узнать чем кончится', en: 'Impossible to scroll past', es: 'Imposible no seguir viendo', fr: 'Impossible de ne pas continuer', de: 'Unmöglich wegzuschauen', pt: 'Impossível não continuar', it: 'Impossibile smettere di guardare', tr: 'Geçmek imkansız', ar: 'مستحيل التوقف عن المشاهدة', ko: '넘길 수 없는 훅', zh: '让人无法划走', ja: 'スクロールできないフック' },
    challenge: { ru: 'Вовлекает через эмоцию и интерес', en: 'Engages through emotion', es: 'Engancha a través de la emoción', fr: 'Engage par l\'émotion', de: 'Engagiert durch Emotion', pt: 'Envolve através da emoção', it: 'Coinvolge attraverso l\'emozione', tr: 'Duygu yoluyla bağlar', ar: 'يجذب عبر المشاعر', ko: '감정으로 참여 유도', zh: '通过情感引发共鸣', ja: '感情で引き込むフック' },
    mistake: { ru: 'Триггер на узнавание себя', en: 'Triggers self-recognition', es: 'Activa el reconocimiento propio', fr: 'Déclenche l\'auto-reconnaissance', de: 'Löst Selbsterkennung aus', pt: 'Ativa o auto-reconhecimento', it: 'Innesca l\'auto-riconoscimento', tr: 'Öz farkındalık tetikler', ar: 'يثير التعرف على الذات', ko: '자기 인식을 자극', zh: '触发自我认知', ja: '自己認識を引き起こす' },
    tutorial: { ru: 'Даёт конкретную ценность сразу', en: 'Delivers value immediately', es: 'Da valor de inmediato', fr: 'Apporte de la valeur immédiatement', de: 'Liefert sofort Mehrwert', pt: 'Entrega valor imediatamente', it: 'Fornisce valore immediatamente', tr: 'Hemen değer sunar', ar: 'يقدم قيمة فورية', ko: '즉각적인 가치 제공', zh: '立即提供价值', ja: 'すぐに価値を届けるフック' },
    hookTutorial: { ru: 'Показывает как делать хуки правильно', en: 'Shows how to make great hooks', es: 'Muestra cómo hacer buenos hooks', fr: 'Montre comment faire de bons hooks', de: 'Zeigt, wie man gute Hooks macht', pt: 'Mostra como fazer bons hooks', it: 'Mostra come fare buoni hook', tr: 'İyi hook yapımını gösterir', ar: 'يوضح كيفية صنع هوكات رائعة', ko: '훅 만드는 법을 알려주는 콘텐츠', zh: '展示如何制作精彩钩子', ja: '良いフックの作り方を解説' },
    engagement: { ru: 'Удерживает внимание зрителя', en: 'Keeps viewer attention', es: 'Mantiene la atención del espectador', fr: 'Maintient l\'attention du spectateur', de: 'Hält die Aufmerksamkeit des Zuschauers', pt: 'Mantém a atenção do espectador', it: 'Mantiene l\'attenzione dello spettatore', tr: 'İzleyici dikkatini tutar', ar: 'يحافظ على انتباه المشاهد', ko: '시청자 관심 유지', zh: '保持观众注意力', ja: '視聴者の注意を保つ' },
  },
  pro: {
    desc: { ru: 'Загрузи Reel — ИИ найдёт слабые хуки и покажет реальные примеры которые работают.', en: 'Upload your Reel — AI finds weak hooks and shows real examples that work.', es: 'Sube tu Reel — la IA encuentra hooks débiles y muestra ejemplos reales.', fr: 'Télécharge ton Reel — l\'IA trouve les hooks faibles et montre de vrais exemples.', de: 'Lade dein Reel hoch — KI findet schwache Hooks und zeigt echte Beispiele.', pt: 'Envie seu Reel — IA encontra hooks fracos e mostra exemplos reais.', it: 'Carica il tuo Reel — l\'IA trova hook deboli e mostra esempi reali.', tr: 'Reel\'ini yükle — Yapay zeka zayıf hookları bulur ve gerçek örnekler gösterir.', ar: 'ارفع Reel — الذكاء الاصطناعي يجد الخطافات الضعيفة ويعرض أمثلة حقيقية.', ko: '릴을 올리면 AI가 약한 훅을 찾고 실제 예시를 보여줍니다.', zh: '上传你的Reel — AI找出弱钩并展示真实有效的例子。', ja: 'リールをアップロード — AIが弱いフックを見つけ、実際の例を表示します。' },
    freeBadge: { ru: '1 видео бесплатно · без регистрации', en: '1 video free · no sign-up', es: '1 video gratis · sin registro', fr: '1 vidéo gratuite · sans inscription', de: '1 Video kostenlos · ohne Anmeldung', pt: '1 vídeo grátis · sem cadastro', it: '1 video gratis · senza registrazione', tr: '1 video ücretsiz · kayıt gerekmez', ar: 'فيديو واحد مجاناً · بدون تسجيل', ko: '1개 무료 · 가입 불필요', zh: '1个视频免费 · 无需注册', ja: '1動画無料 · 登録不要' },
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
