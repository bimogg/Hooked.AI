'use client';
import { useEffect } from 'react';

// Guard so amplitude initializes only once for the whole app lifecycle
let initialized = false;

export default function AmplitudeInit() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;
    (async () => {
      const amplitude = await import('@amplitude/unified');
      amplitude.initAll('b7d79e0dfb73fd8cd877e6bdd588e860', {
        analytics: { autocapture: true },
        sessionReplay: { sampleRate: 1 },
      });
    })();
  }, []);

  return null;
}
