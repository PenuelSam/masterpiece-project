'use client';

import dynamic from 'next/dynamic';

const CanvasScene = dynamic(() => import('../components/CanvasScene'), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      {/* 3D Canvas */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <CanvasScene />
      </div>

      {/* Scrollable Content */}
      <section
        style={{
          height: '5000vh',
          background: '#111',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 'bold',
        }}
      >
        
      </section>
    </>
  );
}
