# Responsive Design System

This document outlines the comprehensive responsive design system implemented in the Restaurant Management System frontend.

## Overview

The responsive design system follows a **mobile-first approach** and provides consistent behavior across all device sizes:
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px  
- **Desktop**: 1024px - 1279px
- **Large Desktop**: 1280px - 1535px
- **Extra Large Desktop**: 1536px+

## Key Features

### 🎯 Mobile-First Approach
- Base styles target mobile devices first
- Progressive enhancement for larger screens
- Touch-friendly interactions (44px minimum touch targets)

### 📱 Responsive Breakpoints
- **Base (Mobile)**: 320px+
- **sm**: 480px+
- **md (Tablet)**: 768px+
- **lg (Desktop)**: 1024px+
- **xl (Large Desktop)**: 1280px+
- **2xl (Extra Large)**: 1536px+

### 🎨 Consistent Design Tokens
- CSS Custom Properties for spacing, colors, and typography
- Responsive spacing scale (xs, sm, md, lg, xl, 2xl, 3xl)
- Responsive typography scale
- Consistent border radius and shadow system

## Components

### 1. Responsive Hooks (`useResponsive`)

```typescript
import { useResponsive, useMobile, useTabletUp, useDesktopUp } from '../hooks/useResponsive';

const MyComponent = () => {
  const { isMobile, isTablet, isDesktop, currentBreakpoint } = useResponsive();
  const isMobileOnly = useMobile();
  const isTabletAndUp = useTabletUp();
  
  // Use responsive values
  const padding = isMobile ? 2 : isTablet ? 4 : 6;
};
```

**Available Hooks:**
- `useResponsive()` - Full responsive state
- `useMobile()` - Mobile-only detection
- `useTabletUp()` - Tablet and larger
- `useDesktopUp()` - Desktop and larger
- `useLargeDesktopUp()` - Large desktop and larger
- `useOrientation()` - Device orientation
- `useScreenDimensions()` - Screen dimensions

### 2. Responsive Layout Components

#### ResponsiveLayout
Main layout wrapper with navigation and sidebar support:

```typescript
import ResponsiveLayout from '../components/ui/ResponsiveLayout';

<ResponsiveLayout
  showNavigation={true}
  showSidebar={true}
  sidebarProps={{ isOpen, onToggle, restaurantId }}
  navigationProps={{ restaurantId, onLogout, userRole, userName }}
>
  <YourContent />
</ResponsiveLayout>
```

#### ResponsiveContainer
Responsive container with max-width and centering:

```typescript
import { ResponsiveContainer } from '../components/ui/ResponsiveLayout';

<ResponsiveContainer maxWidth="1200px" center={true}>
  <YourContent />
</ResponsiveContainer>
```

#### ResponsiveGrid
Automatically responsive grid system:

```typescript
import { ResponsiveGrid } from '../components/ui/ResponsiveLayout';

<ResponsiveGrid columns={4} gap={{ base: 3, md: 4, lg: 6 }}>
  <GridItem1 />
  <GridItem2 />
  <GridItem3 />
  <GridItem4 />
</ResponsiveGrid>
```

#### ResponsiveCard
Responsive card component with hover effects:

```typescript
import { ResponsiveCard } from '../components/ui/ResponsiveLayout';

<ResponsiveCard 
  hoverable={true}
  minHeight={{ base: '200px', md: '250px', lg: '300px' }}
  onClick={handleClick}
>
  <CardContent />
</ResponsiveCard>
```

### 3. Responsive Navigation

#### ResponsiveNavigation
Adaptive navigation that switches between mobile drawer and desktop navigation:

```typescript
import ResponsiveNavigation from '../components/ui/ResponsiveNavigation';

<ResponsiveNavigation
  restaurantId={restaurantId}
  onLogout={handleLogout}
  userRole="admin"
  userName="John Doe"
/>
```

**Features:**
- Mobile: Full-screen drawer navigation
- Tablet: Collapsible sidebar
- Desktop: Horizontal navigation with search and user menu

#### ResponsiveSidebar
Smart sidebar that adapts to screen size:

```typescript
import ResponsiveSidebar from '../components/ui/ResponsiveSidebar';

<ResponsiveSidebar
  isOpen={isSidebarOpen}
  onToggle={toggleSidebar}
  restaurantId={restaurantId}
/>
```

**Behavior:**
- **Mobile**: Full-screen overlay
- **Tablet**: Collapsible sidebar (60px collapsed, 250px expanded)
- **Desktop**: Always visible, toggleable between collapsed/expanded

## CSS Classes

### Utility Classes

#### Spacing
```css
.p-0, .p-1, .p-2, .p-3, .p-4, .p-5  /* Padding */
.m-0, .m-1, .m-2, .m-3, .m-4, .m-5  /* Margin */
```

#### Typography
```css
.text-xs, .text-sm, .text-base, .text-lg, .text-xl, .text-2xl, .text-3xl, .text-4xl
```

#### Layout
```css
.container          /* Responsive container */
.page-wrapper      /* Full-height page wrapper */
.grid              /* Grid container */
.flex              /* Flexbox container */
```

#### Responsive Grids
```css
.grid-1, .grid-2, .grid-3, .grid-4  /* Responsive grid columns */
.dashboard-grid    /* Dashboard-specific grid */
.menu-grid         /* Menu-specific grid */
.inventory-grid    /* Inventory-specific grid */
```

### Component Classes

#### Cards
```css
.card              /* Basic card */
.card-header       /* Card header */
.card-body         /* Card body */
.card-footer       /* Card footer */
```

