import { renderHook, act } from '@testing-library/react';
import { useRafMarquee } from '../useRafMarquee';

// Mock requestAnimationFrame
let rafCallback: FrameRequestCallback | null = null;
let rafId = 0;

beforeAll(() => {
  global.requestAnimationFrame = jest.fn((callback) => {
    rafCallback = callback;
    return ++rafId;
  });

  global.cancelAnimationFrame = jest.fn(() => {
    rafCallback = null;
  });
});

afterEach(() => {
  rafCallback = null;
  rafId = 0;
});

describe('useRafMarquee', () => {
  describe('Initialization', () => {
    it('should initialize with offset 0 and autoplay state', () => {
      const { result } = renderHook(() => useRafMarquee({ autoplay: true }));

      expect(result.current.offset).toBe(0);
      expect(result.current.isPlaying).toBe(true);
    });

    it('should initialize with autoplay false when specified', () => {
      const { result } = renderHook(() => useRafMarquee({ autoplay: false }));

      expect(result.current.offset).toBe(0);
      expect(result.current.isPlaying).toBe(false);
    });

    it('should use default speed of 70 when not specified', () => {
      const { result } = renderHook(() => useRafMarquee());

      expect(result.current.isPlaying).toBe(true);
      // Speed is internal, but we can verify animation starts
      expect(requestAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('Animation Control', () => {
    it('should start animation when play() is called', () => {
      const { result } = renderHook(() => useRafMarquee({ autoplay: false }));

      expect(result.current.isPlaying).toBe(false);

      act(() => {
        result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);
      expect(requestAnimationFrame).toHaveBeenCalled();
    });

    it('should stop animation when pause() is called', () => {
      const { result } = renderHook(() => useRafMarquee({ autoplay: true }));

      expect(result.current.isPlaying).toBe(true);

      act(() => {
        result.current.pause();
      });

      expect(result.current.isPlaying).toBe(false);
      expect(cancelAnimationFrame).toHaveBeenCalled();
    });

    it('should reset offset to 0 when reset() is called', () => {
      const { result } = renderHook(() => useRafMarquee());

      // Manually set offset
      act(() => {
        result.current.setOffset(-100);
      });

      expect(result.current.offset).toBe(-100);

      act(() => {
        result.current.reset();
      });

      expect(result.current.offset).toBe(0);
    });
  });

  describe('Offset Management', () => {
    it('should update offset when setOffset() is called', () => {
      const { result } = renderHook(() => useRafMarquee());

      act(() => {
        result.current.setOffset(-200);
      });

      expect(result.current.offset).toBe(-200);
    });

    it('should accumulate negative offset over time (leftward movement)', () => {
      const { result } = renderHook(() => useRafMarquee({ speed: 100, autoplay: true }));

      // Simulate animation frame at t=0
      act(() => {
        rafCallback?.(0);
      });

      // Initial offset should be 0 (or very close)
      const initialOffset = result.current.offset;

      // Simulate animation frame at t=1000ms (1 second)
      act(() => {
        rafCallback?.(1000);
      });

      // After 1 second at 100px/s, offset should be -100
      expect(result.current.offset).toBeLessThan(initialOffset);
      expect(result.current.offset).toBeCloseTo(-100, 0);
    });
  });

  describe('Cycle Completion', () => {
    it('should call onCycleComplete when offset exceeds cycle width', () => {
      const onCycleComplete = jest.fn();
      const { result } = renderHook(() =>
        useRafMarquee({ speed: 100, autoplay: true, onCycleComplete })
      );

      // Set cycle width to 500px
      act(() => {
        (result.current as any).setCycleWidth(500);
      });

      // Simulate animation to move offset beyond -500
      act(() => {
        rafCallback?.(0);
      });

      act(() => {
        rafCallback?.(6000); // 6 seconds at 100px/s = -600px
      });

      // Should have wrapped and called onCycleComplete
      expect(onCycleComplete).toHaveBeenCalled();
      // Offset should have wrapped back
      expect(result.current.offset).toBeGreaterThan(-500);
    });

    it('should wrap offset when exceeding cycle width', () => {
      const { result } = renderHook(() => useRafMarquee({ speed: 100, autoplay: true }));

      // Set cycle width to 300px
      act(() => {
        (result.current as any).setCycleWidth(300);
      });

      // Manually set offset beyond cycle width
      act(() => {
        result.current.setOffset(-400);
      });

      // Simulate one animation frame to trigger wrap
      act(() => {
        rafCallback?.(0);
      });

      act(() => {
        rafCallback?.(100);
      });

      // Offset should have wrapped
      expect(result.current.offset).toBeGreaterThan(-300);
    });
  });

  describe('Prefers Reduced Motion', () => {
    it('should not start animation if prefers-reduced-motion is set', () => {
      // Override matchMedia to return matches: true for reduced motion
      const originalMatchMedia = window.matchMedia;

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const { result } = renderHook(() => useRafMarquee({ autoplay: true }));

      // Animation should not start
      expect(result.current.isPlaying).toBe(false);

      // play() should do nothing
      act(() => {
        result.current.play();
      });

      expect(result.current.isPlaying).toBe(false);

      // Restore original matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: originalMatchMedia,
      });
    });
  });

  describe('Cleanup', () => {
    it('should cancel animation frame on unmount', () => {
      const { unmount } = renderHook(() => useRafMarquee({ autoplay: true }));

      expect(requestAnimationFrame).toHaveBeenCalled();

      unmount();

      expect(cancelAnimationFrame).toHaveBeenCalled();
    });

    it('should stop animation when isPlaying changes to false', () => {
      const { result } = renderHook(() => useRafMarquee({ autoplay: true }));

      const cancelSpy = jest.spyOn(global, 'cancelAnimationFrame');

      act(() => {
        result.current.pause();
      });

      expect(cancelSpy).toHaveBeenCalled();
    });
  });
});
