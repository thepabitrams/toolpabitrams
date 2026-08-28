// src/core/components/ui/toast/Toast.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ToastType } from '@/core/hooks/useToast';
import { toastMotion } from '@/core/motion/compositions/toastMotion';

interface ToastProps {
  id: number;
  type: ToastType;
  icon: React.ReactNode;
  title: string;
  message: string;
  onDismiss: (id: number) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  icon,
  title,
  message,
  onDismiss,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    void element.offsetWidth;
    element.classList.add('visible');
  }, []);

  const dismiss = useCallback((immediate = false) => {
    if (isExiting) return;
    setIsExiting(true);
    if (immediate) {
      onDismiss(id);
      return;
    }
    const element = elementRef.current;
    if (element) {
      element.classList.remove('visible');
      element.classList.add('hiding');
    }
    setTimeout(() => {
      onDismiss(id);
    }, 350);
  }, [isExiting, onDismiss, id]);

  useEffect(() => {
    if (isExiting) return;
    const element = elementRef.current;
    if (!element) return;

    let startX = 0, startY = 0, currentX = 0, currentY = 0;
    let isSwiping = false, direction: 'horizontal' | 'vertical' | null = null;
    let isDragging = false;

    const onStart = (e: TouchEvent | MouseEvent) => {
      const touch = 'touches' in e ? e.touches[0] : e;
      startX = touch.clientX;
      startY = touch.clientY;
      currentX = 0; currentY = 0;
      isSwiping = false;
      direction = null;
      isDragging = true;
      element.style.transition = 'none';
    };

    const onMove = (e: TouchEvent | MouseEvent) => {
      if (!isDragging) return;
      const touch = 'touches' in e ? e.touches[0] : e;
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      if (!isSwiping) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        if (absX > 10 || absY > 10) {
          isSwiping = true;
          direction = absX > absY ? 'horizontal' : 'vertical';
        }
        return;
      }

      e.preventDefault();

      if (direction === 'horizontal') {
        currentX = deltaX;
        const progress = Math.min(Math.abs(deltaX) / 200, 1);
        element.style.transform = `translateX(${deltaX}px) scale(${0.92 + (1 - progress) * 0.08})`;
        element.style.opacity = String(1 - progress * 0.5);
      } else if (direction === 'vertical' && deltaY < 0) {
        currentY = deltaY;
        const progress = Math.min(Math.abs(deltaY) / 150, 1);
        element.style.transform = `translateY(${deltaY}px) scale(${1 - progress * 0.08})`;
        element.style.opacity = String(1 - progress * 0.5);
      }
    };

    const onEnd = () => {
      isDragging = false;
      if (!isSwiping) {
        element.style.transition = '';
        return;
      }

      const threshold = 100;

      if (direction === 'horizontal') {
        if (Math.abs(currentX) > threshold) {
          dismiss(true);
        } else {
          element.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
          element.style.transform = 'translateX(0) scale(1)';
          element.style.opacity = '1';
          setTimeout(() => {
            element.style.transition = '';
            element.style.transform = '';
            element.style.opacity = '';
          }, 350);
        }
      } else if (direction === 'vertical') {
        if (currentY < -70) {
          dismiss(true);
        } else {
          element.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
          element.style.transform = 'translateY(0) scale(1)';
          element.style.opacity = '1';
          setTimeout(() => {
            element.style.transition = '';
            element.style.transform = '';
            element.style.opacity = '';
          }, 350);
        }
      }

      isSwiping = false;
      direction = null;
    };

    element.addEventListener('touchstart', onStart, { passive: true });
    element.addEventListener('touchmove', onMove, { passive: false });
    element.addEventListener('touchend', onEnd, { passive: true });
    element.addEventListener('touchcancel', onEnd, { passive: true });

    let mouseDown = false;
    const onMouseDown = (e: MouseEvent) => {
      mouseDown = true;
      onStart(e);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!mouseDown) return;
      onMove(e);
    };
    const onMouseUp = () => {
      if (!mouseDown) return;
      mouseDown = false;
      onEnd();
    };

    element.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    element.addEventListener('contextmenu', (e) => e.preventDefault());

    return () => {
      element.removeEventListener('touchstart', onStart);
      element.removeEventListener('touchmove', onMove);
      element.removeEventListener('touchend', onEnd);
      element.removeEventListener('touchcancel', onEnd);
      element.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      element.removeEventListener('contextmenu', () => {});
    };
  }, [dismiss, isExiting]);

  const motionClasses = toastMotion().className;

  return (
    <div
      ref={elementRef}
      className={`
        ${motionClasses} ${type}
        bg-white dark:bg-gray-800 rounded-xl
        border border-gray-100 dark:border-gray-700
        flex items-start gap-3 px-4 py-3.5
        select-none cursor-grab active:cursor-grabbing
        backdrop-blur-sm touch-none
        pointer-events-auto
        ${isExiting ? 'hiding' : ''}
      `}
    >
      <div className="toast-icon">{icon}</div>

      <div className="flex-1 min-w-0">
        <div className="toast-title">{title}</div>
        <div className="toast-message">{message}</div>
        <span className="toast-time">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <span className="toast-swipe-hint">↕</span>
    </div>
  );
};