# Implementation Plan - Landing Page Sem Fronteiras

## Overview

This implementation plan breaks down the development of the Sem Fronteiras landing page into discrete, actionable coding tasks. Each task builds incrementally on previous work, ensuring a functional page at every stage. The plan focuses exclusively on implementation activities that can be executed within the development environment.

---

## Tasks

- [-] 1. Set up project structure and prepare assets
  - Create organized folder structure for CSS, JS, and images
  - Prepare and optimize all image assets (hero, portraits, credentials, testimonials)
  - Set up base HTML file with proper meta tags, SEO elements, and Open Graph tags
  - _Requirements: 1.1, 12.1, 12.2, 12.3_

- [x] 1.1 Create base HTML structure
  - Write semantic HTML5 structure with header, main sections, and footer
  - Add proper meta tags including viewport, charset, description, and OG tags
  - Include favicon link and preload critical resources
  - Set up anchor links for smooth scrolling navigation
  - _Requirements: 1.1, 6.1_

- [ ] 1.2 Prepare and optimize image assets
  - Compress hero image to <300KB maintaining quality
  - Compress Ciro portrait to <200KB in 4:5 aspect ratio
  - Prepare credential badge logos at 60px height
  - Compress emotional identification images to <150KB each
  - Create WebP versions with JPEG fallbacks for all images
  - _Requirements: 12.2, 12.3_

- [ ] 1.3 Set up CSS architecture
  - Create reset.css with modern CSS reset
  - Create variables.css with color palette, typography scale, and spacing system
  - Create typography.css with font imports (Montserrat, Inter) and text styles
  - Create main.css for layout and general styles
  - Create components.css for reusable component styles
  - _Requirements: 1.1, 6.3_

- [ ] 2. Implement header component
  - Code fixed/sticky header with 80px height and white background
  - Add logo/brand text "Sem Fronteiras" with proper styling
  - Implement secondary CTA button linking to purchase section
  - Add box shadow and smooth scroll behavior
  - Ensure header remains visible during page scroll
  - _Requirements: 1.4_

- [ ] 2.1 Make header responsive
  - Implement mobile breakpoint adjustments (<768px)
  - Adjust logo size and button styling for mobile
  - Ensure header doesn't overlap content on small screens
  - Test sticky behavior on iOS Safari
  - _Requirements: 6.1, 6.2_

- [ ] 3. Build hero section
  - Create full viewport height container (100vh desktop, auto mobile)
  - Implement background image with gradient overlay
  - Code centered content container with max-width 800px
  - Add headline with proper typography (48px desktop, 32px mobile)
  - Add subheadline with 20px font size and proper line-height
  - _Requirements: 1.1, 1.2, 6.4_

