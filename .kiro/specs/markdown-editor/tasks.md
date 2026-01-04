# Implementation Plan: Markdown Editor

## Overview

Реализация Markdown Editor будет выполнена поэтапно, начиная с базовой структуры и постепенно добавляя функциональность. Каждый этап включает написание кода и соответствующих тестов для обеспечения качества и корректности.

## Tasks

- [x] 1. Setup project structure and basic HTML layout
  - Create index.html with semantic structure (header, main, footer)
  - Add meta tags with author information "Шоназаров Аброр, группа 085 23"
  - Include basic CSS and JavaScript file references
  - Add proper accessibility attributes and ARIA labels
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 4.3_

- [ ]* 1.1 Write unit tests for HTML structure validation
  - Test that required elements exist with correct attributes
  - Test author information display in header and footer
  - _Requirements: 12.1, 12.2, 12.3, 12.5_

- [x] 2. Implement core CSS styling and responsive layout
  - [x] 2.1 Create CSS custom properties for theme system
    - Define color variables for light and dark themes
    - Set up CSS custom properties for spacing, typography, and transitions
    - _Requirements: 5.1, 5.5_

  - [x] 2.2 Implement responsive grid layout
    - Create CSS Grid layout for desktop split view
    - Implement Flexbox components for toolbar and controls
    - Add mobile-first responsive breakpoints (320px to 1200px+)
    - _Requirements: 4.1, 11.3, 11.4_

  - [ ]* 2.3 Write property test for responsive layout
    - **Property 8: Responsive Layout Adaptation**
    - **Validates: Requirements 4.1**

  - [x] 2.4 Add accessibility and focus styles
    - Implement visible focus indicators for all interactive elements
    - Ensure sufficient color contrast for text readability
    - Add smooth transitions for theme changes
    - _Requirements: 4.4, 4.5, 5.5_

