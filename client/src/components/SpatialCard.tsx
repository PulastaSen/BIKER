import React, { useRef, useState, useCallback, type ReactNode } from 'react';

interface SpatialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  maxTilt?: number; // max tilt rotation in degrees (e.g. 10)
  perspective?: number; // CSS perspective distance in px (default 1000)
  glare?: boolean; // whether to show specular light glare
  scale?: number; // hover scale (default 1.02)
  style?: React.CSSProperties;
}

/**
 * SpatialCard provides a silky, 60fps 3D antigravity tilt interaction
 * grounded in 3D CSS transforms and glassmorphism specular lighting.
 * Automatically respects `prefers-reduced-motion`.
 */
export function SpatialCard({
  children,
  className = '',
  maxTilt = 8,
  perspective = 1000,
  glare = true,
  scale = 1.02,
  style = {},
  ...props
}: SpatialCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Check for prefers-reduced-motion
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt angles: inverted Y for natural tilt
      const rotateX = -((y - centerY) / centerY) * maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      setTransform(
        `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`
      );

      if (glare) {
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        setGlareStyle({
          opacity: 0.35,
          background: `radial-gradient(circle 280px at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.4), transparent 70%)`,
        });
      }
    },
    [glare, maxTilt, perspective, scale]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTransform(`perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);
    setGlareStyle({ opacity: 0, transition: 'opacity 350ms ease' });
  }, [perspective]);

  return (
    <div
      ref={cardRef}
      className={`spatial-card-root ${isHovered ? 'spatial-card--active' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transformStyle: 'preserve-3d',
        transition: isHovered ? 'transform 100ms ease-out' : 'transform 450ms cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
        position: 'relative',
        ...style,
      }}
      {...props}
    >
      {/* Specular Glare Layer */}
      {glare && (
        <div
          className="spatial-card-glare"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 10,
            transition: isHovered ? 'none' : 'opacity 350ms ease',
            ...glareStyle,
          }}
        />
      )}

      {/* Main Content with 3D Z-Depth Preservation */}
      <div className="spatial-card-content" style={{ transformStyle: 'preserve-3d', height: '100%', width: '100%' }}>
        {children}
      </div>
    </div>
  );
}
