import { useState, useEffect } from 'react';

// Breakpoint definitions
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1280,
  extraLargeDesktop: 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isExtraLargeDesktop: boolean;
  currentBreakpoint: Breakpoint;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
}

export const useResponsive = (): ResponsiveState => {
  const [responsiveState, setResponsiveState] = useState<ResponsiveState>({
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
    isExtraLargeDesktop: false,
    currentBreakpoint: 'mobile',
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'portrait',
  });

  useEffect(() => {
    const updateResponsiveState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let currentBreakpoint: Breakpoint = 'mobile';
      let isMobile = true;
      let isTablet = false;
      let isDesktop = false;
      let isLargeDesktop = false;
      let isExtraLargeDesktop = false;

      if (width >= BREAKPOINTS.extraLargeDesktop) {
        currentBreakpoint = 'extraLargeDesktop';
        isMobile = false;
        isTablet = false;
        isDesktop = false;
        isLargeDesktop = false;
        isExtraLargeDesktop = true;
      } else if (width >= BREAKPOINTS.largeDesktop) {
        currentBreakpoint = 'largeDesktop';
        isMobile = false;
        isTablet = false;
        isDesktop = false;
        isLargeDesktop = true;
        isExtraLargeDesktop = false;
      } else if (width >= BREAKPOINTS.desktop) {
        currentBreakpoint = 'desktop';
        isMobile = false;
        isTablet = false;
        isDesktop = true;
        isLargeDesktop = false;
        isExtraLargeDesktop = false;
      } else if (width >= BREAKPOINTS.tablet) {
        currentBreakpoint = 'tablet';
        isMobile = false;
        isTablet = true;
        isDesktop = false;
        isLargeDesktop = false;
        isExtraLargeDesktop = false;
      } else {
        currentBreakpoint = 'mobile';
        isMobile = true;
        isTablet = false;
        isDesktop = false;
        isLargeDesktop = false;
        isExtraLargeDesktop = false;
      }

      const orientation: 'portrait' | 'landscape' = width > height ? 'landscape' : 'portrait';

      setResponsiveState({
        isMobile,
        isTablet,
        isDesktop,
        isLargeDesktop,
        isExtraLargeDesktop,
        currentBreakpoint,
        screenWidth: width,
        screenHeight: height,
        orientation,
      });
    };

    // Set initial state
    updateResponsiveState();

    // Add event listener
    window.addEventListener('resize', updateResponsiveState);
    window.addEventListener('orientationchange', updateResponsiveState);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateResponsiveState);
      window.removeEventListener('orientationchange', updateResponsiveState);
    };
  }, []);

  return responsiveState;
};

// Hook for specific breakpoint checks
export const useBreakpoint = (breakpoint: Breakpoint): boolean => {
  const { currentBreakpoint } = useResponsive();
  const breakpointValues = Object.values(BREAKPOINTS);
  const currentIndex = breakpointValues.indexOf(BREAKPOINTS[currentBreakpoint]);
  const targetIndex = breakpointValues.indexOf(BREAKPOINTS[breakpoint]);
  
  return currentIndex >= targetIndex;
};

// Hook for mobile-only logic
export const useMobile = (): boolean => {
  return useBreakpoint('mobile');
};

// Hook for tablet and up
export const useTabletUp = (): boolean => {
  return useBreakpoint('tablet');
};

// Hook for desktop and up
export const useDesktopUp = (): boolean => {
  return useBreakpoint('desktop');
};

// Hook for large desktop and up
export const useLargeDesktopUp = (): boolean => {
  return useBreakpoint('largeDesktop');
};

// Hook for extra large desktop and up
export const useExtraLargeDesktopUp = (): boolean => {
  return useBreakpoint('extraLargeDesktop');
};

// Hook for orientation
export const useOrientation = (): 'portrait' | 'landscape' => {
  const { orientation } = useResponsive();
  return orientation;
};

// Hook for screen dimensions
export const useScreenDimensions = (): { width: number; height: number } => {
  const { screenWidth, screenHeight } = useResponsive();
  return { width: screenWidth, height: screenHeight };
};