- [x] 3. Create basic JavaScript application structure
  - [x] 3.1 Implement main App Controller class
    - Create MarkdownEditor class with init(), setState(), getState() methods
    - Set up global application state management
    - Initialize loading state display (400-700ms)
    - _Requirements: 9.1_

  - [x] 3.2 Implement Theme System
    - Create ThemeManager class with theme detection and switching
    - Implement prefers-color-scheme detection for first visit
    - Add theme toggle functionality with localStorage persistence
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 3.3 Write unit tests for theme system
    - Test theme switching functionality
    - Test localStorage persistence
    - Test system preference detection
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 4. Implement Markdown Parser
  - [x] 4.1 Create basic MarkdownParser class structure
    - Implement parse() method with basic text processing
    - Add support for headers (# ## ###)
    - Add support for paragraphs and line breaks
    - _Requirements: 2.1, 2.12_

  - [x] 4.2 Add inline formatting support
    - Implement bold (**text**), italic (*text*), strikethrough (~~text~~)
    - Add inline code (`code`) support
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [x] 4.3 Add block elements support
    - Implement code blocks (```) with proper escaping
    - Add blockquotes (> text) support
    - Add horizontal rules (---) support
    - _Requirements: 2.6, 2.9, 2.11_

  - [x] 4.4 Implement lists support
    - Add unordered lists (- item, * item) parsing
    - Add ordered lists (1. item) parsing
    - Handle nested lists correctly
    - _Requirements: 2.7, 2.8_

  - [x] 4.5 Add links support with URL validation
    - Implement link parsing ([text](url))
    - Add URL validation for http/https protocols only
    - _Requirements: 2.10_

  - [ ]* 4.6 Write property test for Markdown parsing
    - **Property 1: Markdown Parsing Round-trip Consistency**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.11, 2.12**

  - [ ]* 4.7 Write property test for URL validation
    - **Property 4: URL Validation Safety**
    - **Validates: Requirements 2.10, 8.3**

- [x] 5. Implement HTML Sanitizer for security
  - [x] 5.1 Create HTMLSanitizer class
    - Implement sanitize() method with whitelist approach
    - Define allowed tags: h1, h2, h3, p, strong, em, del, code, pre, ul, ol, li, blockquote, a, hr
    - Add attribute filtering for security
    - _Requirements: 8.1, 8.2_

  - [x] 5.2 Add HTML escaping for code content
    - Implement escapeHTML() method for special characters
    - Ensure code blocks and inline code are properly escaped
    - _Requirements: 8.4_

  - [ ]* 5.3 Write property test for HTML sanitization
    - **Property 3: HTML Sanitization Security**
    - **Validates: Requirements 8.1, 8.2, 8.4**

- [x] 6. Checkpoint - Core parsing and security complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement live preview functionality
  - [x] 7.1 Create UIManager class for preview updates
    - Implement updatePreview() method
    - Connect editor input to real-time preview updates
    - Add empty state placeholder for preview panel
    - _Requirements: 1.1, 1.2, 9.2_

  - [x] 7.2 Add content counters
    - Implement character, word, and line counting
    - Update counters in real-time as user types
    - Display counters in the UI
    - _Requirements: 3.5_

  - [ ]* 7.3 Write property test for real-time updates
    - **Property 2: Real-time Preview Updates**
    - **Validates: Requirements 1.1**

  - [ ]* 7.4 Write property test for content counters
    - **Property 6: Content Counter Accuracy**
    - **Validates: Requirements 3.5**

- [x] 8. Implement toolbar and formatting controls
  - [x] 8.1 Create toolbar UI with formatting buttons
    - Add buttons for Bold, Italic, Strike, Headers, Lists, Links, Code, Quotes
    - Implement button styling with hover/active/disabled states
    - _Requirements: 3.3, 9.5_

  - [x] 8.2 Implement formatting insertion logic
    - Create insertFormatting() method for cursor/selection handling
    - Add Markdown syntax insertion for each formatting type
    - Handle text selection and cursor position correctly
    - _Requirements: 3.4_

  - [ ]* 8.3 Write property test for toolbar formatting
    - **Property 5: Toolbar Formatting Insertion**
    - **Validates: Requirements 3.4**

- [x] 9. Add keyboard shortcuts support
  - [x] 9.1 Create KeyboardHandler class
    - Implement keyboard event handling for Ctrl/Cmd+B, I, K, S
    - Add Escape key handling for modal closing
    - Connect shortcuts to formatting functions
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 9.2 Write unit tests for keyboard shortcuts
    - Test each keyboard shortcut functionality
    - Test cross-platform Ctrl/Cmd key handling
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 10. Implement data persistence and auto-save
  - [x] 10.1 Create StorageManager class
    - Implement localStorage save/load functionality
    - Add error handling for quota exceeded and unavailable storage
    - _Requirements: 6.2, 6.4_

  - [x] 10.2 Add auto-save with debouncing
    - Implement debounced auto-save (300-500ms delay)
    - Show save confirmation toast notifications
    - _Requirements: 6.1, 6.3_

  - [ ]* 10.3 Write property test for auto-save debouncing
    - **Property 7: Auto-save Debouncing**
    - **Validates: Requirements 6.1**

  - [ ]* 10.4 Write unit tests for storage functionality
    - Test content save/restore functionality
    - Test error handling for storage issues
    - _Requirements: 6.2, 6.4_

- [x] 11. Implement view modes and layout controls
  - [x] 11.1 Add view mode switching
    - Implement Split, Editor Only, Preview Only modes
    - Create mode toggle controls in the UI
    - Add responsive behavior (tabs on mobile, split on desktop)
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 11.2 Add view mode persistence
    - Save selected view mode to localStorage
    - Restore view mode on application load
    - _Requirements: 11.5_

  - [ ]* 11.3 Write unit tests for view modes
    - Test all three view modes functionality
    - Test responsive layout switching
    - Test view mode persistence
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 12. Add utility features
  - [x] 12.1 Implement Clear and Copy functionality
    - Add Clear button to empty editor content
    - Add Copy button to copy content to clipboard
    - Show toast notifications for user feedback
    - _Requirements: 3.1, 3.2, 9.4_

  - [x] 12.2 Add file export functionality
    - Implement download .md file feature
    - Implement download .html file feature (with proper HTML structure)
    - _Requirements: 3.6_

  - [ ]* 12.3 Write unit tests for utility features
    - Test clear and copy functionality
    - Test file export features
    - _Requirements: 3.1, 3.2, 3.6_

- [x] 13. Implement Help system and documentation
  - [x] 13.1 Create Help modal with Markdown syntax reference
    - Design and implement modal dialog
    - Add comprehensive Markdown syntax examples
    - Ensure keyboard accessibility with focus trapping
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 13.2 Add modal accessibility features
    - Implement proper ARIA attributes (aria-modal, aria-labelledby)
    - Add Escape key and close button functionality
    - Ensure focus management and screen reader support
    - _Requirements: 10.4, 10.5, 4.6_

  - [ ]* 13.3 Write unit tests for Help system
    - Test modal opening/closing functionality
    - Test keyboard accessibility features
    - Test ARIA attributes presence
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 14. Add toast notification system
  - [x] 14.1 Implement toast notification component
    - Create showToast() method with different message types
    - Add auto-dismiss functionality with appropriate timing
    - Ensure notifications are accessible with aria-live regions
    - _Requirements: 9.4, 4.6_

  - [ ]* 14.2 Write unit tests for toast notifications
    - Test toast display and auto-dismiss
    - Test accessibility features
    - _Requirements: 9.4, 4.6_

- [x] 15. Final integration and polish
  - [x] 15.1 Complete application integration
    - Wire all components together in main app controller
    - Ensure proper initialization order and error handling
    - Add final UI polish and animations
    - _Requirements: All requirements integration_

  - [x] 15.2 Add comprehensive error handling
    - Implement parser error recovery for malformed Markdown
    - Add graceful degradation for unsupported features
    - Ensure application stability under all conditions
    - _Requirements: 9.3_

  - [ ]* 15.3 Write integration tests
    - Test complete user workflows end-to-end
    - Test error scenarios and recovery
    - Test cross-browser compatibility
    - _Requirements: All requirements validation_

- [x] 16. Final checkpoint and validation
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all requirements are met and documented
  - Prepare REPORT.md with comprehensive project documentation

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties using fast-check library
- Unit tests validate specific examples and edge cases
- Integration tests ensure complete user workflows function correctly
- All tests should run with minimum 100 iterations for property-based tests