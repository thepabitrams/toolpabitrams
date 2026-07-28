// core/motion/components/overlay.tsx

import React from 'react';
import { createPortal } from 'react-dom';
import { Motion } from '../motion';
import { zoomIn } from '../presets/zoomIn';
import { zoomOut } from '../presets/zoomOut';
import { FiX } from 'react-icons/fi';

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Overlay({ isOpen, onClose, children }: OverlayProps) {
  const [isExiting, setIsExiting] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
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

  if (!mounted || !shouldRender) return null;

  const preset = isExiting ? zoomOut : zoomIn;
  const initialStyle = isExiting
    ? { opacity: 1, transform: 'scale(1)' }
    : { opacity: 0, transform: 'scale(0.5)' };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <Motion
        preset={preset}
        as="div"
        className="w-full h-full bg-white dark:bg-gray-900 overflow-hidden flex flex-col"
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