import { useState, useRef, useCallback, useEffect } from 'react';
import { loadTool } from '@/core/registry/toolRegistry';
import type { Tool } from '@/core/registry/toolRegistry';

interface UseActionOptions {
  toolId: string;
}

interface UseActionReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  dragOffset: number;
  isDragging: boolean;
  filter: { category: string; inputType: string } | undefined;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleMouseLeave: () => void;
}

export const useAction = ({ toolId }: UseActionOptions): UseActionReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef<number | null>(null);
  const currentY = useRef<number | null>(null);
  const velocity = useRef<number>(0);
  const lastMoveTime = useRef<number>(0);

  useEffect(() => {
    if (toolId) {
      loadTool(toolId)
        .then((tool) => {
          if (tool) setCurrentTool(tool);
        })
        .catch(() => {
          setCurrentTool(null);
        });
    }
  }, [toolId]);

  const open = useCallback(() => {
    setIsOpen(true);
    setDragOffset(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setDragOffset(0);
    setIsDragging(false);
    startY.current = null;
    currentY.current = null;
    velocity.current = 0;
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const filter = currentTool
    ? {
        category: currentTool.category,
        inputType: currentTool.input || 'single',
      }
    : undefined;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startY.current = touch.clientY;
    currentY.current = touch.clientY;
    setIsDragging(true);
    lastMoveTime.current = Date.now();
    velocity.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || startY.current === null) return;
    const touch = e.touches[0];
    const deltaY = touch.clientY - startY.current;
    const now = Date.now();
    const timeDelta = now - lastMoveTime.current;
    if (timeDelta > 0) {
      velocity.current = (touch.clientY - (currentY.current || startY.current)) / timeDelta;
    }
    currentY.current = touch.clientY;
    lastMoveTime.current = now;
    if (deltaY > 0) {
      const dampened = deltaY * 0.6;
      setDragOffset(Math.min(dampened, 250));
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    const closeThreshold = 80;
    const velocityThreshold = 0.5;
    if (dragOffset > closeThreshold || velocity.current > velocityThreshold) {
      close();
    } else {
      setDragOffset(0);
    }
    setIsDragging(false);
    startY.current = null;
    currentY.current = null;
    velocity.current = 0;
  }, [dragOffset, close]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    startY.current = e.clientY;
    currentY.current = e.clientY;
    setIsDragging(true);
    lastMoveTime.current = Date.now();
    velocity.current = 0;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || startY.current === null) return;
    const deltaY = e.clientY - startY.current;
    const now = Date.now();
    const timeDelta = now - lastMoveTime.current;
    if (timeDelta > 0) {
      velocity.current = (e.clientY - (currentY.current || startY.current)) / timeDelta;
    }
    currentY.current = e.clientY;
    lastMoveTime.current = now;
    if (deltaY > 0) {
      const dampened = deltaY * 0.6;
      setDragOffset(Math.min(dampened, 250));
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    const closeThreshold = 80;
    const velocityThreshold = 0.5;
    if (dragOffset > closeThreshold || velocity.current > velocityThreshold) {
      close();
    } else {
      setDragOffset(0);
    }
    setIsDragging(false);
    startY.current = null;
    currentY.current = null;
    velocity.current = 0;
  }, [dragOffset, close]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      if (dragOffset > 80) {
        close();
      } else {
        setDragOffset(0);
      }
      setIsDragging(false);
      startY.current = null;
      currentY.current = null;
      velocity.current = 0;
    }
  }, [isDragging, dragOffset, close]);

  useEffect(() => {
    if (!isOpen) {
      setDragOffset(0);
      setIsDragging(false);
    }
  }, [isOpen]);

  return {
    isOpen,
    open,
    close,
    toggle,
    dragOffset,
    isDragging,
    filter,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
};