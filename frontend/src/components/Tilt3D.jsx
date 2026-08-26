import React, { useRef, useCallback, useState } from 'react';

/**
 * Wraps its children in a card that tilts in 3D toward the cursor —
 * the actual "3D" effect (as opposed to just a drop shadow). Skips itself
 * on touch/coarse-pointer devices, since there's no hover to track there.
 */
export default function Tilt3D({ children, className = '', max = 10, scale = 1.02 }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({ transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)' });
  const canHover = typeof window !== 'undefined' && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;

  const handleMouseMove = useCallback(
    (e) => {
      if (!canHover || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * max * 2;
      const rotateX = (0.5 - py) * max * 2;
      setStyle({
        transform: `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`,
      });
    },
    [canHover, max, scale],
  );

  const handleMouseLeave = useCallback(() => {
    setStyle({ transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)' });
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`[transform-style:preserve-3d] transition-transform duration-200 ease-out will-change-transform ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
