import React, { useState, useEffect, useRef } from 'react';
import { MdSearch } from 'react-icons/md';
import { Input } from './Input';

export interface SelectOption {
  value: string;
  label: string;
  searchTerms?: string[];
  [key: string]: any;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
  detectedValue?: string;
  detectedLabel?: string;
  renderOption?: (option: SelectOption) => React.ReactNode;
  renderSelected?: (option: SelectOption) => React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  className = '',
  searchable = false,
  detectedValue,
  detectedLabel = 'Detected',
  renderOption,
  renderSelected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    if (!searchable || !searchTerm.trim()) {
      setFilteredOptions(options);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = options.filter((o) => {
      const labelMatch = o.label.toLowerCase().includes(term);
      const valueMatch = o.value.toLowerCase().includes(term);
      const searchMatch = o.searchTerms?.some((t) => t.toLowerCase().includes(term)) || false;
      return labelMatch || valueMatch || searchMatch;
    });
    setFilteredOptions(filtered);
  }, [searchTerm, options, searchable]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredOptions.length > 0) {
      onChange(filteredOptions[0].value);
      setIsOpen(false);
      setSearchTerm('');
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const toggleOpen = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const defaultRenderOption = (option: SelectOption) => (
    <span className="flex items-center gap-2">
      {option.symbol && <span className="text-base text-gray-500">{option.symbol}</span>}
      <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
    </span>
  );

  const defaultRenderSelected = (option: SelectOption) => (
    <span className="text-gray-900 dark:text-gray-100">{option.label}</span>
  );

  return (
    <div className={`flex-1 relative ${className}`} ref={dropdownRef}>
      {/* Display input - click to open */}
      <div
        className={`w-full cursor-pointer border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 transition ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={toggleOpen}
      >
        <span>
          {selectedOption
            ? (renderSelected ? renderSelected(selectedOption) : defaultRenderSelected(selectedOption))
            : <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>}
        </span>
        <span className="text-gray-400 text-xs">
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-72 overflow-hidden">
          {/* Search input */}
          {searchable && (
            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full"
                prefix={<MdSearch className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
                fullWidth
              />
            </div>
          )}

          {/* Options list */}
          <div className="overflow-y-auto max-h-56">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between text-sm ${
                    option.value === value ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                  }`}
                  onClick={() => handleSelect(option.value)}
                >
                  {renderOption ? renderOption(option) : defaultRenderOption(option)}
                  {option.value === value && (
                    <span className="text-gray-400">✓</span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Detected indicator */}
          {detectedValue && (
            <div className="px-3 py-1.5 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
              <MdSearch className="w-3 h-3 inline mr-1" />
              {detectedLabel}: {options.find(o => o.value === detectedValue)?.label || detectedValue}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Select;