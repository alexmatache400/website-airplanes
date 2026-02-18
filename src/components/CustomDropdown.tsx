import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CategoryIcon } from './CategoryIcon';
import { useClickOutside } from '../hooks/useClickOutside';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
  count?: number;
  group?: string; // Optional group label for optgroup-style sections
  isGroupHeader?: boolean; // Mark as non-selectable group header
  isDivider?: boolean; // Mark as visual divider
  disabled?: boolean; // Mark as disabled/non-selectable
}

interface CustomDropdownProps {
  id: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  options: DropdownOption[];
  className?: string;
  placeholder?: string;
  multiSelect?: boolean;
  disabled?: boolean; // Disable the entire dropdown
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  id,
  value,
  onChange,
  options,
  className = '',
  placeholder = '-- Select --',
  multiSelect = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const navigationSourceRef = useRef<'keyboard' | 'mouse' | null>(null);

  // Helper function to get selected values as array
  const getSelectedValues = (): string[] => {
    if (multiSelect) {
      return Array.isArray(value) ? value : [];
    }
    return typeof value === 'string' ? [value] : [];
  };

  // Helper function to check if a value is selected
  const isSelected = (optionValue: string): boolean => {
    if (multiSelect) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  // Helper function to check if all non-"All" categories are selected
  const areAllCategoriesSelected = (): boolean => {
    if (!multiSelect || !Array.isArray(value)) return false;
    const nonAllOptions = options.filter(opt => opt.value !== 'All');
    return nonAllOptions.every(opt => value.includes(opt.value));
  };

  // Display label logic
  const displayLabel = (() => {
    if (multiSelect && Array.isArray(value)) {
      if (value.length === 0) {
        return placeholder;
      }
      if (areAllCategoriesSelected()) {
        return 'All categories';
      }
      return value.length === 1
        ? options.find(opt => opt.value === value[0])?.label || placeholder
        : `${value.length} categories selected`;
    }
    const selectedOption = options.find(opt => opt.value === value);
    return selectedOption
      ? `${selectedOption.label}${selectedOption.count !== undefined ? ` (${selectedOption.count})` : ''}`
      : placeholder;
  })();

  // Handle click outside to close dropdown
  useClickOutside(
    useCallback(() => [dropdownRef.current], []),
    useCallback(() => { setIsOpen(false); setFocusedIndex(-1); }, []),
    isOpen
  );

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
    if (disabled) return; // Don't open if disabled
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Set focused index to current selection when opening, skipping dividers and headers
      const selectableOptions = options.filter(opt => !opt.isDivider && !opt.isGroupHeader && !opt.disabled);
      if (multiSelect) {
        setFocusedIndex(0);
      } else {
        const currentIndex = options.findIndex(opt => opt.value === value);
        setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
      }
    }
  };

  const handleSelect = (optionValue: string) => {
    navigationSourceRef.current = null;

    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];

      // Handle "All" option
      if (optionValue === 'All') {
        // If all categories are selected, deselect all; otherwise select all non-"All" options
        if (areAllCategoriesSelected()) {
          onChange([]);
        } else {
          const allNonAllValues = options.filter(opt => opt.value !== 'All').map(opt => opt.value);
          onChange(allNonAllValues);
        }
      } else {
        // Toggle the selected category
        if (currentValues.includes(optionValue)) {
          onChange(currentValues.filter(v => v !== optionValue));
        } else {
          onChange([...currentValues, optionValue]);
        }
      }
      // Keep dropdown open in multi-select mode
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setFocusedIndex(-1);
    }
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
        disabled={disabled}
        className={`w-full bg-dropdown-bg text-dropdown-text border-2 border-dropdown-border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-dropdown-focus-ring focus:border-transparent hover:bg-dropdown-hover-bg transition-colors text-left flex items-center justify-between ${
          disabled ? 'opacity-50 cursor-not-allowed hover:bg-dropdown-bg' : 'cursor-pointer'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${id}-label`}
        aria-disabled={disabled}
      >
        <span className="flex items-center gap-2">
          {!multiSelect && (() => {
            const selectedOption = options.find(opt => opt.value === value);
            return selectedOption?.icon && (
              <CategoryIcon category={selectedOption.icon} className="w-4 h-4 flex-shrink-0" />
            );
          })()}
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
          className="absolute z-[60] w-full mt-2 bg-dropdown-bg border-2 border-dropdown-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgb(148 163 184) transparent'
          }}
        >
          {options.map((option, index) => {
            // Handle dividers
            if (option.isDivider) {
              return (
                <li
                  key={`divider-${index}`}
                  role="separator"
                  className="border-t border-dark-600 my-2"
                  aria-hidden="true"
                />
              );
            }

            // Handle group headers
            if (option.isGroupHeader) {
              return (
                <li
                  key={`header-${index}`}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-800/40 pointer-events-none"
                  role="presentation"
                  aria-hidden="true"
                >
                  {option.label}
                </li>
              );
            }

            // Check if we need to render a group header (legacy support)
            const showGroupHeader = option.group && (index === 0 || options[index - 1]?.group !== option.group);

            // Check if option is disabled
            const isOptionDisabled = option.disabled || false;

            return (
              <React.Fragment key={option.value}>
                {/* Group Header (legacy) */}
                {showGroupHeader && !option.isGroupHeader && (
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
                  aria-selected={isSelected(option.value)}
                  aria-disabled={isOptionDisabled}
                  onClick={() => !isOptionDisabled && handleSelect(option.value)}
                  onMouseEnter={() => {
                    if (!isOptionDisabled) {
                      navigationSourceRef.current = 'mouse';
                      setFocusedIndex(index);
                    }
                  }}
                  className={`
                    px-4 py-3 flex items-center gap-2 transition-colors
                    ${isOptionDisabled
                      ? 'cursor-not-allowed opacity-50 pointer-events-none'
                      : 'cursor-pointer'
                    }
                    ${!isOptionDisabled && isSelected(option.value)
                      ? 'bg-dropdown-focus-ring bg-opacity-20 text-dropdown-text font-medium'
                      : !isOptionDisabled ? 'text-dropdown-text hover:bg-dropdown-hover-bg' : 'text-dropdown-text'
                    }
                    ${!isOptionDisabled && focusedIndex === index
                      ? 'bg-dropdown-hover-bg'
                      : ''
                    }
                  `}
                >
                  {/* Checkbox for multi-select */}
                  {multiSelect && (
                    <div className="flex-shrink-0">
                      <div className={`w-4 h-4 border-2 rounded ${
                        option.value === 'All'
                          ? (areAllCategoriesSelected() ? 'bg-blue-500 border-blue-500' : 'border-slate-400')
                          : (isSelected(option.value) ? 'bg-blue-500 border-blue-500' : 'border-slate-400')
                      } flex items-center justify-center`}>
                        {((option.value === 'All' && areAllCategoriesSelected()) || (option.value !== 'All' && isSelected(option.value))) && (
                          <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                    </div>
                  )}
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
