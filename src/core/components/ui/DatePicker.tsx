// src/tools/productivity/bulletin-board/DatePicker.tsx
import React, { useState, useRef, useEffect } from 'react';
import { MdCalendarToday, MdChevronLeft, MdChevronRight } from 'react-icons/md';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  align?: 'left' | 'right';
  placement?: 'top' | 'bottom';
  minDate?: string;
}

type ViewMode = 'days' | 'months' | 'years';

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  align = 'right',
  placement = 'bottom',
  minDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('days');
  const [viewYear, setViewYear] = useState(() => {
    const d = value ? new Date(value) : new Date();
    return d.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const d = value ? new Date(value) : new Date();
    return d.getMonth() + 1;
  });
  const wrapperRef = useRef<HTMLDivElement>(null);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = value ? new Date(value) : null;
  const currentYear = currentDate ? currentDate.getFullYear() : null;

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay();

  const handleDayClick = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateStr);
    setIsOpen(false);
    setViewMode('days');
  };

  const handleMonthClick = (monthNum: number) => {
    setViewMonth(monthNum);
    setViewMode('days');
  };

  const handleYearClick = (yearNum: number) => {
    setViewYear(yearNum);
    setViewMode('months');
  };

  const goToPrev = () => {
    if (viewMode === 'days') {
      if (viewMonth === 1) {
        setViewYear(viewYear - 1);
        setViewMonth(12);
      } else {
        setViewMonth(viewMonth - 1);
      }
    } else {
      setViewYear(viewYear - 1);
    }
  };

  const goToNext = () => {
    if (viewMode === 'days') {
      if (viewMonth === 12) {
        setViewYear(viewYear + 1);
        setViewMonth(1);
      } else {
        setViewMonth(viewMonth + 1);
      }
    } else {
      setViewYear(viewYear + 1);
    }
  };

  const togglePicker = () => {
    if (value) {
      const d = new Date(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth() + 1);
    }
    setViewMode('days');
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setViewMode('days');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const years = Array.from({ length: 16 }, (_, i) => viewYear - 7 + i);

  const isDayDisabled = (day: number) => {
    if (!minDate) return false;
    const candidate = new Date(viewYear, viewMonth - 1, day);
    const min = new Date(minDate);
    min.setHours(0, 0, 0, 0);
    return candidate < min;
  };

  const displayText = currentDate
    ? `${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : 'Select date';

  const renderHeader = () => {
    let centerText = '';
    let centerOnClick = () => {};

    if (viewMode === 'days') {
      centerText = monthNames[viewMonth - 1];
      centerOnClick = () => setViewMode('months');
    } else if (viewMode === 'months') {
      centerText = String(viewYear);
      centerOnClick = () => setViewMode('years');
    } else {
      centerText = String(viewYear);
      centerOnClick = () => setViewMode('months');
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={goToPrev}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          type="button"
        >
          <MdChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={centerOnClick}
          className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 min-w-[60px]"
          type="button"
        >
          {centerText}
        </button>
        <button
          onClick={goToNext}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          type="button"
        >
          <MdChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  const renderBody = () => {
    if (viewMode === 'days') {
      return (
        <>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} className="text-xs text-gray-400 font-medium py-1">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <span key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, day) => {
              const dayNum = day + 1;
              const disabled = isDayDisabled(dayNum);
              const isToday = (() => {
                const today = new Date();
                return (
                  today.getFullYear() === viewYear &&
                  today.getMonth() + 1 === viewMonth &&
                  today.getDate() === dayNum
                );
              })();
              const isSelected =
                currentDate &&
                currentDate.getFullYear() === viewYear &&
                currentDate.getMonth() + 1 === viewMonth &&
                currentDate.getDate() === dayNum;
              return (
                <button
                  key={dayNum}
                  onClick={() => !disabled && handleDayClick(dayNum)}
                  disabled={disabled}
                  className={`py-1.5 rounded-full text-sm transition-all duration-150 ${
                    disabled
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      : isSelected
                      ? 'bg-blue-500 text-white shadow-sm'
                      : isToday
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  type="button"
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </>
      );
    }

    if (viewMode === 'months') {
      return (
        <div className="grid grid-cols-4 gap-2">
          {monthNames.map((m, i) => {
            const monthNum = i + 1;
            const isSelected = monthNum === viewMonth && viewYear === (currentDate?.getFullYear() || viewYear);
            return (
              <button
                key={m}
                onClick={() => handleMonthClick(monthNum)}
                className={`py-2.5 px-1 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isSelected
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                type="button"
              >
                {m}
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-4 gap-2">
        {years.map((y) => {
          const isSelected = y === viewYear;
          const isCurrentYear = y === currentYear;
          return (
            <button
              key={y}
              onClick={() => handleYearClick(y)}
              className={`py-2.5 px-1 rounded-lg text-sm font-medium transition-all duration-150 ${
                isSelected
                  ? 'bg-blue-500 text-white shadow-sm'
                  : isCurrentYear
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              type="button"
            >
              {y}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative inline-block w-full" ref={wrapperRef}>
      <div
        onClick={togglePicker}
        className="flex items-center gap-1 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-600 cursor-pointer transition-all select-none w-full"
      >
        <MdCalendarToday className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
          {displayText}
        </span>
      </div>

      {isOpen && (
        <div
          className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl w-[280px] max-w-[90vw] overflow-hidden"
          style={{
            [placement === 'top' ? 'bottom' : 'top']: '100%',
            [placement === 'top' ? 'top' : 'bottom']: 'auto',
            [align === 'left' ? 'left' : 'right']: 0,
            [align === 'left' ? 'right' : 'left']: 'auto',
            minWidth: '260px',
            maxWidth: 'calc(100vw - 32px)',
            marginTop: placement === 'top' ? '0' : '0.5rem',
            marginBottom: placement === 'top' ? '0.5rem' : '0',
          }}
        >
          {renderHeader()}
          <div className="p-3">{renderBody()}</div>
        </div>
      )}
    </div>
  );
};