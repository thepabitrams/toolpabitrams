// src/tools/productivity/infinite-type/useInfiniteType.ts
import { useState, useCallback, useEffect } from 'react';

export interface Line {
  target: string;
  typed: string;
}

export interface Session {
  lines: Line[];
  keys: number;
  hits: number;
  misses: number;
  firstKeyAt: number;
}

export interface UseInfiniteTypeReturn {
  state: Session;
  pool: string;
  setPool: (pool: string) => void;
  start: (maxChars: number) => void;
  stop: () => void;
  isRunning: boolean;
  typeChar: (char: string) => void;
  backspace: () => void;
  enter: (maxChars: number) => void;
}

const DEFAULT_POOL = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

const randomBuffer = new Uint32Array(1);

function randomChar(pool: string): string {
  crypto.getRandomValues(randomBuffer);
  return pool[randomBuffer[0] % pool.length] || 'a';
}

function randomString(pool: string, count: number): string {
  let s = '';
  for (let i = 0; i < count; i++) s += randomChar(pool);
  return s;
}

function createLine(pool: string, maxChars: number): Line {
  return {
    target: randomString(pool, maxChars),
    typed: '',
  };
}

export function useInfiniteType(): UseInfiniteTypeReturn {
  const [pool, setPool] = useState<string>(DEFAULT_POOL);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [state, setState] = useState<Session>({
    lines: [],
    keys: 0,
    hits: 0,
    misses: 0,
    firstKeyAt: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem('infinite_type_config');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (typeof config.pool === 'string') setPool(config.pool);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('infinite_type_config', JSON.stringify({ pool }));
  }, [pool]);

  const start = useCallback(
    (maxChars: number) => {
      const activePool = pool.length > 0 ? pool : DEFAULT_POOL;
      setState({
        lines: [createLine(activePool, maxChars)],
        keys: 0,
        hits: 0,
        misses: 0,
        firstKeyAt: 0,
      });
      setIsRunning(true);
    },
    [pool]
  );

  const stop = useCallback(() => setIsRunning(false), []);

  const typeChar = useCallback(
    (char: string) => {
      if (!isRunning) return;
      setState((prev) => {
        const { lines, keys, hits, misses, firstKeyAt } = prev;
        if (lines.length === 0) return prev;
        const idx = lines.length - 1;
        const line = lines[idx];
        if (line.typed.length >= line.target.length) return prev;
        const expected = line.target[line.typed.length];
        const correct = char === expected;
        const newLines = [...lines];
        newLines[idx] = {
          ...line,
          typed: line.typed + char,
        };
        return {
          ...prev,
          lines: newLines,
          keys: keys + 1,
          hits: hits + (correct ? 1 : 0),
          misses: misses + (correct ? 0 : 1),
          firstKeyAt: firstKeyAt === 0 ? Date.now() : firstKeyAt,
        };
      });
    },
    [isRunning]
  );

  const backspace = useCallback(() => {
    if (!isRunning) return;
    setState((prev) => {
      const { lines } = prev;
      if (lines.length === 0) return prev;
      const idx = lines.length - 1;
      const line = lines[idx];
      if (line.typed.length > 0) {
        const newLines = [...lines];
        newLines[idx] = {
          ...line,
          typed: line.typed.slice(0, -1),
        };
        return { ...prev, lines: newLines };
      }
      if (lines.length > 1) {
        return { ...prev, lines: lines.slice(0, -1) };
      }
      return prev;
    });
  }, [isRunning]);

  const enter = useCallback(
    (maxChars: number) => {
      if (!isRunning) return;
      const activePool = pool.length > 0 ? pool : DEFAULT_POOL;
      setState((prev) => {
        const { lines } = prev;
        if (lines.length === 0) return prev;
        const idx = lines.length - 1;
        const line = lines[idx];
        if (line.typed.length < line.target.length) return prev;
        return { ...prev, lines: [...lines, createLine(activePool, maxChars)] };
      });
    },
    [isRunning, pool]
  );

  return {
    state,
    pool,
    setPool,
    start,
    stop,
    isRunning,
    typeChar,
    backspace,
    enter,
  };
}