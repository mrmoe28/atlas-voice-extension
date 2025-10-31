// Atlas Voice Panel - Content Script for Browser Automation
// This script runs in web pages to enable browser automation

console.log('Atlas Voice Panel content script loaded');

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  try {
    switch (request.action) {
      case 'clickElement':
        handleClickElement(request, sendResponse);
        break;
      case 'typeText':
        handleTypeText(request, sendResponse);
        break;
      case 'scrollPage':
        handleScrollPage(request, sendResponse);
        break;
      case 'getPageInfo':
        handleGetPageInfo(request, sendResponse);
        break;
      case 'findElement':
        handleFindElement(request, sendResponse);
        break;
      case 'mouseMove':
        handleMouseMove(request, sendResponse);
        break;
      case 'mouseClick':
        handleMouseClick(request, sendResponse);
        break;
      case 'takeScreenshot':
        handleTakeScreenshot(request, sendResponse);
        break;
      case 'doubleClick':
        handleDoubleClick(request, sendResponse);
        break;
      case 'rightClick':
        handleRightClick(request, sendResponse);
        break;
      case 'hoverElement':
        handleHoverElement(request, sendResponse);
        break;
      case 'clearField':
        handleClearField(request, sendResponse);
        break;
      case 'selectAll':
        handleSelectAll(request, sendResponse);
        break;
      case 'copyText':
        handleCopyText(request, sendResponse);
        break;
      case 'pasteText':
        handlePasteText(request, sendResponse);
        break;
      case 'dragDrop':
        handleDragDrop(request, sendResponse);
        break;
      case 'keyPress':
        handleKeyPress(request, sendResponse);
        break;
      case 'keyCombination':
        handleKeyCombination(request, sendResponse);
        break;
      case 'fillForm':
        handleFillForm(request, sendResponse);
        break;
      case 'extractData':
        handleExtractData(request, sendResponse);
        break;
      case 'debugElements':
        handleDebugElements(request, sendResponse);
        break;
      case 'waitForElement':
        handleWaitForElement(request, sendResponse);
        break;
      case 'batchClick':
        handleBatchClick(request, sendResponse);
        break;
      case 'smartFillForm':
        handleSmartFillForm(request, sendResponse);
        break;
      case 'highlightElements':
        handleHighlightElements(request, sendResponse);
        break;
      case 'getElementInfo':
        handleGetElementInfo(request, sendResponse);
        break;
      case 'uploadFile':
        handleUploadFile(request, sendResponse);
        break;
      case 'enhancedDragDrop':
        handleEnhancedDragDrop(request, sendResponse);
        break;
      case 'simulateFileUpload':
        handleSimulateFileUpload(request, sendResponse);
        break;
      default:
        sendResponse({ error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Content script error:', error);
    sendResponse({ error: error.message });
  }
  
  return true; // Keep message channel open for async response
});

// Enhanced click element with advanced detection and visual feedback
function handleClickElement(request, sendResponse) {
  try {
    const { selector, text, element_type, wait_for_visible = true, highlight = true } = request;
    let element;

    if (selector) {
      element = document.querySelector(selector);
    } else if (text) {
      // Find element by text content with smart matching
      element = findElementByTextSmart(text, element_type);
    }

    if (element) {
      // Check if element is visible and interactable
      if (wait_for_visible && !isElementInteractable(element)) {
        sendResponse({ error: `Element found but not interactable: ${selector || text}` });
        return;
      }

      // Highlight element before clicking (for user feedback)
      if (highlight) {
        highlightElement(element);
      }

      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Wait for scroll to complete, then click
      setTimeout(() => {
        try {
          // Try multiple click methods for better compatibility
          if (element.click) {
            element.click();
          } else {
            // Fallback: dispatch click event
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            element.dispatchEvent(clickEvent);
          }

          sendResponse({
            success: true,
            message: `Clicked element: ${selector || text}`,
            element_info: {
              tagName: element.tagName,
              text: element.textContent?.trim().substring(0, 50),
              position: element.getBoundingClientRect()
            }
          });
        } catch (clickError) {
          sendResponse({ error: `Click failed: ${clickError.message}` });
        }
      }, 500);
    } else {
      // Enhanced error reporting with suggestions
      const suggestions = generateClickSuggestions(text || selector);
      sendResponse({
        error: `Element not found: ${selector || text}`,
        suggestions: suggestions
      });
    }
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Type text into an element
function handleTypeText(request, sendResponse) {
  try {
    const { selector, text, clear } = request;
    const element = document.querySelector(selector);
    
    if (element && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.contentEditable === 'true')) {
      element.focus();
      
      if (clear) {
        element.value = '';
        element.textContent = '';
      }
      
      // Simulate typing
      element.value = text;
      element.textContent = text;
      
      // Trigger input events
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      
      sendResponse({ success: true, message: `Typed "${text}" into ${selector}` });
    } else {
      sendResponse({ error: `Input element not found: ${selector}` });
    }
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Scroll the page
function handleScrollPage(request, sendResponse) {
  try {
    const { direction, amount } = request;
    const scrollAmount = amount || 300;
    
    switch (direction) {
      case 'up':
        window.scrollBy(0, -scrollAmount);
        break;
      case 'down':
        window.scrollBy(0, scrollAmount);
        break;
      case 'left':
        window.scrollBy(-scrollAmount, 0);
        break;
      case 'right':
        window.scrollBy(scrollAmount, 0);
        break;
      case 'top':
        window.scrollTo(0, 0);
        break;
      case 'bottom':
        window.scrollTo(0, document.body.scrollHeight);
        break;
      default:
        sendResponse({ error: 'Invalid scroll direction' });
        return;
    }
    
    sendResponse({ success: true, message: `Scrolled ${direction}` });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Get page information
function handleGetPageInfo(request, sendResponse) {
  try {
    const info = {
      title: document.title,
      url: window.location.href,
      domain: window.location.hostname,
      elements: {
        links: document.querySelectorAll('a').length,
        buttons: document.querySelectorAll('button').length,
        inputs: document.querySelectorAll('input').length,
        images: document.querySelectorAll('img').length
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    
    sendResponse({ success: true, data: info });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Find element by text content
function handleFindElement(request, sendResponse) {
  try {
    const { text } = request;
    const element = findElementByText(text);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      sendResponse({ 
        success: true, 
        data: {
          tagName: element.tagName,
          text: element.textContent.trim(),
          position: { x: rect.left, y: rect.top },
          size: { width: rect.width, height: rect.height }
        }
      });
    } else {
      sendResponse({ error: `Element with text "${text}" not found` });
    }
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Mouse move simulation
function handleMouseMove(request, sendResponse) {
  try {
    const { x, y } = request;
    
    // Create mouse move event
    const event = new MouseEvent('mousemove', {
      clientX: x,
      clientY: y,
      bubbles: true
    });
    
    document.dispatchEvent(event);
    sendResponse({ success: true, message: `Mouse moved to (${x}, ${y})` });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Mouse click simulation
function handleMouseClick(request, sendResponse) {
  try {
    const { x, y, button = 'left' } = request;
    
    // Create mouse click event
    const event = new MouseEvent('click', {
      clientX: x,
      clientY: y,
      button: button === 'right' ? 2 : 0,
      bubbles: true
    });
    
    document.dispatchEvent(event);
    sendResponse({ success: true, message: `Mouse clicked at (${x}, ${y})` });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Helper function to check if element is interactable
function isElementInteractable(element) {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);

  // Check if element is visible
  if (rect.width === 0 || rect.height === 0) return false;
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  if (style.opacity === '0') return false;

  // Check if element is enabled
  if (element.disabled) return false;

  // Check if element is in viewport
  if (rect.top < 0 || rect.left < 0 ||
      rect.bottom > window.innerHeight ||
      rect.right > window.innerWidth) return false;

  return true;
}

// Helper function to generate click suggestions when element not found
function generateClickSuggestions(searchText) {
  const suggestions = [];
  const lowerText = searchText.toLowerCase();

  // Find similar elements
  const allElements = document.querySelectorAll('button, a, input[type="submit"], input[type="button"], [role="button"]');
  const similarElements = [];

  for (const element of allElements) {
    const text = element.textContent?.toLowerCase() || '';
    const attributes = [
      element.getAttribute('title'),
      element.getAttribute('aria-label'),
      element.getAttribute('placeholder'),
      element.getAttribute('value')
    ].filter(Boolean).map(attr => attr.toLowerCase());

    if (text.includes(lowerText) || attributes.some(attr => attr.includes(lowerText))) {
      similarElements.push({
        text: element.textContent?.trim().substring(0, 30),
        tagName: element.tagName,
        id: element.id,
        className: element.className
      });
    }
  }

  if (similarElements.length > 0) {
    suggestions.push('Similar elements found:', ...similarElements.slice(0, 5));
  }

  // Suggest common selectors
  const commonSelectors = [
    'button',
    'a',
    'input[type="submit"]',
    'input[type="button"]',
    '[role="button"]',
    '.btn',
    '.button'
  ];

  suggestions.push('Try these selectors:', ...commonSelectors);

  return suggestions;
}

// Helper function to find element by text with smart matching
function findElementByTextSmart(text, elementType = null) {
  const searchText = text.toLowerCase().trim();
  const elements = document.querySelectorAll('*');
  
  // Priority order for element types
  const prioritySelectors = [
    'button', 'a', 'input[type="submit"]', 'input[type="button"]',
    '[role="button"]', '[onclick]', '.btn', '.button',
    // YouTube specific selectors
    'ytd-video-renderer', 'ytd-compact-video-renderer', 'ytd-rich-item-renderer',
    'h3', 'h2', 'h1', '[id*="video-title"]', '[class*="video-title"]',
    'span[class*="title"]', 'div[class*="title"]'
  ];
  
  // First try priority elements (buttons, links, etc.)
  for (const selector of prioritySelectors) {
    const priorityElements = document.querySelectorAll(selector);
    for (const element of priorityElements) {
      if (elementMatchesText(element, searchText)) {
        console.log('Found element by selector:', selector, element);
        return element;
      }
    }
  }
  
  // Try to find YouTube video elements specifically
  if (window.location.hostname.includes('youtube.com')) {
    const videoElements = findYouTubeVideoElements(searchText);
    if (videoElements.length > 0) {
      console.log('Found YouTube video elements:', videoElements);
      return videoElements[0]; // Return first match
    }
  }
  
  // Then try all elements
  for (const element of elements) {
    if (elementMatchesText(element, searchText)) {
      console.log('Found element by text search:', element);
      return element;
    }
  }
  
  console.log('No element found for text:', searchText);
  return null;
}

// YouTube-specific video element finder
function findYouTubeVideoElements(searchText) {
  const videoElements = [];
  
  // Try different YouTube selectors
  const youtubeSelectors = [
    'ytd-video-renderer h3 a',
    'ytd-compact-video-renderer h3 a', 
    'ytd-rich-item-renderer h3 a',
    'ytd-video-renderer #video-title',
    'ytd-compact-video-renderer #video-title',
    'ytd-rich-item-renderer #video-title',
    'ytd-video-renderer a#video-title',
    'ytd-compact-video-renderer a#video-title',
    'ytd-rich-item-renderer a#video-title'
  ];
  
  for (const selector of youtubeSelectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      if (elementMatchesText(element, searchText)) {
        videoElements.push(element);
      }
    }
  }
  
  // Also try finding by partial text match in video containers
  const videoContainers = document.querySelectorAll('ytd-video-renderer, ytd-compact-video-renderer, ytd-rich-item-renderer');
  for (const container of videoContainers) {
    const titleElement = container.querySelector('h3 a, #video-title, a#video-title');
    if (titleElement && elementMatchesText(titleElement, searchText)) {
      videoElements.push(titleElement);
    }
  }
  
  return videoElements;
}

// Helper function to check if element matches text
function elementMatchesText(element, searchText) {
  // Check text content with fuzzy matching
  if (element.textContent) {
    const elementText = element.textContent.toLowerCase().trim();
    
    // Exact match
    if (elementText === searchText) {
      return true;
    }
    
    // Contains match
    if (elementText.includes(searchText)) {
      return true;
    }
    
    // Fuzzy match for partial words
    const searchWords = searchText.split(' ').filter(word => word.length > 2);
    const elementWords = elementText.split(' ').filter(word => word.length > 2);
    
    if (searchWords.length > 0) {
      const matchCount = searchWords.filter(searchWord => 
        elementWords.some(elementWord => elementWord.includes(searchWord))
      ).length;
      
      // If more than 50% of search words match, consider it a match
      if (matchCount / searchWords.length >= 0.5) {
        return true;
      }
    }
  }
  
  // Check attributes
  const attributes = ['title', 'alt', 'aria-label', 'placeholder', 'value'];
  for (const attr of attributes) {
    if (element.getAttribute(attr)) {
      const attrValue = element.getAttribute(attr).toLowerCase();
      if (attrValue.includes(searchText)) {
        return true;
      }
    }
  }
  
  // Check data attributes
  for (const attr of element.attributes) {
    if (attr.name.startsWith('data-') && attr.value.toLowerCase().includes(searchText)) {
      return true;
    }
  }
  
  return false;
}

// Helper function to find element by text (legacy)
function findElementByText(text) {
  const elements = document.querySelectorAll('*');
  for (const element of elements) {
    if (element.textContent && element.textContent.trim().toLowerCase().includes(text.toLowerCase())) {
      return element;
    }
  }
  return null;
}

// Helper function to highlight element (for debugging)
function highlightElement(element) {
  const originalStyle = element.style.cssText;
  element.style.cssText = 'border: 2px solid red !important; background-color: yellow !important;';
  
  setTimeout(() => {
    element.style.cssText = originalStyle;
  }, 2000);
}

// Take screenshot of current page
function handleTakeScreenshot(request, sendResponse) {
  try {
    // Use html2canvas if available, otherwise fallback
    if (typeof html2canvas !== 'undefined') {
      html2canvas(document.body).then(canvas => {
        const dataURL = canvas.toDataURL('image/png');
        sendResponse({ success: true, data: dataURL });
      });
    } else {
      // Fallback: return page info
      sendResponse({ 
        success: true, 
        message: 'Screenshot taken (basic mode)',
        data: {
          title: document.title,
          url: window.location.href,
          viewport: { width: window.innerWidth, height: window.innerHeight }
        }
      });
    }
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Double click element
function handleDoubleClick(request, sendResponse) {
  try {
    const { text } = request;
    const element = findElementByTextSmart(text);
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        const event = new MouseEvent('dblclick', { bubbles: true });
        element.dispatchEvent(event);
        sendResponse({ success: true, message: `Double-clicked: ${text}` });
      }, 500);
    } else {
      sendResponse({ error: `Element not found: ${text}` });
    }
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Right click element
function handleRightClick(request, sendResponse) {
  try {
    const { text } = request;
    const element = findElementByTextSmart(text);
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        const event = new MouseEvent('contextmenu', { bubbles: true });
        element.dispatchEvent(event);
        sendResponse({ success: true, message: `Right-clicked: ${text}` });
      }, 500);
    } else {
      sendResponse({ error: `Element not found: ${text}` });
    }
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Hover over element
function handleHoverElement(request, sendResponse) {
  try {
    const { text } = request;
    const element = findElementByTextSmart(text);
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        const event = new MouseEvent('mouseover', { bubbles: true });
        element.dispatchEvent(event);
        sendResponse({ success: true, message: `Hovered over: ${text}` });
      }, 500);
    } else {
      sendResponse({ error: `Element not found: ${text}` });
    }
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Clear input field
function handleClearField(request, sendResponse) {
  try {
    const { selector } = request;
    const element = document.querySelector(selector);
    
    if (element && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')) {
      element.focus();
      element.value = '';
      element.dispatchEvent(new Event('input', { bubbles: true }));
      sendResponse({ success: true, message: `Cleared field: ${selector}` });
    } else {
      sendResponse({ error: `Input field not found: ${selector}` });
    }
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Select all text
function handleSelectAll(request, sendResponse) {
  try {
    document.execCommand('selectAll');
    sendResponse({ success: true, message: 'Selected all text' });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Copy text to clipboard
function handleCopyText(request, sendResponse) {
  try {
    const success = document.execCommand('copy');
    if (success) {
      sendResponse({ success: true, message: 'Text copied to clipboard' });
    } else {
      sendResponse({ error: 'Failed to copy text' });
    }
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Paste text from clipboard
function handlePasteText(request, sendResponse) {
  try {
    const { text } = request;
    const activeElement = document.activeElement;
    
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      activeElement.value = text;
      activeElement.dispatchEvent(new Event('input', { bubbles: true }));
      sendResponse({ success: true, message: `Pasted: ${text}` });
    } else {
      sendResponse({ error: 'No active input field' });
    }
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Drag and drop elements
function handleDragDrop(request, sendResponse) {
  try {
    const { source, target } = request;
    const sourceElement = findElementByTextSmart(source);
    const targetElement = findElementByTextSmart(target);
    
    if (sourceElement && targetElement) {
      // Simulate drag and drop
      const dragEvent = new DragEvent('dragstart', { bubbles: true });
      sourceElement.dispatchEvent(dragEvent);
      
      setTimeout(() => {
        const dropEvent = new DragEvent('drop', { bubbles: true });
        targetElement.dispatchEvent(dropEvent);
        sendResponse({ success: true, message: `Dragged ${source} to ${target}` });
      }, 100);
    } else {
      sendResponse({ error: `Elements not found: ${source} or ${target}` });
    }
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Press specific key
function handleKeyPress(request, sendResponse) {
  try {
    const { key } = request;
    const keyCode = getKeyCode(key);
    
    const event = new KeyboardEvent('keydown', {
      key: key,
      keyCode: keyCode,
      bubbles: true
    });
    
    document.dispatchEvent(event);
    
    setTimeout(() => {
      const keyUpEvent = new KeyboardEvent('keyup', {
        key: key,
        keyCode: keyCode,
        bubbles: true
      });
      document.dispatchEvent(keyUpEvent);
    }, 50);
    
    sendResponse({ success: true, message: `Pressed key: ${key}` });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Press key combination
function handleKeyCombination(request, sendResponse) {
  try {
    const { keys } = request;
    const keyArray = keys.split('+');
    
    // Simulate key combination
    keyArray.forEach(key => {
      const keyCode = getKeyCode(key.trim());
      const event = new KeyboardEvent('keydown', {
        key: key.trim(),
        keyCode: keyCode,
        bubbles: true
      });
      document.dispatchEvent(event);
    });
    
    setTimeout(() => {
      keyArray.forEach(key => {
        const keyCode = getKeyCode(key.trim());
        const event = new KeyboardEvent('keyup', {
          key: key.trim(),
          keyCode: keyCode,
          bubbles: true
        });
        document.dispatchEvent(event);
      });
    }, 100);
    
    sendResponse({ success: true, message: `Pressed combination: ${keys}` });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Helper function to get key code
function getKeyCode(key) {
  const keyMap = {
    'Enter': 13,
    'Escape': 27,
    'Tab': 9,
    'Space': 32,
    'Backspace': 8,
    'Delete': 46,
    'ArrowUp': 38,
    'ArrowDown': 40,
    'ArrowLeft': 37,
    'ArrowRight': 39,
    'Ctrl': 17,
    'Alt': 18,
    'Shift': 16,
    'Meta': 91
  };
  
  return keyMap[key] || key.charCodeAt(0);
}

// Fill form fields
function handleFillForm(request, sendResponse) {
  try {
    const { fields } = request;
    let filledCount = 0;
    
    for (const [fieldName, value] of Object.entries(fields)) {
      // Try different selectors for the field
      const selectors = [
        `input[name="${fieldName}"]`,
        `input[id="${fieldName}"]`,
        `input[placeholder*="${fieldName}"]`,
        `textarea[name="${fieldName}"]`,
        `textarea[id="${fieldName}"]`,
        `select[name="${fieldName}"]`,
        `select[id="${fieldName}"]`
      ];
      
      let element = null;
      for (const selector of selectors) {
        element = document.querySelector(selector);
        if (element) break;
      }
      
      if (element) {
        element.focus();
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        filledCount++;
      }
    }
    
    sendResponse({ 
      success: true, 
      message: `Filled ${filledCount} form fields`,
      filledCount 
    });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Extract data from page
function handleExtractData(request, sendResponse) {
  try {
    const { data_type, selector } = request;
    let data = {};
    
    switch (data_type) {
      case 'text':
        if (selector) {
          const elements = document.querySelectorAll(selector);
          data.text = Array.from(elements).map(el => el.textContent.trim());
        } else {
          data.text = document.body.textContent.trim();
        }
        break;
        
      case 'links':
        const links = document.querySelectorAll('a[href]');
        data.links = Array.from(links).map(link => ({
          text: link.textContent.trim(),
          href: link.href
        }));
        break;
        
      case 'images':
        const images = document.querySelectorAll('img[src]');
        data.images = Array.from(images).map(img => ({
          src: img.src,
          alt: img.alt,
          title: img.title
        }));
        break;
        
      case 'forms':
        const forms = document.querySelectorAll('form');
        data.forms = Array.from(forms).map(form => {
          const inputs = form.querySelectorAll('input, textarea, select');
          return {
            action: form.action,
            method: form.method,
            fields: Array.from(inputs).map(input => ({
              name: input.name,
              type: input.type,
              placeholder: input.placeholder,
              value: input.value
            }))
          };
        });
        break;
        
      case 'tables':
        const tables = document.querySelectorAll('table');
        data.tables = Array.from(tables).map(table => {
          const rows = table.querySelectorAll('tr');
          return Array.from(rows).map(row => {
            const cells = row.querySelectorAll('td, th');
            return Array.from(cells).map(cell => cell.textContent.trim());
          });
        });
        break;
        
      case 'all':
        data = {
          title: document.title,
          url: window.location.href,
          text: document.body.textContent.trim(),
          links: Array.from(document.querySelectorAll('a[href]')).map(link => ({
            text: link.textContent.trim(),
            href: link.href
          })),
          images: Array.from(document.querySelectorAll('img[src]')).map(img => ({
            src: img.src,
            alt: img.alt
          }))
        };
        break;
        
      default:
        sendResponse({ error: 'Invalid data type' });
        return;
    }
    
    sendResponse({ success: true, data });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Wait for element to appear (useful for dynamic content)
function handleWaitForElement(request, sendResponse) {
  try {
    const { selector, text, timeout = 10000, interval = 500 } = request;
    const startTime = Date.now();
    
    function checkForElement() {
      let element = null;
      
      if (selector) {
        element = document.querySelector(selector);
      } else if (text) {
        element = findElementByTextSmart(text);
      }
      
      if (element && isElementInteractable(element)) {
        sendResponse({ 
          success: true, 
          message: `Element found after ${Date.now() - startTime}ms`,
          element_info: {
            tagName: element.tagName,
            text: element.textContent?.trim().substring(0, 50),
            position: element.getBoundingClientRect()
          }
        });
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        sendResponse({ error: `Element not found within ${timeout}ms timeout` });
        return;
      }
      
      setTimeout(checkForElement, interval);
    }
    
    checkForElement();
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Batch click multiple elements
function handleBatchClick(request, sendResponse) {
  try {
    const { elements, delay = 1000 } = request;
    let clickedCount = 0;
    let errors = [];
    
    async function clickNext(index) {
      if (index >= elements.length) {
        sendResponse({ 
          success: true, 
          message: `Batch clicked ${clickedCount} elements`,
          clickedCount,
          errors: errors.length > 0 ? errors : undefined
        });
        return;
      }
      
      const elementData = elements[index];
      try {
        let element = null;
        
        if (elementData.selector) {
          element = document.querySelector(elementData.selector);
        } else if (elementData.text) {
          element = findElementByTextSmart(elementData.text, elementData.element_type);
        }
        
        if (element && isElementInteractable(element)) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          setTimeout(() => {
            element.click();
            clickedCount++;
            
            // Wait before next click
            setTimeout(() => clickNext(index + 1), delay);
          }, 500);
        } else {
          errors.push(`Element ${index + 1} not found or not interactable`);
          setTimeout(() => clickNext(index + 1), delay);
        }
      } catch (error) {
        errors.push(`Element ${index + 1} error: ${error.message}`);
        setTimeout(() => clickNext(index + 1), delay);
      }
    }
    
    clickNext(0);
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Smart form filling with better field detection
function handleSmartFillForm(request, sendResponse) {
  try {
    const { fields, form_selector } = request;
    let filledCount = 0;
    let errors = [];
    
    // Find form container
    let formContainer = document;
    if (form_selector) {
      formContainer = document.querySelector(form_selector);
      if (!formContainer) {
        sendResponse({ error: `Form container not found: ${form_selector}` });
        return;
      }
    }
    
    for (const [fieldName, value] of Object.entries(fields)) {
      try {
        // Enhanced field detection with multiple strategies
        const fieldSelectors = [
          // Direct selectors
          `input[name="${fieldName}"]`,
          `input[id="${fieldName}"]`,
          `textarea[name="${fieldName}"]`,
          `textarea[id="${fieldName}"]`,
          `select[name="${fieldName}"]`,
          `select[id="${fieldName}"]`,
          
          // Placeholder-based
          `input[placeholder*="${fieldName}"]`,
          `textarea[placeholder*="${fieldName}"]`,
          
          // Label-based
          `input[id="${fieldName.toLowerCase()}"]`,
          `textarea[id="${fieldName.toLowerCase()}"]`,
          
          // Type-based for common fields
          fieldName.toLowerCase().includes('email') ? 'input[type="email"]' : null,
          fieldName.toLowerCase().includes('password') ? 'input[type="password"]' : null,
          fieldName.toLowerCase().includes('phone') ? 'input[type="tel"]' : null,
          fieldName.toLowerCase().includes('name') ? 'input[type="text"]' : null,
          
          // Data attributes
          `input[data-field="${fieldName}"]`,
          `input[data-name="${fieldName}"]`
        ].filter(Boolean);
        
        let element = null;
        for (const selector of fieldSelectors) {
          element = formContainer.querySelector(selector);
          if (element && !element.disabled && isElementInteractable(element)) {
            break;
          }
        }
        
        if (element) {
          element.focus();
          element.value = value;
          
          // Trigger all relevant events
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          element.dispatchEvent(new Event('blur', { bubbles: true }));
          
          filledCount++;
        } else {
          errors.push(`Field "${fieldName}" not found`);
        }
      } catch (error) {
        errors.push(`Field "${fieldName}" error: ${error.message}`);
      }
    }
    
    sendResponse({ 
      success: true, 
      message: `Smart filled ${filledCount} form fields`,
      filledCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Highlight multiple elements for debugging
function handleHighlightElements(request, sendResponse) {
  try {
    const { selectors, text_queries, duration = 3000, color = 'red' } = request;
    const highlightedElements = [];
    
    // Highlight by selectors
    if (selectors) {
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          highlightElementWithColor(element, color, duration);
          highlightedElements.push({
            selector,
            tagName: element.tagName,
            text: element.textContent?.trim().substring(0, 30)
          });
        });
      }
    }
    
    // Highlight by text queries
    if (text_queries) {
      for (const textQuery of text_queries) {
        const element = findElementByTextSmart(textQuery);
        if (element) {
          highlightElementWithColor(element, color, duration);
          highlightedElements.push({
            textQuery,
            tagName: element.tagName,
            text: element.textContent?.trim().substring(0, 30)
          });
        }
      }
    }
    
    sendResponse({ 
      success: true, 
      message: `Highlighted ${highlightedElements.length} elements`,
      highlightedElements
    });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Get detailed information about an element
function handleGetElementInfo(request, sendResponse) {
  try {
    const { selector, text } = request;
    let element = null;
    
    if (selector) {
      element = document.querySelector(selector);
    } else if (text) {
      element = findElementByTextSmart(text);
    }
    
    if (element) {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      
      const info = {
        // Basic info
        tagName: element.tagName,
        id: element.id,
        className: element.className,
        textContent: element.textContent?.trim().substring(0, 100),
        
        // Position and size
        position: {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        },
        
        // Visibility
        visible: rect.width > 0 && rect.height > 0,
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        
        // Interactability
        disabled: element.disabled,
        interactable: isElementInteractable(element),
        
        // Attributes
        attributes: Array.from(element.attributes).reduce((acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {}),
        
        // Form-specific info
        formInfo: element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' ? {
          type: element.type,
          name: element.name,
          placeholder: element.placeholder,
          value: element.value,
          required: element.required
        } : null
      };
      
      sendResponse({ success: true, data: info });
    } else {
      sendResponse({ error: `Element not found: ${selector || text}` });
    }
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Helper function to highlight element with custom color and duration
function highlightElementWithColor(element, color, duration) {
  const originalStyle = element.style.cssText;
  element.style.cssText = `border: 3px solid ${color} !important; background-color: rgba(255, 255, 0, 0.3) !important; box-shadow: 0 0 10px ${color} !important;`;
  
  setTimeout(() => {
    element.style.cssText = originalStyle;
  }, duration);
}

// Enhanced drag and drop with visual feedback and file support
function handleEnhancedDragDrop(request, sendResponse) {
  try {
    const { source, target, files, duration = 1000, visual_feedback = true } = request;
    const sourceElement = findElementByTextSmart(source);
    const targetElement = findElementByTextSmart(target);
    
    if (!sourceElement || !targetElement) {
      sendResponse({ error: `Elements not found: ${source} or ${target}` });
      return;
    }
    
    // Visual feedback: highlight elements
    if (visual_feedback) {
      highlightElementWithColor(sourceElement, 'blue', duration);
      highlightElementWithColor(targetElement, 'green', duration);
    }
    
    // Scroll elements into view
    sourceElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
    
    // Simulate enhanced drag and drop sequence
    setTimeout(() => {
      try {
        // Create comprehensive drag events
        const dragStartEvent = new DragEvent('dragstart', {
          bubbles: true,
          cancelable: true,
          dataTransfer: createDataTransfer(files)
        });
        
        sourceElement.dispatchEvent(dragStartEvent);
        
        // Simulate drag over target
        setTimeout(() => {
          const dragOverEvent = new DragEvent('dragover', {
            bubbles: true,
            cancelable: true,
            dataTransfer: createDataTransfer(files)
          });
          targetElement.dispatchEvent(dragOverEvent);
          
          // Drop event
          setTimeout(() => {
            const dropEvent = new DragEvent('drop', {
              bubbles: true,
              cancelable: true,
              dataTransfer: createDataTransfer(files)
            });
            targetElement.dispatchEvent(dropEvent);
            
            // Drag end event
            setTimeout(() => {
              const dragEndEvent = new DragEvent('dragend', {
                bubbles: true,
                cancelable: true
              });
              sourceElement.dispatchEvent(dragEndEvent);
              
              sendResponse({ 
                success: true, 
                message: `Enhanced drag and drop: ${source} → ${target}`,
                files_transferred: files ? files.length : 0
              });
            }, 100);
          }, 200);
        }, 300);
        
      } catch (error) {
        sendResponse({ error: `Drag and drop failed: ${error.message}` });
      }
    }, 500);
    
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// File upload functionality
function handleUploadFile(request, sendResponse) {
  try {
    const { selector, files, file_data, file_names } = request;
    let targetElement = null;
    
    // Find file input element
    if (selector) {
      targetElement = document.querySelector(selector);
    } else {
      // Try to find file input automatically
      const fileInputs = document.querySelectorAll('input[type="file"]');
      if (fileInputs.length > 0) {
        targetElement = fileInputs[0]; // Use first file input found
      }
    }
    
    if (!targetElement) {
      sendResponse({ error: 'File input element not found' });
      return;
    }
    
    // Create File objects if file_data is provided
    if (file_data && file_names) {
      const fileObjects = file_data.map((data, index) => {
        const fileName = file_names[index] || `file_${index + 1}.txt`;
        const mimeType = getMimeTypeFromFileName(fileName);
        
        // Convert base64 to blob if needed
        let blob;
        if (data.startsWith('data:')) {
          // Data URL format
          const response = fetch(data);
          blob = response.then(r => r.blob());
        } else if (data.startsWith('data:application/')) {
          // Base64 encoded data
          const base64Data = data.split(',')[1];
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          blob = new Blob([bytes], { type: mimeType });
        } else {
          // Plain text data
          blob = new Blob([data], { type: mimeType });
        }
        
        return new File([blob], fileName, { type: mimeType });
      });
      
      // Set files on input element
      const dataTransfer = new DataTransfer();
      fileObjects.forEach(file => dataTransfer.items.add(file));
      targetElement.files = dataTransfer.files;
      
      // Trigger change event
      targetElement.dispatchEvent(new Event('change', { bubbles: true }));
      
      sendResponse({ 
        success: true, 
        message: `Uploaded ${fileObjects.length} files to ${selector || 'file input'}`,
        files_uploaded: fileObjects.length,
        file_names: file_names
      });
    } else {
      sendResponse({ error: 'No file data provided' });
    }
    
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Simulate file upload with drag and drop
function handleSimulateFileUpload(request, sendResponse) {
  try {
    const { target_selector, files, file_names, file_data } = request;
    let targetElement = null;
    
    // Find drop target
    if (target_selector) {
      targetElement = document.querySelector(target_selector);
    } else {
      // Look for common drop zones
      const dropZones = document.querySelectorAll('[class*="drop"], [class*="upload"], [class*="drag"]');
      if (dropZones.length > 0) {
        targetElement = dropZones[0];
      }
    }
    
    if (!targetElement) {
      sendResponse({ error: 'Drop target not found' });
      return;
    }
    
    // Create file objects
    const fileObjects = [];
    if (file_data && file_names) {
      fileObjects.push(...file_data.map((data, index) => {
        const fileName = file_names[index] || `file_${index + 1}.txt`;
        const mimeType = getMimeTypeFromFileName(fileName);
        
        let blob;
        if (data.startsWith('data:')) {
          const base64Data = data.split(',')[1];
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          blob = new Blob([bytes], { type: mimeType });
        } else {
          blob = new Blob([data], { type: mimeType });
        }
        
        return new File([blob], fileName, { type: mimeType });
      }));
    }
    
    // Simulate drag and drop file upload
    const dataTransfer = new DataTransfer();
    fileObjects.forEach(file => dataTransfer.items.add(file));
    
    // Highlight target
    highlightElementWithColor(targetElement, 'green', 2000);
    
    // Scroll target into view
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    setTimeout(() => {
      // Simulate drag over
      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer
      });
      targetElement.dispatchEvent(dragOverEvent);
      
      // Simulate drop
      setTimeout(() => {
        const dropEvent = new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dataTransfer
        });
        targetElement.dispatchEvent(dropEvent);
        
        sendResponse({ 
          success: true, 
          message: `Simulated file upload: ${fileObjects.length} files`,
          files_uploaded: fileObjects.length,
          target: target_selector || 'auto-detected'
        });
      }, 200);
    }, 500);
    
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// Helper function to create DataTransfer object
function createDataTransfer(files) {
  const dataTransfer = new DataTransfer();
  if (files && files.length > 0) {
    files.forEach(file => {
      if (file instanceof File) {
        dataTransfer.items.add(file);
      } else if (typeof file === 'string') {
        // Create a simple text file
        const blob = new Blob([file], { type: 'text/plain' });
        const fileObj = new File([blob], 'file.txt', { type: 'text/plain' });
        dataTransfer.items.add(fileObj);
      }
    });
  }
  return dataTransfer;
}

// Helper function to get MIME type from file name
function getMimeTypeFromFileName(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  const mimeTypes = {
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'mp4': 'video/mp4',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed'
  };

  return mimeTypes[extension] || 'application/octet-stream';
}

// Debug elements on page
function handleDebugElements(request, sendResponse) {
  try {
    const { text } = request;
    const searchText = text.toLowerCase().trim();
    
    // Find all potential matches
    const allElements = document.querySelectorAll('*');
    const matches = [];
    
    for (const element of allElements) {
      if (element.textContent && element.textContent.toLowerCase().includes(searchText)) {
        const rect = element.getBoundingClientRect();
        matches.push({
          tagName: element.tagName,
          text: element.textContent.trim().substring(0, 100),
          id: element.id,
          className: element.className,
          position: { x: rect.left, y: rect.top },
          size: { width: rect.width, height: rect.height },
          visible: rect.width > 0 && rect.height > 0
        });
      }
    }
    
    sendResponse({ 
      success: true, 
      data: {
        searchText,
        totalMatches: matches.length,
        matches: matches.slice(0, 10) // Limit to first 10 matches
      }
    });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

// ===== ATLAS CONTROL TOGGLE =====
// Floating button to pause/resume Atlas control

let atlasControlActive = false;
let controlToggleButton = null;

// Create floating control toggle
function createControlToggle() {
  if (controlToggleButton) return; // Already created

  // Create container
  const container = document.createElement('div');
  container.id = 'atlas-control-toggle';
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Create button
  const button = document.createElement('button');
  button.style.cssText = `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 50px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    user-select: none;
  `;

  // Status indicator dot
  const dot = document.createElement('span');
  dot.style.cssText = `
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ff4444;
    display: inline-block;
    box-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
  `;

  // Button text
  const text = document.createElement('span');
  text.textContent = 'Atlas Paused';

  button.appendChild(dot);
  button.appendChild(text);
  container.appendChild(button);

  // Hover effects
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.05)';
    button.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
  });

  // Click handler
  button.addEventListener('click', () => {
    atlasControlActive = !atlasControlActive;
    updateControlToggle();

    // Notify sidepanel of state change
    chrome.runtime.sendMessage({
      action: 'atlasControlToggle',
      active: atlasControlActive
    });

    // Visual feedback
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 100);
  });

  document.body.appendChild(container);
  controlToggleButton = { container, button, dot, text };
}

// Update toggle button appearance
function updateControlToggle() {
  if (!controlToggleButton) return;

  const { button, dot, text } = controlToggleButton;

  if (atlasControlActive) {
    // Atlas is in control
    button.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
    dot.style.background = '#38ef7d';
    dot.style.boxShadow = '0 0 10px rgba(56, 239, 125, 0.5)';
    text.textContent = 'Atlas Active';
  } else {
    // User has control (Atlas paused)
    button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    dot.style.background = '#ff4444';
    dot.style.boxShadow = '0 0 10px rgba(255, 68, 68, 0.5)';
    text.textContent = 'Atlas Paused';
  }
}

// Remove toggle button
function removeControlToggle() {
  if (controlToggleButton) {
    controlToggleButton.container.remove();
    controlToggleButton = null;
  }
}

// Listen for messages to show/hide toggle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showControlToggle') {
    createControlToggle();
    sendResponse({ success: true });
  } else if (request.action === 'hideControlToggle') {
    removeControlToggle();
    sendResponse({ success: true });
  } else if (request.action === 'getControlState') {
    sendResponse({ active: atlasControlActive });
  } else if (request.action === 'updateControlState') {
    atlasControlActive = request.active;
    updateControlToggle();
    sendResponse({ success: true });
  }
  return true;
});

// Create toggle when page loads (only if Atlas is connected)
console.log('✅ Atlas control toggle ready');
