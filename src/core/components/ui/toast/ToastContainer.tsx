// src/core/components/ui/toast/ToastContainer.tsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { Stagger } from '@/core/motion/core/Stagger';
import { Toast } from './Toast';
import { useToast } from '@/core/hooks/useToast';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast, clearAll } = useToast();
  const location = useLocation();

  useEffect(() => {
    clearAll();
  }, [location.pathname, clearAll]);

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed left-0 right-0 z-[9999] flex justify-center pointer-events-none px-4 pt-2"
      style={{
        top: 'calc(60px + 8px)',
      }}
    >
      <div className="w-full max-w-[480px] flex flex-col gap-1.5">
        <Stagger delay={80}>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              type={toast.type}
              icon={toast.icon}
              title={toast.title}
              message={toast.message}
              onDismiss={dismissToast}
            />
          ))}
        </Stagger>
      </div>
    </div>,
    document.body
  );
};