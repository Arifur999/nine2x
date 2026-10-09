'use client';
import { useEffect, useState } from 'react';

export default function ProgressBar() {
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Expose progress control globally
    (window as any).__pfProgress = {
      start: () => {
        setVisible(true);
        setWidth(30);
        setTimeout(() => setWidth(72), 220);
      },
      done: () => {
        setWidth(100);
        setTimeout(() => {
          setVisible(false);
          setTimeout(() => setWidth(0), 320);
        }, 320);
      },
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: 3,
        zIndex: 99999, pointerEvents: 'none',
        opacity: visible ? 1 : 0, transition: 'opacity 0.25s',
      }}
    >
      <div
        style={{
          height: '100%', width: `${width}%`,
          background: 'linear-gradient(90deg, #E50914, #ff6b6b, #00D4FF)',
          boxShadow: '0 0 12px #E50914',
          transition: 'width 0.25s ease-out',
          borderRadius: '0 999px 999px 0',
        }}
      />
    </div>
  );
}
