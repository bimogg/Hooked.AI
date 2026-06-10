import { NextRequest } from 'next/server';

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return new Response('Missing url', { status: 400 });

  // only allow instagram cdn
  if (!url.includes('cdninstagram.com') && !url.includes('scontent')) {
    return new Response('Forbidden', { status: 403 });
  }

  const range = req.headers.get('range');
  const upstream: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Referer': 'https://www.instagram.com/',
    'Origin': 'https://www.instagram.com',
    'Accept': '*/*',
  };
  if (range) upstream['Range'] = range;

  const res = await fetch(url, { headers: upstream });

  const out = new Headers({
    'Content-Type': res.headers.get('Content-Type') || 'video/mp4',
    'Accept-Ranges': 'bytes',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=604800',
  });
  const cl = res.headers.get('Content-Length');
  const cr = res.headers.get('Content-Range');
  if (cl) out.set('Content-Length', cl);
  if (cr) out.set('Content-Range', cr);

  return new Response(res.body, { status: res.status, headers: out });
}