// Utility function to get responsive values
export const getResponsiveValue = <T>(
  mobile: T,
  tablet: T,
  desktop: T,
  largeDesktop?: T,
  extraLargeDesktop?: T,
  currentBreakpoint: Breakpoint
): T => {
  switch (currentBreakpoint) {
    case 'extraLargeDesktop':
      return extraLargeDesktop ?? largeDesktop ?? desktop;
    case 'largeDesktop':
      return largeDesktop ?? desktop;
    case 'desktop':
      return desktop;
    case 'tablet':
      return tablet;
    case 'mobile':
    default:
      return mobile;
  }
};

// Utility function for responsive spacing
export const useResponsiveSpacing = () => {
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();
  
  return {
    padding: isMobile ? 2 : isTablet ? 4 : isDesktop ? 6 : isLargeDesktop ? 8 : 10,
    margin: isMobile ? 2 : isTablet ? 4 : isDesktop ? 6 : isLargeDesktop ? 8 : 10,
    gap: isMobile ? 2 : isTablet ? 3 : isDesktop ? 4 : isLargeDesktop ? 5 : 6,
    borderRadius: isMobile ? 'md' : 'lg',
    fontSize: isMobile ? 'sm' : isTablet ? 'md' : isDesktop ? 'lg' : 'xl',
  };
};

// Utility function for responsive grid columns
export const useResponsiveGrid = () => {
  const { isMobile, isTablet, isDesktop, isLargeDesktop, isExtraLargeDesktop } = useResponsive();
  
  return {
    columns: isMobile ? 1 : isTablet ? 2 : isDesktop ? 3 : isLargeDesktop ? 4 : isExtraLargeDesktop ? 5 : 4,
    gap: isMobile ? 2 : isTablet ? 3 : isDesktop ? 4 : isLargeDesktop ? 5 : 6,
  };
};

// Utility function for responsive sidebar behavior
export const useResponsiveSidebar = () => {
  const { isMobile, isTablet } = useResponsive();
  
  return {
    isCollapsible: isMobile || isTablet,
    defaultOpen: !isMobile,
    overlay: isMobile,
    position: isMobile ? 'full' : 'left',
  };
};

// Utility function for responsive navigation
export const useResponsiveNavigation = () => {
  const { isMobile, isTablet } = useResponsive();
  
  return {
    showHamburger: isMobile || isTablet,
    showSearch: !isMobile,
    showUserMenu: !isMobile,
    compactMode: isMobile,
  };
};

// Utility function for responsive forms
export const useResponsiveForm = () => {
  const { isMobile, isTablet } = useResponsive();
  
  return {
    layout: isMobile ? 'vertical' : isTablet ? 'vertical' : 'horizontal',
    labelPosition: isMobile ? 'top' : 'left',
    buttonSize: isMobile ? 'md' : 'lg',
    inputSize: isMobile ? 'md' : 'lg',
  };
};

// Utility function for responsive tables
export const useResponsiveTable = () => {
  const { isMobile, isTablet } = useResponsive();
  
  return {
    scrollable: isMobile || isTablet,
    compact: isMobile,
    showPagination: !isMobile,
    itemsPerPage: isMobile ? 5 : isTablet ? 10 : 20,
  };
};

// Utility function for responsive modals
export const useResponsiveModal = () => {
  const { isMobile, isTablet } = useResponsive();
  
  return {
    size: isMobile ? 'full' : isTablet ? 'lg' : 'xl',
    closeOnOverlayClick: isMobile,
    showCloseButton: !isMobile,
    padding: isMobile ? 4 : isTablet ? 6 : 8,
  };
};

// Utility function for responsive charts
export const useResponsiveChart = () => {
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();
  
  return {
    height: isMobile ? 200 : isTablet ? 300 : isDesktop ? 400 : isLargeDesktop ? 500 : 400,
    showLegend: !isMobile,
    showTooltip: true,
    showGrid: !isMobile,
    fontSize: isMobile ? 'xs' : isTablet ? 'sm' : 'md',
  };
};

export default useResponsive;