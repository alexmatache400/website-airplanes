import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onBack,
  title,
  children,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const scrollLockRef = useRef<{
    originalOverflow: string;
    originalPaddingRight: string;
    isLocked: boolean;
  }>({
    originalOverflow: '',
    originalPaddingRight: '',
    isLocked: false,
  });

  // Handle ESC key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Focus trap
  useFocusTrap(modalRef, isOpen);

  // Lock/unlock body scroll when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Unlock scroll when modal closes - use setTimeout to ensure this happens after all event handlers
      setTimeout(() => {
        if (scrollLockRef.current.isLocked) {
          // Force restore scroll - be aggressive to fix any stuck state
          if (scrollLockRef.current.originalOverflow) {
            document.body.style.overflow = scrollLockRef.current.originalOverflow;
          } else {
            document.body.style.removeProperty('overflow');
          }

          if (scrollLockRef.current.originalPaddingRight) {
            document.body.style.paddingRight = scrollLockRef.current.originalPaddingRight;
          } else {
            document.body.style.removeProperty('padding-right');
          }

          scrollLockRef.current.isLocked = false;
        }
      }, 0);
      return;
    }

    // Store the element that had focus before modal opened
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Lock body scroll (only if not already locked)
    if (!scrollLockRef.current.isLocked) {
      scrollLockRef.current.originalOverflow = document.body.style.overflow || '';
      scrollLockRef.current.originalPaddingRight = document.body.style.paddingRight || '';

      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      scrollLockRef.current.isLocked = true;
    }

    // Add event listeners
    document.addEventListener('keydown', handleEscape);

    // Focus the close button when modal opens
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    return () => {
      // Remove event listeners
      document.removeEventListener('keydown', handleEscape);

      // Return focus to the element that opened the modal
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, handleEscape]);

  // Safety cleanup: Ensure scroll is unlocked when component unmounts
  useEffect(() => {
    // Capture the current ref value to use in cleanup
    const scrollLock = scrollLockRef.current;

    return () => {
      // Force unlock scroll on unmount - be very aggressive
      setTimeout(() => {
        if (scrollLock.isLocked) {
          if (scrollLock.originalOverflow) {
            document.body.style.overflow = scrollLock.originalOverflow;
          } else {
            document.body.style.removeProperty('overflow');
          }

          if (scrollLock.originalPaddingRight) {
            document.body.style.paddingRight = scrollLock.originalPaddingRight;
          } else {
            document.body.style.removeProperty('padding-right');
          }

          scrollLock.isLocked = false;
        } else {
          // Even if we think it's not locked, force remove overflow: hidden just in case
          const currentOverflow = document.body.style.overflow;
          if (currentOverflow === 'hidden') {
            document.body.style.removeProperty('overflow');
            document.body.style.removeProperty('padding-right');
          }
        }
      }, 0);
    };
  }, []);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`bg-dark-800 rounded-2xl max-w-3xl w-full shadow-2xl border border-dark-700 relative flex flex-col max-h-[85vh] ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-dark-800 border-b border-dark-700 p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <h2
              id="modal-title"
              className="text-2xl font-bold text-dark-100 flex-1"
            >
              {title}
            </h2>

            <div className="flex items-center gap-2">
              {/* Close Button */}
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="text-dark-400 hover:text-dark-100 transition-colors p-2 rounded-lg hover:bg-dark-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                aria-label="Close modal"
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
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 rounded-b-2xl">
          {children}
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  return createPortal(modalContent, document.body);
};

export default Modal;
