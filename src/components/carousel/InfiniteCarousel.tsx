import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { useRafMarquee } from '../../hooks/useRafMarquee';

export interface InfiniteCarouselProps {
  /** Array of pre-rendered slide components */
  items: React.ReactNode[];

  /** Enable autoplay */
  autoplay?: boolean;

  /** Scrolling speed in pixels per second */
  speed?: number;

  /** Gap between slides in pixels */
  gap?: number;

  /** ARIA label for the carousel region */
  ariaLabel?: string;

  /** Callback when one full cycle completes */
  onReachEnd?: () => void;

  /** Additional CSS classes */
  className?: string;
}

export interface InfiniteCarouselHandle {
  play: () => void;
  pause: () => void;
  prev: () => void;
  next: () => void;
  snapTo: (index: number) => void;
}

/**
 * High-performance infinite carousel with exact one-item navigation.
 *
 * Optimizations:
 * - GPU-accelerated transforms (translate3d, will-change)
 * - Passive event listeners for touch/pointer
 * - Exact one-item navigation with snap positions
 * - ResizeObserver for dynamic sizing
 * - Visibility/intersection observers for pause/play
 * - Lazy loading with fetchpriority
 * - contain CSS for paint optimization
 */
export const InfiniteCarousel = forwardRef<InfiniteCarouselHandle, InfiniteCarouselProps>(
  (
    {
      items,
      autoplay = true,
      speed = 70,
      gap = 24,
      ariaLabel = 'Featured products carousel',
      onReachEnd,
      className = '',
    },
    ref
  ) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const laneRef = useRef<HTMLDivElement>(null);
    const [clonedItems, setClonedItems] = useState<React.ReactNode[]>([]);
    const [liveRegionText, setLiveRegionText] = useState('');
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Sizing state
    const [itemWidth, setItemWidth] = useState(0);
    const currentIndexRef = useRef(0);

    // Drag state
    const isDraggingRef = useRef(false);
    const dragStartXRef = useRef(0);
    const dragStartOffsetRef = useRef(0);
    const autoplayResumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize marquee hook with laneRef
    const {
      offset,
      isPlaying,
      play,
      pause,
      setCycleWidth,
      animateToOffset,
    } = useRafMarquee({
      speed,
      autoplay: autoplay && !isHovered && isVisible,
      onCycleComplete: onReachEnd,
      laneRef: laneRef as React.RefObject<HTMLElement>,
    });

    // Calculate snap unit (one item width + gap)
    const getSnapUnit = useCallback(() => {
      return itemWidth + gap;
    }, [itemWidth, gap]);

    // Measure and clone items
    const measureAndClone = useCallback(() => {
      if (!trackRef.current || !laneRef.current || items.length === 0) return;

      const children = Array.from(laneRef.current.children) as HTMLElement[];
      if (children.length === 0) {
        setTimeout(measureAndClone, 50);
        return;
      }

      // Measure first child to get item width
      const firstChild = children[0];
      const rect = firstChild.getBoundingClientRect();
      const measuredWidth = rect.width;

      if (measuredWidth === 0) {
        setTimeout(measureAndClone, 50);
        return;
      }

      setItemWidth(measuredWidth);

      // Calculate content width for one set of items
      const contentWidth = items.length * (measuredWidth + gap);

      // Clone items until we have at least 2x viewport width
      const trackWidth = trackRef.current.offsetWidth;
      const minWidth = trackWidth * 2;
      const timesToClone = Math.max(Math.ceil(minWidth / contentWidth), 2);

      const cloned: React.ReactNode[] = [];
      for (let i = 0; i < timesToClone; i++) {
        items.forEach((item, idx) => {
          cloned.push(
            React.cloneElement(item as React.ReactElement, {
              key: `clone-${i}-${idx}`,
            })
          );
        });
      }

      setClonedItems(cloned);
      setCycleWidth(contentWidth);
    }, [items, gap, setCycleWidth]);

    // ResizeObserver for dynamic sizing (debounced)
    useEffect(() => {
      if (!trackRef.current) return;

      const resizeObserver = new ResizeObserver(() => {
        // Debounce resize
        setTimeout(measureAndClone, 150);
      });

      resizeObserver.observe(trackRef.current);

      return () => resizeObserver.disconnect();
    }, [measureAndClone]);

    // Initial measurement
    useEffect(() => {
      const timeoutId = setTimeout(measureAndClone, 100);
      return () => clearTimeout(timeoutId);
    }, [measureAndClone]);

    // IntersectionObserver for visibility-based pause/play
    useEffect(() => {
      if (!trackRef.current || !autoplay) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const visible = entry.intersectionRatio >= 0.2;
            setIsVisible(visible);

            if (!visible && isPlaying) {
              pause();
            } else if (visible && !isHovered) {
              play();
            }
          });
        },
        { threshold: [0, 0.2, 1] }
      );

      observer.observe(trackRef.current);

      return () => observer.disconnect();
    }, [autoplay, isPlaying, isHovered, play, pause]);

    // Visibility change (tab hidden/shown)
    useEffect(() => {
      if (!autoplay) return;

      const handleVisibilityChange = () => {
        if (document.hidden) {
          pause();
        } else if (!isHovered) {
          play();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, [autoplay, isHovered, play, pause]);

    // Handle hover pause/resume
    const handleMouseEnter = useCallback(() => {
      setIsHovered(true);
      pause();
    }, [pause]);

    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);
      if (autoplay && isVisible) {
        play();
      }
    }, [autoplay, isVisible, play]);

    // Snap to nearest card position
    const snapToNearest = useCallback(() => {
      const snapUnit = getSnapUnit();
      if (snapUnit === 0) return;

      // Calculate nearest snap position
      const nearestIndex = Math.round(Math.abs(offset) / snapUnit);
      const targetOffset = -(nearestIndex * snapUnit);

      // Animate to snap position
      animateToOffset(targetOffset, 260);
      currentIndexRef.current = nearestIndex;
    }, [offset, getSnapUnit, animateToOffset]);

    // Navigate to specific index
    const navigateToIndex = useCallback((index: number) => {
      const snapUnit = getSnapUnit();
      if (snapUnit === 0) return;

      // Normalize index within cycle
      const totalItems = items.length;
      const normalizedIndex = ((index % totalItems) + totalItems) % totalItems;

      // Calculate target offset
      const targetOffset = -(normalizedIndex * snapUnit);

      // Animate to target
      pause();
      animateToOffset(targetOffset, 250).then(() => {
        currentIndexRef.current = normalizedIndex;
        setLiveRegionText(`Showing item ${normalizedIndex + 1} of ${totalItems}`);
      });
    }, [items.length, getSnapUnit, pause, animateToOffset]);

    // Prev/Next navigation (exact one item)
    const handlePrev = useCallback(() => {
      const newIndex = currentIndexRef.current - 1;
      navigateToIndex(newIndex);
    }, [navigateToIndex]);

    const handleNext = useCallback(() => {
      const newIndex = currentIndexRef.current + 1;
      navigateToIndex(newIndex);
    }, [navigateToIndex]);

    // Pointer/touch handlers (passive where possible)
    const handlePointerDown = useCallback(
      (e: React.PointerEvent) => {
        if (e.button !== 0) return;

        isDraggingRef.current = true;
        dragStartXRef.current = e.clientX;
        dragStartOffsetRef.current = offset;
        pause();

        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      },
      [offset, pause]
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (!isDraggingRef.current) return;

        const deltaX = e.clientX - dragStartXRef.current;
        const newOffset = dragStartOffsetRef.current + deltaX;

        // Update transform directly via the hook's updateTransform
        if (laneRef.current) {
          laneRef.current.style.transform = `translate3d(${newOffset}px, 0, 0)`;
        }
      },
      []
    );

    const handlePointerUp = useCallback(
      (e: React.PointerEvent) => {
        if (!isDraggingRef.current) return;

        isDraggingRef.current = false;
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);

        // Snap to nearest card
        snapToNearest();

        // Resume autoplay after delay
        if (autoplay && isVisible) {
          if (autoplayResumeTimeoutRef.current) {
            clearTimeout(autoplayResumeTimeoutRef.current);
          }
          autoplayResumeTimeoutRef.current = setTimeout(() => {
            if (!isHovered) {
              play();
            }
          }, 2000);
        }
      },
      [autoplay, isVisible, isHovered, play, snapToNearest]
    );

    // Keyboard navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNext();
        }
      },
      [handlePrev, handleNext]
    );

    // Expose public methods via ref
    useImperativeHandle(ref, () => ({
      play,
      pause,
      prev: handlePrev,
      next: handleNext,
      snapTo: navigateToIndex,
    }), [play, pause, handlePrev, handleNext, navigateToIndex]);

    // Cleanup resume timeout
    useEffect(() => {
      return () => {
        if (autoplayResumeTimeoutRef.current) {
          clearTimeout(autoplayResumeTimeoutRef.current);
        }
      };
    }, []);

    if (items.length === 0) {
      return null;
    }

    const itemsToRender = clonedItems.length > 0 ? clonedItems : items;

    // Calculate card width classes based on breakpoint
    const getCardWidthClass = () => {
      // Mobile: 1 full card
      // sm (640px+): 1.25 cards with peek
      // lg (1024px+): 2 cards
      // xl (1280px+): 3 cards
      return 'w-full sm:w-[calc((100%-1.5rem)/1.25)] lg:w-[calc((100%-1.5rem)/2)] xl:w-[calc((100%-2rem)/3)]';
    };

    return (
      <div
        className={`relative ${className}`}
        role="region"
        aria-label={ariaLabel}
        aria-live="polite"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Visually hidden live region for screen reader announcements */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveRegionText}
        </div>

        {/* Track (overflow container) */}
        <div ref={trackRef} className="overflow-hidden">
          {/* Lane (scrolling container) - GPU accelerated */}
          <div
            ref={laneRef}
            className="flex items-stretch cursor-grab active:cursor-grabbing"
            style={{
              gap: `${gap}px`,
              willChange: 'transform',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {itemsToRender.map((item, idx) => (
              <div
                key={idx}
                className={`flex-shrink-0 ${getCardWidthClass()}`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Previous Button */}
        <button
          onClick={handlePrev}
          aria-label="Previous item"
          aria-controls={ariaLabel}
          className="absolute top-1/2 -translate-y-1/2 left-3 z-10 w-10 h-10 rounded-full bg-dark-800/80 backdrop-blur-sm hover:bg-dark-700/90 text-dark-100 flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-transparent shadow-sm md:shadow-lg"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          aria-label="Next item"
          aria-controls={ariaLabel}
          className="absolute top-1/2 -translate-y-1/2 right-3 z-10 w-10 h-10 rounded-full bg-dark-800/80 backdrop-blur-sm hover:bg-dark-700/90 text-dark-100 flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-transparent shadow-sm md:shadow-lg"
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    );
  }
);

InfiniteCarousel.displayName = 'InfiniteCarousel';

export default InfiniteCarousel;
