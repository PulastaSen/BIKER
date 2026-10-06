import React, { useState, type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'dark' | 'ghost';
  glow?: boolean;
};

export function Button({
  children,
  className = '',
  variant = 'primary',
  glow = false,
  type = 'button',
  onClick,
  ...props
}: ButtonProps) {
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setTimeout(() => setRipple(null), 600);

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={`button button--${variant} ${glow ? 'button--glow' : ''} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {/* Specular button sheen on primary */}
      {variant === 'primary' && <span className="button__sheen" aria-hidden="true" />}
      
      {/* Interactive click ripple */}
      {ripple && (
        <span
          className="button__ripple"
          aria-hidden="true"
          style={{ left: ripple.x, top: ripple.y }}
        />
      )}

      <span className="button__content">{children}</span>
    </button>
  );
}
