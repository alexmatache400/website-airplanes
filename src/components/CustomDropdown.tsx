import React, { useState, useRef, useEffect } from 'react';
import { CategoryIcon } from './CategoryIcon';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
  count?: number;
  group?: string; // Optional group label for optgroup-style sections
}

interface CustomDropdownProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  className?: string;
  placeholder?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  id,
  value,
  onChange,
  options,
  className = '',
  placeholder = '-- Select --'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const navigationSourceRef = useRef<'keyboard' | 'mouse' | null>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption
    ? `${selectedOption.label}${selectedOption.count !== undefined ? ` (${selectedOption.count})` : ''}`
    : placeholder;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Scroll focused item into view (keyboard navigation only)
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current && navigationSourceRef.current === 'keyboard') {
      const focusedElement = listRef.current.children[focusedIndex] as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [focusedIndex, isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Set focused index to current selection when opening
      const currentIndex = options.findIndex(opt => opt.value === value);
      setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  };

  const handleSelect = (optionValue: string) => {
    navigationSourceRef.current = null;
    onChange(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        navigationSourceRef.current = 'keyboard';
        setIsOpen(true);
        const currentIndex = options.findIndex(opt => opt.value === value);
        setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        navigationSourceRef.current = 'keyboard';
        setFocusedIndex(prev =>
          prev < options.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        navigationSourceRef.current = 'keyboard';
        setFocusedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;

      case 'Home':
        e.preventDefault();
        navigationSourceRef.current = 'keyboard';
        setFocusedIndex(0);
        break;

      case 'End':
        e.preventDefault();
        navigationSourceRef.current = 'keyboard';
        setFocusedIndex(options.length - 1);
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          handleSelect(options[focusedIndex].value);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        break;

      case 'Tab':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;

      default:
        break;
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Dropdown Button */}
      <button
        type="button"
        id={id}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="w-full bg-dropdown-bg text-dropdown-text border-2 border-dropdown-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-dropdown-focus-ring focus:border-transparent hover:bg-dropdown-hover-bg transition-colors cursor-pointer text-left flex items-center justify-between"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${id}-label`}
      >
        <span className="flex items-center gap-2">
          {selectedOption?.icon && (
            <CategoryIcon category={selectedOption.icon} className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="truncate">{displayLabel}</span>
        </span>
        {/* Dropdown arrow */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={`flex-shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ stroke: '#cbd5e1' }}
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2 4l4 4 4-4"
          />
        </svg>
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="absolute z-50 w-full mt-2 bg-dropdown-bg border-2 border-dropdown-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgb(148 163 184) transparent'
          }}
        >
          {options.map((option, index) => {
            // Check if we need to render a group header
            const showGroupHeader = option.group && (index === 0 || options[index - 1]?.group !== option.group);

            return (
              <React.Fragment key={option.value}>
                {/* Group Header */}
                {showGroupHeader && (
                  <li
                    className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-800/40 pointer-events-none"
                    role="presentation"
                  >
                    {option.group}
                  </li>
                )}

                {/* Option Item */}
                <li
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => {
                    navigationSourceRef.current = 'mouse';
                    setFocusedIndex(index);
                  }}
                  className={`
                    px-4 py-3 cursor-pointer flex items-center gap-2 transition-colors
                    ${option.value === value
                      ? 'bg-dropdown-focus-ring bg-opacity-20 text-dropdown-text font-medium'
                      : 'text-dropdown-text hover:bg-dropdown-hover-bg'
                    }
                    ${focusedIndex === index
                      ? 'bg-dropdown-hover-bg'
                      : ''
                    }
                  `}
                >
                  {option.icon && (
                    <CategoryIcon category={option.icon} className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="truncate">
                    {option.label}
                    {option.count !== undefined && ` (${option.count})`}
                  </span>
                </li>
              </React.Fragment>
            );
          })}
        </ul>
      )}
    </div>
  );
};
