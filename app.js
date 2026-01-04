/**
 * Markdown Editor Application
 * Author: Шоназаров Аброр, группа 085 23
 * Variant: 17
 */

'use strict';

// ===== APPLICATION STATE =====

const appState = {
  content: '',
  theme: 'auto',
  viewMode: 'split',
  isLoading: true,
  lastSaved: null,
  counters: {
    characters: 0,
    words: 0,
    lines: 1
  },
  isInitialized: false
};

// ===== MAIN APPLICATION CONTROLLER =====

class MarkdownEditor {
  constructor() {
    this.state = { ...appState };
    this.elements = {};
    this.debounceTimers = new Map();
    this.isKeyboardNavigation = false;
    
    // Bind methods to preserve context
    this.init = this.init.bind(this);
    this.setState = this.setState.bind(this);
    this.getState = this.getState.bind(this);
    this.render = this.render.bind(this);
    this.handleKeyboardNavigation = this.handleKeyboardNavigation.bind(this);
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('Initializing Markdown Editor...');
      
      // Show loading state
      this.showLoadingState();
      
      // Cache DOM elements
      this.cacheElements();
      
      // Initialize components
      this.initializeComponents();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Load saved state
      await this.loadSavedState();
      
      // Simulate loading time (400-700ms as per requirements)
      const loadingTime = 500 + Math.random() * 200; // 500-700ms
      await this.delay(loadingTime);
      
      // Hide loading and show app
      this.hideLoadingState();
      
      // Mark as initialized
      this.setState({ isInitialized: true });
      
      console.log('Markdown Editor initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize Markdown Editor:', error);
      this.showError('Ошибка инициализации приложения');
    }
  }

  /**
   * Cache DOM elements for performance
   */
  cacheElements() {
    this.elements = {
      // Main containers
      loadingOverlay: document.getElementById('loading-overlay'),
      app: document.getElementById('app'),
      
      // Editor elements
      editor: document.getElementById('editor'),
      preview: document.getElementById('preview'),
      editorPanel: document.getElementById('editor-panel'),
      previewPanel: document.getElementById('preview-panel'),
      editorContainer: document.querySelector('.editor-container'),
      
      // Stats
      charCount: document.getElementById('char-count'),
      wordCount: document.getElementById('word-count'),
      lineCount: document.getElementById('line-count'),
      
      // Controls
      themeToggle: document.getElementById('theme-toggle'),
      helpButton: document.getElementById('help-button'),
      aboutButton: document.getElementById('about-button'),
      clearBtn: document.getElementById('clear-btn'),
      copyBtn: document.getElementById('copy-btn'),
      downloadMd: document.getElementById('download-md'),
      downloadHtml: document.getElementById('download-html'),
      
      // View controls
      viewButtons: document.querySelectorAll('.view-btn'),
      
      // Toolbar
      toolbarButtons: document.querySelectorAll('.toolbar-btn[data-format]'),
      
      // Modal
      helpModal: document.getElementById('help-modal'),
      helpClose: document.getElementById('help-close'),
      aboutModal: document.getElementById('about-modal'),
      aboutClose: document.getElementById('about-close'),
      modalOverlay: document.querySelector('.modal-overlay'),
      
      // Containers
      toastContainer: document.getElementById('toast-container'),
      errorContainer: document.getElementById('error-container')
    };
    
    // Debug: Check if help button is found
    console.log('=== ELEMENT CACHING DEBUG ===');
    console.log('Help button element:', this.elements.helpButton);
    console.log('Help modal element:', this.elements.helpModal);
    console.log('Help close element:', this.elements.helpClose);
    console.log('Modal overlay element:', this.elements.modalOverlay);
    
    // Additional debugging for help button
    if (this.elements.helpButton) {
      console.log('Help button ID:', this.elements.helpButton.id);
      console.log('Help button class:', this.elements.helpButton.className);
      console.log('Help button parent:', this.elements.helpButton.parentElement);
    }
    
    if (this.elements.helpModal) {
      console.log('Help modal ID:', this.elements.helpModal.id);
      console.log('Help modal class:', this.elements.helpModal.className);
    }
    
    // Validate critical elements
    const criticalElements = ['editor', 'preview', 'app', 'loadingOverlay'];
    for (const elementName of criticalElements) {
      if (!this.elements[elementName]) {
        throw new Error(`Critical element not found: ${elementName}`);
      }
    }
  }

  /**
   * Initialize all components
   */
  initializeComponents() {
    console.log('Initializing components...');
    
    // Initialize theme system
    if (window.ThemeManager) {
      console.log('ThemeManager available, initializing...');
      this.themeManager = new ThemeManager();
      this.themeManager.init();
    } else {
      console.warn('ThemeManager not available');
    }
    
    // Initialize storage manager
    if (window.StorageManager) {
      console.log('StorageManager available, initializing...');
      this.storageManager = new StorageManager();
    } else {
      console.warn('StorageManager not available');
    }
    
    // Initialize markdown parser
    if (window.MarkdownParser) {
      console.log('MarkdownParser available, initializing...');
      this.markdownParser = new MarkdownParser();
    } else {
      console.warn('MarkdownParser not available');
    }
    
    // Initialize HTML sanitizer
    if (window.HTMLSanitizer) {
      console.log('HTMLSanitizer available, initializing...');
      this.htmlSanitizer = new HTMLSanitizer();
    } else {
      console.warn('HTMLSanitizer not available');
    }
    
    // Initialize UI manager
    if (window.UIManager) {
      console.log('UIManager available, initializing...');
      this.uiManager = new UIManager(this);
      this.uiManager.initializeLayout();
      this.uiManager.setupEventListeners();
      console.log('UIManager initialized successfully');
    } else {
      console.error('UIManager not available! This will cause view mode buttons to not work.');
    }
    
    // Initialize keyboard handler
    if (window.KeyboardHandler) {
      console.log('KeyboardHandler available, initializing...');
      this.keyboardHandler = new KeyboardHandler(this);
      this.keyboardHandler.init();
    } else {
      console.warn('KeyboardHandler not available');
    }
    
    // Initialize formatting manager
    if (window.FormattingManager) {
      console.log('FormattingManager available, initializing...');
      this.formattingManager = new FormattingManager(this);
    } else {
      console.warn('FormattingManager not available');
    }
    
    console.log('Component initialization completed');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Keyboard navigation detection
    document.addEventListener('keydown', this.handleKeyboardNavigation);
    document.addEventListener('mousedown', () => {
      this.isKeyboardNavigation = false;
      document.body.classList.remove('keyboard-navigation');
    });
    
    // Drag & Drop functionality
    this.setupDragAndDrop();
    
    // Editor input events
    if (this.elements.editor) {
      this.elements.editor.addEventListener('input', (e) => {
        this.handleEditorInput(e.target.value);
      });
      
      this.elements.editor.addEventListener('keyup', (e) => {
        this.handleEditorInput(e.target.value);
      });
      
      this.elements.editor.addEventListener('paste', (e) => {
        // Handle paste with slight delay to get the pasted content
        setTimeout(() => {
          this.handleEditorInput(e.target.value);
        }, 10);
      });
      
      this.elements.editor.addEventListener('scroll', () => {
        this.syncScroll();
      });
    }
    
    // Theme toggle
    if (this.elements.themeToggle) {
      this.elements.themeToggle.addEventListener('click', () => {
        if (this.themeManager) {
          this.themeManager.toggleTheme();
        }
      });
    }
    
    // About modal
    if (this.elements.aboutButton) {
      console.log('About button found, adding event listener');
      this.elements.aboutButton.addEventListener('click', (e) => {
        console.log('About button clicked!');
        this.showAboutModal();
      });
      
      // Make sure SVG elements don't interfere with pointer events
      const svg = this.elements.aboutButton.querySelector('svg');
      if (svg) {
        svg.style.pointerEvents = 'none';
      }
    } else {
      console.error('About button not found!');
    }
    
    // Help modal
    if (this.elements.helpButton) {
      console.log('Help button found, adding event listener');
      console.log('Help button element:', this.elements.helpButton);
      
      // Add event listener to the button itself
      this.elements.helpButton.addEventListener('click', (e) => {
        console.log('=== HELP BUTTON CLICK EVENT ===');
        console.log('Event:', e);
        console.log('Event target:', e.target);
        console.log('Event currentTarget:', e.currentTarget);
        console.log('UIManager available:', !!this.uiManager);
        
        // Ensure we're handling the click regardless of what element was actually clicked
        this.showHelpModal();
      });
      
      // Also add event listeners to child elements (SVG) to ensure clicks are captured
      const svgElements = this.elements.helpButton.querySelectorAll('svg, svg *');
      svgElements.forEach(element => {
        element.addEventListener('click', (e) => {
          console.log('SVG element clicked, delegating to button');
          e.preventDefault();
          e.stopPropagation();
          this.showHelpModal();
        });
      });
      
      // Make sure SVG elements don't interfere with pointer events
      const svg = this.elements.helpButton.querySelector('svg');
      if (svg) {
        svg.style.pointerEvents = 'none';
        console.log('Set SVG pointer-events to none');
      }
      
      console.log('Event listeners added to help button');
      
    } else {
      console.error('Help button not found!');
    }
    
    // Fullscreen toggle
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        this.toggleFullscreen();
      });
    }
    
    // F11 key for fullscreen
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F11') {
        e.preventDefault();
        this.toggleFullscreen();
      }
    });
    
    if (this.elements.aboutClose) {
      console.log('About close button found, adding event listener');
      this.elements.aboutClose.addEventListener('click', () => {
        console.log('About close button clicked');
        this.hideAboutModal();
      });
    } else {
      console.log('About close button not found');
    }
    
    if (this.elements.helpClose) {
      console.log('Help close button found, adding event listener');
      this.elements.helpClose.addEventListener('click', () => {
        console.log('Help close button clicked');
        this.hideHelpModal();
      });
    } else {
      console.log('Help close button not found');
    }
    
    // Modal overlay handlers - need to handle both modals
    const helpModalOverlay = this.elements.helpModal?.querySelector('.modal-overlay');
    const aboutModalOverlay = this.elements.aboutModal?.querySelector('.modal-overlay');
    
    if (helpModalOverlay) {
      console.log('Help modal overlay found, adding event listener');
      helpModalOverlay.addEventListener('click', () => {
        console.log('Help modal overlay clicked');
        this.hideHelpModal();
      });
    } else {
      console.log('Help modal overlay not found');
    }
    
    if (aboutModalOverlay) {
      console.log('About modal overlay found, adding event listener');
      aboutModalOverlay.addEventListener('click', () => {
        console.log('About modal overlay clicked');
        this.hideAboutModal();
      });
    } else {
      console.log('About modal overlay not found');
    }
    
    // View mode controls
    this.elements.viewButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        console.log('View button clicked:', e.currentTarget.dataset.view);
        const viewMode = e.currentTarget.dataset.view;
        this.setViewMode(viewMode);
      });
    });
    
    // Utility buttons
    if (this.elements.clearBtn) {
      this.elements.clearBtn.addEventListener('click', () => {
        this.clearEditor();
      });
    }
    
    if (this.elements.copyBtn) {
      this.elements.copyBtn.addEventListener('click', () => {
        this.copyContent();
      });
    }
    
    if (this.elements.downloadMd) {
      this.elements.downloadMd.addEventListener('click', () => {
        this.downloadMarkdown();
      });
    }
    
    if (this.elements.downloadHtml) {
      this.elements.downloadHtml.addEventListener('click', () => {
        this.downloadHTML();
      });
    }
    
    const downloadPdf = document.getElementById('download-pdf');
    if (downloadPdf) {
      downloadPdf.addEventListener('click', () => {
        this.downloadPDF();
      });
    }
    
    // Toolbar formatting buttons
    this.elements.toolbarButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const format = e.currentTarget.dataset.format;
        this.insertFormatting(format);
      });
    });
    
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (this.keyboardHandler) {
        this.keyboardHandler.handleShortcut(e);
      }
    });
    
    // Global click listener for debugging
    document.addEventListener('click', (e) => {
      if (e.target.id === 'help-button' || e.target.closest('#help-button')) {
        console.log('=== GLOBAL CLICK LISTENER DETECTED HELP BUTTON CLICK ===');
        console.log('Target:', e.target);
        console.log('Closest help button:', e.target.closest('#help-button'));
      }
    });
    
    // Window events
    window.addEventListener('beforeunload', () => {
      if (this.storageManager) {
        this.storageManager.saveContent(this.state.content);
        this.storageManager.saveSettings({
          theme: this.state.theme,
          viewMode: this.state.viewMode
        });
      }
    });
    
    // Resize handler for responsive behavior
    window.addEventListener('resize', this.debounce(() => {
      this.handleResize();
    }, 250));
  }

  /**
   * Handle keyboard navigation detection
   */
  handleKeyboardNavigation(e) {
    if (e.key === 'Tab') {
      this.isKeyboardNavigation = true;
      document.body.classList.add('keyboard-navigation');
    }
  }

  /**
   * Update application state
   */
  setState(newState) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };
    
    // Trigger re-render if needed
    this.render(prevState);
    
    // Auto-save content changes
    if (newState.content !== undefined && newState.content !== prevState.content) {
      this.autoSave();
    }
  }

  /**
   * Get current application state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Render application based on current state
   */
  render(prevState = {}) {
    // Update counters if content changed
    if (this.state.content !== prevState.content) {
      this.updateCounters();
      this.updatePreview();
    }
    
    // Update view mode if changed
    if (this.state.viewMode !== prevState.viewMode) {
      this.updateViewMode();
    }
    
    // Update theme if changed
    if (this.state.theme !== prevState.theme) {
      this.updateTheme();
    }
  }

  /**
   * Show loading state
   */
  showLoadingState() {
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.style.display = 'flex';
      this.elements.loadingOverlay.setAttribute('aria-hidden', 'false');
    }
    
    if (this.elements.app) {
      this.elements.app.style.display = 'none';
    }
  }

  /**
   * Hide loading state and show main app
   */
  hideLoadingState() {
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.classList.add('fade-out');
      
      setTimeout(() => {
        this.elements.loadingOverlay.style.display = 'none';
        this.elements.loadingOverlay.setAttribute('aria-hidden', 'true');
      }, 300);
    }
    
    if (this.elements.app) {
      this.elements.app.style.display = 'grid';
    }
  }

  /**
   * Load saved state from storage
   */
  async loadSavedState() {
    if (!this.storageManager) return;
    
    try {
      // Load content
      const savedContent = this.storageManager.loadContent();
      if (savedContent) {
        this.setState({ content: savedContent });
        if (this.elements.editor) {
          this.elements.editor.value = savedContent;
        }
      }
      
      // Load settings
      const savedSettings = this.storageManager.loadSettings();
      if (savedSettings) {
        if (savedSettings.theme) {
          this.setState({ theme: savedSettings.theme });
        }
        if (savedSettings.viewMode) {
          this.setState({ viewMode: savedSettings.viewMode });
        }
      }
      
    } catch (error) {
      console.warn('Failed to load saved state:', error);
    }
  }

  /**
   * Handle editor input with debouncing
   */
  handleEditorInput(content) {
    this.setState({ content });
    
    // Debounce preview updates to prevent infinite loops
    this.debounce(() => {
      this.updatePreview();
    }, 150, 'previewUpdate')();
  }

  /**
   * Update content counters
   */
  updateCounters() {
    const content = this.state.content;
    
    const counters = {
      characters: content.length,
      words: content.trim() ? content.trim().split(/\s+/).length : 0,
      lines: content.split('\n').length
    };
    
    this.setState({ counters });
    
    // Update UI
    if (this.elements.charCount) {
      this.elements.charCount.textContent = counters.characters;
    }
    if (this.elements.wordCount) {
      this.elements.wordCount.textContent = counters.words;
    }
    if (this.elements.lineCount) {
      this.elements.lineCount.textContent = counters.lines;
    }
  }

  /**
   * Update preview content
   */
  updatePreview() {
    if (!this.elements.preview) return;
    
    const content = this.state.content.trim();
    
    if (!content) {
      // Show empty state
      this.elements.preview.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10,9 9,9 8,9"></polyline>
          </svg>
          <h3>Начните печатать Markdown...</h3>
          <p>Ваш текст будет отображаться здесь в реальном времени</p>
        </div>
      `;
      return;
    }
    
    try {
      // Parse markdown to HTML
      let html = '';
      if (this.markdownParser) {
        html = this.markdownParser.parse(content);
      } else {
        // Fallback: simple text display
        html = `<p>${this.escapeHTML(content)}</p>`;
      }
      
      // Sanitize HTML for security
      if (this.htmlSanitizer) {
        html = this.htmlSanitizer.sanitize(html);
      }
      
      this.elements.preview.innerHTML = html;
      
    } catch (error) {
      console.error('Preview update failed:', error);
      this.showError('Ошибка обновления предпросмотра');
    }
  }

  /**
   * Auto-save content with debouncing
   */
  autoSave() {
    if (!this.storageManager) return;
    
    this.debounce(() => {
      try {
        this.storageManager.saveContent(this.state.content);
        this.setState({ lastSaved: Date.now() });
        this.showToast('Автосохранение выполнено', 'success');
      } catch (error) {
        console.warn('Auto-save failed:', error);
      }
    }, 400, 'autoSave')();
  }

  /**
   * Utility: Debounce function calls
   */
  debounce(func, delay, key = 'default') {
    return (...args) => {
      if (this.debounceTimers.has(key)) {
        clearTimeout(this.debounceTimers.get(key));
      }
      
      const timer = setTimeout(() => {
        func.apply(this, args);
        this.debounceTimers.delete(key);
      }, delay);
      
      this.debounceTimers.set(key, timer);
    };
  }

  /**
   * Utility: Create delay promise
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Utility: Escape HTML characters
   */
  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    if (this.uiManager && this.uiManager.showToast) {
      this.uiManager.showToast(message, type);
    } else {
      console.log(`Toast (${type}): ${message}`);
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    if (this.uiManager && this.uiManager.showError) {
      this.uiManager.showError(message);
    } else {
      console.error(`Error: ${message}`);
    }
  }

  /**
   * Placeholder methods for features to be implemented
   */
  
  updateViewMode() {
    // Will be implemented with UIManager
    console.log('View mode updated to:', this.state.viewMode);
  }
  
  updateTheme() {
    // Will be implemented with ThemeManager
    console.log('Theme updated to:', this.state.theme);
  }
  
  setViewMode(mode) {
    console.log('MarkdownEditor.setViewMode called with:', mode);
    this.setState({ viewMode: mode });
    
    // Also update the UI through UIManager
    if (this.uiManager) {
      console.log('Calling UIManager.setViewMode with:', mode);
      this.uiManager.setViewMode(mode);
    } else {
      console.warn('UIManager not available for setViewMode, using fallback');
      // Fallback: direct CSS manipulation
      this.setViewModeFallback(mode);
    }
  }
  
  setViewModeFallback(mode) {
    console.log('Using fallback setViewMode for:', mode);
    
    if (!['split', 'editor', 'preview'].includes(mode)) {
      console.warn('Invalid view mode:', mode);
      return;
    }
    
    const container = this.elements.editorContainer;
    if (!container) {
      console.error('Editor container not found!');
      return;
    }
    
    // Remove existing view classes
    container.classList.remove('view-split', 'view-editor', 'view-preview');
    
    // Add new view class
    const newClass = `view-${mode}`;
    container.classList.add(newClass);
    
    console.log('Fallback: Added class:', newClass, 'Container classes:', container.className);
    
    // Update view buttons
    this.elements.viewButtons.forEach(button => {
      const buttonMode = button.dataset.view;
      const isActive = buttonMode === mode;
      
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', isActive.toString());
    });
    
    console.log('Fallback view mode set to:', mode);
  }
  
  showAboutModal() {
    console.log('showAboutModal called');
    if (this.uiManager) {
      console.log('UIManager available, calling uiManager.showAboutModal');
      this.uiManager.showAboutModal();
    } else {
      console.log('UIManager not available for showAboutModal, trying direct modal manipulation');
      // Fallback: direct modal manipulation
      const modal = this.elements.aboutModal;
      console.log('About modal element (fallback):', modal);
      if (modal) {
        console.log('Adding show class directly to modal');
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
      } else {
        console.error('About modal element not found in fallback!');
      }
    }
  }
  
  hideAboutModal() {
    if (this.uiManager) {
      this.uiManager.hideAboutModal();
    } else {
      console.log('UIManager not available for hideAboutModal');
      const modal = this.elements.aboutModal;
      if (modal) {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
      }
    }
  }
  
  showHelpModal() {
    console.log('showHelpModal called');
    console.log('UIManager available:', !!this.uiManager);
    if (this.uiManager) {
      console.log('UIManager available, calling uiManager.showHelpModal');
      this.uiManager.showHelpModal();
    } else {
      console.log('UIManager not available for showHelpModal, trying direct modal manipulation');
      // Fallback: direct modal manipulation
      const modal = this.elements.helpModal;
      console.log('Help modal element (fallback):', modal);
      if (modal) {
        console.log('Adding show class directly to modal');
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
      } else {
        console.error('Help modal element not found in fallback!');
      }
    }
  }
  
  hideHelpModal() {
    if (this.uiManager) {
      this.uiManager.hideHelpModal();
    } else {
      console.log('UIManager not available for hideHelpModal');
    }
  }
  
  clearEditor() {
    console.log('Clear editor');
  }
  
  copyContent() {
    console.log('Copy content');
  }
  
  downloadMarkdown() {
    console.log('Download markdown');
  }
  
  downloadHTML() {
    console.log('Download HTML');
  }
  
  downloadPDF() {
    try {
      const content = this.state.content.trim();
      if (!content) {
        this.showToast('Нет контента для экспорта', 'warning');
        return;
      }
      
      // Create a new window with the content for printing
      const printWindow = window.open('', '_blank');
      
      let html = '';
      if (this.markdownParser) {
        html = this.markdownParser.parse(content);
      } else {
        html = `<p>${this.escapeHTML(content)}</p>`;
      }
      
      if (this.htmlSanitizer) {
        html = this.htmlSanitizer.sanitize(html);
      }
      
      const printHTML = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Markdown Document - Шоназаров Аброр</title>
    <style>
        @media print {
            body { margin: 0; }
            @page { margin: 2cm; }
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: none;
        }
        h1, h2, h3 { 
            color: #2563eb; 
            page-break-after: avoid;
        }
        code {
            background: #f1f5f9;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: 'SF Mono', Monaco, monospace;
        }
        pre {
            background: #f8f8f8;
            padding: 1rem;
            border-radius: 5px;
            page-break-inside: avoid;
        }
        blockquote {
            border-left: 4px solid #3498db;
            background: #f9f9f9;
            padding: 1rem;
            margin: 1rem 0;
            page-break-inside: avoid;
        }
        a { color: #3498db; }
        hr {
            border: none;
            height: 2px;
            background: #eee;
            margin: 2rem 0;
        }
        .footer {
            position: fixed;
            bottom: 1cm;
            right: 2cm;
            font-size: 0.8em;
            color: #666;
        }
    </style>
</head>
<body>
${html}
<div class="footer">Создано в Markdown Editor - Шоназаров Аброр, группа 085 23</div>
<script>
    window.onload = function() {
        window.print();
        setTimeout(() => window.close(), 1000);
    };
</script>
</body>
</html>`;
      
      printWindow.document.write(printHTML);
      printWindow.document.close();
      
      this.showToast('Открыто окно печати PDF', 'success');
    } catch (error) {
      console.error('PDF export failed:', error);
      this.showToast('Ошибка экспорта PDF', 'error');
    }
  }
  
  insertFormatting(format) {
    console.log('Insert formatting:', format);
  }
  
  syncScroll() {
    if (!this.elements.editor || !this.elements.preview) return;
    
    // Prevent infinite scroll loop
    if (this._syncingScroll) return;
    this._syncingScroll = true;
    
    const editor = this.elements.editor;
    const preview = this.elements.preview;
    
    // Calculate scroll percentage
    const scrollTop = editor.scrollTop;
    const scrollHeight = editor.scrollHeight - editor.clientHeight;
    const scrollPercent = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
    
    // Apply to preview
    const previewScrollHeight = preview.scrollHeight - preview.clientHeight;
    const previewScrollTop = previewScrollHeight * scrollPercent;
    
    preview.scrollTop = previewScrollTop;
    
    // Reset sync flag after a short delay
    setTimeout(() => {
      this._syncingScroll = false;
    }, 50);
  }
  
  handleResize() {
    console.log('Handle resize');
  }
  
  /**
   * Set up drag and drop functionality
   */
  setupDragAndDrop() {
    const dropZone = this.elements.app;
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, this.preventDefaults, false);
      document.body.addEventListener(eventName, this.preventDefaults, false);
    });
    
    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => this.highlight(), false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => this.unhighlight(), false);
    });
    
    // Handle dropped files
    dropZone.addEventListener('drop', (e) => this.handleDrop(e), false);
  }
  
  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  highlight() {
    this.elements.app.classList.add('drag-over');
  }
  
  unhighlight() {
    this.elements.app.classList.remove('drag-over');
  }
  
  handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    this.handleFiles(files);
  }
  
  handleFiles(files) {
    ([...files]).forEach(this.handleFile.bind(this));
  }
  
  handleFile(file) {
    // Only accept markdown and text files
    const validTypes = ['text/markdown', 'text/plain', 'application/octet-stream'];
    const validExtensions = ['.md', '.markdown', '.txt'];
    
    const isValidType = validTypes.includes(file.type);
    const isValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType && !isValidExtension) {
      this.showToast(`Неподдерживаемый тип файла: ${file.name}`, 'error');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target.result;
      this.setState({ content });
      
      if (this.elements.editor) {
        this.elements.editor.value = content;
      }
      
      this.showToast(`Файл загружен: ${file.name}`, 'success');
    };
    
    reader.onerror = () => {
      this.showToast(`Ошибка чтения файла: ${file.name}`, 'error');
    };
    
    reader.readAsText(file);
  }
  
  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen() {
    const app = this.elements.app;
    const isFullscreen = app.classList.contains('fullscreen');
    
    if (isFullscreen) {
      app.classList.remove('fullscreen');
      this.showToast('Обычный режим', 'info');
    } else {
      app.classList.add('fullscreen');
      this.showToast('Полноэкранный режим (F11 для выхода)', 'info');
    }
  }
}

