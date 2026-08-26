import React, { useRef, useCallback, useState } from 'react';

const REST_STYLE = {
  transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1,1,1)',
  filter: 'drop-shadow(0 10px 18px rgba(15, 10, 40, 0))',
};

/**
 * Wraps its children in a card that tilts in 3D toward the cursor, lifts
 * toward the viewer (translateZ), and casts a shadow that leans away from
 * the tilt direction — like a real object catching light from above rather
 * than a flat image just rotating in place. This is what turns "a card with
 * a hover effect" into something that actually reads as 3D depth. Skips
 * itself on touch/coarse-pointer devices, since there's no hover to track.
 */
export default function Tilt3D({ children, className = '', max = 10, scale = 1.02, liftZ = 26 }) {
  const ref = useRef(null);
  const [style, setStyle] = useState(REST_STYLE);
  const canHover = typeof window !== 'undefined' && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;

  const handleMouseMove = useCallback(
    (e) => {
      if (!canHover || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * max * 2;
      const rotateX = (0.5 - py) * max * 2;
      const shadowX = (-rotateY / max) * 14;
      const shadowY = (rotateX / max) * 10 + 14;
      setStyle({
        transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(${liftZ}px) scale3d(${scale}, ${scale}, ${scale})`,
        filter: `drop-shadow(${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px 18px rgba(15, 10, 40, 0.22))`,
      });
    },
    [canHover, max, scale, liftZ],
  );

  const handleMouseLeave = useCallback(() => {
    setStyle(REST_STYLE);
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`[transform-style:preserve-3d] transition-[transform,filter] duration-200 ease-out will-change-transform ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
