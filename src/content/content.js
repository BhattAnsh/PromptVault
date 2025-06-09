// Content script for PromptVault - injected into AI chat platforms
console.log('PromptVault content script loaded');

// Premium icons for content script - embedded for reliability
const Icons = {
  save: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="7,3 7,8 15,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  loading: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
    </path>
  </svg>`,

  saved: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#10b981" stroke="none"/>
    <path d="M8 12l3 3 5-6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  get: function(iconName) {
    return this[iconName] || '';
  }
};

// Determine which AI platform we're on
const detectPlatform = () => {
  try {
    const url = window.location.href;
    const hostname = window.location.hostname;
    console.log('Detecting platform for URL:', url);

  if (url.includes("chat.openai.com") || url.includes("chatgpt.com")) {
    console.log('Detected platform: ChatGPT');
    return 'chatgpt';
  } else if (hostname.includes('claude.ai')) {
    console.log('Detected platform: Claude');
    return 'claude';
  } else if (url.includes('grok.x.ai') || url.includes('x.ai/grok') || url.includes('grok.com')) {
    console.log('Detected platform: Grok');
    return 'grok';
  } else if (hostname.includes('gemini.google.com') || hostname.includes('bard.google.com')) {
    console.log('Detected platform: Gemini');
    return 'gemini';
  }

  console.log('No supported platform detected');
  return null;
  } catch (error) {
    console.error('Error detecting platform:', error);
    return null;
  }
};

// Function to find conversation pairs (user message + AI response)
const findConversationPairs = () => {
  console.log('Finding conversation pairs...');

  // Platform-specific selectors for conversation turns
  const turnSelectors = [
    // ChatGPT
    '[data-testid*="conversation-turn"]',
    'article[data-testid*="conversation-turn"]',

    // Claude - comprehensive selectors for both user and assistant messages
    '.conversation-item',
    '.message-pair',
    '.group.relative.inline-flex.gap-2',  // Claude user messages
    '.group.relative.-tracking-\\[0\\.015em\\]',  // Claude assistant messages
    '.group.relative.-tracking-\\[0\\.015em\\].pb-3',  // Claude assistant messages with padding
    '.group.relative[data-is-streaming]',  // Claude streaming messages
    '[data-testid="user-message"]',
    '.group.relative.inline-flex',  // Alternative Claude user message selector
    '.group.relative[style*="opacity"]',  // Claude messages with opacity styling
    '[data-is-streaming]',  // Claude streaming messages
    '.font-claude-message',  // Direct Claude message selector
    '.group.relative',  // Broader Claude selector to catch both types

    // Gemini - specific selectors for user and assistant messages
    'user-query',
    'model-response',
    '.conversation-container',

    // Grok
    '.relative.group.flex.flex-col.justify-center',
    '.message-bubble',

    // Generic
    'article',
    '[role="presentation"] > div',
    '.conversation-turn',
    '.chat-turn'
  ];

  let allTurns = [];

  // For Claude and Gemini, we need to collect both user and assistant messages separately
  const platform = detectPlatform();

  if (platform === 'claude') {
    console.log('Claude: Using comprehensive message collection strategy');

    // Collect user messages
    const userMessages = document.querySelectorAll('.group.relative.inline-flex.gap-2');
    console.log(`Claude: Found ${userMessages.length} user messages`);

    // Collect assistant messages
    const assistantMessages = document.querySelectorAll('.group.relative.-tracking-\\[0\\.015em\\]');
    console.log(`Claude: Found ${assistantMessages.length} assistant messages`);

    // Combine and sort by document order
    allTurns = [...userMessages, ...assistantMessages].sort((a, b) => {
      const position = a.compareDocumentPosition(b);
      return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

    console.log(`Claude: Total combined turns: ${allTurns.length}`);
  } else if (platform === 'gemini') {
    console.log('Gemini: Using comprehensive message collection strategy');

    // Collect user messages
    const userMessages = document.querySelectorAll('user-query');
    console.log(`Gemini: Found ${userMessages.length} user messages`);

    // Collect assistant messages
    const assistantMessages = document.querySelectorAll('model-response');
    console.log(`Gemini: Found ${assistantMessages.length} assistant messages`);

    // Combine and sort by document order
    allTurns = [...userMessages, ...assistantMessages].sort((a, b) => {
      const position = a.compareDocumentPosition(b);
      return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

    console.log(`Gemini: Total combined turns: ${allTurns.length}`);
  } else {
    // Try each selector until we find conversation turns for other platforms
    for (const selector of turnSelectors) {
      try {
        const turns = document.querySelectorAll(selector);
        if (turns.length > 0) {
          console.log(`Found ${turns.length} turns with selector: ${selector}`);
          allTurns = Array.from(turns);
          break;
        }
      } catch (e) {
        console.warn(`Selector failed: ${selector}`, e);
      }
    }
  }

  // Group consecutive user and assistant messages into pairs
  const pairs = [];
  let currentPair = { user: null, assistant: null };

  allTurns.forEach((turn, index) => {
    let role = determineMessageRole(turn);
    const content = extractMessageContent(turn);

    // Debug logging for Claude and Gemini
    const currentPlatform = detectPlatform();
    if (currentPlatform === 'claude') {
      console.log(`Claude turn ${index}:`, {
        element: turn,
        classes: turn.className,
        fullHTML: turn.outerHTML.substring(0, 200) + '...',
        role: role,
        content: content?.substring(0, 50) + '...',
        hasUserMessage: !!turn.querySelector('[data-testid="user-message"]'),
        hasClaudeMessage: !!turn.querySelector('.font-claude-message'),
        hasDataStreaming: turn.hasAttribute('data-is-streaming'),
        hasBgBg300: turn.className.includes('bg-bg-300'),
        hasRoundedXl: turn.className.includes('rounded-xl'),
        hasTracking: turn.className.includes('-tracking-[0.015em]'),
        hasPb3: turn.className.includes('pb-3')
      });
    } else if (currentPlatform === 'gemini') {
      console.log(`Gemini turn ${index}:`, {
        element: turn,
        tagName: turn.tagName,
        classes: turn.className,
        fullHTML: turn.outerHTML.substring(0, 200) + '...',
        role: role,
        content: content?.substring(0, 50) + '...',
        isUserQuery: turn.tagName === 'USER-QUERY',
        isModelResponse: turn.tagName === 'MODEL-RESPONSE',
        hasMessageContent: !!turn.querySelector('message-content'),
        hasUserQueryContent: !!turn.querySelector('user-query-content')
      });
    }

    // Skip empty messages
    if (!content || content.length < 3) return;

    // If role is still unclear, use alternating pattern as fallback
    if (!role) {
      const platform = detectPlatform();

      if (platform === 'claude') {
        role = index % 2 === 0 ? 'user' : 'assistant';
        console.log(`Claude: Using fallback role detection - turn ${index} assigned as ${role}`);
      } else if (platform === 'gemini') {
        role = index % 2 === 0 ? 'user' : 'assistant';
        console.log(`Gemini: Using fallback role detection - turn ${index} assigned as ${role}`);
      } else {
        const prevTurns = allTurns.slice(0, index);
        const userCount = prevTurns.filter(t => determineMessageRole(t) === 'user').length;
        const assistantCount = prevTurns.filter(t => determineMessageRole(t) === 'assistant').length;

        // If we have more assistants than users, this is likely a user message
        role = assistantCount >= userCount ? 'user' : 'assistant';
      }
    }

    if (role === 'user') {
      // If we already have a user message, save the current pair and start a new one
      if (currentPair.user) {
        if (currentPair.assistant) {
          pairs.push({...currentPair});
        }
        currentPair = { user: null, assistant: null };
      }
      currentPair.user = { element: turn, content, role };
    } else if (role === 'assistant') {
      currentPair.assistant = { element: turn, content, role };

      // If we have both user and assistant, we have a complete pair
      if (currentPair.user) {
        pairs.push({...currentPair});
        currentPair = { user: null, assistant: null };
      }
    }
  });

  // Add the last pair if it's complete
  if (currentPair.user && currentPair.assistant) {
    pairs.push(currentPair);
  }

  // Final validation and repair of pairs
  const validatedPairs = [];
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    if (pair.user && pair.assistant) {
      validatedPairs.push(pair);
    } else if (pair.assistant && i > 0) {
      // Try to pair with previous user message if current pair is incomplete
      const prevPair = validatedPairs[validatedPairs.length - 1];
      if (prevPair && !prevPair.assistant) {
        prevPair.assistant = pair.assistant;
      }
    }
  }

  console.log(`Found ${validatedPairs.length} conversation pairs (${pairs.length} before validation)`);
  return validatedPairs;
};

// Determine if a message is from user or AI
const determineMessageRole = (element) => {
  // Strategy 1: Check data attributes
  const roleAttr = element.getAttribute('data-message-author-role') ||
                   element.getAttribute('data-author') ||
                   element.getAttribute('role');

  if (roleAttr === 'user' || roleAttr === 'human') return 'user';
  if (roleAttr === 'assistant' || roleAttr === 'ai' || roleAttr === 'bot') return 'assistant';

  // Strategy 2: Check for specific platform patterns
  const userPattern = element.querySelector('[data-message-author-role="user"]');
  const assistantPattern = element.querySelector('[data-message-author-role="assistant"]');

  if (userPattern) return 'user';
  if (assistantPattern) return 'assistant';

  // Claude-specific patterns
  const claudeUserPattern = element.querySelector('[data-testid="user-message"]');
  const claudeAssistantPattern = element.querySelector('.font-claude-message') ||
                                element.hasAttribute('data-is-streaming');

  if (claudeUserPattern) return 'user';
  if (claudeAssistantPattern) return 'assistant';

  // Gemini-specific patterns
  if (element.tagName === 'USER-QUERY') return 'user';
  if (element.tagName === 'MODEL-RESPONSE') return 'assistant';

  const geminiUserPattern = element.querySelector('user-query-content');
  const geminiAssistantPattern = element.querySelector('message-content');

  if (geminiUserPattern) return 'user';
  if (geminiAssistantPattern) return 'assistant';

  // Enhanced Claude role detection based on class combinations
  const classes = element.className || '';

  // Claude user message patterns - they have bg-bg-300 and inline-flex
  if (classes.includes('group') && classes.includes('relative') && classes.includes('inline-flex') &&
      classes.includes('bg-bg-300')) {
    return 'user';
  }

  // Claude assistant message patterns - they have -tracking-[0.015em]
  if (classes.includes('group') && classes.includes('relative') && classes.includes('-tracking-[0.015em]')) {
    return 'assistant';
  }

  // Strategy 3: Check classes
  const className = element.className.toLowerCase();
  if (className.includes('user') || className.includes('human')) return 'user';
  if (className.includes('assistant') || className.includes('ai') || className.includes('bot') || className.includes('agent-turn')) return 'assistant';

  // Grok-specific: check for items-end (user) vs items-start (assistant)
  if (className.includes('items-end')) return 'user';
  if (className.includes('items-start')) return 'assistant';

  // Strategy 4: Check SR-only text (screen reader text)
  const srText = element.querySelector('.sr-only')?.textContent?.toLowerCase() || '';
  if (srText.includes('you said') || srText.includes('user said')) return 'user';
  if (srText.includes('chatgpt said') || srText.includes('claude said') || srText.includes('assistant said')) return 'assistant';

  // Strategy 5: Content analysis - look for typical AI response patterns
  const text = element.textContent?.toLowerCase() || '';
  const aiPhrases = ['as an ai', 'i\'m an ai', 'i\'m claude', 'i\'m chatgpt', 'i can help', 'here\'s', 'certainly'];
  const userPhrases = ['can you', 'please help', 'i want', 'how do i', 'what is', 'explain'];

  const hasAiPhrases = aiPhrases.some(phrase => text.includes(phrase));
  const hasUserPhrases = userPhrases.some(phrase => text.includes(phrase));

  if (hasAiPhrases) return 'assistant';
  if (hasUserPhrases) return 'user';

  // Strategy 6: Check position (user messages often aligned right, AI left)
  const style = window.getComputedStyle(element);
  const textAlign = style.textAlign;
  const justifyContent = style.justifyContent;

  if (textAlign === 'right' || justifyContent === 'flex-end') return 'user';
  if (textAlign === 'left' || justifyContent === 'flex-start') return 'assistant';

  // Default: return null to let the pairing logic handle it
  return null;
};

// Extract clean text content from message element
const extractMessageContent = (element) => {
  // Remove unwanted elements like buttons, timestamps, etc.
  const clone = element.cloneNode(true);

  // Remove common UI elements
  const unwantedSelectors = [
    'button',
    '[role="button"]',
    '.timestamp',
    '.time',
    '.copy-button',
    '.edit-button',
    '[class*="button"]',
    'svg',
    '.icon',
    '.sr-only',
    '[aria-label*="Copy"]',
    '[aria-label*="Edit"]',
    '[aria-label*="Good"]',
    '[aria-label*="Bad"]',
    '[aria-label*="Read"]',
    '[data-testid*="button"]',
    // Grok-specific unwanted elements
    '.action-buttons',
    '[aria-label*="Regenerate"]',
    '[aria-label*="Like"]',
    '[aria-label*="Dislike"]',
    '[aria-label*="Share"]',
    '.thinking-container',
    '.inline-media-container',
    '.auth-notification',
    // Claude-specific unwanted elements
    '.text-text-300.flex.items-stretch.justify-between',
    '.rounded-lg.transition.min-w-max',
    '.absolute.bottom-0.right-2',
    '[data-testid*="action-bar"]',
    '.shrink-0',  // Claude user avatar area
    '.w-8.text-accent-brand',  // Claude logo
    '.text-text-400.pt-5',  // Claude disclaimer text
    // Gemini-specific unwanted elements
    '.actions-container-v2',
    '.buttons-container-v2',
    'thumb-up-button',
    'thumb-down-button',
    'regenerate-button',
    'tts-control',
    '.edit-button',
    '.more-menu-button',
    'bard-avatar',
    '.response-container-header',
    '.response-container-footer',
    '.mat-mdc-icon-button',
    '.mat-icon'
  ];

  unwantedSelectors.forEach(selector => {
    const unwanted = clone.querySelectorAll(selector);
    unwanted.forEach(el => el.remove());
  });

  return clone.textContent?.trim() || '';
};

// Function to add save button to assistant message action area
const addSaveButtonToMessage = (assistantElement, conversationPair, platform) => {
  // Check if button already exists
  if (assistantElement.querySelector('.promptvault-save-btn')) {
    console.log('Save button already exists for this message');
    return;
  }

  // Debug logging for Claude and Gemini
  if (platform === 'claude') {
    console.log('Adding save button to Claude message:', assistantElement);
    console.log('Claude element classes:', assistantElement.className);
    console.log('Claude assistant element HTML:', assistantElement.outerHTML.substring(0, 200) + '...');
  } else if (platform === 'gemini') {
    console.log('Adding save button to Gemini message:', assistantElement);
    console.log('Gemini element tag:', assistantElement.tagName);
    console.log('Gemini assistant element HTML:', assistantElement.outerHTML.substring(0, 200) + '...');
  }

  // Find the action button container
  let actionContainer = null;

      // Platform-specific action selectors
    const actionSelectors = [
      // ChatGPT
      '.flex.min-h-\\[46px\\].justify-start .flex.items-center',
      '[class*="justify-start"] [class*="items-center"]',
      '.flex.items-center.p-1',

      // Claude
      '.text-text-300.flex.items-stretch.justify-between',
      '.rounded-lg.transition.min-w-max .text-text-300.flex.items-stretch.justify-between',
      '.flex.items-stretch.justify-between',
      '.absolute.bottom-0.right-2 .text-text-300.flex.items-stretch.justify-between',

      // Gemini
      '.buttons-container-v2',
      '.actions-container-v2',
      'message-actions .buttons-container-v2',
      'message-actions .actions-container-v2',

      // Grok
      '.action-buttons .flex.items-center',
      '.action-buttons',

      // Generic
      '.actions',
      '.message-actions',
      '[class*="action"]'
    ];

  // Try to find existing action container
  for (const selector of actionSelectors) {
    try {
      actionContainer = assistantElement.querySelector(selector);
      if (actionContainer) {
        console.log('Found action container with selector:', selector);
        if (platform === 'claude') {
          console.log('Claude action container:', actionContainer);
          console.log('Claude action container HTML:', actionContainer.outerHTML.substring(0, 150) + '...');
        }
        break;
      } else if (platform === 'claude') {
        console.log('Claude: Selector failed to find container:', selector);
      }
    } catch (e) {
      console.warn('Action selector failed:', selector, e);
    }
  }

  // If no action container found, create one
  if (!actionContainer) {
    console.log('No action container found, creating one...');
    if (platform === 'claude') {
      console.log('Claude: Attempting to create action container for element:', assistantElement);
    }
    actionContainer = createActionContainer(assistantElement);

    if (platform === 'claude') {
      console.log('Claude: createActionContainer returned:', actionContainer);
    }

    // Special handling for Claude - if createActionContainer returns null, try a direct search approach
    if (!actionContainer && platform === 'claude') {
      console.log('Claude: Trying direct search for existing action buttons...');

             // Look for any existing Claude action button structure in the assistant element or its siblings
       const parentContainer = assistantElement.parentElement;
       if (parentContainer) {
         console.log('Claude: Searching in parent container:', parentContainer);

         // Try multiple search strategies
         const searchSelectors = [
           '.absolute.bottom-0.right-2 .text-text-300.flex.items-stretch.justify-between',
           '.text-text-300.flex.items-stretch.justify-between',
           '.rounded-lg.transition.min-w-max .text-text-300',
           '.rounded-lg.transition.min-w-max',
           '[data-testid*="action-bar"]'
         ];

         for (const searchSelector of searchSelectors) {
           const existingActionArea = parentContainer.querySelector(searchSelector);
           if (existingActionArea) {
             console.log('Claude: Found existing action area with selector:', searchSelector, existingActionArea);
             actionContainer = existingActionArea;
             break;
           } else {
             console.log('Claude: No action area found with selector:', searchSelector);
           }
         }
       }

             // If still no container, create a simple overlay
       if (!actionContainer) {
         console.log('Claude: Creating simple overlay container...');
         const simpleContainer = document.createElement('div');
         simpleContainer.className = 'promptvault-simple-actions text-text-300 flex items-center justify-end';
         simpleContainer.style.cssText = `
           position: absolute;
           bottom: 8px;
           right: 8px;
           z-index: 1000;
           background: rgba(255, 255, 255, 0.95);
           border-radius: 6px;
           padding: 4px;
           box-shadow: 0 2px 8px rgba(0,0,0,0.15);
           backdrop-filter: blur(4px);
         `;

         // Find the message container and append
         const messageContainer = assistantElement.closest('.group.relative') || assistantElement;
         console.log('Claude: Message container for overlay:', messageContainer);

         if (messageContainer) {
           if (messageContainer.style.position !== 'relative') {
             messageContainer.style.position = 'relative';
           }
           messageContainer.appendChild(simpleContainer);
           actionContainer = simpleContainer;
           console.log('Claude: Simple overlay container created and added');
         } else {
           console.log('Claude: Could not find message container for overlay');
         }
       }
    }
  }

  if (!actionContainer && platform === 'claude') {
    console.log('Claude: All methods failed, trying absolute last resort...');

    // Last resort for Claude: create a floating button positioned relative to the message
    const lastResortContainer = document.createElement('div');
    lastResortContainer.className = 'promptvault-claude-fallback';
    lastResortContainer.style.cssText = `
      position: fixed;
      top: 50%;
      right: 20px;
      z-index: 10000;
      background: #fff;
      border: 2px solid #007bff;
      border-radius: 8px;
      padding: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    `;

    // Add a small label
    const label = document.createElement('div');
    label.textContent = 'PromptVault';
    label.style.cssText = 'font-size: 10px; color: #666; margin-bottom: 4px;';
    lastResortContainer.appendChild(label);

    document.body.appendChild(lastResortContainer);
    actionContainer = lastResortContainer;

    console.log('Claude: Last resort container created');
  }

  if (!actionContainer) {
    console.warn('Could not find or create action container for assistant message');
    if (platform === 'claude') {
      console.log('Claude: Final action container is null, cannot add save button');
    }
    return;
  }

  if (platform === 'claude') {
    console.log('Claude: Final action container found:', actionContainer);
    console.log('Claude: Action container children:', actionContainer.children.length);
  }

  // Create save button
  const saveButton = createSaveButton(conversationPair, platform);

  if (platform === 'claude') {
    console.log('Claude: Save button created:', saveButton);
  }

  // Insert the save button based on platform
  if (platform === 'claude') {
    // For Claude, insert before the retry button container (if it exists) or at the end
    const retryContainer = actionContainer.querySelector('.flex.items-center.gap-0\\.5');
    console.log('Claude: Retry container found:', !!retryContainer);

    if (retryContainer) {
      console.log('Claude: Inserting before retry container');
      actionContainer.insertBefore(saveButton, retryContainer);
    } else {
      console.log('Claude: Appending to action container');
      actionContainer.appendChild(saveButton);
    }

    console.log('Claude: Save button inserted, container now has', actionContainer.children.length, 'children');
  } else if (platform === 'gemini') {
    // For Gemini, insert at the beginning of the button container
    console.log('Gemini: Inserting save button at beginning of action container');
    actionContainer.insertBefore(saveButton, actionContainer.firstChild);
    console.log('Gemini: Save button inserted, container now has', actionContainer.children.length, 'children');
  } else {
    // For other platforms, insert at the beginning
    actionContainer.insertBefore(saveButton, actionContainer.firstChild);
  }

  console.log('Save button added to assistant message');
};

// Create action container if none exists
const createActionContainer = (assistantElement) => {
  // Find a good place to insert the action container
  const messageContent = assistantElement.querySelector('[class*="markdown"]') ||
                        assistantElement.querySelector('.message-content') ||
                        assistantElement.querySelector('.response-content-markdown') || // Grok specific
                        assistantElement.querySelector('.message-bubble') || // Grok specific
                        assistantElement.querySelector('.font-claude-message') || // Claude specific
                        assistantElement.querySelector('.grid.grid-cols-1.gap-2\\.5') || // Claude specific
                        assistantElement.querySelector('p') ||
                        assistantElement.lastElementChild;

  if (!messageContent) return null;

  // Detect platform for platform-specific styling
  const platform = detectPlatform();

  // Create action container
  const actionContainer = document.createElement('div');

  if (platform === 'grok') {
    // Grok-specific styling
    actionContainer.className = 'promptvault-actions action-buttons flex flex-row flex-wrap w-full mt-0.5 justify-end';
    actionContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 2px;
      margin-top: 4px;
      justify-content: flex-end;
      width: 100%;
    `;
  } else if (platform === 'gemini') {
    // Gemini-specific styling to match Material Design buttons
    actionContainer.className = 'promptvault-actions buttons-container-v2';
    actionContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      justify-content: flex-start;
    `;
  } else if (platform === 'claude') {
    // Claude-specific: try to find existing action container first
    const existingActionContainer = assistantElement.querySelector('.text-text-300.flex.items-stretch.justify-between');
    if (existingActionContainer) {
      console.log('Claude: Found existing action container, using it directly');
      return existingActionContainer;
    }

    // If no existing container found, create one that matches Claude's structure exactly
    console.log('Claude: Creating new action container structure');

    // Find the message container
    const messageContainer = messageContent.closest('.group.relative.-tracking-\\[0\\.015em\\]') ||
                            messageContent.closest('.group.relative') ||
                            assistantElement;

    if (!messageContainer) {
      console.log('Claude: Could not find message container');
      return null;
    }

    // Create the outer wrapper (absolute positioned)
    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'absolute bottom-0 right-2 pointer-events-none';
    wrapperDiv.style.cssText = `transform: none;`;

    // Create the inner container
    const innerDiv = document.createElement('div');
    innerDiv.className = 'rounded-lg transition min-w-max pointer-events-auto translate-x-2 translate-y-full pt-2';

    // Create the action container
    actionContainer.className = 'text-text-300 flex items-stretch justify-between';
    actionContainer.style.cssText = `
      display: flex;
      align-items: stretch;
      justify-content: space-between;
    `;

    // Build the structure
    innerDiv.appendChild(actionContainer);
    wrapperDiv.appendChild(innerDiv);
    messageContainer.appendChild(wrapperDiv);

    return actionContainer;
  } else {
    // Default styling for other platforms
    actionContainer.className = 'promptvault-actions flex items-center p-1 mt-2';
    actionContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      opacity: 0.7;
      transition: opacity 0.2s ease;
    `;
  }

  // Insert after message content (for non-Claude platforms)
  if (platform !== 'claude') {
    messageContent.parentNode.insertBefore(actionContainer, messageContent.nextSibling);
  }

  return actionContainer;
};