// ===== APPLICATION INITIALIZATION =====

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('=== DOM LOADED - CHECKING CLASSES ===');
  console.log('ThemeManager:', typeof window.ThemeManager);
  console.log('MarkdownParser:', typeof window.MarkdownParser);
  console.log('HTMLSanitizer:', typeof window.HTMLSanitizer);
  console.log('UIManager:', typeof window.UIManager);
  console.log('KeyboardHandler:', typeof window.KeyboardHandler);
  console.log('StorageManager:', typeof window.StorageManager);
  console.log('FormattingManager:', typeof window.FormattingManager);
  console.log('=== STARTING APP INITIALIZATION ===');
  
  window.markdownEditor = new MarkdownEditor();
  window.markdownEditor.init().catch(error => {
    console.error('Failed to initialize application:', error);
  });
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MarkdownEditor, appState };
}

// Global test functions for debugging
window.testHelpButton = function() {
  console.log('=== GLOBAL HELP BUTTON TEST ===');
  const helpButton = document.getElementById('help-button');
  const helpModal = document.getElementById('help-modal');
  
  console.log('Help button:', helpButton);
  console.log('Help modal:', helpModal);
  
  if (helpButton && helpModal) {
    console.log('Both elements found, testing modal show...');
    helpModal.classList.add('show');
    helpModal.setAttribute('aria-hidden', 'false');
    console.log('Modal should now be visible');
    
    setTimeout(() => {
      console.log('Auto-hiding modal...');
      helpModal.classList.remove('show');
      helpModal.setAttribute('aria-hidden', 'true');
    }, 3000);
  } else {
    console.error('Elements not found!');
  }
};

