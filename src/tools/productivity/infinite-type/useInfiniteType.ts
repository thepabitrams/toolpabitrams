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
  typeChar: (character: string) => void;
  backspace: () => void;
  enter: (maxChars: number) => void;
}

const DEFAULT_POOL = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

const randomBuffer = new Uint32Array(1);

function randomCharacter(pool: string): string {
  crypto.getRandomValues(randomBuffer);
  return pool[randomBuffer[0] % pool.length] || 'a';
}

function randomString(pool: string, count: number): string {
  let result = '';
  for (let i = 0; i < count; i++) result += randomCharacter(pool);
  return result;
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
    const savedConfig = localStorage.getItem('infinite_type_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
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
    (character: string) => {
      if (!isRunning) return;
      setState((previousState) => {
        const { lines, keys, hits, misses, firstKeyAt } = previousState;
        if (lines.length === 0) return previousState;
        const activeLineIndex = lines.length - 1;
        const activeLine = lines[activeLineIndex];
        if (activeLine.typed.length >= activeLine.target.length) return previousState;
        const expectedCharacter = activeLine.target[activeLine.typed.length];
        const isCorrect = character === expectedCharacter;
        const newLines = [...lines];
        newLines[activeLineIndex] = {
          ...activeLine,
          typed: activeLine.typed + character,
        };
        return {
          ...previousState,
          lines: newLines,
          keys: keys + 1,
          hits: hits + (isCorrect ? 1 : 0),
          misses: misses + (isCorrect ? 0 : 1),
          firstKeyAt: firstKeyAt === 0 ? Date.now() : firstKeyAt,
        };
      });
    },
    [isRunning]
  );

  const backspace = useCallback(() => {
    if (!isRunning) return;
    setState((previousState) => {
      const { lines } = previousState;
      if (lines.length === 0) return previousState;
      const activeLineIndex = lines.length - 1;
      const activeLine = lines[activeLineIndex];
      if (activeLine.typed.length > 0) {
        const newLines = [...lines];
        newLines[activeLineIndex] = {
          ...activeLine,
          typed: activeLine.typed.slice(0, -1),
        };
        return { ...previousState, lines: newLines };
      }
      if (lines.length > 1) {
        return { ...previousState, lines: lines.slice(0, -1) };
      }
      return previousState;
    });
  }, [isRunning]);

  const enter = useCallback(
    (maxChars: number) => {
      if (!isRunning) return;
      const activePool = pool.length > 0 ? pool : DEFAULT_POOL;
      setState((previousState) => {
        const { lines } = previousState;
        if (lines.length === 0) return previousState;
        const activeLineIndex = lines.length - 1;
        const activeLine = lines[activeLineIndex];
        if (activeLine.typed.length < activeLine.target.length) return previousState;
        return { ...previousState, lines: [...lines, createLine(activePool, maxChars)] };
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