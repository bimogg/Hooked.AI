// Techniques shown in the Hook Library "Techniques" group. Each technique is a
// carousel of short demo clips + step-by-step instructions for recreating it.
// Steps live here (not in the DB) so adding a technique = edit this file + deploy.

export type Loc = { ru: string; en: string };

export interface Clip {
  videoUrl: string;
  thumbUrl: string;
}

export interface Technique {
  id: string;
  title: Loc;
  app: Loc;
  thumbUrl: string; // card cover
  clips: Clip[]; // swipeable carousel inside the modal
  steps: Loc[];
}

const BASE = 'https://asftbzhrxmikfubzrily.supabase.co/storage/v1/object/public/techniques';

// Method for the two-tone / accent caption text seen in the demos.
const TWO_TONE_STEPS: Loc[] = [
  { ru: 'Открой CapCut → «Новый проект» и добавь своё видео.', en: 'Open CapCut → "New project" and add your clip.' },
  { ru: 'Внизу нажми «Текст» → «Добавить текст».', en: 'At the bottom tap "Text" → "Add text".' },
  { ru: 'Напечатай фразу (например «I found it at the Yandex Museum»).', en: 'Type your phrase (e.g. "I found it at the Yandex Museum").' },
  { ru: 'Во вкладке «Шрифт» выбери жирный шрифт, как в видео.', en: 'In the "Font" tab pick a bold font like in the video.' },
  { ru: 'Чтобы слова были разного цвета — разбей текст на два слоя: один белый, второй цветной (красный/жёлтый), и поставь их рядом.', en: 'For different word colors split the text into two layers: one white, one colored (red/yellow), placed next to each other.' },
  { ru: 'Во вкладке «Стиль» добавь лёгкую обводку или тень, чтобы текст читался на любом фоне.', en: 'In "Style" add a thin outline or shadow so text stays readable on any background.' },
  { ru: 'Перетащи текст в верхнюю часть кадра.', en: 'Drag the text to the top of the frame.' },
  { ru: 'Растяни слой текста на всю длину клипа (или нужный отрезок).', en: 'Stretch the text layer across the whole clip (or the part you need).' },
  { ru: '(По желанию) «Анимация» → «Вход» → выбери появление (Fade / Type).', en: '(Optional) "Animation" → "In" → pick an entrance (Fade / Type).' },
  { ru: 'Нажми «Экспорт» вверху справа и сохрани видео без вотермарки.', en: 'Tap "Export" top-right and save the video without a watermark.' },
];

export const TECHNIQUES: Technique[] = [
  {
    id: 'two-tone-text',
    title: { ru: 'Двухцветный текст / субтитры', en: 'Two-color caption text' },
    app: { ru: 'CapCut', en: 'CapCut' },
    thumbUrl: `${BASE}/IMG_2837.png`,
    clips: [
      { videoUrl: `${BASE}/IMG_2837.mp4`, thumbUrl: `${BASE}/IMG_2837.png` },
      { videoUrl: `${BASE}/IMG_2840.mp4`, thumbUrl: `${BASE}/IMG_2840.png` },
    ],
    steps: TWO_TONE_STEPS,
  },
];