#### Forms
```css
.form-group        /* Form group container */
.form-label        /* Form label */
.form-input        /* Form input */
```

#### Buttons
```css
.btn               /* Base button */
.btn-sm            /* Small button */
.btn-lg            /* Large button */
.btn-full          /* Full-width button */
```

## Best Practices

### 1. Use Responsive Props
```typescript
// ✅ Good - Responsive values
<Box 
  p={{ base: 2, md: 4, lg: 6 }}
  fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
  width={{ base: '100%', md: '50%', lg: '33%' }}
>

// ❌ Bad - Fixed values
<Box p={6} fontSize="md" width="50%">
```

### 2. Leverage Chakra UI Responsive Props
```typescript
// ✅ Good - Chakra UI responsive props
<Grid templateColumns={{ base: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }}>

// ✅ Good - Custom responsive hook
const { isMobile, isTablet } = useResponsive();
const columns = isMobile ? 1 : isTablet ? 2 : 3;
```

### 3. Use Responsive Layout Components
```typescript
// ✅ Good - Use responsive components
<ResponsiveLayout showSidebar={true} sidebarProps={sidebarProps}>
  <ResponsiveGrid columns={3}>
    <ResponsiveCard>Content</ResponsiveCard>
  </ResponsiveGrid>
</ResponsiveLayout>

// ❌ Bad - Manual responsive handling
<Box display="flex" direction={{ base: 'column', md: 'row' }}>
```

### 4. Touch-Friendly Design
```typescript
// ✅ Good - Touch-friendly sizes
<Button minHeight="44px" fontSize="md">
<Input minHeight="44px" fontSize="md">

// ❌ Bad - Too small for touch
<Button height="32px" fontSize="xs">
```

## Performance Considerations

### 1. Responsive Images
```typescript
// ✅ Good - Responsive image sizing
<Image
  boxSize={{ base: '200px', md: '300px', lg: '400px' }}
  objectFit="cover"
  loading="lazy"
/>

// ✅ Good - CSS classes for responsive images
<img className="img-responsive" src="image.jpg" alt="Description" />
```

### 2. Conditional Rendering
```typescript
// ✅ Good - Conditional rendering based on screen size
{isDesktop && <DesktopOnlyComponent />}
{isMobile && <MobileOnlyComponent />}

// ✅ Good - Responsive display
<Box display={{ base: 'none', md: 'block' }}>
  Desktop Only Content
</Box>
```

### 3. Efficient Media Queries
```css
/* ✅ Good - Mobile-first approach */
.base-styles { /* Mobile styles */ }

@media (min-width: 768px) { /* Tablet and up */ }
@media (min-width: 1024px) { /* Desktop and up */ }
```

## Testing

### 1. Device Testing
Test on actual devices or use browser dev tools:
- **Mobile**: 375px × 667px (iPhone)
- **Tablet**: 768px × 1024px (iPad)
- **Desktop**: 1920px × 1080px

### 2. Breakpoint Testing
Test at key breakpoints:
- 320px (Mobile)
- 480px (Small Mobile)
- 768px (Tablet)
- 1024px (Desktop)
- 1280px (Large Desktop)
- 1536px (Extra Large)

### 3. Orientation Testing
Test both portrait and landscape orientations on mobile devices.

## Browser Support

- **Modern Browsers**: Full support
- **IE11+**: Limited support (use polyfills if needed)
- **Mobile Browsers**: Full support
- **Progressive Web App**: Optimized for PWA features

## Accessibility

### 1. Touch Targets
- Minimum 44px × 44px for interactive elements
- Adequate spacing between touch targets

### 2. Focus Management
- Visible focus indicators
- Logical tab order
- Skip links for keyboard navigation

### 3. Screen Readers
- Semantic HTML structure
- ARIA labels where appropriate
- Alt text for images

## Future Enhancements

### 1. Advanced Responsive Features
- Container queries support
- Aspect ratio utilities
- Advanced grid systems

### 2. Performance Optimizations
- Lazy loading for responsive images
- Code splitting by device type
- Progressive enhancement strategies

### 3. Design System Integration
- Design token management
- Component library integration
- Theme switching capabilities

## Troubleshooting

### Common Issues

#### 1. Sidebar Not Responsive
```typescript
// ✅ Ensure proper responsive hook usage
const { isMobile, isTablet } = useResponsive();
const sidebarConfig = useResponsiveSidebar();
```

#### 2. Grid Not Adapting
```typescript
// ✅ Use ResponsiveGrid component
<ResponsiveGrid columns={3} gap={{ base: 2, md: 4, lg: 6 }}>
  {items.map(item => <GridItem key={item.id} />)}
</ResponsiveGrid>
```

#### 3. Navigation Not Mobile-Friendly
```typescript
// ✅ Use ResponsiveNavigation component
<ResponsiveNavigation
  showHamburger={true}
  compactMode={isMobile}
/>
```

### Debug Mode
Enable responsive debugging:
```typescript
const { currentBreakpoint, screenWidth, screenHeight } = useResponsive();
console.log('Current breakpoint:', currentBreakpoint);
console.log('Screen dimensions:', { width: screenWidth, height: screenHeight });
```

## Conclusion

This responsive design system provides a robust foundation for creating mobile-first, accessible, and performant web applications. By following the established patterns and using the provided components, developers can ensure consistent responsive behavior across all device sizes.

For questions or contributions, please refer to the project documentation or create an issue in the repository.