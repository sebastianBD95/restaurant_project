import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveNavigation from './ResponsiveNavigation';
import ResponsiveSidebar from './ResponsiveSidebar';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  showSidebar?: boolean;
  sidebarProps?: {
    isOpen: boolean;
    onToggle: () => void;
    restaurantId?: string;
  };
  navigationProps?: {
    restaurantId?: string;
    onLogout?: () => void;
    userRole?: string;
    userName?: string;
  };
  maxWidth?: string;
  padding?: any;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  showNavigation = false,
  showSidebar = false,
  sidebarProps,
  navigationProps,
  maxWidth = '100%',
  padding = { base: 2, md: 4, lg: 6 },
}) => {
  const { isMobile, isTablet } = useResponsive();
  
  const bgColor = 'gray.50';
  const borderColor = 'gray.200';

  return (
    <Box className="page-wrapper" minH="100vh" bg={bgColor}>
      {/* Responsive Navigation */}
      {showNavigation && (
        <ResponsiveNavigation {...navigationProps} />
      )}

      {/* Main Layout Container */}
      <Flex direction="row" minH="100vh">
        {/* Responsive Sidebar */}
        {showSidebar && sidebarProps && (
          <ResponsiveSidebar {...sidebarProps} />
        )}

        {/* Main Content Area */}
        <Box
          flex={1}
          p={padding}
          ml={showSidebar && sidebarProps?.isOpen && !isMobile ? '250px' : '0'}
          ml={showSidebar && !sidebarProps?.isOpen && !isMobile ? '60px' : '0'}
          transition="margin-left 0.3s"
          maxW={maxWidth}
          mx="auto"
        >
          {/* Content */}
          <Box
            bg="white"
            borderRadius={{ base: 'none', md: 'lg' }}
            boxShadow={{ base: 'none', md: 'sm' }}
            border={{ base: 'none', md: '1px solid' }}
            borderColor={borderColor}
            overflow="hidden"
          >
            {children}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

// Responsive Container Component
export const ResponsiveContainer: React.FC<{
  children: React.ReactNode;
  maxWidth?: string;
  padding?: any;
  center?: boolean;
}> = ({ 
  children, 
  maxWidth = '100%', 
  padding = { base: 2, md: 4, lg: 6 },
  center = false 
}) => {
  return (
    <Box
      w="100%"
      maxW={maxWidth}
      mx={center ? 'auto' : '0'}
      px={padding}
    >
      {children}
    </Box>
  );
};

// Responsive Grid Component
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  columns?: number;
  gap?: any;
  templateColumns?: any;
}> = ({ 
  children, 
  columns = 1,
  gap = { base: 3, md: 4, lg: 6 },
  templateColumns 
}) => {
  const defaultTemplateColumns = {
    base: '1fr',
    sm: columns >= 2 ? 'repeat(2, 1fr)' : '1fr',
    md: columns >= 3 ? 'repeat(3, 1fr)' : columns >= 2 ? 'repeat(2, 1fr)' : '1fr',
    lg: columns >= 4 ? 'repeat(4, 1fr)' : columns >= 3 ? 'repeat(3, 1fr)' : columns >= 2 ? 'repeat(2, 1fr)' : '1fr',
    xl: columns >= 5 ? 'repeat(5, 1fr)' : columns >= 4 ? 'repeat(4, 1fr)' : columns >= 3 ? 'repeat(3, 1fr)' : columns >= 2 ? 'repeat(2, 1fr)' : '1fr',
  };

  return (
    <Box
      display="grid"
      gap={gap}
      templateColumns={templateColumns || defaultTemplateColumns}
    >
      {children}
    </Box>
  );
};

// Responsive Card Component
export const ResponsiveCard: React.FC<{
  children: React.ReactNode;
  padding?: any;
  height?: any;
  minHeight?: any;
  onClick?: () => void;
  hoverable?: boolean;
}> = ({ 
  children, 
  padding = { base: 3, md: 4, lg: 6 },
  height,
  minHeight = { base: '200px', md: '250px', lg: '300px' },
  onClick,
  hoverable = false
}) => {
  const bgColor = 'white';
  const borderColor = 'gray.200';
  const hoverBgColor = 'gray.50';

  return (
    <Box
      bg={bgColor}
      p={padding}
      h={height}
      minH={minHeight}
      borderRadius="lg"
      boxShadow="sm"
      border="1px solid"
      borderColor={borderColor}
      cursor={onClick ? 'pointer' : 'default'}
      transition="all 0.2s"
      _hover={hoverable ? {
        transform: 'translateY(-2px)',
        boxShadow: 'md',
        bg: hoverBgColor,
      } : {}}
      onClick={onClick}
    >
      {children}
    </Box>
  );
};

// Responsive Section Component
export const ResponsiveSection: React.FC<{
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  padding?: any;
  margin?: any;
  background?: string;
}> = ({ 
  children, 
  title, 
  subtitle,
  padding = { base: 4, md: 6, lg: 8 },
  margin = { base: 4, md: 6, lg: 8 },
  background
}) => {
  const bgColor = background || 'transparent';
  const textColor = 'gray.800';

  return (
    <Box
      bg={bgColor}
      p={padding}
      m={margin}
      borderRadius="lg"
    >
      {(title || subtitle) && (
        <Box mb={4}>
          {title && (
            <Box
              as="h2"
              fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
              fontWeight="bold"
              color={textColor}
              mb={subtitle ? 2 : 0}
            >
              {title}
            </Box>
          )}
          {subtitle && (
            <Box
              as="p"
              fontSize={{ base: 'md', md: 'lg' }}
              color="gray.600"
              lineHeight="tall"
            >
              {subtitle}
            </Box>
          )}
        </Box>
      )}
      {children}
    </Box>
  );
};

// Responsive Button Group Component
export const ResponsiveButtonGroup: React.FC<{
  children: React.ReactNode;
  direction?: 'row' | 'column';
  spacing?: any;
  justify?: string;
  align?: string;
  wrap?: boolean;
}> = ({ 
  children, 
  direction = 'row',
  spacing = { base: 2, md: 3 },
  justify = 'flex-start',
  align = 'center',
  wrap = true
}) => {
  return (
    <Flex
      direction={{ base: 'column', md: direction }}
      spacing={spacing}
      justify={justify}
      align={align}
      wrap={wrap ? 'wrap' : 'nowrap'}
      gap={spacing}
    >
      {children}
    </Flex>
  );
};

export default ResponsiveLayout;