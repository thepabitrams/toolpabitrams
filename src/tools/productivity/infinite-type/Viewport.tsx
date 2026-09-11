// src/tools/productivity/infinite-type/Viewport.tsx
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import type { Session, Line } from './useInfiniteType';

const DEFAULT_VIEWPORT_HEIGHT     = 400;
const MIN_VIEWPORT_HEIGHT         = 180;
const VIEWPORT_BOTTOM_MARGIN      = 16;
const ACTIVE_LINE_TOP_OFFSET_RATIO = 0.25;
const SCROLL_TRIGGER_TOP_RATIO     = 0.10;
const SCROLL_TRIGGER_BOTTOM_RATIO  = 0.35;
const PROGRAMMATIC_SCROLL_LOCK_MS  = 600;
const USER_SCROLL_COOLDOWN_MS      = 1200;
const HEIGHT_SETTLE_MS             = 300;
const FOCUS_SNAP_DELAY_MS          = 100;

interface ViewportProps {
  state: Session;
  isRunning: boolean;
  isFocused: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  probeRef: React.RefObject<HTMLSpanElement>;
  onContainerWidth: (width: number) => void;
  onCharWidth: (width: number) => void;
}

export const Viewport: React.FC<ViewportProps> = React.memo(({
  state,
  isRunning,
  isFocused,
  containerRef,
  probeRef,
  onContainerWidth,
  onCharWidth,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const userScrollingRef = useRef(false);
  const userScrollTimeoutRef = useRef<number | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const [viewportHeight, setViewportHeight] = useState<number>(DEFAULT_VIEWPORT_HEIGHT);
  const { lines } = state;

  const activeTypedLen = lines.length > 0 ? lines[lines.length - 1].typed.length : 0;

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        onContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef, onContainerWidth]);

  useEffect(() => {
    if (!probeRef.current) return;
    const measureProbe = () => {
      if (!probeRef.current) return;
      const width = probeRef.current.getBoundingClientRect().width;
      if (width > 0) onCharWidth(width);
    };
    measureProbe();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measureProbe);
    }
  }, [probeRef, onCharWidth]);

  useEffect(() => {
    const vv = window.visualViewport;

    const updateHeight = () => {
      const el = viewportRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();

      let available: number;
      if (vv) {
        const visibleBottom = vv.offsetTop + vv.height;
        available = visibleBottom - rect.top - VIEWPORT_BOTTOM_MARGIN;
      } else {
        available = window.innerHeight - rect.top - VIEWPORT_BOTTOM_MARGIN;
      }

      const clamped = Math.max(
        MIN_VIEWPORT_HEIGHT,
        Math.min(DEFAULT_VIEWPORT_HEIGHT, available)
      );

      setViewportHeight((prev) => (Math.abs(prev - clamped) > 1 ? clamped : prev));
    };

    updateHeight();

    if (vv) {
      vv.addEventListener('resize', updateHeight);
      vv.addEventListener('scroll', updateHeight);
    }
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);
    document.addEventListener('focusin', updateHeight);
    document.addEventListener('focusout', updateHeight);

    return () => {
      if (vv) {
        vv.removeEventListener('resize', updateHeight);
        vv.removeEventListener('scroll', updateHeight);
      }
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
      document.removeEventListener('focusin', updateHeight);
      document.removeEventListener('focusout', updateHeight);
    };
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const markUserScrolling = () => {
      userScrollingRef.current = true;
      if (userScrollTimeoutRef.current) {
        window.clearTimeout(userScrollTimeoutRef.current);
      }
      userScrollTimeoutRef.current = window.setTimeout(() => {
        userScrollingRef.current = false;
      }, USER_SCROLL_COOLDOWN_MS);
    };

    const onTouchStart = () => markUserScrolling();
    const onWheel = () => markUserScrolling();

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('wheel', onWheel);
      if (userScrollTimeoutRef.current) {
        window.clearTimeout(userScrollTimeoutRef.current);
      }
    };
  }, []);

  const handleScroll = () => {
    if (isProgrammaticScrollRef.current) return;

    userScrollingRef.current = true;
    if (userScrollTimeoutRef.current) {
      window.clearTimeout(userScrollTimeoutRef.current);
    }
    userScrollTimeoutRef.current = window.setTimeout(() => {
      userScrollingRef.current = false;
    }, USER_SCROLL_COOLDOWN_MS);
  };

  const scrollActiveLineIntoView = (behavior: ScrollBehavior) => {
    const vp = viewportRef.current;
    const line = activeLineRef.current;
    if (!vp || !line) return;

    const lineTop = line.offsetTop;
    const offsetPx = vp.clientHeight * ACTIVE_LINE_TOP_OFFSET_RATIO;
    const targetScrollTop = lineTop - offsetPx;

    isProgrammaticScrollRef.current = true;
    vp.scrollTo({ top: Math.max(0, targetScrollTop), behavior });

    window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, PROGRAMMATIC_SCROLL_LOCK_MS);
  };

  useLayoutEffect(() => {
    if (!isRunning) return;
    if (userScrollingRef.current) return;

    const vp = viewportRef.current;
    const line = activeLineRef.current;
    if (!vp || !line) return;

    const lineTop = line.offsetTop;
    const lineBottom = lineTop + line.offsetHeight;
    const vpTop = vp.scrollTop;

    const triggerTop = vpTop + vp.clientHeight * SCROLL_TRIGGER_TOP_RATIO;
    const triggerBottom = vpTop + vp.clientHeight * SCROLL_TRIGGER_BOTTOM_RATIO;

    if (lineTop < triggerTop || lineBottom > triggerBottom) {
      scrollActiveLineIntoView('smooth');
    }
  }, [lines.length, activeTypedLen, isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    if (userScrollingRef.current) return;

    const timeout = window.setTimeout(() => {
      if (userScrollingRef.current) return;
      scrollActiveLineIntoView('auto');
    }, HEIGHT_SETTLE_MS);

    return () => window.clearTimeout(timeout);
  }, [viewportHeight, isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    if (!isFocused) return;
    if (userScrollingRef.current) return;

    const timeout = window.setTimeout(() => {
      if (userScrollingRef.current) return;
      scrollActiveLineIntoView('auto');
    }, FOCUS_SNAP_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [isFocused, isRunning, viewportHeight]);

  const cursorClass = isFocused ? 'cursor-blink' : 'cursor-hidden';
  const endCursorClass = isFocused ? 'cursor-bar' : 'cursor-bar-hidden';

  const renderLine = (line: Line, isActive: boolean) => {
    return (
      <div
        className="w-full"
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
      >
        {line.target.split('').map((char, i) => {
          const typedChar = line.typed[i] || '';
          const isTyped = i < line.typed.length;
          const isError = isTyped && (typedChar !== char);
          const isCursorHere = isActive && i === line.typed.length;

          let cls = 'text-gray-300 dark:text-gray-700';
          if (isTyped) {
            cls = isError ? 'text-red-500' : 'text-gray-900 dark:text-gray-100';
          }
          if (isCursorHere) cls += ' ' + cursorClass;

          const display = char === ' ' ? '\u00A0' : char;
          return (
            <span key={i} className={cls}>
              {display}
            </span>
          );
        })}
        {isActive && line.typed.length >= line.target.length && line.target.length > 0 && (
          <span className={endCursorClass} />
        )}
      </div>
    );
  };

  return (
    <Container className="px-0 py-0 max-w-full">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes cursorBlinkShadow {
              0%, 49% { box-shadow: -2px 0 0 rgb(59 130 246); }
              50%, 100% { box-shadow: -2px 0 0 transparent; }
            }
            .cursor-blink {
              box-shadow: -2px 0 0 rgb(59 130 246);
              animation: cursorBlinkShadow 1s step-end infinite;
            }
            .cursor-hidden {
              box-shadow: none;
            }
            @keyframes cursorBlinkBar {
              0%, 49% { opacity: 1; }
              50%, 100% { opacity: 0; }
            }
            .cursor-bar {
              display: inline-block;
              position: relative;
              width: 0;
              height: 1em;
              vertical-align: text-bottom;
            }
            .cursor-bar::after {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              width: 2px;
              height: 100%;
              background-color: rgb(59 130 246);
              animation: cursorBlinkBar 1s step-end infinite;
            }
            .cursor-bar-hidden {
              display: none;
            }
          `,
        }}
      />
      <Card className="overflow-hidden p-0 min-h-[180px]">
        <div
          ref={viewportRef}
          onScroll={handleScroll}
          className="relative px-6 py-4 overflow-y-auto font-mono text-lg leading-[46px]"
          style={{
            height: `${viewportHeight}px`,
            touchAction: 'pan-y',
            overscrollBehavior: 'auto',
            transition: 'height 200ms ease-out',
          }}
        >
          <span
            ref={probeRef}
            aria-hidden="true"
            className="absolute invisible pointer-events-none top-0 left-0"
            style={{ whiteSpace: 'pre' }}
          >
            M
          </span>
          <div ref={containerRef} className="flex flex-col w-full gap-1">
            {lines.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
                Press Start to begin typing
              </div>
            ) : (
              lines.map((line, i) => {
                const isActive = i === lines.length - 1;
                const isCompleted = i < lines.length - 1;
                const opacity = isCompleted ? 'opacity-50' : 'opacity-100';
                return (
                  <div
                    key={i}
                    ref={isActive ? activeLineRef : undefined}
                    className={`w-full ${opacity}`}
                  >
                    {renderLine(line, isActive)}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Card>
    </Container>
  );
});

Viewport.displayName = 'Viewport';