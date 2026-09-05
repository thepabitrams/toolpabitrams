// src/core/components/layout/Footer.tsx
import { Container } from '@/core/components/ui/Container';
import { FaGithub, FaInstagram } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="py-6 border-t-0 mt-auto bg-transparent">
      <Container>
        <div className="flex flex-col items-center justify-center gap-3">
          <p className="text-center text-sm text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} ToolPabitraMS. Built with ❤️
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/thepabitrams"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200"
              aria-label="GitHub Profile"
            >
              <FaGithub className="w-5 h-5" />
            </a>

            <a
              href="https://www.instagram.com/learnpabitrams"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200"
              aria-label="Instagram Profile"
            >
              <FaInstagram className="w-5 h-5" />
            </a>

            <span className="w-px h-5 bg-gray-300 dark:bg-gray-600" />

            <a
              href="/ATTRIBUTION.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200 underline-offset-2 hover:underline"
            >
              Open Source Licenses
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}