window.testAboutButton = function() {
  console.log('=== GLOBAL ABOUT BUTTON TEST ===');
  const aboutButton = document.getElementById('about-button');
  const aboutModal = document.getElementById('about-modal');
  
  console.log('About button:', aboutButton);
  console.log('About modal:', aboutModal);
  
  if (aboutButton && aboutModal) {
    console.log('Both elements found, testing modal show...');
    aboutModal.classList.add('show');
    aboutModal.setAttribute('aria-hidden', 'false');
    console.log('About modal should now be visible');
    
    setTimeout(() => {
      console.log('Auto-hiding about modal...');
      aboutModal.classList.remove('show');
      aboutModal.setAttribute('aria-hidden', 'true');
    }, 5000);
  } else {
    console.error('Elements not found!');
  }
};

window.testHelpButtonClick = function() {
  console.log('=== TESTING HELP BUTTON CLICK ===');
  const helpButton = document.getElementById('help-button');
  if (helpButton) {
    console.log('Clicking help button programmatically...');
    helpButton.click();
  } else {
    console.error('Help button not found!');
  }
};

window.testAboutButtonClick = function() {
  console.log('=== TESTING ABOUT BUTTON CLICK ===');
  const aboutButton = document.getElementById('about-button');
  if (aboutButton) {
    console.log('Clicking about button programmatically...');
    aboutButton.click();
  } else {
    console.error('About button not found!');
  }
};
// ===== THEME MANAGER =====

class ThemeManager {
  constructor() {
    this.currentTheme = 'auto';
    this.systemPreference = 'light';
    this.storageKey = 'markdown-editor-theme';
    
    // Bind methods
    this.init = this.init.bind(this);
    this.setTheme = this.setTheme.bind(this);
    this.toggleTheme = this.toggleTheme.bind(this);
    this.detectSystemPreference = this.detectSystemPreference.bind(this);
    this.handleSystemPreferenceChange = this.handleSystemPreferenceChange.bind(this);
  }

  /**
   * Initialize theme system
   */
  init() {
    try {
      // Detect system preference
      this.detectSystemPreference();
      
      // Load saved theme preference
      const savedTheme = this.loadThemePreference();
      
      // Set initial theme
      if (savedTheme) {
        this.setTheme(savedTheme);
      } else {
        // First visit - respect system preference
        this.setTheme('auto');
      }
      
      // Listen for system preference changes
      this.setupSystemPreferenceListener();
      
      console.log('Theme system initialized');
      
    } catch (error) {
      console.error('Failed to initialize theme system:', error);
      // Fallback to light theme
      this.setTheme('light');
    }
  }

  /**
   * Set theme
   */
  setTheme(theme) {
    if (!['light', 'dark', 'auto'].includes(theme)) {
      console.warn('Invalid theme:', theme);
      return;
    }
    
    const prevTheme = this.currentTheme;
    this.currentTheme = theme;
    
    // Add transition class to prevent flashing
    document.body.classList.add('theme-transitioning');
    
    // Apply theme to document
    this.applyTheme(theme);
    
    // Save preference
    this.saveThemePreference(theme);
    
    // Update app state if available
    if (window.markdownEditor) {
      window.markdownEditor.setState({ theme });
    }
    
    // Remove transition class after animation
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 300);
    
    console.log(`Theme changed from ${prevTheme} to ${theme}`);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    let nextTheme;
    
    switch (this.currentTheme) {
      case 'light':
        nextTheme = 'dark';
        break;
      case 'dark':
        nextTheme = 'light';
        break;
      case 'auto':
        // Toggle to opposite of current system preference
        nextTheme = this.systemPreference === 'light' ? 'dark' : 'light';
        break;
      default:
        nextTheme = 'light';
    }
    
    this.setTheme(nextTheme);
  }

  /**
   * Apply theme to document
   */
  applyTheme(theme) {
    const root = document.documentElement;
    
    // Remove existing theme attributes
    root.removeAttribute('data-theme');
    
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else if (theme === 'auto') {
      // Let CSS media query handle auto theme
      // Don't set data-theme attribute
    }
    
    // Update theme toggle icon visibility
    this.updateThemeToggleIcon(theme);
  }

  /**
   * Update theme toggle icon based on current theme
   */
  updateThemeToggleIcon(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    const lightIcon = themeToggle.querySelector('.theme-icon-light');
    const darkIcon = themeToggle.querySelector('.theme-icon-dark');
    
    if (!lightIcon || !darkIcon) return;
    
    // Determine which icon to show based on effective theme
    let effectiveTheme = theme;
    if (theme === 'auto') {
      effectiveTheme = this.systemPreference;
    }
    
    if (effectiveTheme === 'dark') {
      lightIcon.style.display = 'none';
      darkIcon.style.display = 'block';
    } else {
      lightIcon.style.display = 'block';
      darkIcon.style.display = 'none';
    }
    
    // Update aria-label
    const label = effectiveTheme === 'dark' 
      ? 'Переключить на светлую тему' 
      : 'Переключить на темную тему';
    themeToggle.setAttribute('aria-label', label);
    themeToggle.setAttribute('title', label);
  }

  /**
   * Detect system color scheme preference
   */
  detectSystemPreference() {
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemPreference = darkModeQuery.matches ? 'dark' : 'light';
      console.log('System preference detected:', this.systemPreference);
    } else {
      this.systemPreference = 'light';
      console.log('matchMedia not supported, defaulting to light theme');
    }
  }

  /**
   * Set up listener for system preference changes
   */
  setupSystemPreferenceListener() {
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Modern browsers
      if (darkModeQuery.addEventListener) {
        darkModeQuery.addEventListener('change', this.handleSystemPreferenceChange);
      } 
      // Older browsers
      else if (darkModeQuery.addListener) {
        darkModeQuery.addListener(this.handleSystemPreferenceChange);
      }
    }
  }

  /**
   * Handle system preference changes
   */
  handleSystemPreferenceChange(e) {
    const newPreference = e.matches ? 'dark' : 'light';
    console.log('System preference changed to:', newPreference);
    
    this.systemPreference = newPreference;
    
    // If current theme is auto, update the display
    if (this.currentTheme === 'auto') {
      this.updateThemeToggleIcon('auto');
    }
  }

  /**
   * Save theme preference to localStorage
   */
  saveThemePreference(theme) {
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }

  /**
   * Load theme preference from localStorage
   */
  loadThemePreference() {
    try {
      return localStorage.getItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
      return null;
    }
  }

  /**
   * Get current effective theme (resolves 'auto' to actual theme)
   */
  getEffectiveTheme() {
    if (this.currentTheme === 'auto') {
      return this.systemPreference;
    }
    return this.currentTheme;
  }

  /**
   * Get current theme setting
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Check if dark mode is currently active
   */
  isDarkMode() {
    return this.getEffectiveTheme() === 'dark';
  }

  /**
   * Cleanup method
   */
  destroy() {
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      if (darkModeQuery.removeEventListener) {
        darkModeQuery.removeEventListener('change', this.handleSystemPreferenceChange);
      } else if (darkModeQuery.removeListener) {
        darkModeQuery.removeListener(this.handleSystemPreferenceChange);
      }
    }
  }
}

// Make ThemeManager available globally
window.ThemeManager = ThemeManager;
// ===== MARKDOWN PARSER =====

