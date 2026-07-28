// src/core/components/ui/Search.tsx
import { FiSearch } from 'react-icons/fi';
import { Motion } from '@/core/motion/motion';
import { searchMotion } from '@/core/motion/compositions/search';

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  offset?: string;
}

export function Search({
  value,
  onChange,
  placeholder = 'Search tools...',
  offset = 'top-[60px]'
}: SearchProps) {
  return (
    <div className={`sticky ${offset} z-40 py-4`}>
      <div className="flex justify-center">
        <div className="relative w-full max-w-md group">
          <Motion
            preset={searchMotion}
            as="div"
            className={`
              relative w-full
              rounded-full
              overflow-hidden
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              hover:border-gray-300 dark:hover:border-gray-600
              focus-within:border-blue-500
              focus-within:ring-2 focus-within:ring-blue-500/20

              /* 🔥 SPRING TRANSITION - Applied to container */
              transition-all duration-200
            `}
          >
            <FiSearch
              className={`
                absolute left-4 top-1/2 -translate-y-1/2
                w-5 h-5
                text-gray-500 dark:text-gray-400
                transition-colors duration-200
                group-hover:text-blue-500 dark:group-hover:text-blue-400
                group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400
                pointer-events-none
                z-10
              `}
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className={`
                w-full pl-11 pr-4 py-3
                bg-transparent
                text-sm
                text-gray-900 dark:text-white
                placeholder:text-gray-500 dark:placeholder:text-gray-400
                outline-none
                border-none
                focus:ring-0
              `}
            />
          </Motion>
        </div>
      </div>
    </div>
  );
}