// src/core/components/layout/Header.tsx
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IconButton } from '@/core/components/ui/IconButton';
import { ToolHub } from '@/core/components/layout/ToolHub';
import { Container } from '@/core/components/ui/Container';
import { FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import { useThemeStore } from '@/core/store/themeStore';
import { Motion } from '@/core/motion/motion';
import { drawerMotion } from '@/core/motion/compositions/drawer';

interface HeaderProps {
  variant: 'grid' | 'list';
  toolName?: string;
}

export function Header({ variant, toolName = '' }: HeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const { theme, toggle } = useThemeStore();

  // Close drawer on route change
  useEffect(() => {
    if (drawerOpen) setDrawerOpen(false);
  }, [location.pathname]);

  // Close drawer on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!drawerOpen) return;
      const target = e.target as Node;
      const isDrawer = drawerRef.current?.contains(target);
      const isToggle = toggleRef.current?.contains(target);
      if (!isDrawer && !isToggle) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [drawerOpen]);

  const toggleDrawer = () => setDrawerOpen((v) => !v);
  const showDrawer = variant === 'list';
  const title = variant === 'grid' ? 'ToolPabitraMS' : `${toolName} by PabitraMS`;

  return (
    <header className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-950">
      <Container className="py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showDrawer && (
            <div ref={toggleRef}>
              <IconButton
                onClick={toggleDrawer}
                variant="standard"
                size="md"
                ariaLabel="Toggle menu"
                className="p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
              >
                {drawerOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </IconButton>
            </div>
          )}
        </div>

        <Link to="/" className="font-medium text-lg tracking-tight text-gray-800 dark:text-gray-100 hover:opacity-80 transition-opacity">
          {title}
        </Link>

        <IconButton
          onClick={toggle}
          variant="standard"
          size="md"
          ariaLabel="Toggle theme"
          className="p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
        >
          {theme === 'light' ? (
            <FiMoon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <FiSun className="w-5 h-5 text-yellow-400" />
          )}
        </IconButton>
      </Container>

      {/* 🔥 DRAWER — Now powered by Motion! */}
      {showDrawer && (
        <Motion
          preset={drawerMotion}
          as="div"
          ref={drawerRef}
          className={`
            transform transition-all duration-300 ease-[cubic-bezier(0.4,0.0,0.2,1)]
            ${drawerOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
          `}
        >
          <div className="p-4">
            <ToolHub variant="list" />
          </div>
        </Motion>
      )}
    </header>
  );
}