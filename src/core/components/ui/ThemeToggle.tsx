import { useThemeStore } from '@/core/store/themeStore';
import { FiSun, FiMoon } from 'react-icons/fi';

export function ThemeToggle() {
  const { theme, toggle } = useThemeStore();
  return (
    <button
      onClick={toggle}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-300"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <FiMoon className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <FiSun className="w-5 h-5 text-yellow-400" />}
    </button>
  );
}