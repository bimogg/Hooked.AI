type Point = { second: number; viewers: number };

export default function RetentionChart({ data, dark }: { data: Point[]; dark?: boolean }) {
  if (!data || data.length < 2) return null;

  const W = 280;
  const H = 80;
  const maxV = data[0].viewers;
  const maxS = data[data.length - 1].second;

  const points = data.map((p) => ({
    x: (p.second / maxS) * W,
    y: H - (p.viewers / maxV) * H,
  }));

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const fill = `${path} L ${W} ${H} L 0 ${H} Z`;

  const dropIdx = data.findIndex((_, i) => {
    if (i === 0) return false;
    const drop = (data[i - 1].viewers - data[i].viewers) / data[i - 1].viewers;
    return drop > 0.15;
  });

  const stroke = dark ? '#e8002d' : '#e8002d';
  const gridColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const labelColor = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';

  return (
    <svg viewBox={`0 0 ${W} ${H + 16}`} className="w-full" aria-label="Retention chart">
      <line x1="0" y1={H * 0.33} x2={W} y2={H * 0.33} stroke={gridColor} strokeWidth="1" />
      <line x1="0" y1={H * 0.66} x2={W} y2={H * 0.66} stroke={gridColor} strokeWidth="1" />
      <path d={fill} fill={stroke} fillOpacity="0.08" />
      <path d={path} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {dropIdx > 0 && (
        <>
          <circle cx={points[dropIdx].x} cy={points[dropIdx].y} r="4" fill={stroke} />
          <line x1={points[dropIdx].x} y1="0" x2={points[dropIdx].x} y2={H} stroke={stroke} strokeWidth="1" strokeDasharray="3 2" />
        </>
      )}
      <text x="0" y={H + 13} fontSize="9" fill={labelColor}>0s</text>
      <text x={W / 2} y={H + 13} fontSize="9" fill={labelColor} textAnchor="middle">{Math.round(maxS / 2)}s</text>
      <text x={W} y={H + 13} fontSize="9" fill={labelColor} textAnchor="end">{maxS}s</text>
    </svg>
  );
}