// Create the save button element with premium styling
const createSaveButton = (conversationPair, platform) => {
  const button = document.createElement('button');
  button.setAttribute('aria-label', 'Save to PromptVault');
  button.setAttribute('data-state', 'closed');
  button.setAttribute('type', 'button');

  // Premium base styling that works across all platforms
  const premiumBaseStyles = `
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    font-weight: 500;
    outline: none;
    user-select: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  `;

  if (platform === 'grok') {
    // Grok-specific premium styling
    button.className = 'promptvault-save-btn promptvault-premium-btn grok-style';
    button.style.cssText = premiumBaseStyles + `
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #e1e8ed;
      margin-right: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    `;
  } else if (platform === 'claude') {
    // Claude-specific premium styling
    button.className = 'promptvault-save-btn promptvault-premium-btn claude-style';
    button.style.cssText = premiumBaseStyles + `
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(0, 0, 0, 0.08);
      color: #6b7280;
      margin-right: 6px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    `;
  } else if (platform === 'gemini') {
    // Gemini-specific premium styling
    button.className = 'promptvault-save-btn promptvault-premium-btn gemini-style';
    button.style.cssText = premiumBaseStyles + `
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(66, 133, 244, 0.08);
      border: 1px solid rgba(66, 133, 244, 0.12);
      color: #4285f4;
      margin-right: 4px;
      box-shadow: 0 2px 4px rgba(66, 133, 244, 0.1);
    `;
  } else {
    // ChatGPT and default premium styling
    button.className = 'promptvault-save-btn promptvault-premium-btn chatgpt-style';
    button.style.cssText = premiumBaseStyles + `
      width: 30px;
      height: 30px;
      border-radius: 6px;
      background: rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.1);
      color: #6b7280;
      margin-right: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    `;
  }

  // Create premium icon container
  const iconSpan = document.createElement('span');
  iconSpan.className = 'promptvault-icon-container';
  iconSpan.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
  `;

  // Set premium save icon
  iconSpan.innerHTML = Icons.get('save');

  button.appendChild(iconSpan);

  // Add premium tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'promptvault-tooltip';
  tooltip.textContent = 'Save to PromptVault';
  tooltip.style.cssText = `
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-4px);
    background: #1f2937;
    color: white;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    pointer-events: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `;

  // Add tooltip arrow
  const tooltipArrow = document.createElement('div');
  tooltipArrow.style.cssText = `
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid #1f2937;
  `;
  tooltip.appendChild(tooltipArrow);
  button.appendChild(tooltip);

  // Add premium hover effects
  button.addEventListener('mouseenter', () => {
    // Show tooltip
    tooltip.style.opacity = '1';
    tooltip.style.visibility = 'visible';
    tooltip.style.transform = 'translateX(-50%) translateY(-8px)';

    // Platform-specific hover states
    if (platform === 'grok') {
      button.style.background = 'rgba(255, 255, 255, 0.12)';
      button.style.borderColor = 'rgba(255, 255, 255, 0.2)';
      button.style.transform = 'translateY(-1px)';
      button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    } else if (platform === 'claude') {
      button.style.background = 'rgba(0, 0, 0, 0.08)';
      button.style.borderColor = 'rgba(0, 0, 0, 0.12)';
      button.style.transform = 'translateY(-1px)';
      button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      button.style.color = '#374151';
    } else if (platform === 'gemini') {
      button.style.background = 'rgba(66, 133, 244, 0.12)';
      button.style.borderColor = 'rgba(66, 133, 244, 0.2)';
      button.style.transform = 'translateY(-1px)';
      button.style.boxShadow = '0 3px 8px rgba(66, 133, 244, 0.15)';
    } else {
      button.style.background = 'rgba(0, 0, 0, 0.08)';
      button.style.borderColor = 'rgba(0, 0, 0, 0.15)';
      button.style.transform = 'translateY(-1px)';
      button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
      button.style.color = '#374151';
    }

    // Icon scale effect
    iconSpan.style.transform = 'scale(1.1)';
  });

  button.addEventListener('mouseleave', () => {
    // Hide tooltip
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'hidden';
    tooltip.style.transform = 'translateX(-50%) translateY(-4px)';

    // Reset to original state
    button.style.transform = 'translateY(0)';
    iconSpan.style.transform = 'scale(1)';

    // Reset platform-specific styles
    if (platform === 'grok') {
      button.style.background = 'rgba(255, 255, 255, 0.08)';
      button.style.borderColor = 'rgba(255, 255, 255, 0.12)';
      button.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    } else if (platform === 'claude') {
      button.style.background = 'rgba(0, 0, 0, 0.04)';
      button.style.borderColor = 'rgba(0, 0, 0, 0.08)';
      button.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
      button.style.color = '#6b7280';
    } else if (platform === 'gemini') {
      button.style.background = 'rgba(66, 133, 244, 0.08)';
      button.style.borderColor = 'rgba(66, 133, 244, 0.12)';
      button.style.boxShadow = '0 2px 4px rgba(66, 133, 244, 0.1)';
    } else {
      button.style.background = 'rgba(0, 0, 0, 0.05)';
      button.style.borderColor = 'rgba(0, 0, 0, 0.1)';
      button.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      button.style.color = '#6b7280';
    }
  });

  // Add click animation
  button.addEventListener('mousedown', () => {
    button.style.transform = 'translateY(-1px) scale(0.98)';
  });

  button.addEventListener('mouseup', () => {
    button.style.transform = 'translateY(-1px) scale(1)';
  });

  // Add click handler
  button.addEventListener('click', () => {
    saveSingleConversation(conversationPair, platform, button);
  });

  return button;
};

// Helper function to reset button state with premium styling
const resetButtonState = (buttonElement, iconSpan, originalIcon, platform) => {
  if (iconSpan && originalIcon) {
    iconSpan.innerHTML = originalIcon;
  }
  if (buttonElement) {
    buttonElement.disabled = false;
    buttonElement.style.transform = 'translateY(0)';
    
    // Reset platform-specific styles
    if (platform === 'grok') {
      buttonElement.style.background = 'rgba(255, 255, 255, 0.08)';
      buttonElement.style.borderColor = 'rgba(255, 255, 255, 0.12)';
      buttonElement.style.color = '#e1e8ed';
      buttonElement.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    } else if (platform === 'claude') {
      buttonElement.style.background = 'rgba(0, 0, 0, 0.04)';
      buttonElement.style.borderColor = 'rgba(0, 0, 0, 0.08)';
      buttonElement.style.color = '#6b7280';
      buttonElement.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
    } else if (platform === 'gemini') {
      buttonElement.style.background = 'rgba(66, 133, 244, 0.08)';
      buttonElement.style.borderColor = 'rgba(66, 133, 244, 0.12)';
      buttonElement.style.color = '#4285f4';
      buttonElement.style.boxShadow = '0 2px 4px rgba(66, 133, 244, 0.1)';
    } else {
      buttonElement.style.background = 'rgba(0, 0, 0, 0.05)';
      buttonElement.style.borderColor = 'rgba(0, 0, 0, 0.1)';
      buttonElement.style.color = '#6b7280';
      buttonElement.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    }
  }
};

// Function to save a single conversation pair
const saveSingleConversation = (conversationPair, platform, buttonElement) => {
  console.log('Saving single conversation pair');

  if (!conversationPair.user || !conversationPair.assistant) {
    alert('Could not find complete conversation pair to save.');
    return;
  }

  // Create chat data for this specific conversation
  const chatData = {
    platform: platform,
    url: window.location.href,
    title: document.title,
    timestamp: new Date().toISOString(),
    messages: [
      {
        role: 'user',
        content: conversationPair.user.content,
        timestamp: new Date().toISOString()
      },
      {
        role: 'assistant',
        content: conversationPair.assistant.content,
        timestamp: new Date().toISOString()
      }
    ],
    tags: []
  };

  // Show loading state
  const iconSpan = buttonElement.querySelector('span');
  if (!iconSpan) {
    console.error('Icon span not found in button element');
    alert('Failed to save conversation. Button not properly initialized.');
    return;
  }
  const originalIcon = iconSpan.innerHTML;

  // Set loading icon
  iconSpan.innerHTML = Icons.get('loading');

  buttonElement.style.backgroundColor = 'rgba(0,0,0,0.1)';
  buttonElement.disabled = true;

  // Send to background script
  const sendMessageWithRetry = (maxRetries = 2) => {
    // Check if chrome extension APIs are available
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
      console.error('Chrome extension APIs not available');
      resetButtonState(buttonElement, iconSpan, originalIcon);
      alert('Extension connection lost. Please reload the page and try again.');
      return;
    }

    // Check if extension context is still valid
    try {
      chrome.runtime.sendMessage({
        action: 'saveChat',
        platform: platform,
        data: chatData
      }, function(response) {
        // Check for runtime errors
        if (chrome.runtime.lastError) {
          console.error('Runtime error:', chrome.runtime.lastError);
          
          // If it's a context invalidated error and we have retries left, try again
          if (chrome.runtime.lastError.message && 
              chrome.runtime.lastError.message.includes('Extension context invalidated') && 
              maxRetries > 0) {
            console.log(`Extension context invalidated, retrying... (${maxRetries} retries left)`);
            setTimeout(() => sendMessageWithRetry(maxRetries - 1), 500);
            return;
          }

          // Reset button on error
          resetButtonState(buttonElement, iconSpan, originalIcon, platform);
          alert('Failed to save conversation. Extension may need to be reloaded. Please try again.');
          return;
        }

        // Check response validity
        if (!response || response.status !== 'success') {
          console.error('Save operation failed:', response);
          
          // Reset button on error
          resetButtonState(buttonElement, iconSpan, originalIcon, platform);
          alert(`Failed to save conversation: ${response?.message || 'Unknown error'}`);
          return;
        }

        console.log('Conversation saved:', response);

        // Show success state
        setTimeout(() => {
          // Check if elements still exist in DOM
          if (!buttonElement.isConnected) {
            console.log('Button element was removed from DOM, skipping success animation');
            return;
          }
          
          const currentIconSpan = buttonElement.querySelector('span');
          if (currentIconSpan) {
            currentIconSpan.innerHTML = Icons.get('saved');
          }

          buttonElement.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
          buttonElement.style.color = '#22c55e';

                      // Reset after 2 seconds
            setTimeout(() => {
              // Check again if elements still exist
              if (!buttonElement.isConnected) {
                console.log('Button element was removed from DOM, skipping reset');
                return;
              }
              
              resetButtonState(buttonElement, currentIconSpan, originalIcon, platform);
            }, 2000);
        }, 600);
      });
    } catch (error) {
      console.error('Error sending message to background script:', error);
      
      // Reset button on error
      resetButtonState(buttonElement, iconSpan, originalIcon, platform);
      
      if (error.message && error.message.includes('Extension context invalidated')) {
        alert('Extension context lost. Please reload the page and try again.');
      } else {
        alert('Failed to save conversation. Please try again.');
      }
    }
  };

  try {
    sendMessageWithRetry();
  } catch (error) {
    console.error('Error in saveSingleConversation:', error);
    
    // Reset button on error
    resetButtonState(buttonElement, iconSpan, originalIcon, platform);
    alert('Failed to save conversation. Please try again.');
  }
};

// Function to add save buttons to all existing conversation pairs
const addSaveButtonsToExistingPairs = (platform) => {
  console.log('Adding save buttons to existing conversation pairs...');

  const pairs = findConversationPairs();

  pairs.forEach((pair, index) => {
    if (pair.assistant && pair.assistant.element) {
      addSaveButtonToMessage(pair.assistant.element, pair, platform);
    }
  });

  console.log(`Added save buttons to ${pairs.length} conversation pairs`);
};

// Function to observe for new messages and add save buttons
const observeForNewMessages = (platform) => {
  console.log('Setting up observer for new messages...');

  let isProcessing = false;

  const observer = new MutationObserver((mutations) => {
    if (isProcessing) return; // Prevent overlapping processing

    let newMessagesFound = false;
    let shouldProcessImmediately = false;

    mutations.forEach((mutation) => {
      // Check if new nodes were added
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          // Check if the added node or its children contain conversation turns
          if (node.nodeType === Node.ELEMENT_NODE) {
            const isConversationTurn = node.matches && (
              node.matches('[data-testid*="conversation-turn"]') ||
              node.matches('article[data-testid*="conversation-turn"]') ||
              node.matches('.conversation-item') ||
              node.matches('.message') ||
              node.matches('[class*="agent-turn"]') ||
              node.matches('[data-message-author-role]') ||
              // Grok-specific selectors
              node.matches('.message-bubble') ||
              node.matches('.relative.group.flex.flex-col.justify-center') ||
              // Claude-specific selectors
              node.matches('.group.relative.inline-flex.gap-2') ||
              node.matches('.group.relative.-tracking-\\[0\\.015em\\]') ||
              node.matches('[data-testid="user-message"]') ||
              node.matches('.group.relative.inline-flex') ||
              node.matches('.group.relative[style*="opacity"]') ||
              // Gemini-specific selectors
              node.matches('user-query') ||
              node.matches('model-response') ||
              node.matches('.conversation-container')
            );

            const hasConversationTurns = node.querySelectorAll && (
              node.querySelectorAll('[data-testid*="conversation-turn"]').length > 0 ||
              node.querySelectorAll('article[data-testid*="conversation-turn"]').length > 0 ||
              node.querySelectorAll('[data-message-author-role]').length > 0 ||
              node.querySelectorAll('.conversation-item').length > 0 ||
              node.querySelectorAll('[class*="agent-turn"]').length > 0 ||
              // Grok-specific selectors
              node.querySelectorAll('.message-bubble').length > 0 ||
              node.querySelectorAll('.relative.group.flex.flex-col.justify-center').length > 0 ||
              // Claude-specific selectors
              node.querySelectorAll('.group.relative.inline-flex.gap-2').length > 0 ||
              node.querySelectorAll('.group.relative.-tracking-\\[0\\.015em\\]').length > 0 ||
              node.querySelectorAll('[data-testid="user-message"]').length > 0 ||
              node.querySelectorAll('.group.relative.inline-flex').length > 0 ||
              node.querySelectorAll('.group.relative[style*="opacity"]').length > 0 ||
              // Gemini-specific selectors
              node.querySelectorAll('user-query').length > 0 ||
              node.querySelectorAll('model-response').length > 0 ||
              node.querySelectorAll('.conversation-container').length > 0
            );

            if (isConversationTurn || hasConversationTurns) {
              newMessagesFound = true;

              // Check if this looks like a completed AI response (has action buttons or final content)
              const hasActionButtons = node.querySelector('.flex.items-center') ||
                                    node.querySelector('[aria-label*="Copy"]') ||
                                    node.querySelector('[data-testid*="button"]') ||
                                    // Grok-specific action buttons
                                    node.querySelector('.action-buttons') ||
                                    node.querySelector('[aria-label*="Regenerate"]') ||
                                    node.querySelector('[aria-label*="Like"]') ||
                                    // Claude-specific action buttons
                                    node.querySelector('.text-text-300.flex.items-stretch.justify-between') ||
                                    node.querySelector('[data-testid*="action-bar"]') ||
                                    node.querySelector('.rounded-lg.transition.min-w-max') ||
                                    // Gemini-specific action buttons
                                    node.querySelector('.buttons-container-v2') ||
                                    node.querySelector('.actions-container-v2') ||
                                    node.querySelector('thumb-up-button') ||
                                    node.querySelector('thumb-down-button') ||
                                    node.querySelector('regenerate-button');

              if (hasActionButtons) {
                shouldProcessImmediately = true;
              }
            }
          }
        });
      }

      // Also check for attribute changes that might indicate content completion
      if (mutation.type === 'attributes' && mutation.target.nodeType === Node.ELEMENT_NODE) {
        const target = mutation.target;
        if (target.matches && (
          target.matches('[data-testid*="conversation-turn"]') ||
          target.matches('[data-message-author-role="assistant"]')
        )) {
          newMessagesFound = true;
        }
      }
    });

    // If new messages were found, add save buttons
    if (newMessagesFound) {
      isProcessing = true;

      const delay = shouldProcessImmediately ? 100 : 1000; // Faster for completed responses

      setTimeout(() => {
        try {
          console.log('Processing new messages detected by observer...');
          addSaveButtonsToExistingPairs(platform);
        } catch (error) {
          console.error('Error processing new messages:', error);
        } finally {
          isProcessing = false;
        }
      }, delay);
    }
  });

  // Start observing with more comprehensive options
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-testid', 'data-message-author-role', 'class']
  });

  console.log('Enhanced observer set up for new messages');
};

// Periodic check to ensure save buttons are present
const setupPeriodicCheck = (platform) => {
  console.log('Setting up periodic check for missing save buttons...');

  setInterval(() => {
    try {
      const pairs = findConversationPairs();
      let buttonsAdded = 0;

      pairs.forEach((pair) => {
        if (pair.assistant && pair.assistant.element) {
          const hasButton = pair.assistant.element.querySelector('.promptvault-save-btn');
          if (!hasButton) {
            addSaveButtonToMessage(pair.assistant.element, pair, platform);
            buttonsAdded++;
          }
        }
      });

      if (buttonsAdded > 0) {
        console.log(`Periodic check added ${buttonsAdded} missing save buttons`);
      }
    } catch (error) {
      console.error('Error in periodic check:', error);
    }
  }, 3000); // Check every 3 seconds
};

// Main initialization
const init = () => {
  try {
    console.log('Initializing PromptVault selective save content script');

    const platform = detectPlatform();

    if (!platform) {
      console.log('Not on a supported AI platform');
      return;
    }

    console.log(`PromptVault selective save active on ${platform}`);

    // Add save buttons when DOM is ready
    const addButtonsWhenReady = () => {
      if (document.body) {
        // Wait a bit for the page to fully load
        setTimeout(() => {
          addSaveButtonsToExistingPairs(platform);
          observeForNewMessages(platform);
          setupPeriodicCheck(platform); // Add periodic checking
          setupStreamingDetection(platform); // Add streaming detection
        }, 1000);
      } else {
        setTimeout(addButtonsWhenReady, 100);
      }
    };

    addButtonsWhenReady();
  } catch (error) {
    console.error('Error in init function:', error);
  }
};

// Function to detect when streaming responses complete
const setupStreamingDetection = (platform) => {
  console.log('Setting up streaming response detection...');

  // Watch for specific indicators that streaming has completed
  const streamingObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        const target = mutation.target;

        // Look for action buttons appearing (indicates response is complete)
        if (target.nodeType === Node.ELEMENT_NODE) {
          const hasNewActionButtons = target.querySelector && (
            target.querySelector('[aria-label*="Copy"]') ||
            target.querySelector('[data-testid*="copy"]') ||
            target.querySelector('[aria-label*="Good response"]') ||
            target.querySelector('.flex.items-center.p-1') ||
            // Grok-specific action buttons
            target.querySelector('.action-buttons') ||
            target.querySelector('[aria-label*="Regenerate"]') ||
            target.querySelector('[aria-label*="Like"]') ||
            target.querySelector('[aria-label*="Dislike"]') ||
            // Claude-specific action buttons
            target.querySelector('.text-text-300.flex.items-stretch.justify-between') ||
            target.querySelector('[data-testid*="action-bar"]') ||
            target.querySelector('[data-is-streaming="false"]') ||
            // Gemini-specific action buttons
            target.querySelector('.buttons-container-v2') ||
            target.querySelector('.actions-container-v2') ||
            target.querySelector('thumb-up-button') ||
            target.querySelector('thumb-down-button') ||
            target.querySelector('regenerate-button')
          );

          if (hasNewActionButtons) {
            console.log('Detected completed streaming response, adding save buttons...');
            setTimeout(() => {
              addSaveButtonsToExistingPairs(platform);
            }, 200);
          }
        }
      }
    });
  });

  streamingObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
};

// Initialize the content script
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Also initialize on window load for single-page applications
window.addEventListener('load', () => {
  setTimeout(init, 2000); // Longer delay for SPA navigation
});

// Additional initialization for dynamic content platforms
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    // Page became visible again, re-check for missing buttons
    setTimeout(() => {
      const platform = detectPlatform();
      if (platform) {
        console.log('Page visibility changed, checking for missing save buttons...');
        addSaveButtonsToExistingPairs(platform);
      }
    }, 1000);
  }
});
