// src/tools/houseandhome/tenant-billing/modules/shared/MonthPicker.tsx
import React, { useState, useRef, useEffect } from 'react';
import { MdCalendarToday, MdChevronLeft, MdChevronRight } from 'react-icons/md';

interface MonthPickerProps {
  year: string;
  month: string;
  onMonthChange: (year: string, month: string) => void;
  align?: 'left' | 'right';
  placement?: 'top' | 'bottom'; // 👈 NEW: control dropdown position
}

export const MonthPicker: React.FC<MonthPickerProps> = ({
  year,
  month,
  onMonthChange,
  align = 'right',
  placement = 'bottom', // default: opens below
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parseInt(year));
  const [showYears, setShowYears] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthName = monthNames[parseInt(month) - 1];
  const currentYear = parseInt(year);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowYears(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setViewYear(parseInt(year));
  }, [year]);

  const goToPrevYear = () => setViewYear(viewYear - 1);
  const goToNextYear = () => setViewYear(viewYear + 1);
  const selectMonth = (monthNum: number) => {
    onMonthChange(String(viewYear), String(monthNum).padStart(2, '0'));
    setIsOpen(false);
    setShowYears(false);
  };
  const toggleView = () => setShowYears(!showYears);
  const selectYear = (yearNum: number) => {
    setViewYear(yearNum);
    setShowYears(false);
  };
  const togglePicker = () => {
    setViewYear(parseInt(year));
    setShowYears(false);
    setIsOpen(!isOpen);
  };

  const getYears = () => {
    const years = [];
    const startYear = viewYear - 7;
    for (let i = 0; i < 16; i++) {
      years.push(startYear + i);
    }
    return years;
  };

  const years = getYears();

  return (
    <div className="relative inline-block" ref={wrapperRef}>
      <div
        onClick={togglePicker}
        className="flex items-center gap-1 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-600 cursor-pointer transition-all select-none"
      >
        <MdCalendarToday className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
          {currentMonthName} {year}
        </span>
      </div>

      {isOpen && (
        <div 
          className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl w-[280px] max-w-[90vw] overflow-hidden"
          style={{
            // ─── 🔥 FIX: placement = 'top' opens upward ──────
            [placement === 'top' ? 'bottom' : 'top']: '100%',
            [placement === 'top' ? 'top' : 'bottom']: 'auto',
            // ─── alignment ────────────────────────────────────
            [align === 'left' ? 'left' : 'right']: 0,
            [align === 'left' ? 'right' : 'left']: 'auto',
            minWidth: '260px',
            maxWidth: 'calc(100vw - 32px)',
            marginTop: placement === 'top' ? '0' : '0.5rem',
            marginBottom: placement === 'top' ? '0.5rem' : '0',
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <button onClick={goToPrevYear} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" type="button">
              <MdChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={toggleView} className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 min-w-[60px]" type="button">
              {showYears ? currentMonthName : viewYear}
            </button>
            <button onClick={goToNextYear} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" type="button">
              <MdChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-4 gap-2">
              {showYears ? (
                years.map((y) => {
                  const isSelected = y === viewYear;
                  const isCurrentYear = y === currentYear;
                  return (
                    <button
                      key={y}
                      onClick={() => selectYear(y)}
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
                })
              ) : (
                monthNames.map((m, i) => {
                  const monthNum = i + 1;
                  const isSelected = monthNum === parseInt(month) && viewYear === currentYear;
                  return (
                    <button
                      key={m}
                      onClick={() => selectMonth(monthNum)}
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
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};