class MarkdownParser {
  constructor() {
    // Regex patterns for markdown elements
    this.patterns = {
      // Headers
      h1: /^# (.+)$/gm,
      h2: /^## (.+)$/gm,
      h3: /^### (.+)$/gm,
      
      // Inline formatting (will be processed in order)
      bold: /\*\*([^*]+)\*\*/g,
      italic: /\*([^*]+)\*/g,
      strikethrough: /~~([^~]+)~~/g,
      inlineCode: /`([^`]+)`/g,
      
      // Block elements
      codeBlock: /```([\s\S]*?)```/g,
      blockquote: /^> (.+)$/gm,
      horizontalRule: /^---\s*$/gm,
      
      // Lists
      unorderedList: /^[-*] (.+)$/gm,
      orderedList: /^\d+\. (.+)$/gm,
      
      // Links
      link: /\[([^\]]+)\]\(([^)]+)\)/g,
      
      // Line breaks and paragraphs
      lineBreak: /\n\s*\n/g,
      paragraph: /^(?!<[h1-6]|<ul|<ol|<blockquote|<pre|<hr)(.+)$/gm
    };
    
    // Bind methods
    this.parse = this.parse.bind(this);
    this.parseHeaders = this.parseHeaders.bind(this);
    this.parseInlineFormatting = this.parseInlineFormatting.bind(this);
    this.parseBlockElements = this.parseBlockElements.bind(this);
    this.parseLists = this.parseLists.bind(this);
    this.parseLinks = this.parseLinks.bind(this);
    this.parseParagraphs = this.parseParagraphs.bind(this);
  }

  /**
   * Main parse method - converts markdown to HTML
   */
  parse(markdown) {
    if (!markdown || typeof markdown !== 'string') {
      return '';
    }
    
    try {
      let html = markdown;
      
      // Process in specific order to avoid conflicts
      
      // 1. Code blocks first (to protect content from other processing)
      html = this.parseCodeBlocks(html);
      
      // 2. Headers
      html = this.parseHeaders(html);
      
      // 3. Block elements
      html = this.parseBlockElements(html);
      
      // 4. Lists
      html = this.parseLists(html);
      
      // 5. Links (before inline formatting to avoid conflicts)
      html = this.parseLinks(html);
      
      // 6. Inline formatting
      html = this.parseInlineFormatting(html);
      
      // 7. Paragraphs and line breaks (last)
      html = this.parseParagraphs(html);
      
      return html.trim();
      
    } catch (error) {
      console.error('Markdown parsing error:', error);
      // Return escaped HTML as fallback
      return this.escapeHTML(markdown);
    }
  }

  /**
   * Parse headers (# ## ###)
   */
  parseHeaders(text) {
    // H1
    text = text.replace(this.patterns.h1, '<h1>$1</h1>');
    
    // H2
    text = text.replace(this.patterns.h2, '<h2>$1</h2>');
    
    // H3
    text = text.replace(this.patterns.h3, '<h3>$1</h3>');
    
    return text;
  }

  /**
   * Parse inline formatting (bold, italic, strikethrough, inline code)
   */
  parseInlineFormatting(text) {
    // Process inline code first to protect it from other formatting
    text = text.replace(this.patterns.inlineCode, (match, content) => {
      return `<code>${this.escapeHTML(content)}</code>`;
    });
    
    // Bold (process before italic to handle ***)
    text = text.replace(this.patterns.bold, '<strong>$1</strong>');
    
    // Italic
    text = text.replace(this.patterns.italic, '<em>$1</em>');
    
    // Strikethrough
    text = text.replace(this.patterns.strikethrough, '<del>$1</del>');
    
    return text;
  }

  /**
   * Parse code blocks
   */
  parseCodeBlocks(text) {
    return text.replace(this.patterns.codeBlock, (match, content) => {
      // Escape HTML in code blocks
      const escapedContent = this.escapeHTML(content.trim());
      return `<pre><code>${escapedContent}</code></pre>`;
    });
  }

  /**
   * Parse block elements (blockquotes, horizontal rules)
   */
  parseBlockElements(text) {
    // Blockquotes
    text = text.replace(this.patterns.blockquote, '<blockquote><p>$1</p></blockquote>');
    
    // Horizontal rules
    text = text.replace(this.patterns.horizontalRule, '<hr>');
    
    return text;
  }

  /**
   * Parse lists (unordered and ordered)
   */
  parseLists(text) {
    // Split text into lines for list processing
    const lines = text.split('\n');
    const result = [];
    let inUnorderedList = false;
    let inOrderedList = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Check for unordered list item
      const unorderedMatch = trimmedLine.match(/^[-*] (.+)$/);
      if (unorderedMatch) {
        if (!inUnorderedList) {
          if (inOrderedList) {
            result.push('</ol>');
            inOrderedList = false;
          }
          result.push('<ul>');
          inUnorderedList = true;
        }
        result.push(`<li>${unorderedMatch[1]}</li>`);
        continue;
      }
      
      // Check for ordered list item
      const orderedMatch = trimmedLine.match(/^\d+\. (.+)$/);
      if (orderedMatch) {
        if (!inOrderedList) {
          if (inUnorderedList) {
            result.push('</ul>');
            inUnorderedList = false;
          }
          result.push('<ol>');
          inOrderedList = true;
        }
        result.push(`<li>${orderedMatch[1]}</li>`);
        continue;
      }
      
      // Not a list item - close any open lists
      if (inUnorderedList) {
        result.push('</ul>');
        inUnorderedList = false;
      }
      if (inOrderedList) {
        result.push('</ol>');
        inOrderedList = false;
      }
      
      result.push(line);
    }
    
    // Close any remaining open lists
    if (inUnorderedList) {
      result.push('</ul>');
    }
    if (inOrderedList) {
      result.push('</ol>');
    }
    
    return result.join('\n');
  }

  /**
   * Parse links with URL validation
   */
  parseLinks(text) {
    return text.replace(this.patterns.link, (match, linkText, url) => {
      // Validate URL - only allow http and https
      if (this.isValidURL(url)) {
        return `<a href="${this.escapeHTML(url)}">${this.escapeHTML(linkText)}</a>`;
      } else {
        // Invalid URL - return as plain text
        return match;
      }
    });
  }

  /**
   * Parse paragraphs and handle line breaks
   */
  parseParagraphs(text) {
    // Split by double line breaks to create paragraphs
    const paragraphs = text.split(/\n\s*\n/);
    
    return paragraphs.map(paragraph => {
      const trimmed = paragraph.trim();
      if (!trimmed) return '';
      
      // Skip if already wrapped in HTML tags
      if (trimmed.match(/^<(h[1-6]|ul|ol|blockquote|pre|hr)/)) {
        return trimmed;
      }
      
      // Convert single line breaks to <br> within paragraphs
      const withBreaks = trimmed.replace(/\n/g, '<br>');
      
      return `<p>${withBreaks}</p>`;
    }).filter(p => p).join('\n\n');
  }

  /**
   * Validate URL - only allow http and https protocols
   */
  isValidURL(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (error) {
      // Invalid URL format
      return false;
    }
  }

  /**
   * Escape HTML characters to prevent XSS
   */
  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get supported markdown elements (for help documentation)
   */
  getSupportedElements() {
    return {
      headers: ['# Header 1', '## Header 2', '### Header 3'],
      formatting: ['**Bold text**', '*Italic text*', '~~Strikethrough~~', '`Inline code`'],
      lists: ['- Unordered item', '* Another item', '1. Ordered item', '2. Second item'],
      blocks: ['> Blockquote', '```\nCode block\n```', '---'],
      links: ['[Link text](https://example.com)']
    };
  }

  /**
   * Test method for validation
   */
  test() {
    const testMarkdown = `# Test Header
This is **bold** and *italic* text.
- List item 1
- List item 2

> This is a blockquote

\`\`\`
Code block
\`\`\`

[Link](https://example.com)`;

    console.log('Test markdown:', testMarkdown);
    console.log('Parsed HTML:', this.parse(testMarkdown));
  }
}

// Make MarkdownParser available globally
window.MarkdownParser = MarkdownParser;
// ===== HTML SANITIZER =====

class HTMLSanitizer {
  constructor() {
    // Whitelist of allowed HTML tags
    this.allowedTags = new Set([
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br',
      'strong', 'em', 'del', 'code', 'pre',
      'ul', 'ol', 'li',
      'blockquote',
      'a', 'hr'
    ]);
    
    // Allowed attributes per tag
    this.allowedAttributes = {
      'a': new Set(['href']),
      '*': new Set(['class']) // Global attributes allowed on any tag
    };
    
    // Allowed URL protocols
    this.allowedProtocols = new Set(['http:', 'https:']);
    
    // Dangerous patterns to remove
    this.dangerousPatterns = [
      /javascript:/gi,
      /vbscript:/gi,
      /data:/gi,
      /on\w+\s*=/gi, // Event handlers like onclick, onload, etc.
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi
    ];
    
    // Bind methods
    this.sanitize = this.sanitize.bind(this);
    this.isAllowedTag = this.isAllowedTag.bind(this);
    this.isAllowedAttribute = this.isAllowedAttribute.bind(this);
    this.sanitizeAttributes = this.sanitizeAttributes.bind(this);
    this.escapeHTML = this.escapeHTML.bind(this);
  }

  /**
   * Main sanitization method
   */
  sanitize(html) {
    if (!html || typeof html !== 'string') {
      return '';
    }
    
    try {
      // First pass: Remove dangerous patterns
      let sanitized = this.removeDangerousPatterns(html);
      
      // Second pass: Parse and filter HTML elements
      sanitized = this.filterHTMLElements(sanitized);
      
      return sanitized;
      
    } catch (error) {
      console.error('HTML sanitization error:', error);
      // Fallback: escape all HTML
      return this.escapeHTML(html);
    }
  }

  /**
   * Remove dangerous patterns from HTML
   */
  removeDangerousPatterns(html) {
    let sanitized = html;
    
    for (const pattern of this.dangerousPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }
    
    return sanitized;
  }

  /**
   * Filter HTML elements using DOM parsing
   */
  filterHTMLElements(html) {
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Recursively sanitize all elements
    this.sanitizeElement(tempDiv);
    
    return tempDiv.innerHTML;
  }

  /**
   * Recursively sanitize DOM element and its children
   */
  sanitizeElement(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return;
    }
    
    const children = Array.from(element.childNodes);
    
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const tagName = child.tagName.toLowerCase();
        
