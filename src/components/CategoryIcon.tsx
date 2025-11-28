import React from 'react';

interface CategoryIconProps {
  category: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  className = 'w-4 h-4',
  size
}) => {
  const svgProps = {
    width: size || 16,
    height: size || 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: className
  };

  const categoryLower = category.toLowerCase();

  switch (categoryLower) {
    case 'pilot':
      return (
        <svg {...svgProps} xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8" r="4" />
          <path d="M6 8 L8 8" />
          <path d="M16 8 L18 8" />
          <path d="M6 21 L6 19 C6 16.79 7.79 15 10 15 L14 15 C16.21 15 18 16.79 18 19 L18 21" />
          <line x1="8" y1="17" x2="10" y2="17" />
          <line x1="14" y1="17" x2="16" y2="17" />
        </svg>
      );

    case 'copilot':
      return (
        <svg {...svgProps} xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="6" r="3" />
          <path d="M22 21 L22 19 C22 17.34 20.66 16 19 16 L17 16" />
          <circle cx="9" cy="8" r="4" />
          <path d="M2 21 L2 19 C2 16.79 3.79 15 6 15 L12 15 C14.21 15 16 16.79 16 19 L16 21" />
        </svg>
      );

    case 'hotas':
      return (
        <svg {...svgProps} xmlns="http://www.w3.org/2000/svg">
          {/* Throttle (left) */}
          <path d="M4 6 L4 18" />
          <path d="M4 6 L6 6 L6 18 L4 18" />
          <circle cx="5" cy="9" r="0.5" fill="currentColor" />
          <circle cx="5" cy="12" r="0.5" fill="currentColor" />
          <circle cx="5" cy="15" r="0.5" fill="currentColor" />
          <line x1="3" y1="10" x2="7" y2="10" />
          {/* Joystick (right) */}
          <path d="M18 18 L18 13 Q18 11, 17 10 L15 8" />
          <circle cx="15" cy="8" r="2" />
          <line x1="14" y1="7" x2="16" y2="7" />
          <circle cx="15" cy="9.5" r="0.5" fill="currentColor" />
          <path d="M16 18 L20 18" />
          <path d="M17 16 L19 16" />
        </svg>
      );

    case 'throttle':
      return (
        <svg {...svgProps} xmlns="http://www.w3.org/2000/svg">
          {/* Base/panel */}
          <rect x="3" y="18" width="18" height="3" rx="1" />
          {/* Throttle left - slot */}
          <line x1="8" y1="18" x2="8" y2="4" />
          {/* Throttle left - handle */}
          <rect x="6" y="6" width="4" height="5" rx="1" />
          {/* Throttle right - slot */}
          <line x1="16" y1="18" x2="16" y2="4" />
          {/* Throttle right - handle (different position) */}
          <rect x="14" y="10" width="4" height="5" rx="1" />
          {/* Gradations left */}
          <line x1="5" y1="8" x2="6" y2="8" />
          <line x1="5" y1="12" x2="6" y2="12" />
          <line x1="5" y1="16" x2="6" y2="16" />
          {/* Gradations right */}
          <line x1="18" y1="8" x2="19" y2="8" />
          <line x1="18" y1="12" x2="19" y2="12" />
          <line x1="18" y1="16" x2="19" y2="16" />
        </svg>
      );

    case 'joystick':
      return (
        <svg {...svgProps} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3 L12 11" />
          <circle cx="12" cy="3" r="2" />
          <circle cx="12" cy="2" r="0.5" fill="currentColor" />
          <path d="M9 11 L9 14 L15 14 L15 11 Z" />
          <rect x="6" y="17" width="12" height="4" rx="1" />
          <path d="M10 14 L10 17" />
          <path d="M14 14 L14 17" />
          <line x1="8" y1="19" x2="10" y2="19" />
          <line x1="14" y1="19" x2="16" y2="19" />
        </svg>
      );

    case 'pedals':
      return (
        <svg {...svgProps} xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="18" width="20" height="3" rx="1" />
          <path d="M4 18 L4 12 L8 10 L8 18" />
          <line x1="5" y1="14" x2="7" y2="13" />
          <path d="M16 18 L16 12 L20 10 L20 18" />
          <line x1="17" y1="14" x2="19" y2="13" />
          <line x1="12" y1="18" x2="12" y2="8" />
          <circle cx="12" cy="7" r="1" />
          <line x1="8" y1="14" x2="12" y2="12" />
          <line x1="16" y1="14" x2="12" y2="12" />
        </svg>
      );

    case 'rudder':
      return (
        <svg {...svgProps} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2 L12 16" />
          <path d="M8 6 L12 4 L16 6 L16 14 L12 16 L8 14 Z" />
          <line x1="12" y1="6" x2="12" y2="14" />
          <line x1="9" y1="8" x2="9" y2="12" />
          <line x1="15" y1="8" x2="15" y2="12" />
          <ellipse cx="12" cy="19" rx="5" ry="2" />
          <line x1="12" y1="16" x2="12" y2="17" />
          <path d="M3 10 L6 12 L3 14" />
          <path d="M21 10 L18 12 L21 14" />
        </svg>
      );

    case 'panel':
      return (
        <svg {...svgProps} xmlns="http://www.w3.org/2000/svg">
          {/* Panel frame */}
          <rect x="2" y="3" width="20" height="18" rx="2" />
          {/* Main display */}
          <rect x="4" y="5" width="10" height="7" rx="1" />
          {/* Display indicators */}
          <line x1="6" y1="8" x2="8" y2="8" />
          <line x1="10" y1="8" x2="12" y2="8" />
          {/* Buttons top right */}
          <circle cx="17" cy="6" r="1" />
          <circle cx="20" cy="6" r="1" />
          <circle cx="17" cy="9" r="1" />
          <circle cx="20" cy="9" r="1" />
          {/* Switches bottom */}
          <rect x="4" y="14" width="3" height="5" rx="0.5" />
          <rect x="9" y="14" width="3" height="5" rx="0.5" />
          <rect x="14" y="14" width="3" height="5" rx="0.5" />
          {/* Switch position indicator */}
          <line x1="5.5" y1="15" x2="5.5" y2="16" />
          <line x1="10.5" y1="17" x2="10.5" y2="18" />
          <line x1="15.5" y1="15" x2="15.5" y2="16" />
          {/* LED status */}
          <circle cx="19" cy="15" r="0.5" fill="currentColor" />
          <circle cx="19" cy="17" r="0.5" fill="currentColor" />
        </svg>
      );

    case 'mcdu':
      return (
        <svg {...svgProps} xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <rect x="4" y="8" width="4" height="3" rx="0.5" />
          <rect x="10" y="8" width="4" height="3" rx="0.5" />
          <rect x="16" y="8" width="4" height="3" rx="0.5" />
          <circle cx="6" cy="15" r="1.5" />
          <circle cx="12" cy="15" r="1.5" />
          <circle cx="18" cy="15" r="1.5" />
          <line x1="6" y1="13.5" x2="6" y2="14" />
          <line x1="12" y1="13.5" x2="12" y2="14" />
          <line x1="18" y1="13.5" x2="18" y2="14" />
        </svg>
      );

    case 'base':
      return (
        <svg {...svgProps} xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="12" cy="6" rx="6" ry="2" />
          <path d="M6 6 L6 14 Q6 18, 10 18 L14 18 Q18 18, 18 14 L18 6" />
          <circle cx="12" cy="6" r="1" />
          <line x1="9" y1="6" x2="10" y2="6" />
          <line x1="14" y1="6" x2="15" y2="6" />
          <rect x="4" y="18" width="16" height="3" rx="1" />
          <circle cx="7" cy="21" r="0.5" fill="currentColor" />
          <circle cx="17" cy="21" r="0.5" fill="currentColor" />
          <line x1="8" y1="10" x2="8" y2="14" />
          <line x1="16" y1="10" x2="16" y2="14" />
        </svg>
      );

    case 'bundles':
    case 'bundle':
      return (
        <svg {...svgProps} xmlns="http://www.w3.org/2000/svg">
          <path d="M3 8 L12 3 L21 8 L21 16 L12 21 L3 16 Z" />
          <line x1="12" y1="3" x2="12" y2="21" />
          <line x1="3" y1="8" x2="12" y2="12" />
          <line x1="21" y1="8" x2="12" y2="12" />
          <circle cx="7" cy="11" r="1" />
          <circle cx="17" cy="11" r="1" />
          <circle cx="12" cy="16" r="1" />
          <path d="M10 5 L12 3 L14 5" />
        </svg>
      );

    case 'accessories':
      return (
        <svg {...svgProps} xmlns="http://www.w3.org/2000/svg">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          <rect x="2" y="3" width="4" height="6" rx="1" />
          <line x1="3" y1="5" x2="5" y2="5" />
          <line x1="3" y1="7" x2="5" y2="7" />
        </svg>
      );

    case 'first':
    case 'firstclass':
      return (
        <svg {...svgProps} xmlns="http://www.w3.org/2000/svg">
          {/* Left wall */}
          <line x1="2" y1="2" x2="2" y2="20" />
          <line x1="2" y1="2" x2="5" y2="2" />
          {/* Right wall */}
          <line x1="22" y1="2" x2="22" y2="20" />
          <line x1="19" y1="2" x2="22" y2="2" />
          {/* Central large seat (suite) */}
          <rect x="7" y="4" width="10" height="8" rx="2" />
          <rect x="7" y="12" width="10" height="5" rx="1" />
          {/* Premium headrest */}
          <path d="M9 5 Q12 3, 15 5" />
          {/* Seat legs */}
          <line x1="8" y1="17" x2="8" y2="20" />
          <line x1="16" y1="17" x2="16" y2="20" />
          {/* Left table */}
          <rect x="3" y="10" width="3" height="6" rx="0.5" />
          <circle cx="4.5" cy="12" r="0.5" fill="currentColor" />
          {/* Right table */}
          <rect x="18" y="10" width="3" height="6" rx="0.5" />
          <circle cx="19.5" cy="12" r="0.5" fill="currentColor" />
          {/* Wide armrests on seat */}
          <line x1="7" y1="10" x2="7" y2="14" />
          <line x1="17" y1="10" x2="17" y2="14" />
          {/* Base/floor */}
          <line x1="2" y1="21" x2="22" y2="21" />
        </svg>
      );

    case 'business':
    case 'businessclass':
      return (
        <svg {...svgProps} xmlns="http://www.w3.org/2000/svg">
          {/* Left seat (wider) */}
          <rect x="2" y="3" width="8" height="9" rx="1.5" />
          <rect x="2" y="12" width="8" height="5" rx="1" />
          <line x1="3" y1="17" x2="3" y2="20" />
          <line x1="9" y1="17" x2="9" y2="20" />
          {/* Left headrest */}
          <path d="M4 4 Q6 3, 8 4" />
          {/* Left outer armrest */}
          <line x1="2" y1="10" x2="2" y2="14" />
          {/* Right seat (wider) */}
          <rect x="14" y="3" width="8" height="9" rx="1.5" />
          <rect x="14" y="12" width="8" height="5" rx="1" />
          <line x1="15" y1="17" x2="15" y2="20" />
          <line x1="21" y1="17" x2="21" y2="20" />
          {/* Right headrest */}
          <path d="M16 4 Q18 3, 20 4" />
          {/* Right outer armrest */}
          <line x1="22" y1="10" x2="22" y2="14" />
          {/* Shared central armrest (wider) */}
          <rect x="10" y="9" width="4" height="5" rx="0.5" />
          {/* Base/floor */}
          <line x1="2" y1="21" x2="22" y2="21" />
        </svg>
      );

    case 'economy':
    case 'economyclass':
      return (
        <svg {...svgProps} xmlns="http://www.w3.org/2000/svg">
          {/* Left seat */}
          <rect x="2" y="4" width="5" height="8" rx="1" />
          <rect x="2" y="12" width="5" height="4" rx="0.5" />
          <line x1="3" y1="16" x2="3" y2="20" />
          <line x1="6" y1="16" x2="6" y2="20" />
          {/* Middle seat */}
          <rect x="9" y="4" width="6" height="8" rx="1" />
          <rect x="9" y="12" width="6" height="4" rx="0.5" />
          <line x1="10" y1="16" x2="10" y2="20" />
          <line x1="14" y1="16" x2="14" y2="20" />
          {/* Right seat */}
          <rect x="17" y="4" width="5" height="8" rx="1" />
          <rect x="17" y="12" width="5" height="4" rx="0.5" />
          <line x1="18" y1="16" x2="18" y2="20" />
          <line x1="21" y1="16" x2="21" y2="20" />
          {/* Armrests between seats */}
          <line x1="7" y1="10" x2="9" y2="10" />
          <line x1="15" y1="10" x2="17" y2="10" />
          {/* Base/floor */}
          <line x1="2" y1="21" x2="22" y2="21" />
        </svg>
      );

    default:
      return null;
  }
};
