import React, { useState, useEffect, useRef } from 'react';
import type { AffiliateProgramRef } from '../lib/DataProvider';

interface AffiliateDropdownProps {
  program: AffiliateProgramRef;
  index: number;
  totalCount: number;
  isOpen: boolean;
  onToggle: () => void;
  links: Record<string, string>;
  onDropdownRef?: (el: HTMLDivElement | null) => void;
  onDropdownMenuRef?: (el: HTMLDivElement | null) => void;
  context?: 'hover' | 'modal' | 'grid';
}

export const AffiliateDropdown: React.FC<AffiliateDropdownProps> = ({
  program,
  index,
  totalCount,
  isOpen,
  onToggle,
  links,
  onDropdownRef,
  onDropdownMenuRef,
  context = 'hover',
}) => {
  // All hooks must be called before any conditional returns
  const [position, setPosition] = useState<'center' | 'left' | 'right' | 'above'>('center');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const localDropdownRef = useRef<HTMLDivElement | null>(null);

  // Calculate values needed for hooks
  const hasLinks = Object.values(links).some(Boolean);
  const visibleLinksCount = Object.values(links).filter(Boolean).length;
  const estimatedDropdownWidth = visibleLinksCount * 88 + 32; // ~88px per button + padding

  // Smart positioning logic - recalculates dropdown position based on viewport and card boundaries
  useEffect(() => {
    if (!isOpen || !buttonRef.current || !localDropdownRef.current) return;

    const button = buttonRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Find closest parent card (.glass)
    const card = localDropdownRef.current.closest('.glass');
    const cardBounds = card?.getBoundingClientRect();

    // Calculate available space
    const spaceBelow = viewport.height - button.bottom;
    const spaceAbove = button.top;

    let horizontalPos: 'center' | 'left' | 'right' = 'center';

    if (context === 'modal' || context === 'grid') {
      // Modal/Grid: align based on button position
      // First button → left-aligned, last button → right-aligned
      horizontalPos = index === 0 ? 'left' : 'right';
    } else {
      // Hover overlay: check if centered dropdown fits within card bounds
      const halfDropdownWidth = estimatedDropdownWidth / 2;
      const buttonCenter = button.left + button.width / 2;

      const leftEdge = buttonCenter - halfDropdownWidth;
      const rightEdge = buttonCenter + halfDropdownWidth;

      if (cardBounds) {
        // Check overflow against card boundaries
        const cardPadding = 16; // Account for card padding
        if (leftEdge < cardBounds.left + cardPadding) {
          horizontalPos = 'left'; // Align to left edge of button
        } else if (rightEdge > cardBounds.right - cardPadding) {
          horizontalPos = 'right'; // Align to right edge of button
        }
      }
    }

    // Determine vertical position (position above if no space below)
    // Force below in modal/grid context, smart positioning in hover context
    const verticalPos = (context === 'modal' || context === 'grid')
      ? 'center' // Always show below buttons in modal/grid
      : (spaceBelow < 150 && spaceAbove > 150 ? 'above' : 'center');

    setPosition(verticalPos === 'above' ? 'above' : horizontalPos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, estimatedDropdownWidth, context, index]);

  // ResizeObserver for live updates on window resize
  useEffect(() => {
    if (!localDropdownRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (isOpen) {
        requestAnimationFrame(() => {});
      }
    });

    resizeObserver.observe(localDropdownRef.current);

    return () => resizeObserver.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Position class mapping
  const positionClasses = {
    center: 'left-1/2 -translate-x-1/2',
    left: 'left-0',
    right: 'right-0',
    above: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
  };

  // Early return if no links available (after all hooks)
  if (!hasLinks) return null;

  return (
    <div
      ref={(el) => {
        localDropdownRef.current = el;
        onDropdownRef?.(el);
      }}
      className="relative"
    >
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault();
          onToggle();
        }}
        className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`${program.label} purchase options`}
      >
        {program.label}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={onDropdownMenuRef}
          className={`absolute ${position === 'above' ? '' : 'top-full mt-2'} ${positionClasses[position]} flex gap-2 z-20 bg-dark-800/95 backdrop-blur-sm p-3 rounded-lg border border-dark-700/50 shadow-xl ${index === 0 ? 'animate-slide-left' : 'animate-slide-right'}`}
          role="menu"
          aria-label={`${program.label} regions`}
        >
          {program.regions.map(region => {
            const url = links[region.key];
            if (!url) return null;
            return (
              <a
                key={region.key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded text-sm font-medium transition-colors whitespace-nowrap"
              >
                {region.flag} {region.key.toUpperCase()}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};