        if (this.isAllowedTag(tagName)) {
          // Sanitize attributes
          this.sanitizeAttributes(child);
          
          // Recursively sanitize children
          this.sanitizeElement(child);
        } else {
          // Remove disallowed tag but keep text content
          const textContent = child.textContent || '';
          const textNode = document.createTextNode(textContent);
          element.replaceChild(textNode, child);
        }
      } else if (child.nodeType === Node.TEXT_NODE) {
        // Text nodes are safe, keep as is
        continue;
      } else {
        // Remove other node types (comments, etc.)
        element.removeChild(child);
      }
    }
  }

  /**
   * Check if HTML tag is allowed
   */
  isAllowedTag(tagName) {
    return this.allowedTags.has(tagName.toLowerCase());
  }

  /**
   * Check if attribute is allowed for given tag
   */
  isAllowedAttribute(tagName, attrName, attrValue) {
    const tag = tagName.toLowerCase();
    const attr = attrName.toLowerCase();
    
    // Check tag-specific allowed attributes
    if (this.allowedAttributes[tag] && this.allowedAttributes[tag].has(attr)) {
      // Special validation for href attributes
      if (attr === 'href') {
        return this.isValidURL(attrValue);
      }
      return true;
    }
    
    // Check global allowed attributes
    if (this.allowedAttributes['*'] && this.allowedAttributes['*'].has(attr)) {
      return true;
    }
    
    return false;
  }

  /**
   * Sanitize attributes of an element
   */
  sanitizeAttributes(element) {
    const tagName = element.tagName.toLowerCase();
    const attributes = Array.from(element.attributes);
    
    for (const attr of attributes) {
      if (!this.isAllowedAttribute(tagName, attr.name, attr.value)) {
        element.removeAttribute(attr.name);
      } else {
        // Additional sanitization for specific attributes
        if (attr.name.toLowerCase() === 'href') {
          // Ensure URL is safe
          const sanitizedURL = this.sanitizeURL(attr.value);
          if (sanitizedURL !== attr.value) {
            element.setAttribute(attr.name, sanitizedURL);
          }
        }
      }
    }
  }

  /**
   * Validate URL for safety
   */
  isValidURL(url) {
    if (!url || typeof url !== 'string') {
      return false;
    }
    
    try {
      const urlObj = new URL(url);
      return this.allowedProtocols.has(urlObj.protocol);
    } catch (error) {
      // Invalid URL format
      return false;
    }
  }

  /**
   * Sanitize URL by removing dangerous parts
   */
  sanitizeURL(url) {
    if (!this.isValidURL(url)) {
      return '#';
    }
    
    try {
      const urlObj = new URL(url);
      
      // Only allow safe protocols
      if (!this.allowedProtocols.has(urlObj.protocol)) {
        return '#';
      }
      
      // Remove dangerous characters
      let sanitized = url.replace(/[<>"']/g, '');
      
      return sanitized;
      
    } catch (error) {
      return '#';
    }
  }

  /**
   * Escape HTML characters
   */
  escapeHTML(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Escape HTML characters in code content
   */
  escapeCodeContent(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Test method for validation
   */
  test() {
    const testCases = [
      // Safe HTML
      '<h1>Safe Header</h1><p>Safe <strong>bold</strong> text</p>',
      
      // Dangerous script
      '<script>alert("XSS")</script><p>Text</p>',
      
      // Event handlers
      '<p onclick="alert(\'XSS\')">Click me</p>',
      
      // Invalid tags
      '<div><span>Text</span></div>',
      
      // Safe links
      '<a href="https://example.com">Safe link</a>',
      
      // Dangerous links
      '<a href="javascript:alert(\'XSS\')">Dangerous link</a>',
      
      // Mixed content
      '<h2>Title</h2><script>bad()</script><p>Good text</p>'
    ];
    
    console.log('HTML Sanitizer Test Results:');
    testCases.forEach((test, index) => {
      console.log(`Test ${index + 1}:`);
      console.log('Input:', test);
      console.log('Output:', this.sanitize(test));
      console.log('---');
    });
  }

  /**
   * Get configuration info
   */
  getConfig() {
    return {
      allowedTags: Array.from(this.allowedTags),
      allowedAttributes: Object.fromEntries(
        Object.entries(this.allowedAttributes).map(([key, value]) => [key, Array.from(value)])
      ),
      allowedProtocols: Array.from(this.allowedProtocols)
    };
  }
}

// Make HTMLSanitizer available globally
window.HTMLSanitizer = HTMLSanitizer;
// ===== UI MANAGER =====

class UIManager {
  constructor(app) {
    this.app = app;
    this.toastQueue = [];
    this.activeToasts = new Set();
    this.maxToasts = 3;
    this.toastDuration = 4000; // 4 seconds
    
    // Bind methods
    this.updatePreview = this.updatePreview.bind(this);
    this.showToast = this.showToast.bind(this);
    this.showError = this.showError.bind(this);
    this.updateCounters = this.updateCounters.bind(this);
    this.toggleViewMode = this.toggleViewMode.bind(this);
    this.initializeLayout = this.initializeLayout.bind(this);
    this.setupEventListeners = this.setupEventListeners.bind(this);
  }

  /**
   * Initialize UI layout
   */
  initializeLayout() {
    console.log('UIManager.initializeLayout called');
    
    // Set initial view mode
    const initialMode = this.app.state.viewMode || 'split';
    console.log('Setting initial view mode to:', initialMode);
    this.setViewMode(initialMode);
    
    // Initialize empty state
    this.showEmptyState();
    
    console.log('UI layout initialized');
  }

  /**
   * Set up additional UI event listeners
   */
  setupEventListeners() {
    // Modal escape key handling
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
    
    // Toast click to dismiss
    if (this.app.elements.toastContainer) {
      this.app.elements.toastContainer.addEventListener('click', (e) => {
        const toast = e.target.closest('.toast');
        if (toast) {
          this.dismissToast(toast);
        }
      });
    }
  }

  /**
   * Update preview content with live updates
   */
  updatePreview() {
    if (!this.app.elements.preview) return;
    
    const content = this.app.state.content.trim();
    
    if (!content) {
      this.showEmptyState();
      return;
    }
    
    try {
      // Parse markdown to HTML
      let html = '';
      if (this.app.markdownParser) {
        html = this.app.markdownParser.parse(content);
      } else {
        // Fallback: simple text display with line breaks
        html = `<p>${this.escapeHTML(content).replace(/\n/g, '<br>')}</p>`;
      }
      
      // Sanitize HTML for security
      if (this.app.htmlSanitizer) {
        html = this.app.htmlSanitizer.sanitize(html);
      }
      
      // Update preview content
      this.app.elements.preview.innerHTML = html;
      
      // Announce to screen readers
      this.announceToScreenReader('Предпросмотр обновлен');
      
    } catch (error) {
      console.error('Preview update failed:', error);
      this.showError('Ошибка обновления предпросмотра');
      
      // Show error state in preview
      this.showErrorState('Ошибка парсинга Markdown');
    }
  }

  /**
   * Show empty state in preview
   */
  showEmptyState() {
    if (!this.app.elements.preview) return;
    
    this.app.elements.preview.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14,2 14,8 20,8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10,9 9,9 8,9"></polyline>
        </svg>
        <h3>Начните печатать Markdown...</h3>
        <p>Ваш текст будет отображаться здесь в реальном времени</p>
      </div>
    `;
  }

  /**
   * Show error state in preview
   */
  showErrorState(message) {
    if (!this.app.elements.preview) return;
    
    this.app.elements.preview.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <h3>Ошибка парсинга</h3>
        <p>${this.escapeHTML(message)}</p>
      </div>
    `;
  }

  /**
   * Update content counters
   */
  updateCounters(counters) {
    if (this.app.elements.charCount) {
      this.app.elements.charCount.textContent = counters.characters;
    }
    if (this.app.elements.wordCount) {
      this.app.elements.wordCount.textContent = counters.words;
    }
    if (this.app.elements.lineCount) {
      this.app.elements.lineCount.textContent = counters.lines;
    }
  }

  /**
   * Set view mode
   */
  setViewMode(mode) {
    console.log('UIManager.setViewMode called with:', mode);
    
    if (!['split', 'editor', 'preview'].includes(mode)) {
      console.warn('Invalid view mode:', mode);
      return;
    }
    
    const container = this.app.elements.editorContainer;
    if (!container) {
      console.error('Editor container not found!');
      return;
    }
    
    console.log('Container found:', container);
    
    // Remove existing view classes
    container.classList.remove('view-split', 'view-editor', 'view-preview');
    
    // Add new view class
    const newClass = `view-${mode}`;
    container.classList.add(newClass);
    
    console.log('Added class:', newClass, 'Container classes:', container.className);
    
    // Update view buttons
    this.updateViewButtons(mode);
    
    // Update ARIA attributes
    this.updateViewModeAria(mode);
    
    console.log('View mode set to:', mode);
  }

  /**
   * Update view mode buttons
   */
  updateViewButtons(activeMode) {
    console.log('Updating view buttons, active mode:', activeMode);
    
    this.app.elements.viewButtons.forEach(button => {
      const mode = button.dataset.view;
      const isActive = mode === activeMode;
      
      console.log(`Button ${mode}: ${isActive ? 'active' : 'inactive'}`);
      
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', isActive.toString());
    });
  }

  /**
   * Update ARIA attributes for view mode
   */
  updateViewModeAria(mode) {
    const editorPanel = this.app.elements.editorPanel;
    const previewPanel = this.app.elements.previewPanel;
    
    if (editorPanel) {
      editorPanel.setAttribute('aria-hidden', mode === 'preview' ? 'true' : 'false');
    }
    
    if (previewPanel) {
      previewPanel.setAttribute('aria-hidden', mode === 'editor' ? 'true' : 'false');
    }
  }

  /**
   * Toggle view mode
   */
  toggleViewMode(mode) {
    this.app.setState({ viewMode: mode });
    this.setViewMode(mode);
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info', duration = this.toastDuration) {
    const toast = this.createToast(message, type);
    
    // Add to queue if too many toasts are active
    if (this.activeToasts.size >= this.maxToasts) {
      this.toastQueue.push({ message, type, duration });
      return;
    }
    
    this.displayToast(toast, duration);
  }

  /**
   * Create toast element
   */
  createToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    // Icon based on type
    let iconSVG = '';
    switch (type) {
      case 'success':
        iconSVG = `<svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>`;
        break;
      case 'error':
        iconSVG = `<svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>`;
        break;
      case 'warning':
        iconSVG = `<svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>`;
        break;
      default:
        iconSVG = `<svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 16v-4"></path>
          <path d="M12 8h.01"></path>
        </svg>`;
    }
    
    toast.innerHTML = `
      ${iconSVG}
      <span class="toast-message">${this.escapeHTML(message)}</span>
      <button class="toast-close" type="button" aria-label="Закрыть уведомление">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    
    // Add close button event listener
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      this.dismissToast(toast);
    });
    
    return toast;
  }

  /**
   * Display toast with animation
   */
  displayToast(toast, duration) {
    const container = this.app.elements.toastContainer;
    if (!container) return;
    
    // Add to active toasts
    this.activeToasts.add(toast);
    
    // Add to DOM
    container.appendChild(toast);
    
    // Trigger show animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    // Auto-dismiss after duration
    setTimeout(() => {
      this.dismissToast(toast);
    }, duration);
  }

  /**
   * Dismiss toast
   */
  dismissToast(toast) {
    if (!this.activeToasts.has(toast)) return;
    
    toast.classList.add('hide');
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.activeToasts.delete(toast);
      
      // Show next toast from queue
      if (this.toastQueue.length > 0) {
        const next = this.toastQueue.shift();
        this.showToast(next.message, next.type, next.duration);
      }
    }, 300);
  }

  /**
   * Show error message
   */
  showError(message) {
    const container = this.app.elements.errorContainer;
    if (!container) {
      console.error('Error:', message);
      return;
    }
    
    // Create error element
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.setAttribute('role', 'alert');
    errorEl.setAttribute('aria-live', 'assertive');
    errorEl.textContent = message;
    
    // Clear existing errors
    container.innerHTML = '';
    
    // Add to DOM
    container.appendChild(errorEl);
    
    // Show with animation
    requestAnimationFrame(() => {
      errorEl.classList.add('show');
    });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      errorEl.classList.remove('show');
      setTimeout(() => {
        if (errorEl.parentNode) {
          errorEl.parentNode.removeChild(errorEl);
        }
      }, 300);
    }, 5000);
  }

  /**
   * Close all modals
   */
  closeAllModals() {
    // Close help modal
    const helpModal = this.app.elements.helpModal;
    if (helpModal && helpModal.classList.contains('show')) {
      this.hideHelpModal();
    }
    
    // Close about modal
    const aboutModal = this.app.elements.aboutModal;
    if (aboutModal && aboutModal.classList.contains('show')) {
      this.hideAboutModal();
    }
  }

  /**
   * Show about modal
   */
  showAboutModal() {
    console.log('UIManager.showAboutModal called');
    const modal = this.app.elements.aboutModal;
    console.log('About modal element:', modal);
    console.log('Modal current classes:', modal ? modal.className : 'modal not found');
    if (!modal) {
      console.error('About modal element not found!');
      return;
    }
    
    console.log('Adding show class to about modal');
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    console.log('About modal classes after adding show:', modal.className);
    
    // Focus management
    const closeButton = modal.querySelector('.modal-close');
    if (closeButton) {
      console.log('Focusing close button');
      closeButton.focus();
    } else {
      console.log('Close button not found');
    }
    
    // Trap focus within modal
    this.trapFocus(modal);
  }

  /**
   * Hide about modal
   */
  hideAboutModal() {
    const modal = this.app.elements.aboutModal;
    if (!modal) return;
    
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    
    // Return focus to about button
    if (this.app.elements.aboutButton) {
      this.app.elements.aboutButton.focus();
    }
  }

  /**
   * Show help modal
   */
  showHelpModal() {
    console.log('UIManager.showHelpModal called');
    const modal = this.app.elements.helpModal;
    console.log('Help modal element:', modal);
    console.log('Modal current classes:', modal ? modal.className : 'modal not found');
    if (!modal) {
      console.error('Help modal element not found!');
      return;
    }
    
    console.log('Adding show class to modal');
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    console.log('Modal classes after adding show:', modal.className);
    
    // Focus management
    const closeButton = modal.querySelector('.modal-close');
    if (closeButton) {
      console.log('Focusing close button');
      closeButton.focus();
    } else {
      console.log('Close button not found');
    }
    
    // Trap focus within modal
    this.trapFocus(modal);
  }

  /**
   * Hide help modal
   */
  hideHelpModal() {
    const modal = this.app.elements.helpModal;
    if (!modal) return;
    
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    
    // Return focus to help button
    if (this.app.elements.helpButton) {
      this.app.elements.helpButton.focus();
    }
  }

  /**
   * Trap focus within element
   */
  trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    element.addEventListener('keydown', handleTabKey);
    
    // Store handler for cleanup
    element._focusTrapHandler = handleTabKey;
  }

  /**
   * Announce to screen readers
   */
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 1000);
  }

  /**
   * Escape HTML characters
   */
  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Make UIManager available globally
window.UIManager = UIManager;
// ===== FORMATTING MANAGER =====

class FormattingManager {
  constructor(app) {
    this.app = app;
    
    // Formatting templates
    this.formats = {
      bold: { prefix: '**', suffix: '**', placeholder: 'жирный текст' },
      italic: { prefix: '*', suffix: '*', placeholder: 'курсив' },
      strikethrough: { prefix: '~~', suffix: '~~', placeholder: 'зачеркнутый текст' },
      code: { prefix: '`', suffix: '`', placeholder: 'код' },
      h1: { prefix: '# ', suffix: '', placeholder: 'Заголовок 1' },
      h2: { prefix: '## ', suffix: '', placeholder: 'Заголовок 2' },
      h3: { prefix: '### ', suffix: '', placeholder: 'Заголовок 3' },
      ul: { prefix: '- ', suffix: '', placeholder: 'элемент списка', newLine: true },
      ol: { prefix: '1. ', suffix: '', placeholder: 'элемент списка', newLine: true },
      quote: { prefix: '> ', suffix: '', placeholder: 'цитата', newLine: true },
      link: { 
        prefix: '[', 
        suffix: '](https://)', 
        placeholder: 'текст ссылки',
        cursorOffset: -10 // Position cursor before "https://"
      }
    };
    
    // Bind methods
    this.insertFormatting = this.insertFormatting.bind(this);
    this.wrapSelection = this.wrapSelection.bind(this);
    this.insertAtCursor = this.insertAtCursor.bind(this);
    this.getSelectionInfo = this.getSelectionInfo.bind(this);
  }

  /**
   * Insert formatting based on type
   */
  insertFormatting(formatType) {
    const editor = this.app.elements.editor;
    if (!editor) return;
    
    const format = this.formats[formatType];
    if (!format) {
      console.warn('Unknown format type:', formatType);
      return;
    }
    
    const selectionInfo = this.getSelectionInfo(editor);
    
    if (selectionInfo.hasSelection) {
      this.wrapSelection(editor, format, selectionInfo);
    } else {
      this.insertAtCursor(editor, format, selectionInfo);
    }
    
    // Update app state
    this.app.setState({ content: editor.value });
    
    // Focus back to editor
    editor.focus();
  }

  /**
   * Get selection information from editor
   */
  getSelectionInfo(editor) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);
    const beforeCursor = editor.value.substring(0, start);
    const afterCursor = editor.value.substring(end);
    
    return {
      start,
      end,
      selectedText,
      beforeCursor,
      afterCursor,
      hasSelection: start !== end,
      isAtLineStart: beforeCursor.endsWith('\n') || beforeCursor === '',
      isAtLineEnd: afterCursor.startsWith('\n') || afterCursor === ''
    };
  }

  /**
   * Wrap selected text with formatting
   */
  wrapSelection(editor, format, selectionInfo) {
    const { selectedText, start, end } = selectionInfo;
    
    let newText;
    let newCursorPos;
    
    if (format.newLine) {
      // For block elements (headers, lists, quotes)
      newText = this.formatBlockElement(selectedText, format, selectionInfo);
      newCursorPos = start + newText.length;
    } else {
      // For inline elements (bold, italic, etc.)
      newText = format.prefix + selectedText + format.suffix;
      newCursorPos = start + format.prefix.length + selectedText.length + format.suffix.length;
      
      // Handle special cursor positioning (e.g., for links)
      if (format.cursorOffset) {
        newCursorPos += format.cursorOffset;
      }
    }
    
    // Replace selection with formatted text
    const beforeSelection = editor.value.substring(0, start);
    const afterSelection = editor.value.substring(end);
    
    editor.value = beforeSelection + newText + afterSelection;
    
    // Set cursor position
    editor.setSelectionRange(newCursorPos, newCursorPos);
  }

  /**
   * Insert formatting at cursor position
   */
  insertAtCursor(editor, format, selectionInfo) {
    const { start } = selectionInfo;
    
    let insertText;
    let newCursorPos;
    
    if (format.newLine) {
      // For block elements
      insertText = this.formatBlockElement('', format, selectionInfo);
      newCursorPos = start + format.prefix.length + format.placeholder.length;
    } else {
      // For inline elements
      insertText = format.prefix + format.placeholder + format.suffix;
      newCursorPos = start + format.prefix.length + format.placeholder.length;
      
      // Handle special cursor positioning
      if (format.cursorOffset) {
        newCursorPos = start + insertText.length + format.cursorOffset;
      }
    }
    
    // Insert text at cursor
    const beforeCursor = editor.value.substring(0, start);
    const afterCursor = editor.value.substring(start);
    
    editor.value = beforeCursor + insertText + afterCursor;
    
    // Select placeholder text for easy replacement
    if (format.newLine) {
      editor.setSelectionRange(
        start + format.prefix.length,
        start + format.prefix.length + format.placeholder.length
      );
    } else if (format.cursorOffset) {
      editor.setSelectionRange(newCursorPos, newCursorPos);
    } else {
      editor.setSelectionRange(
        start + format.prefix.length,
        start + format.prefix.length + format.placeholder.length
      );
    }
  }

  /**
   * Format block elements (headers, lists, quotes)
   */
  formatBlockElement(text, format, selectionInfo) {
    const { isAtLineStart } = selectionInfo;
    
    let result = '';
    
    // Add newline before if not at line start
    if (!isAtLineStart) {
      result += '\n';
    }
    
    if (text) {
      // Format existing text
      const lines = text.split('\n');
      result += lines.map(line => {
        if (line.trim()) {
          return format.prefix + line.trim();
        }
        return line;
      }).join('\n');
    } else {
      // Insert placeholder
      result += format.prefix + format.placeholder;
    }
    
    return result;
  }

  /**
   * Handle special formatting cases
   */
  handleSpecialFormatting(formatType, editor) {
    switch (formatType) {
      case 'link':
        this.insertLink(editor);
        break;
      case 'ul':
      case 'ol':
        this.insertList(editor, formatType);
        break;
      default:
        this.insertFormatting(formatType);
    }
  }

  /**
   * Insert link with URL prompt
   */
  insertLink(editor) {
    const selectionInfo = this.getSelectionInfo(editor);
    const linkText = selectionInfo.selectedText || 'текст ссылки';
    
    // For now, use the standard link format
    // In a more advanced version, we could show a modal for URL input
    const format = this.formats.link;
    
    if (selectionInfo.hasSelection) {
      this.wrapSelection(editor, format, selectionInfo);
    } else {
      this.insertAtCursor(editor, format, selectionInfo);
    }
    
    // Update app state
    this.app.setState({ content: editor.value });
  }

  /**
   * Insert list with proper numbering
   */
  insertList(editor, listType) {
    const selectionInfo = this.getSelectionInfo(editor);
    const format = this.formats[listType];
    
    if (listType === 'ol') {
      // For ordered lists, we might want to find the next number
      const beforeCursor = selectionInfo.beforeCursor;
      const lastOrderedItem = beforeCursor.match(/(\d+)\. [^\n]*$/);
      
      if (lastOrderedItem) {
        const nextNumber = parseInt(lastOrderedItem[1]) + 1;
        format.prefix = `${nextNumber}. `;
      }
    }
    
    if (selectionInfo.hasSelection) {
      this.wrapSelection(editor, format, selectionInfo);
    } else {
      this.insertAtCursor(editor, format, selectionInfo);
    }
    
    // Update app state
    this.app.setState({ content: editor.value });
  }

  /**
   * Check if text is already formatted
   */
  isAlreadyFormatted(text, format) {
    return text.startsWith(format.prefix) && text.endsWith(format.suffix);
  }

  /**
   * Remove formatting from text
   */
  removeFormatting(text, format) {
    if (this.isAlreadyFormatted(text, format)) {
      return text.substring(format.prefix.length, text.length - format.suffix.length);
    }
    return text;
  }

  /**
   * Toggle formatting (add if not present, remove if present)
   */
  toggleFormatting(formatType) {
    const editor = this.app.elements.editor;
    if (!editor) return;
    
    const format = this.formats[formatType];
    if (!format || format.newLine) {
      // Block elements don't toggle, just insert
      this.insertFormatting(formatType);
      return;
    }
    
    const selectionInfo = this.getSelectionInfo(editor);
    
    if (selectionInfo.hasSelection) {
      const { selectedText } = selectionInfo;
      
      if (this.isAlreadyFormatted(selectedText, format)) {
        // Remove formatting
        const unformattedText = this.removeFormatting(selectedText, format);
        const beforeSelection = editor.value.substring(0, selectionInfo.start);
        const afterSelection = editor.value.substring(selectionInfo.end);
        
        editor.value = beforeSelection + unformattedText + afterSelection;
        
        // Update selection
        editor.setSelectionRange(
          selectionInfo.start,
          selectionInfo.start + unformattedText.length
        );
      } else {
        // Add formatting
        this.wrapSelection(editor, format, selectionInfo);
      }
    } else {
      // No selection, just insert
      this.insertAtCursor(editor, format, selectionInfo);
    }
    
    // Update app state
    this.app.setState({ content: editor.value });
    
    // Focus back to editor
    editor.focus();
  }

  /**
   * Get available formatting options
   */
  getAvailableFormats() {
    return Object.keys(this.formats);
  }

  /**
   * Get format configuration
   */
  getFormat(formatType) {
    return this.formats[formatType];
  }
}

// Update main MarkdownEditor class to include formatting
MarkdownEditor.prototype.insertFormatting = function(formatType) {
  if (!this.formattingManager) {
    this.formattingManager = new FormattingManager(this);
  }
  
  this.formattingManager.insertFormatting(formatType);
};

// Add utility functions to main app
MarkdownEditor.prototype.clearEditor = function() {
  if (this.elements.editor) {
    this.elements.editor.value = '';
    this.setState({ content: '' });
    this.elements.editor.focus();
    this.showToast('Редактор очищен', 'success');
  }
};

MarkdownEditor.prototype.copyContent = function() {
  const content = this.state.content;
  
  if (!content.trim()) {
    this.showToast('Нечего копировать', 'warning');
    return;
  }
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(content)
      .then(() => {
        this.showToast('Содержимое скопировано ✅', 'success');
      })
      .catch(error => {
        console.error('Failed to copy to clipboard:', error);
        this.fallbackCopyToClipboard(content);
      });
  } else {
    this.fallbackCopyToClipboard(content);
  }
};

MarkdownEditor.prototype.fallbackCopyToClipboard = function(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      this.showToast('Содержимое скопировано ✅', 'success');
    } else {
      this.showToast('Не удалось скопировать', 'error');
    }
  } catch (error) {
    console.error('Fallback copy failed:', error);
    this.showToast('Не удалось скопировать', 'error');
  } finally {
    document.body.removeChild(textArea);
  }
};

MarkdownEditor.prototype.downloadMarkdown = function() {
  const content = this.state.content;
  
  if (!content.trim()) {
    this.showToast('Нечего скачивать', 'warning');
    return;
  }
  
  try {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    this.showToast('Markdown файл скачан', 'success');
  } catch (error) {
    console.error('Download failed:', error);
    this.showToast('Ошибка скачивания', 'error');
  }
};

MarkdownEditor.prototype.downloadHTML = function() {
  const content = this.state.content;
  
  if (!content.trim()) {
    this.showToast('Нечего скачивать', 'warning');
    return;
  }
  
  try {
    // Parse markdown to HTML
    let html = '';
    if (this.markdownParser) {
      html = this.markdownParser.parse(content);
    } else {
      html = `<p>${this.escapeHTML(content)}</p>`;
    }
    
    // Sanitize HTML
    if (this.htmlSanitizer) {
      html = this.htmlSanitizer.sanitize(html);
    }
    
    // Create complete HTML document
    const fullHTML = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Document</title>
    <meta name="generator" content="Markdown Editor - Шоназаров Аброр, группа 085 23">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            color: #333;
        }
        h1, h2, h3 { color: #2c3e50; }
        h1 { border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
        h2 { border-bottom: 1px solid #eee; padding-bottom: 0.25rem; }
        code {
            background: #f4f4f4;
            padding: 0.125rem 0.25rem;
            border-radius: 3px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        }
        pre {
            background: #f8f8f8;
            padding: 1rem;
            border-radius: 5px;
            overflow-x: auto;
        }
        blockquote {
            border-left: 4px solid #3498db;
            background: #f9f9f9;
            padding: 1rem;
            margin: 1rem 0;
        }
        a { color: #3498db; }
        hr {
            border: none;
            height: 2px;
            background: #eee;
            margin: 2rem 0;
        }
    </style>
</head>
<body>
${html}
</body>
</html>`;
    
    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    this.showToast('HTML файл скачан', 'success');
  } catch (error) {
    console.error('HTML download failed:', error);
    this.showToast('Ошибка скачивания HTML', 'error');
  }
};

// Update the placeholder methods in main class
MarkdownEditor.prototype.showHelpModal = function() {
  if (this.uiManager) {
    this.uiManager.showHelpModal();
  }
};

MarkdownEditor.prototype.hideHelpModal = function() {
  if (this.uiManager) {
    this.uiManager.hideHelpModal();
  }
};

MarkdownEditor.prototype.updateViewMode = function() {
  if (this.uiManager) {
    this.uiManager.setViewMode(this.state.viewMode);
  }
};

MarkdownEditor.prototype.updatePreview = function() {
  if (this.uiManager) {
    this.uiManager.updatePreview();
  }
};

// Make FormattingManager available globally
window.FormattingManager = FormattingManager;
// ===== KEYBOARD HANDLER =====

class KeyboardHandler {
  constructor(app) {
    this.app = app;
    
    // Keyboard shortcuts mapping
    this.shortcuts = {
      'ctrl+b': 'bold',
      'cmd+b': 'bold',
      'ctrl+i': 'italic',
      'cmd+i': 'italic',
      'ctrl+k': 'link',
      'cmd+k': 'link',
      'ctrl+s': 'save',
      'cmd+s': 'save',
      'escape': 'escape'
    };
    
    // Platform detection
    this.isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    // Bind methods
    this.init = this.init.bind(this);
    this.handleShortcut = this.handleShortcut.bind(this);
    this.getShortcutKey = this.getShortcutKey.bind(this);
    this.executeShortcut = this.executeShortcut.bind(this);
  }

  /**
   * Initialize keyboard handler
   */
  init() {
    // Add keyboard shortcut hints to buttons
    this.addShortcutHints();
    
    console.log('Keyboard handler initialized');
  }

  /**
   * Handle keyboard shortcuts
   */
  handleShortcut(event) {
    const shortcutKey = this.getShortcutKey(event);
    
    if (this.shortcuts[shortcutKey]) {
      event.preventDefault();
      this.executeShortcut(this.shortcuts[shortcutKey], event);
    }
  }

  /**
   * Get shortcut key string from event
   */
  getShortcutKey(event) {
    const parts = [];
    
    // Add modifiers
    if (event.ctrlKey && !this.isMac) parts.push('ctrl');
    if (event.metaKey && this.isMac) parts.push('cmd');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    
    // Add key
    const key = event.key.toLowerCase();
    parts.push(key);
    
    return parts.join('+');
  }

  /**
   * Execute shortcut action
   */
  executeShortcut(action, event) {
    switch (action) {
      case 'bold':
        this.insertFormatting('bold');
        break;
        
      case 'italic':
        this.insertFormatting('italic');
        break;
        
      case 'link':
        this.insertFormatting('link');
        break;
        
      case 'save':
        this.saveContent();
        break;
        
      case 'escape':
        this.handleEscape();
        break;
        
      default:
        console.warn('Unknown shortcut action:', action);
    }
  }

  /**
   * Insert formatting using the app's formatting manager
   */
  insertFormatting(formatType) {
    if (this.app.insertFormatting) {
      this.app.insertFormatting(formatType);
    }
  }

  /**
   * Save content
   */
  saveContent() {
    if (this.app.storageManager) {
      try {
        this.app.storageManager.saveContent(this.app.state.content);
        this.app.storageManager.saveSettings({
          theme: this.app.state.theme,
          viewMode: this.app.state.viewMode
        });
        this.app.setState({ lastSaved: Date.now() });
        this.app.showToast('Сохранено ✅', 'success');
      } catch (error) {
        console.error('Save failed:', error);
        this.app.showToast('Ошибка сохранения', 'error');
      }
    }
  }

  /**
   * Handle escape key
   */
  handleEscape() {
    // Close modals
    if (this.app.uiManager) {
      this.app.uiManager.closeAllModals();
    }
    
    // Clear any active selections or focus states
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
  }

  /**
   * Add shortcut hints to toolbar buttons
   */
  addShortcutHints() {
    const shortcutMap = {
      'bold': this.isMac ? 'Cmd+B' : 'Ctrl+B',
      'italic': this.isMac ? 'Cmd+I' : 'Ctrl+I',
      'link': this.isMac ? 'Cmd+K' : 'Ctrl+K'
    };
    
    // Update toolbar button titles
    Object.entries(shortcutMap).forEach(([format, shortcut]) => {
      const button = document.querySelector(`[data-format="${format}"]`);
      if (button) {
        const currentTitle = button.getAttribute('title') || button.getAttribute('aria-label');
        if (currentTitle && !currentTitle.includes('(')) {
          button.setAttribute('title', `${currentTitle} (${shortcut})`);
          button.setAttribute('aria-label', `${currentTitle} (${shortcut})`);
        }
      }
    });
    
    // Update save button hint (if exists)
    const saveButton = document.querySelector('[data-action="save"]');
    if (saveButton) {
      const saveShortcut = this.isMac ? 'Cmd+S' : 'Ctrl+S';
      const currentTitle = saveButton.getAttribute('title') || 'Сохранить';
      saveButton.setAttribute('title', `${currentTitle} (${saveShortcut})`);
    }
  }

  /**
   * Get available shortcuts for help display
   */
  getShortcutList() {
    const modifierKey = this.isMac ? 'Cmd' : 'Ctrl';
    
    return [
      { key: `${modifierKey}+B`, action: 'Жирный текст' },
      { key: `${modifierKey}+I`, action: 'Курсив' },
      { key: `${modifierKey}+K`, action: 'Вставить ссылку' },
      { key: `${modifierKey}+S`, action: 'Сохранить' },
      { key: 'Escape', action: 'Закрыть модальные окна' }
    ];
  }

  /**
   * Check if shortcut is available
   */
  isShortcutAvailable(event) {
    const shortcutKey = this.getShortcutKey(event);
    return this.shortcuts.hasOwnProperty(shortcutKey);
  }

  /**
   * Add custom shortcut
   */
  addShortcut(keyCombo, action) {
    this.shortcuts[keyCombo.toLowerCase()] = action;
  }

  /**
   * Remove shortcut
   */
  removeShortcut(keyCombo) {
    delete this.shortcuts[keyCombo.toLowerCase()];
  }

  /**
   * Get platform-specific modifier key name
   */
  getModifierKeyName() {
    return this.isMac ? 'Cmd' : 'Ctrl';
  }

  /**
   * Format shortcut for display
   */
  formatShortcutForDisplay(shortcut) {
    return shortcut
      .replace('ctrl', 'Ctrl')
      .replace('cmd', 'Cmd')
      .replace('alt', 'Alt')
      .replace('shift', 'Shift')
      .replace('+', ' + ')
      .split(' + ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' + ');
  }
}

// ===== STORAGE MANAGER =====

class StorageManager {
  constructor() {
    this.contentKey = 'markdown-editor-content';
    this.settingsKey = 'markdown-editor-settings';
    this.isAvailable = this.checkStorageAvailability();
    
    // Bind methods
    this.saveContent = this.saveContent.bind(this);
    this.loadContent = this.loadContent.bind(this);
    this.saveSettings = this.saveSettings.bind(this);
    this.loadSettings = this.loadSettings.bind(this);
    this.clearStorage = this.clearStorage.bind(this);
  }

  /**
   * Check if localStorage is available
   */
  checkStorageAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn('localStorage not available:', error);
      return false;
    }
  }

  /**
   * Save content to localStorage
   */
  saveContent(content) {
    if (!this.isAvailable) {
      throw new Error('Storage not available');
    }
    
    try {
      const data = {
        content,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      localStorage.setItem(this.contentKey, JSON.stringify(data));
      
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw error;
    }
  }

  /**
   * Load content from localStorage
   */
  loadContent() {
    if (!this.isAvailable) {
      return null;
    }
    
    try {
      const stored = localStorage.getItem(this.contentKey);
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      
      // Validate data structure
      if (data && typeof data.content === 'string') {
        return data.content;
      }
      
      return null;
      
    } catch (error) {
      console.warn('Failed to load content:', error);
      return null;
    }
  }

  /**
   * Save settings to localStorage
   */
  saveSettings(settings) {
    if (!this.isAvailable) {
      throw new Error('Storage not available');
    }
    
    try {
      const data = {
        settings,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      localStorage.setItem(this.settingsKey, JSON.stringify(data));
      
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Settings storage quota exceeded');
      }
      throw error;
    }
  }

  /**
   * Load settings from localStorage
   */
  loadSettings() {
    if (!this.isAvailable) {
      return null;
    }
    
    try {
      const stored = localStorage.getItem(this.settingsKey);
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      
      // Validate data structure
      if (data && data.settings && typeof data.settings === 'object') {
        return data.settings;
      }
      
      return null;
      
    } catch (error) {
      console.warn('Failed to load settings:', error);
      return null;
    }
  }

  /**
   * Clear all stored data
   */
  clearStorage() {
    if (!this.isAvailable) {
      return;
    }
    
    try {
      localStorage.removeItem(this.contentKey);
      localStorage.removeItem(this.settingsKey);
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }
  }

  /**
   * Get storage usage info
   */
  getStorageInfo() {
    if (!this.isAvailable) {
      return { available: false };
    }
    
    try {
      const content = localStorage.getItem(this.contentKey);
      const settings = localStorage.getItem(this.settingsKey);
      
      return {
        available: true,
        contentSize: content ? content.length : 0,
        settingsSize: settings ? settings.length : 0,
        totalSize: (content ? content.length : 0) + (settings ? settings.length : 0)
      };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }

  /**
   * Export all data
   */
  exportData() {
    return {
      content: this.loadContent(),
      settings: this.loadSettings(),
      timestamp: Date.now()
    };
  }

  /**
   * Import data
   */
  importData(data) {
    if (data.content) {
      this.saveContent(data.content);
    }
    if (data.settings) {
      this.saveSettings(data.settings);
    }
  }
}

// Make classes available globally
window.KeyboardHandler = KeyboardHandler;
window.StorageManager = StorageManager;
// ===== FINAL APPLICATION INTEGRATION =====

// Update MarkdownEditor initialization to properly wire all components
MarkdownEditor.prototype.initializeComponents = function() {
  console.log('Initializing components...');
  
  // Initialize theme system
  if (window.ThemeManager) {
    this.themeManager = new ThemeManager();
    this.themeManager.init();
  }
  
  // Initialize storage manager
  if (window.StorageManager) {
    this.storageManager = new StorageManager();
  }
  
  // Initialize markdown parser
  if (window.MarkdownParser) {
    this.markdownParser = new MarkdownParser();
  }
  
  // Initialize HTML sanitizer
  if (window.HTMLSanitizer) {
    this.htmlSanitizer = new HTMLSanitizer();
  }
  
  // Initialize UI manager
  if (window.UIManager) {
    this.uiManager = new UIManager(this);
    this.uiManager.initializeLayout();
    this.uiManager.setupEventListeners();
  }
  
  // Initialize keyboard handler
  if (window.KeyboardHandler) {
    this.keyboardHandler = new KeyboardHandler(this);
    this.keyboardHandler.init();
  }
  
  // Initialize formatting manager
  if (window.FormattingManager) {
    this.formattingManager = new FormattingManager(this);
  }
  
  console.log('All components initialized successfully');
};

// Enhanced render method
MarkdownEditor.prototype.render = function(prevState = {}) {
  // Update counters if content changed
  if (this.state.content !== prevState.content) {
    this.updateCounters();
    
    // Only update preview if content actually changed and we're not already updating
    if (!this._updatingPreview) {
      this._updatingPreview = true;
      
      // Use requestAnimationFrame to prevent blocking
      requestAnimationFrame(() => {
        this.updatePreview();
        this._updatingPreview = false;
      });
    }
    
    // Debug log
    console.log('Content changed, updating preview. Content length:', this.state.content.length);
  }
  
  // Update view mode if changed
  if (this.state.viewMode !== prevState.viewMode) {
    this.updateViewMode();
  }
  
  // Update theme if changed
  if (this.state.theme !== prevState.theme) {
    this.updateTheme();
  }
};

// Enhanced updatePreview method
MarkdownEditor.prototype.updatePreview = function() {
  console.log('updatePreview called, content:', this.state.content.substring(0, 50) + '...');
  
  if (this.uiManager) {
    this.uiManager.updatePreview();
  } else {
    // Fallback direct update
    console.log('UIManager not available, using fallback preview update');
    
    const preview = this.elements.preview;
    if (!preview) return;
    
    const content = this.state.content.trim();
    
    if (!content) {
      preview.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10,9 9,9 8,9"></polyline>
          </svg>
          <h3>Начните печатать Markdown...</h3>
          <p>Ваш текст будет отображаться здесь в реальном времени</p>
        </div>
      `;
      return;
    }
    
    try {
      let html = '';
      if (this.markdownParser) {
        html = this.markdownParser.parse(content);
        console.log('Parsed HTML:', html.substring(0, 100) + '...');
      } else {
        // Simple fallback
        html = content
          .replace(/\n/g, '<br>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/^# (.*$)/gm, '<h1>$1</h1>')
          .replace(/^## (.*$)/gm, '<h2>$1</h2>')
          .replace(/^### (.*$)/gm, '<h3>$1</h3>');
        
        html = `<p>${html}</p>`;
        console.log('Fallback HTML:', html.substring(0, 100) + '...');
      }
      
      if (this.htmlSanitizer) {
        html = this.htmlSanitizer.sanitize(html);
      }
      
      preview.innerHTML = html;
      console.log('Preview updated successfully');
      
    } catch (error) {
      console.error('Preview update error:', error);
      preview.innerHTML = `<div class="empty-state"><h3>Ошибка парсинга</h3><p>${error.message}</p></div>`;
    }
  }
};

// Enhanced updateCounters method
MarkdownEditor.prototype.updateCounters = function() {
  const content = this.state.content;
  
  const counters = {
    characters: content.length,
    words: content.trim() ? content.trim().split(/\s+/).length : 0,
    lines: content.split('\n').length
  };
  
  this.setState({ counters });
  
  // Update UI through UIManager
  if (this.uiManager) {
    this.uiManager.updateCounters(counters);
  }
};

// Enhanced theme update
MarkdownEditor.prototype.updateTheme = function() {
  if (this.themeManager) {
    this.themeManager.setTheme(this.state.theme);
  }
};

// Enhanced view mode update
MarkdownEditor.prototype.updateViewMode = function() {
  if (this.uiManager) {
    this.uiManager.setViewMode(this.state.viewMode);
  }
};

// Enhanced modal methods
MarkdownEditor.prototype.showHelpModal = function() {
  if (this.uiManager) {
    this.uiManager.showHelpModal();
  }
};

MarkdownEditor.prototype.hideHelpModal = function() {
  if (this.uiManager) {
    this.uiManager.hideHelpModal();
  }
};

// Enhanced resize handler
MarkdownEditor.prototype.handleResize = function() {
  // Update responsive behavior
  const width = window.innerWidth;
  
  // Switch to mobile layout on small screens
  if (width < 1024 && this.state.viewMode === 'split') {
    // On mobile, split view shows both panels stacked
    console.log('Mobile layout detected');
  }
  
  // Update view controls visibility
  const viewControls = document.querySelector('.view-controls');
  if (viewControls) {
    // View controls are always visible but behavior changes on mobile
    console.log('View controls updated for screen size:', width);
  }
};

// Enhanced scroll sync (for future implementation)
MarkdownEditor.prototype.syncScroll = function() {
  // Placeholder for scroll synchronization between editor and preview
  // This could be implemented to sync scrolling positions
  console.log('Scroll sync triggered');
};

// ===== ERROR HANDLING AND RECOVERY =====

// Enhanced error handling
MarkdownEditor.prototype.handleError = function(error, context = '') {
  console.error(`Application error${context ? ` in ${context}` : ''}:`, error);
  
  // Show user-friendly error message
  const message = this.getErrorMessage(error);
  this.showError(message);
  
  // Log error for debugging
  this.logError(error, context);
};

MarkdownEditor.prototype.getErrorMessage = function(error) {
  if (error.message.includes('Storage')) {
    return 'Ошибка сохранения данных. Проверьте доступное место на диске.';
  }
  
  if (error.message.includes('Parse') || error.message.includes('parsing')) {
    return 'Ошибка обработки Markdown. Проверьте синтаксис.';
  }
  
  if (error.message.includes('Network') || error.message.includes('fetch')) {
    return 'Ошибка сети. Проверьте подключение к интернету.';
  }
  
  return 'Произошла неожиданная ошибка. Попробуйте обновить страницу.';
};

MarkdownEditor.prototype.logError = function(error, context) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    context,
    state: {
      content: this.state.content.substring(0, 100) + '...', // First 100 chars
      theme: this.state.theme,
      viewMode: this.state.viewMode
    },
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.log('Error log:', errorLog);
  
  // In a production app, this could be sent to an error tracking service
};

// ===== PERFORMANCE OPTIMIZATIONS =====

// Debounced input handler
MarkdownEditor.prototype.handleEditorInput = function(content) {
  this.setState({ content });
  
  // Debounce preview updates for better performance
  this.debounce(() => {
    this.updatePreview();
  }, 150, 'previewUpdate')();
};

// Enhanced debounce with cleanup
MarkdownEditor.prototype.debounce = function(func, delay, key = 'default') {
  return (...args) => {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    
    const timer = setTimeout(() => {
      try {
        func.apply(this, args);
      } catch (error) {
        this.handleError(error, `debounced function ${key}`);
      } finally {
        this.debounceTimers.delete(key);
      }
    }, delay);
    
    this.debounceTimers.set(key, timer);
  };
};

// Cleanup method
MarkdownEditor.prototype.cleanup = function() {
  // Clear all debounce timers
  this.debounceTimers.forEach(timer => clearTimeout(timer));
  this.debounceTimers.clear();
  
  // Cleanup theme manager
  if (this.themeManager && this.themeManager.destroy) {
    this.themeManager.destroy();
  }
  
  // Remove event listeners
  document.removeEventListener('keydown', this.handleKeyboardNavigation);
  window.removeEventListener('resize', this.handleResize);
  
  console.log('Application cleanup completed');
};

// ===== ACCESSIBILITY ENHANCEMENTS =====

// Enhanced keyboard navigation
MarkdownEditor.prototype.handleKeyboardNavigation = function(e) {
  if (e.key === 'Tab') {
    this.isKeyboardNavigation = true;
    document.body.classList.add('keyboard-navigation');
    
    // Announce keyboard navigation mode to screen readers
    if (!this.keyboardModeAnnounced) {
      this.announceToScreenReader('Режим навигации с клавиатуры активен');
      this.keyboardModeAnnounced = true;
    }
  }
};

// Screen reader announcements
MarkdownEditor.prototype.announceToScreenReader = function(message) {
  if (this.uiManager && this.uiManager.announceToScreenReader) {
    this.uiManager.announceToScreenReader(message);
  }
};

// ===== APPLICATION LIFECYCLE =====

// Enhanced initialization with error handling
MarkdownEditor.prototype.init = async function() {
  try {
    console.log('Initializing Markdown Editor...');
    
    // Show loading state
    this.showLoadingState();
    
    // Cache DOM elements
    this.cacheElements();
    
    // Initialize components with error handling
    await this.initializeComponentsSafely();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Load saved state
    await this.loadSavedState();
    
    // Simulate loading time (400-700ms as per requirements)
    const loadingTime = 500 + Math.random() * 200; // 500-700ms
    await this.delay(loadingTime);
    
    // Hide loading and show app
    this.hideLoadingState();
    
    // Mark as initialized
    this.setState({ isInitialized: true });
    
    // Initial render
    this.render();
    
    // Focus editor for immediate use
    if (this.elements.editor) {
      this.elements.editor.focus();
    }
    
    console.log('Markdown Editor initialized successfully');
    
    // Show welcome message
    this.showToast('Markdown Editor готов к работе!', 'success');
    
  } catch (error) {
    console.error('Failed to initialize Markdown Editor:', error);
    this.handleError(error, 'initialization');
    
    // Try to show a basic error state
    this.showFallbackErrorState();
  }
};

// Safe component initialization
MarkdownEditor.prototype.initializeComponentsSafely = async function() {
  const components = [
    { name: 'ThemeManager', class: window.ThemeManager, init: true },
    { name: 'StorageManager', class: window.StorageManager, init: false },
    { name: 'MarkdownParser', class: window.MarkdownParser, init: false },
    { name: 'HTMLSanitizer', class: window.HTMLSanitizer, init: false },
    { name: 'UIManager', class: window.UIManager, init: true },
    { name: 'KeyboardHandler', class: window.KeyboardHandler, init: true },
    { name: 'FormattingManager', class: window.FormattingManager, init: false }
  ];
  
  for (const component of components) {
    try {
      if (component.class) {
        const instance = new component.class(this);
        const propertyName = component.name.charAt(0).toLowerCase() + component.name.slice(1);
        this[propertyName] = instance;
        
        if (component.init && instance.init) {
          await instance.init();
        }
        
        console.log(`${component.name} initialized successfully`);
      } else {
        console.warn(`${component.name} class not found`);
      }
    } catch (error) {
      console.error(`Failed to initialize ${component.name}:`, error);
      // Continue with other components
    }
  }
  
  // Ensure preview updates when content changes
  if (this.elements.editor && this.uiManager) {
    console.log('Setting up live preview updates...');
    
    // Initial preview update
    this.updatePreview();
  }
};

// Fallback error state
MarkdownEditor.prototype.showFallbackErrorState = function() {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 2rem;">
        <div>
          <h1 style="color: #dc2626; margin-bottom: 1rem;">Ошибка инициализации</h1>
          <p style="margin-bottom: 1rem;">Не удалось загрузить Markdown Editor.</p>
          <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
            Перезагрузить страницу
          </button>
        </div>
      </div>
    `;
    app.style.display = 'block';
  }
  
  // Hide loading overlay
  const loading = document.getElementById('loading-overlay');
  if (loading) {
    loading.style.display = 'none';
  }
};

// Window beforeunload handler
window.addEventListener('beforeunload', (e) => {
  if (window.markdownEditor) {
    // Save current state
    try {
      if (window.markdownEditor.storageManager) {
        window.markdownEditor.storageManager.saveContent(window.markdownEditor.state.content);
        window.markdownEditor.storageManager.saveSettings({
          theme: window.markdownEditor.state.theme,
          viewMode: window.markdownEditor.state.viewMode
        });
      }
    } catch (error) {
      console.warn('Failed to save on beforeunload:', error);
    }
    
    // Cleanup
    window.markdownEditor.cleanup();
  }
});

// Global error handler
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  
  if (window.markdownEditor) {
    window.markdownEditor.handleError(e.error, 'global');
  }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  
  if (window.markdownEditor) {
    window.markdownEditor.handleError(new Error(e.reason), 'promise rejection');
  }
});

console.log('Markdown Editor application loaded successfully');
console.log('Author: Шоназаров Аброр, группа 085 23');
console.log('Variant: 17');