- [ ] 3.1 Implement hero CTA button
  - Create primary CTA button with specified dimensions (380px × 64px)
  - Apply green background (#10B981) with white text
  - Add box shadow and border-radius styling
  - Implement hover effect (scale 1.05, darker shade)
  - Link button to purchase section with smooth scroll
  - Add trust line text below button
  - _Requirements: 1.3, 1.4, 7.1_

- [ ] 3.2 Optimize hero section performance
  - Implement lazy loading for background image
  - Add preload hint for hero image
  - Ensure First Contentful Paint <1.5s
  - Test loading on 4G connection simulation
  - _Requirements: 12.4, 12.5_

- [ ] 4. Create emotional identification section
  - Build section container with proper padding (80px vertical desktop, 40px mobile)
  - Add section header with border-left accent
  - Implement long-form copy with proper paragraph spacing
  - Insert emotional images with 4:3 aspect ratio and border-radius
  - Apply box shadows to images
  - _Requirements: 1.2, 6.2_

- [ ] 4.1 Integrate emotional images
  - Position images inline with text using CSS Grid or float
  - Implement responsive image sizing
  - Add lazy loading attributes
  - Ensure images don't break text flow on mobile
  - _Requirements: 12.3_

- [ ] 5. Build authority section
  - Create 2-column grid layout (60/40 split desktop, stacked mobile)
  - Add Ciro's biography text in left column with credential list
  - Implement checkmark icons before each credential
  - Insert professional portrait in right column with styling
  - Add credential badges row with institutional logos
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 5.1 Style credential badges
  - Arrange logos in horizontal row with 32px gap
  - Apply grayscale filter with color on hover
  - Ensure logos scale proportionally
  - Implement responsive stacking on mobile
  - _Requirements: 2.2, 2.3_

- [ ] 6. Implement before/after transformation section
  - Create 2-column grid (50/50 desktop, stacked mobile)
  - Build left column with red tint background (#FEE2E2) for "Before"
  - Build right column with green tint background (#D1FAE5) for "After"
  - Add X icons before "Before" items and check icons before "After" items
  - Apply border-radius and padding to both columns
  - _Requirements: 1.2_

- [ ] 7. Create course modules accordion
  - Build accordion container with 9 module items
  - Implement expandable/collapsible functionality with JavaScript
  - Style module headers with title, video count, and duration
  - Add expand/collapse icons (plus/minus toggle)
  - Style expanded content with topic bullets and bonus highlights
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 7.1 Implement accordion JavaScript functionality
  - Write click event handlers for expand/collapse
  - Add smooth height transition animation (0.3s ease)
  - Ensure only one module expanded at a time (optional behavior)
  - Maintain collapsed state for unselected modules
  - Test keyboard accessibility (Enter/Space to toggle)
  - _Requirements: 3.1, 3.2_

- [ ] 8. Build bonus and value stack section
  - Create callout box with yellow background (#FEF3C7) and orange border
  - Add gift icon at top-left
  - List bonus items with checkmarks and individual values
  - Calculate and display total bonus value (R$ 897)
  - Show price contrast with strikethrough total vs. actual price (R$ 497)
  - _Requirements: 3.4, 3.5_

- [ ] 9. Create target audience section
  - Build "Para Quem É" checklist with green checkmarks
  - Build "NÃO É Para Você Se" list with red X marks
  - Apply proper spacing and typography
  - Add warning callout box with important disclaimer
  - _Requirements: 1.2_

- [ ] 10. Implement testimonial cards
  - Create 3-card layout in row (desktop) / stacked (mobile)
  - Style each card with white background, border, and shadow
  - Add quote icon at top-right of each card
  - Insert testimonial text with proper typography
  - Add author name, location, and success detail
  - Implement hover effect (slight lift with translateY)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 10.1 Add testimonial images
  - Insert optional author photos (64px circular) at top-left
  - Ensure images are optimized (<30KB each)
  - Implement lazy loading
  - Test layout with and without photos
  - _Requirements: 4.4_

- [ ] 11. Build guarantee section
  - Create callout box with light blue background (#DBEAFE) and blue border
  - Add shield icon centered at top
  - Display "Garantia Incondicional de 30 Dias" title
  - Add guarantee copy emphasizing "100% do dinheiro de volta"
  - Insert trust badges row (lock, check, clock icons)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 12. Implement urgency/countdown section
  - Create callout box with light orange background and orange border
  - Build countdown timer display with 4 boxes (days, hours, minutes, seconds)
  - Style timer boxes with white background and large numbers
  - Add bonus consultation offer text with strikethrough value
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 12.1 Code countdown timer JavaScript
  - Write JavaScript to calculate time remaining from 48-hour deadline
  - Update timer display every second
  - Store start time in localStorage to persist across page reloads
  - Handle timer expiration by updating section to show standard offer
  - Test timer accuracy and persistence
  - _Requirements: 10.1, 10.4, 10.5_

- [ ] 13. Create FAQ accordion section
  - Build accordion with minimum 6 FAQ items
  - Implement expand/collapse functionality (reuse accordion JS)
  - Style questions with Montserrat SemiBold 18px
  - Style answers with Inter Regular 16px and proper line-height
  - Add plus/minus toggle icons
  - Include CTA link within FAQ section
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 14. Build final CTA/pricing section
  - Create 2-column layout (60/40 desktop, stacked mobile)
  - Add headline and value bullets in left column
  - Build pricing card in right column with white background and blue border
  - Display strikethrough price "De R$ 1.394" and main price "R$ 497"
  - Add payment info text "à vista ou 12x no cartão"
  - _Requirements: 7.3, 7.4_

- [ ] 14.1 Implement final CTA button
  - Create CTA button matching hero button style
  - Set text to "QUERO ACESSO AGORA"
  - Link to Hotmart checkout URL with UTM parameters
  - Add trust badges row below button (SSL, Garantia, Acesso Imediato)
  - Ensure button opens checkout in new tab
  - _Requirements: 7.1, 7.2, 7.5_

- [ ] 15. Create footer component
  - Build footer with dark gray background (#1F2937)
  - Add logo/brand name and copyright text
  - Insert legal links (Política de Privacidade, Termos de Uso, Contato)
  - Add email link (mailto:contato@olcan.com)
  - Include social icons if applicable
  - Style text with white 80% opacity
  - _Requirements: 1.1_

- [ ] 16. Implement lead capture form
  - Create form with email and name fields
  - Add form validation for email format and name length
  - Style form fields with proper spacing and focus states
  - Add submit button with loading state
  - Include honeypot field for bot detection (hidden)
  - _Requirements: 11.1, 11.2_

- [ ] 16.1 Code form submission JavaScript
  - Write form submit event handler
  - Validate fields before submission
  - Display inline error messages for invalid inputs
  - Show success message after submission
  - Handle network errors with retry option
  - Prevent duplicate submissions
  - _Requirements: 11.2, 11.4, 11.5_

- [ ] 16.2 Integrate form with Mautic API
  - Set up API endpoint configuration
  - Write POST request to Mautic with form data
  - Include timestamp and UTM source in payload
  - Handle API response and errors
  - Log successful submissions
  - _Requirements: 11.3_

- [ ] 17. Implement smooth scroll navigation
  - Write JavaScript for smooth scroll to anchor links
  - Handle CTA button clicks to scroll to purchase section
  - Add scroll offset to account for fixed header
  - Ensure smooth behavior works across browsers
  - Test on mobile devices
  - _Requirements: 1.4_

- [ ] 18. Add scroll animations
  - Implement Intersection Observer for scroll-triggered animations
  - Add fade-in-up animation to sections (opacity 0→1, translateY 20px→0)
  - Set animation duration to 0.6s with ease-out easing
  - Stagger animations with 0.1s delay between elements
  - Ensure animations don't cause layout shift
  - _Requirements: 1.1_

- [ ] 19. Integrate Facebook Pixel tracking
  - Add Facebook Pixel base code to HTML head
  - Implement PageView event on page load
  - Add ViewContent event trigger at 50% scroll depth
  - Add InitiateCheckout event on CTA button clicks
  - Include content_name, value, and currency parameters
  - Test pixel firing with Facebook Pixel Helper extension
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 20. Integrate Google Analytics 4
  - Add GA4 tracking code to HTML head
  - Configure custom events for scroll depth (25%, 50%, 75%, 100%)
  - Track CTA button clicks with event parameters
  - Track FAQ accordion expansions
  - Track form submissions
  - Verify events in GA4 DebugView
  - _Requirements: 8.4, 8.5_

- [ ] 21. Implement UTM parameter handling
  - Write JavaScript to capture UTM parameters from URL
  - Store UTM values in sessionStorage
  - Append UTM parameters to Hotmart checkout URLs
  - Include utm_source, utm_medium, utm_campaign, utm_content
  - Test parameter passing through entire flow
  - _Requirements: 7.2, 8.5_

- [ ] 22. Optimize for mobile responsiveness
  - Test all sections at breakpoints: 375px, 414px, 768px, 1024px
  - Adjust font sizes for mobile (30-40% reduction)
  - Stack all multi-column layouts on mobile
  - Ensure CTA buttons are 95% width on mobile
  - Verify touch targets are minimum 44px height
  - Test on real iOS and Android devices
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 23. Implement lazy loading for images
  - Add loading="lazy" attribute to all below-fold images
  - Implement Intersection Observer for custom lazy loading if needed
  - Ensure hero image is not lazy loaded (critical resource)
  - Test lazy loading behavior on slow connections
  - Verify Largest Contentful Paint metric
  - _Requirements: 12.3, 12.4_

- [ ] 24. Optimize CSS and JavaScript
  - Minify all CSS files
  - Minify all JavaScript files
  - Remove unused CSS rules
  - Combine CSS files where appropriate
  - Defer non-critical JavaScript loading
  - Test page load speed after optimization
  - _Requirements: 12.5_

- [ ] 25. Implement accessibility features
  - Add descriptive alt text to all images
  - Ensure proper heading hierarchy (H1 → H2 → H3)
  - Add ARIA labels to interactive elements (buttons, accordions)
  - Verify keyboard navigation works for all interactive elements
  - Ensure focus indicators are visible
  - Test color contrast ratios (minimum 4.5:1)
  - _Requirements: 1.1_

- [ ] 26. Add error handling for image loading
  - Implement onerror handlers for images
  - Display placeholder or alt text if image fails to load
  - Log image loading errors to console
  - Ensure page layout doesn't break with missing images
  - _Requirements: 12.3_

- [ ] 27. Configure Hotmart checkout integration
  - Set up Hotmart product if not already created
  - Copy checkout URL and add to all CTA buttons
  - Configure UTM parameter passing
  - Test checkout flow from landing page to Hotmart
  - Verify purchase tracking webhook (if available)
  - _Requirements: 7.1, 7.2_

- [ ] 28. Perform cross-browser testing
  - Test in Chrome (latest version)
  - Test in Safari (latest version)
  - Test in Firefox (latest version)
  - Test in Edge (latest version)
  - Test in Mobile Safari on iOS
  - Test in Chrome on Android
  - Document and fix any browser-specific issues
  - _Requirements: 1.1, 6.1_

- [ ] 29. Run performance audit
  - Run Google PageSpeed Insights test
  - Achieve score ≥85 on desktop
  - Achieve score ≥75 on mobile
  - Verify First Contentful Paint ≤1.5s
  - Verify Largest Contentful Paint ≤2.5s
  - Verify Time to Interactive ≤3.5s
  - Verify Cumulative Layout Shift ≤0.1
  - Fix any performance issues identified
  - _Requirements: 12.1, 12.4, 12.5_

- [ ] 30. Conduct final QA testing
  - Test all CTA buttons link correctly to Hotmart
  - Verify smooth scroll navigation works
  - Test form submission and validation
  - Verify countdown timer accuracy and persistence
  - Test accordion expand/collapse functionality
  - Verify all tracking pixels fire correctly
  - Test on multiple devices and screen sizes
  - Proofread all copy for typos
  - Verify legal links are present and functional
  - _Requirements: 1.1, 1.4, 7.1, 8.1, 8.2, 8.3, 9.1, 11.2_

---

## Implementation Notes

### Development Environment
- This plan assumes development in a standard HTML/CSS/JavaScript environment
- For Wix implementation, tasks will need adaptation to Wix Editor workflow
- Some tasks (like accordion, countdown) may use Wix apps instead of custom code

### Task Dependencies
- Tasks 1-3 must be completed first (foundation)
- Tasks 4-15 can be done in parallel after foundation is set
- Tasks 16-21 (integrations) can be done independently
- Tasks 22-30 (optimization and testing) should be done last

### Optional Tasks
- Tasks marked with * are optional and can be skipped for MVP
- No tasks are marked optional in this plan as all are core functionality

### Testing Approach
- Test each component immediately after building it
- Perform integration testing after completing related groups of tasks
- Final QA testing (task 30) validates entire page

### Time Estimates
- Foundation (tasks 1-3): 4-6 hours
- Core sections (tasks 4-15): 12-16 hours
- Integrations (tasks 16-21): 6-8 hours
- Optimization (tasks 22-27): 6-8 hours
- Testing (tasks 28-30): 4-6 hours
- **Total estimated time: 32-44 hours**

---

**Implementation Plan Version:** 1.0  
**Last Updated:** 2025-11-17  
**Total Tasks:** 30 main tasks with sub-tasks  
**Estimated Completion:** 1-2 weeks for solo developer
