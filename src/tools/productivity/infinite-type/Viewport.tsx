// src/tools/productivity/infinite-type/Viewport.tsx
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { Card } from '@/core/components/ui/Card';
import { Container } from '@/core/components/ui/Container';
import type { Session, Line } from './useInfiniteType';

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
  const userScrollUntilRef = useRef<number>(0);
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

  useLayoutEffect(() => {
    if (!isRunning) return;
    const vp = viewportRef.current;
    const line = activeLineRef.current;
    if (!vp || !line) return;

    if (Date.now() < userScrollUntilRef.current) return;

    const lineTop = line.offsetTop;
    const lineBottom = lineTop + line.offsetHeight;
    const vpTop = vp.scrollTop;
    const vpBottom = vpTop + vp.clientHeight;

    const comfortTop = vpTop + vp.clientHeight * 0.15;
    const comfortBottom = vpTop + vp.clientHeight * 0.85;

    if (lineTop < comfortTop || lineBottom > comfortBottom) {
      const target = lineTop + line.offsetHeight / 2 - vp.clientHeight / 2;
      vp.scrollTo({ top: target, behavior: 'smooth' });
    }
  }, [lines.length, activeTypedLen, isRunning]);

  const handleScroll = () => {
    userScrollUntilRef.current = Date.now() + 1000;
  };

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
      <Card className="overflow-hidden p-0 min-h-[400px]">
        <div
          ref={viewportRef}
          onScroll={handleScroll}
          className="relative px-6 py-4 overflow-y-auto h-[400px] font-mono text-lg leading-[46px]"
          style={{
            touchAction: 'pan-y',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
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
              <div className="flex items-center justify-center h-[360px] text-gray-400 dark:text-gray-500 text-sm">
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