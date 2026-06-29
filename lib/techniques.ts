// Techniques shown in the Hook Library "Techniques" group. Each technique is a
// carousel of short demo clips + step-by-step instructions for recreating it.
// Steps live here (not in the DB) so adding a technique = edit this file + deploy.

export type Loc = { ru: string; en: string };

export interface Clip {
  videoUrl: string;
  thumbUrl: string;
}

export interface Step {
  text: Loc;
  img?: string; // optional screenshot illustrating the step
  video?: string; // optional short clip illustrating the step
}

export interface Technique {
  id: string;
  title: Loc;
  app: Loc;
  thumbUrl: string; // card cover
  clips: Clip[]; // swipeable carousel inside the modal
  steps: Step[];
}

const BASE = 'https://asftbzhrxmikfubzrily.supabase.co/storage/v1/object/public/techniques';

// Method for the two-tone / accent caption text — made in NodeVideo.
// Add `img` or `video` (public techniques-bucket URL) to any step to illustrate it.
// Steps are being filled in one by one as Alina sends them.
const TWO_TONE_STEPS: Step[] = [
  {
    text: { ru: 'Скачай приложение NodeVideo.', en: 'Download the NodeVideo app.' },
    img: `${BASE}/step1.jpg`,
  },
];

export const TECHNIQUES: Technique[] = [
  {
    id: 'two-tone-text',
    title: { ru: 'Двухцветный текст / субтитры', en: 'Two-color caption text' },
    app: { ru: 'NodeVideo', en: 'NodeVideo' },
    thumbUrl: `${BASE}/IMG_2837.png`,
    clips: [
      { videoUrl: `${BASE}/IMG_2837.mp4`, thumbUrl: `${BASE}/IMG_2837.png` },
      { videoUrl: `${BASE}/IMG_2840.mp4`, thumbUrl: `${BASE}/IMG_2840.png` },
    ],
    steps: TWO_TONE_STEPS,
  },
];
