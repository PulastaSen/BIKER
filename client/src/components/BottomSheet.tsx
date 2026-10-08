import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: string;
  showCloseButton?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = '90vh',
  showCloseButton = true,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Trap Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Sheet / Dialog Container */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 400) {
                onClose();
              }
            }}
            style={{ maxHeight }}
            className="relative w-full md:max-w-xl bg-[#111111] border-t md:border border-white/15 rounded-t-[32px] md:rounded-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] z-10 flex flex-col overflow-hidden"
          >
            {/* Visual Drag Handle for mobile touch */}
            <div className="pt-3 pb-1 flex justify-center md:hidden cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 rounded-full bg-white/25 hover:bg-white/40 transition-colors" />
            </div>

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
                <div>
                  {title && <h2 className="text-lg md:text-xl font-black text-white">{title}</h2>}
                  {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
                </div>
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 -mr-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Close dialog"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto overscroll-contain flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
