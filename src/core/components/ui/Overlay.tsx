// core/motion/components/overlay.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Motion } from '../../motion/motion';
import { zoomIn } from '../../motion/presets/zoomIn';
import { zoomOut } from '../../motion/presets/zoomOut';
import { FiX } from 'react-icons/fi';

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  containerSelector?: string;
}

export function Overlay({
  isOpen,
  onClose,
  children,
  containerSelector = '[data-tool-container]'
}: OverlayProps) {
  const [isExiting, setIsExiting] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [containerRect, setContainerRect] = React.useState<DOMRect | null>(null);

  const updateContainerRect = useCallback(() => {
    const container = document.querySelector(containerSelector) as HTMLElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      setContainerRect(rect);
    } else {
      const fallback = document.querySelector('main') as HTMLElement;
      if (fallback) {
        const rect = fallback.getBoundingClientRect();
        setContainerRect(rect);
      } else {
        setContainerRect(null);
      }
    }
  }, [containerSelector]);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsExiting(false);
      updateContainerRect();

      const handleUpdate = () => updateContainerRect();
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);

      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    } else if (shouldRender) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsExiting(false);
        setContainerRect(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender, updateContainerRect]);

  if (!mounted || !shouldRender) return null;

  const preset = isExiting ? zoomOut : zoomIn;
  const initialStyle = isExiting
    ? { opacity: 1, transform: 'scale(1)' }
    : { opacity: 0, transform: 'scale(0.95)' };

  const overlayStyles: React.CSSProperties = containerRect ? {
    position: 'fixed',
    top: containerRect.top,
    left: containerRect.left,
    width: containerRect.width,
    height: containerRect.height,
    zIndex: 50,
    backgroundColor: '#f9fafb',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: 'inherit',
  } : {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    backgroundColor: '#f9fafb',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const isDark = document.documentElement.classList.contains('dark');
  if (isDark) {
    overlayStyles.backgroundColor = '#030712';
  }

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