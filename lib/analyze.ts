import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type RetentionPoint = { second: number; viewers: number };
type DropPoint = { second: number; drop_pct: number };

export function findDropPoints(data: RetentionPoint[]): DropPoint[] {
  const drops: DropPoint[] = [];
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1].viewers;
    const curr = data[i].viewers;
    if (prev === 0) continue;
    const pct = (prev - curr) / prev;
    if (pct > 0.12) {
      drops.push({ second: data[i].second, drop_pct: Math.round(pct * 100) });
    }
  }
  return drops;
}

export async function getAIRecommendations(
  drops: DropPoint[],
  topHooks: string[]
): Promise<string[]> {
  if (!process.env.ANTHROPIC_API_KEY || drops.length === 0) {
    return getFallbackRecommendations(drops);
  }

  const dropsText = drops
    .map((d) => `• Second ${d.second}: −${d.drop_pct}% viewers`)
    .join('\n');

  const hooksText = topHooks.slice(0, 5).join('\n');

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    system:
      'You are a short-form video hook strategist. Give 3 specific, actionable hook recommendations. Each must be under 20 words. No bullet points, no headers — just 3 lines separated by newlines.',
    messages: [
      {
        role: 'user',
        content: `My Reel has these retention drops:\n${dropsText}\n\nTop performing hooks from similar creators:\n${hooksText}\n\nGive me 3 specific hook improvements to fix the drops.`,
      },
    ],
  });

  const text = (message.content[0] as { type: string; text: string }).text;
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 3);
}

function getFallbackRecommendations(drops: DropPoint[]): string[] {
  const recs = [
    'Open with a bold statement or question in the first frame — before any context.',
    'Add a text overlay at second 0 that teases the payoff: "wait for it…" or a shocking stat.',
    'Cut the intro — start at the moment of highest tension or value.',
    'Add a sound hit or visual cut at the drop point to reset attention.',
    'Show your face in the first second making a surprised or emphatic expression.',
  ];

  if (drops.length > 0 && drops[0].second <= 2) {
    return [
      `Drop at ${drops[0].second}s: Open mid-action — skip the intro completely.`,
      'Add a fast-cut or sound hit in the first 2 seconds to interrupt passive scrolling.',
      'Use a pattern-interrupt text overlay at frame 0: bold claim or question.',
    ];
  }

  return recs.slice(0, 3);
}
