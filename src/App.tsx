import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { ToolPage } from '@/pages/ToolPage';
import { useEffect, useState } from 'react';
import { useThemeStore } from '@/core/store/themeStore';
import { useFileStore } from '@/core/store/fileStore';

function App() {
  const { theme, setSystemTheme } = useThemeStore();
  const init = useFileStore((state) => state.init);
  const [isReady, setIsReady] = useState(false);

  // --- Theme Initialization ---
  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      setSystemTheme();
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme, setSystemTheme]);

  // --- Storage Initialization ---
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        await init();
      } catch {
        // Silent fail - app will still render
      } finally {
        setIsReady(true);
      }
    };

    initializeStorage();
  }, [init]);

  // --- Show loading screen while storage initializes ---
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:toolId" element={<ToolPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;