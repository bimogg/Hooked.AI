'use client';
import { useState } from 'react';
import { Zap } from 'lucide-react';

export default function AnalyzeButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function run() {
    setState('loading');
    try {
      const res = await fetch('/api/analyze', { method: 'POST' });
      if (!res.ok) throw new Error();
      setState('done');
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  }

  const labels = {
    idle: 'Analyze with AI',
    loading: 'Analyzing…',
    done: 'Done! Refreshing…',
    error: 'Failed — retry',
  };

  return (
    <button
      onClick={run}
      disabled={state === 'loading' || state === 'done'}
      className="flex items-center gap-2 bg-[#0a0a0a] text-white text-xs font-bold px-4 py-2 rounded-full hover:opacity-80 transition-opacity disabled:opacity-50"
    >
      <Zap size={12} />
      {labels[state]}
    </button>
  );
}
