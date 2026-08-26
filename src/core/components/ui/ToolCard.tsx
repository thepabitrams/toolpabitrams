import { memo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToolStore } from '@/core/store/toolStore';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import type { Tool } from '@/core/registry/toolRegistry';
import { Motion } from '@/core/motion/motion';
import { toolCardGridMotion, toolCardListMotion } from '@/core/motion/compositions/toolCardMotion';
import { marqueeSwing } from '@/core/motion/presets/marqueeSwing';
import { injectKeyframes } from '@/core/motion/core/injection';

interface ToolCardProps {
  tool: Tool;
  variant?: 'grid' | 'list';
  onToolSelect?: (toolId: string) => void;
  onToolHover?: (toolId: string) => void;
  isLoading?: boolean;
}

export const ToolCard = memo(function ToolCard({
  tool,
  variant = 'grid',
  onToolSelect,
  onToolHover,
  isLoading,
}: ToolCardProps) {
  const navigate = useNavigate();
  const { favorites, toggleFavorite, incrementUsage } = useToolStore();
  const isFavorite = favorites.includes(tool.id);

  const handleClick = () => {
    incrementUsage(tool.id);
    
    if (onToolSelect) {
      onToolSelect(tool.id);
    } else {
      navigate(`/${tool.id}`);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(tool.id);
  };

  const textRef = useRef<HTMLHeadingElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const injectedRef = useRef(false);
  useEffect(() => {
    if (!injectedRef.current) {
      injectKeyframes(marqueeSwing.name, marqueeSwing.keyframes);
      injectedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (textRef.current) {
      setIsOverflowing(textRef.current.scrollWidth > textRef.current.clientWidth);
    }
  }, [tool.name]);

  if (variant === 'list') {
    return (
      <Motion
        preset={toolCardListMotion}
        as="div"
        className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer select-none transition-opacity ${
          isLoading ? 'opacity-50 cursor-wait' : ''
        }`}
        onClick={handleClick}
        onMouseEnter={() => onToolHover?.(tool.id)}
      >
        <div className="flex-1 min-w-0 overflow-hidden">
          {isOverflowing ? (
            <div
              className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap inline-block"
              style={{
                animation: 'marquee-swing 4s ease-in-out infinite',
              }}
            >
              {tool.name}
            </div>
          ) : (
            <div
              ref={textRef}
              className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap"
            >
              {tool.name}
            </div>
          )}
        </div>
        <button
          onClick={handleFavorite}
          className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
          aria-label="Toggle favorite"
        >
          {isFavorite ? (
            <FaHeart className="text-red-500 w-3.5 h-3.5" />
          ) : (
            <FaRegHeart className="w-3.5 h-3.5" />
          )}
        </button>
      </Motion>
    );
  }

  return (
    <Motion
      preset={toolCardGridMotion}
      as="div"
      className={`
        w-full max-w-[280px] mx-auto 
        cursor-pointer select-none
        bg-white dark:bg-gray-900
        rounded-2xl 
        border border-gray-200/50 dark:border-gray-800/50
        overflow-hidden
        transition-opacity
        ${isLoading ? 'opacity-50 cursor-wait' : ''}
      `}
      onClick={handleClick}
      onMouseEnter={() => onToolHover?.(tool.id)}
    >
      <div className="relative p-6">
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
          aria-label="Toggle favorite"
        >
          {isFavorite ? (
            <FaHeart className="text-red-500 w-4 h-4" />
          ) : (
            <FaRegHeart className="text-gray-400 group-hover:text-red-400 w-4 h-4 transition-colors" />
          )}
        </button>

        <div className="pr-8 overflow-hidden">
          {isOverflowing ? (
            <div
              className="tool-title mb-1 whitespace-nowrap inline-block"
              style={{
                animation: 'marquee-swing 4s ease-in-out infinite',
              }}
            >
              {tool.name}
            </div>
          ) : (
            <h3 ref={textRef} className="tool-title mb-1 whitespace-nowrap">
              {tool.name}
            </h3>
          )}
        </div>

        <p className="tool-description line-clamp-2">
          {tool.description}
        </p>
      </div>
    </Motion>
  );
});

ToolCard.displayName = 'ToolCard';