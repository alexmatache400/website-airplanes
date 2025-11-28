import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  imageUrl: string;
  imageAlt: string;
}

const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  onClose,
  onBack,
  imageUrl,
  imageAlt,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const lightboxRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wheelListenerRef = useRef<((e: WheelEvent) => void) | null>(null);

  const MIN_SCALE = 1;
  const MAX_SCALE = 5;
  const SCALE_STEP = 0.5;
  const PAN_STEP = 50; // pixels for keyboard pan

  // Reset state when lightbox opens
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isOpen]);

  // Zoom functions
  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + SCALE_STEP, MAX_SCALE));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => {
      const newScale = Math.max(prev - SCALE_STEP, MIN_SCALE);
      // Reset position if zooming back to 1x
      if (newScale === MIN_SCALE) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setScale(MIN_SCALE);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Handle mouse wheel zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!isOpen) return;
      e.preventDefault();

      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    },
    [isOpen, zoomIn, zoomOut]
  );

  // Handle mouse drag for panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (scale > MIN_SCALE) {
        setIsDragging(true);
        setDragStart({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        });
      }
    },
    [scale, position]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && scale > MIN_SCALE) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, scale, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard controls
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
        case 'ArrowLeft':
          if (scale > MIN_SCALE) {
            e.preventDefault();
            setPosition((prev) => ({ ...prev, x: prev.x + PAN_STEP }));
          }
          break;
        case 'ArrowRight':
          if (scale > MIN_SCALE) {
            e.preventDefault();
            setPosition((prev) => ({ ...prev, x: prev.x - PAN_STEP }));
          }
          break;
        case 'ArrowUp':
          if (scale > MIN_SCALE) {
            e.preventDefault();
            setPosition((prev) => ({ ...prev, y: prev.y + PAN_STEP }));
          }
          break;
        case 'ArrowDown':
          if (scale > MIN_SCALE) {
            e.preventDefault();
            setPosition((prev) => ({ ...prev, y: prev.y - PAN_STEP }));
          }
          break;
      }
    },
    [isOpen, onClose, scale, zoomIn, zoomOut, resetZoom]
  );

  // Focus trap
  const handleTab = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !lightboxRef.current) return;

    const focusableElements = lightboxRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, []);

  // Effect for event listeners
  useEffect(() => {
    if (!isOpen) return;

    // Store previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Note: We don't lock body scroll here because the lightbox is always
    // opened from within the modal, which already has scroll lock active.
    // Managing scroll lock here would conflict with the modal's scroll management.

    // Store the current handleWheel for cleanup
    const currentWheelHandler = handleWheel;
    wheelListenerRef.current = currentWheelHandler;

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleTab);
    document.addEventListener('wheel', currentWheelHandler, { passive: false });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Focus close button
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    return () => {
      // Remove event listeners with the captured function references
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleTab);
      document.removeEventListener('wheel', currentWheelHandler);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // Clear the ref
      wheelListenerRef.current = null;

      // Return focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, handleKeyDown, handleTab, handleWheel, handleMouseMove, handleMouseUp]);

  // Safety cleanup: Force remove any lingering wheel listeners on unmount
  useEffect(() => {
    return () => {
      // Try to remove with both the ref and a direct removal attempt
      if (wheelListenerRef.current) {
        document.removeEventListener('wheel', wheelListenerRef.current);
        wheelListenerRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  const scalePercentage = Math.round(scale * 100);

  const lightboxContent = (
    <div
      ref={lightboxRef}
      className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      {/* Control Buttons - Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          {/* Back Button */}
          {onBack && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBack();
              }}
              className="p-2 rounded-lg bg-dark-800/80 hover:bg-dark-700 text-dark-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              aria-label="Go back"
              title="Go back"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-2 rounded-lg bg-dark-800/80 hover:bg-dark-700 text-dark-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          aria-label="Close lightbox"
          title="Close (ESC)"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Image Container */}
      <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div
          className="relative w-[92vw] h-[92vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full h-full bg-dark-900/40 rounded-xl border border-dark-700/50 shadow-2xl backdrop-blur-sm overflow-hidden">
            <img
              ref={imageRef}
              src={imageUrl}
              alt={imageAlt}
              className={`w-full h-full object-contain transition-transform duration-200 ${
                scale > MIN_SCALE ? 'cursor-move' : 'cursor-zoom-in'
              }`}
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${
                  position.y / scale
                }px)`,
              }}
              onMouseDown={handleMouseDown}
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* Zoom Controls - Bottom Right */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 bg-dark-800/90 backdrop-blur-sm rounded-lg p-2 border border-dark-700">
        {/* Zoom In */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            zoomIn();
          }}
          disabled={scale >= MAX_SCALE}
          className="p-2 rounded-md bg-dark-700 hover:bg-dark-600 text-dark-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          aria-label="Zoom in"
          title="Zoom in (+)"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
          </svg>
        </button>

        {/* Zoom Level */}
        <div className="px-2 py-1 text-xs font-medium text-dark-200 text-center">
          {scalePercentage}%
        </div>

        {/* Zoom Out */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            zoomOut();
          }}
          disabled={scale <= MIN_SCALE}
          className="p-2 rounded-md bg-dark-700 hover:bg-dark-600 text-dark-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          aria-label="Zoom out"
          title="Zoom out (-)"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
            />
          </svg>
        </button>

        {/* Reset */}
        {scale !== MIN_SCALE && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              resetZoom();
            }}
            className="p-2 rounded-md bg-accent-600 hover:bg-accent-500 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            aria-label="Reset zoom"
            title="Reset zoom (0)"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Instructions - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10 bg-dark-800/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-dark-700">
        <div className="text-xs text-dark-300 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-dark-200">Zoom:</span>
            <span>Mouse wheel or +/- keys</span>
          </div>
          {scale > MIN_SCALE && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-dark-200">Pan:</span>
              <span>Drag or arrow keys</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Use portal to render lightbox at document body level
  return createPortal(lightboxContent, document.body);
};

export default Lightbox;
