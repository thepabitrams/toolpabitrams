// core/motion/components/overlay.tsx
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Motion } from '../../motion/motion';
import { zoomIn } from '../../motion/presets/zoomIn';
import { zoomOut } from '../../motion/presets/zoomOut';
import { FiX } from 'react-icons/fi';

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Overlay({ isOpen, onClose, children }: OverlayProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsExiting(false);
    } else if (shouldRender) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsExiting(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!mounted || !shouldRender) return null;

  const preset = isExiting ? zoomOut : zoomIn;
  const initialStyle = isExiting
    ? { opacity: 1, transform: 'scale(1)' }
    : { opacity: 0, transform: 'scale(0.95)' };

  const isDark = document.documentElement.classList.contains('dark');
  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    backgroundColor: isDark ? '#030712' : '#f9fafb',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  return createPortal(
    <div style={overlayStyles}>
      <Motion
        preset={preset}
        as="div"
        className="w-full h-full flex flex-col"
        style={initialStyle}
      >
        <div className="flex justify-end p-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-label="Close"
          >
            <FiX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {children}
        </div>
      </Motion>
    </div>,
    document.body
  );
}