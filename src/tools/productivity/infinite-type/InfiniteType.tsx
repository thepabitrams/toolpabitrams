// src/tools/productivity/infinite-type/InfiniteType.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Motion } from '@/core/motion/motion';
import { Stagger } from '@/core/motion/core/Stagger';
import { zoomIn } from '@/core/motion/presets/zoomIn';
import { MdWarningAmber } from 'react-icons/md';
import { FiCopy } from 'react-icons/fi';
import { useToast } from '@/core/hooks/useToast';
import { useInfiniteType } from './useInfiniteType';
import { Controls } from './Controls';
import { Viewport } from './Viewport';

const RESIZE_THRESHOLD_PX = 20;
const TOOLKIT_URL = 'https://toolpabitrams.pages.dev/';

function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const InfiniteType: React.FC = () => {
  const {
    state,
    pool,
    setPool,
    start,
    stop,
    isRunning,
    typeChar,
    backspace,
    enter,
  } = useInfiniteType();

  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [charWidth, setCharWidth] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [, setTick] = useState(0);
  const initialContainerWidthRef = useRef(0);
  const hasWarnedAboutResizeRef = useRef(false);

  const activeLineIndex = state.lines.length - 1;
  const activeTypedLength = state.lines[activeLineIndex]?.typed.length ?? 0;

  const maxCharsPerLine = useMemo(() => {
    if (containerWidth <= 0 || charWidth <= 0) return 40;
    return Math.max(1, Math.floor(containerWidth / charWidth));
  }, [containerWidth, charWidth]);

  useEffect(() => {
    if (isRunning) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    const intervalId = setInterval(() => setTick((previousTick) => previousTick + 1), 1000);
    return () => clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    if (initialContainerWidthRef.current === 0) return;
    if (Math.abs(containerWidth - initialContainerWidthRef.current) > RESIZE_THRESHOLD_PX) {
      stop();
      if (!hasWarnedAboutResizeRef.current) {
        hasWarnedAboutResizeRef.current = true;
        showToast(
          'warning',
          <MdWarningAmber size={20} />,
          'Screen size changed',
          'Session stopped. Press Start to continue with the new layout.'
        );
      }
    }
  }, [containerWidth, isRunning, stop, showToast]);

  useEffect(() => {
    if (!isRunning) return;
    const inputElement = inputRef.current;
    const containerElement = containerRef.current;
    if (!inputElement || !containerElement) return;
    const activeLineElement = containerElement.lastElementChild as HTMLElement | null;
    if (!activeLineElement) return;

    const animationFrameId = requestAnimationFrame(() => {
      const rect = activeLineElement.getBoundingClientRect();
      inputElement.style.transform = `translate(${rect.left}px, ${Math.max(0, rect.top)}px)`;
    });
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeLineIndex, activeTypedLength, isRunning]);

  const handleStart = () => {
    let measuredContainerWidth = containerWidth;
    let measuredCharWidth = charWidth;

    if (containerRef.current) {
      const measuredWidth = containerRef.current.getBoundingClientRect().width;
      if (measuredWidth > 0) measuredContainerWidth = measuredWidth;
    }
    if (probeRef.current) {
      const measuredWidth = probeRef.current.getBoundingClientRect().width;
      if (measuredWidth > 0) measuredCharWidth = measuredWidth;
    }

    if (measuredContainerWidth > 0 && measuredCharWidth > 0) {
      setContainerWidth(measuredContainerWidth);
      setCharWidth(measuredCharWidth);
    }

    const computedMaxChars =
      measuredContainerWidth > 0 && measuredCharWidth > 0
        ? Math.max(1, Math.floor(measuredContainerWidth / measuredCharWidth))
        : 40;

    initialContainerWidthRef.current = measuredContainerWidth;
    hasWarnedAboutResizeRef.current = false;
    start(computedMaxChars);
    inputRef.current?.focus({ preventScroll: true });
  };

  const elapsedMilliseconds = state.firstKeyAt > 0 ? Date.now() - state.firstKeyAt : 0;
  const elapsedMinutes = elapsedMilliseconds / 60000;
  const charsPerMinute = elapsedMinutes > 0 ? Math.round(state.hits / elapsedMinutes) : 0;
  const accuracy = state.keys === 0 ? 100 : (state.hits / state.keys) * 100;

  const stats = {
    charsPerMinute,
    accuracy: accuracy.toFixed(1),
    keys: state.keys,
    errors: state.misses,
    time: formatTime(elapsedMilliseconds),
  };

  const handleCopy = async () => {
    const payload = [
      `CPM: ${stats.charsPerMinute}`,
      `Acc: ${stats.accuracy}%`,
      `Keys: ${stats.keys}`,
      `Errors: ${stats.errors}`,
      `Time: ${stats.time}`,
      '',
      `Pool: ${pool}`,
      '',
      'InfiniteType By PabitraMS',
      'Generated by toolpabitrams',
      TOOLKIT_URL,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(payload);
      showToast(
        'success',
        <FiCopy size={18} />,
        'Copied',
        'Stats copied to clipboard.'
      );
    } catch {
      showToast(
        'error',
        <MdWarningAmber size={18} />,
        'Copy failed',
        'Could not access clipboard.'
      );
    }
  };

  const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
    if (!isRunning) return;
    const inputElement = event.currentTarget;
    const value = inputElement.value;
    if (value.length > 0) {
      for (let i = 0; i < value.length; i++) {
        typeChar(value[i]);
      }
      inputElement.value = '';
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isRunning) return;

    const key = event.key;
    if (key === 'Escape') {
      stop();
      return;
    }
    if (key === 'Backspace') {
      event.preventDefault();
      backspace();
      return;
    }
    if (key === 'Enter') {
      event.preventDefault();
      enter(maxCharsPerLine);
      return;
    }
  };

  const focusInput = () => {
    if (isRunning) inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div
      className="w-full py-6 px-4 sm:px-6 lg:px-8"
      onClick={focusInput}
    >
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Typing input"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '1px',
          height: '1px',
          opacity: 0,
          border: 'none',
          outline: 'none',
          padding: 0,
          margin: 0,
          fontSize: '16px',
          zIndex: -1,
          pointerEvents: 'none',
        }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      <div className="max-w-4xl mx-auto space-y-4">
        <Stagger delay={100}>
          <Motion
            preset={zoomIn}
            as="div"
            delay={0}
            style={{ opacity: 0, transform: 'scale(0.5)' }}
          >
            <Controls
              pool={pool}
              isRunning={isRunning}
              onPoolChange={setPool}
              onStart={handleStart}
              onStop={stop}
              onCopy={handleCopy}
              stats={stats}
            />
          </Motion>

          <Motion
            preset={zoomIn}
            as="div"
            delay={100}
            style={{ opacity: 0, transform: 'scale(0.5)' }}
          >
            <Viewport
              state={state}
              isRunning={isRunning}
              isFocused={isFocused}
              containerRef={containerRef}
              probeRef={probeRef}
              onContainerWidth={setContainerWidth}
              onCharWidth={setCharWidth}
            />
          </Motion>

          <Motion
            preset={zoomIn}
            as="div"
            delay={200}
            style={{ opacity: 0, transform: 'scale(0.5)' }}
          >
            <div className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
              {isRunning
                ? 'Type. Backspace to fix. Enter at the end for a new line. Escape to stop.'
                : 'Configure above and press Start.'}
            </div>
          </Motion>
        </Stagger>
      </div>
    </div>
  );
};