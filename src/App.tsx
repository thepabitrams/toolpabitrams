import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { ToolPage } from '@/pages/ToolPage';
import { useEffect, useState } from 'react';
import { useThemeStore } from '@/core/store/themeStore';
import { useFileStore } from '@/core/store/fileStore';
import { ToastContainer } from '@/core/components/ui/toast';
import { useToast } from '@/core/hooks/useToast';

function RouteChangeListener({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { clearAll } = useToast();

  useEffect(() => {
    clearAll();
  }, [location.pathname, clearAll]);

  return <>{children}</>;
}

function App() {
  const { theme, setSystemTheme } = useThemeStore();
  const init = useFileStore((state) => state.init);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      setSystemTheme();
    } else {
      const isDark = theme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      document.body.classList.toggle('dark', isDark);
    }
  }, [theme, setSystemTheme]);

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        await init();
      } catch {
      } finally {
        setIsReady(true);
      }
    };
    initializeStorage();
  }, [init]);

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
      <RouteChangeListener>
        <Routes>
          {/* Router paths */}
          <Route path="/" element={<HomePage />} />
          <Route path="/:toolId" element={<ToolPage />} />
        </Routes>
        <ToastContainer />
      </RouteChangeListener>
    </BrowserRouter>
  );
}

export default App;