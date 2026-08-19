'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useEffect } from 'react';
import Navbar from '@/components/ui/Navbar';

const Scene = dynamic(() => import('@/components/organism/Scene'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#020408',
      color: '#00f5d4',
      fontSize: '1.2rem',
      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
    }}>
      <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
        Assembling neural pathways...
      </span>
    </div>
  ),
});

export interface ZoomState {
  nodeId: string | null;
  position: [number, number, number] | null;
}

export default function Home() {
  const [zoom, setZoom] = useState<ZoomState>({ nodeId: null, position: null });
  const [exploredCount, setExploredCount] = useState(0);

  const handleZoomIn = useCallback((nodeId: string, position: [number, number, number]) => {
    setZoom({ nodeId, position });
    setExploredCount((c) => c + 1);
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom({ nodeId: null, position: null });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && zoom.nodeId) {
        handleZoomOut();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom.nodeId, handleZoomOut]);

  return (
    <main style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#020408',
      position: 'relative',
    }}>
      <Scene
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      <Navbar
        totalExplored={exploredCount}
        isZoomed={!!zoom.nodeId}
        onZoomOut={handleZoomOut}
      />

      {!zoom.nodeId && (
        <div style={{
          position: 'absolute',
          bottom: '2.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#00f5d4',
          fontSize: '0.7rem',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          opacity: 0.4,
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          Click nodes to explore
        </div>
      )}
    </main>
  );
}
