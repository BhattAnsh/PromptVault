// PromptVault Popup - Premium UI with Modern Interactions
document.addEventListener('DOMContentLoaded', function() {
  console.log('PromptVault popup initialized');

  // Elements
  const elements = {
    // Theme
    container: document.querySelector('.popup-container'),
    themeToggle: document.getElementById('theme-toggle'),
    themeIcon: document.querySelector('.theme-icon'),
    
    // Status
    statusCard: document.getElementById('status-card'),
    statusIcon: document.querySelector('.status-icon'),
    statusText: document.getElementById('status-text'),
    
    // Session
    sessionIndicator: document.getElementById('session-indicator'),
    sessionName: document.getElementById('session-name'),
    sessionMeta: document.getElementById('session-meta'),
    createSessionBtn: document.getElementById('create-session'),
    closeSessionBtn: document.getElementById('close-session'),
    
    // Platform status
    platforms: {
    chatgpt: document.getElementById('chatgpt-status'),
    claude: document.getElementById('claude-status'),
    grok: document.getElementById('grok-status'),
    gemini: document.getElementById('gemini-status'),
    },
    
    // Stats
    sessionCount: document.getElementById('session-count'),
    randomCount: document.getElementById('random-count'),
    
    // Actions
    viewChatsBtn: document.getElementById('view-chats'),
    actionIcon: document.querySelector('.action-icon'),
    actionArrow: document.querySelector('.action-arrow'),
  };

  // Initialize theme
  initializeTheme();
  
  // Initialize UI
  initializeUI();
  
  // Set up event listeners
  setupEventListeners();
  
  // Load initial data
  loadInitialData();

  // Theme Management
  function initializeTheme() {
    const savedTheme = localStorage.getItem('promptvault-theme') || 'light';
    setTheme(savedTheme);
  }

  function setTheme(theme) {
    elements.container.setAttribute('data-theme', theme);
    localStorage.setItem('promptvault-theme', theme);
    
    // Update theme icon
    if (elements.themeIcon) {
      elements.themeIcon.innerHTML = theme === 'dark' ? Icons.get('sun') : Icons.get('moon');
    }
  }

  function toggleTheme() {
    const currentTheme = elements.container.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Add a subtle animation
    elements.container.style.transform = 'scale(0.98)';
    setTimeout(() => {
      elements.container.style.transform = 'scale(1)';
    }, 150);
  }

  // UI Initialization
  function initializeUI() {
    // Set initial icons
    updateStatusIcon('ready');
    updateSessionActionIcons();
    updateActionIcons();
    
    // Set all platform statuses to inactive initially
    Object.values(elements.platforms).forEach(element => {
      if (element) {
        element.innerHTML = Icons.get('statusInactive');
      }
    });
  }

  function updateStatusIcon(state) {
    if (!elements.statusIcon) return;
    
    const icons = {
      ready: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      warning: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      error: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      loading: Icons.get('loading')
    };
    
    elements.statusIcon.innerHTML = icons[state] || icons.ready;
  }

  function updateSessionActionIcons() {
    const createIcon = document.querySelector('#create-session .btn-icon');
    const closeIcon = document.querySelector('#close-session .btn-icon');
    
    if (createIcon) {
      createIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    }
    
    if (closeIcon) {
      closeIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    }
  }

  function updateActionIcons() {
    if (elements.actionIcon) {
      elements.actionIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
        <path d="M21 15l-5-5L5 21l5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    }
    
    if (elements.actionArrow) {
      elements.actionArrow.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="7" y1="17" x2="17" y2="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="7,7 17,7 17,17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    }
  }

  // Event Listeners
  function setupEventListeners() {
    // Theme toggle
    if (elements.themeToggle) {
      elements.themeToggle.addEventListener('click', toggleTheme);
    }

    // Session management
    if (elements.createSessionBtn) {
      elements.createSessionBtn.addEventListener('click', handleCreateSession);
    }

    if (elements.closeSessionBtn) {
      elements.closeSessionBtn.addEventListener('click', handleCloseSession);
    }

    // View chats
    if (elements.viewChatsBtn) {
      elements.viewChatsBtn.addEventListener('click', handleViewChats);
    }

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        if (changes.currentSession) {
          updateSessionDisplay();
        }
        if (changes.promptVaultData) {
          updateChatCounts();
        }
      }
    });

    // Listen for messages from content script
    chrome.runtime.onMessage.addListener(handleRuntimeMessage);
  }

  // Data Loading
  function loadInitialData() {
    checkCurrentPlatform();
    updateSessionDisplay();
    updateChatCounts();
  }

  function checkCurrentPlatform() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (!tabs || !tabs[0]) return;
      
    const currentUrl = tabs[0].url;

      // Reset all platform items
      document.querySelectorAll('.platform-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Update platform status indicators
      Object.values(elements.platforms).forEach(element => {
        if (element) {
          element.innerHTML = Icons.get('statusInactive');
        }
      });

      // Check which platform is active
      let activePlatform = null;
      
    if (currentUrl.includes('chat.openai.com') || currentUrl.includes('chatgpt.com')) {
        activePlatform = 'chatgpt';
    } else if (currentUrl.includes('claude.ai')) {
        activePlatform = 'claude';
    } else if (currentUrl.includes('grok.x.ai') || currentUrl.includes('x.ai/grok')) {
        activePlatform = 'grok';
    } else if (currentUrl.includes('gemini.google.com') || currentUrl.includes('bard.google.com')) {
        activePlatform = 'gemini';
      }

      if (activePlatform && elements.platforms[activePlatform]) {
        // Update status indicator
        elements.platforms[activePlatform].innerHTML = Icons.get('statusActive');
        
        // Mark platform as active
        const platformItem = document.querySelector(`[data-platform="${activePlatform}"]`);
        if (platformItem) {
          platformItem.classList.add('active');
        }
      }
    });
  }

  function updateSessionDisplay() {
    chrome.storage.local.get(['currentSession'], function(result) {
      const currentSession = result.currentSession;
      
      if (currentSession) {
        // Active session
        elements.sessionIndicator.classList.add('active');
        elements.sessionName.textContent = currentSession.name;
        elements.sessionMeta.textContent = `Created ${new Date(currentSession.createdAt).toLocaleDateString()}`;
        
        elements.createSessionBtn.disabled = true;
        elements.closeSessionBtn.disabled = false;
        
        // Update status
        updateStatus('Session active', 'ready');
      } else {
        // No active session
        elements.sessionIndicator.classList.remove('active');
        elements.sessionName.textContent = 'No active session';
        elements.sessionMeta.textContent = 'Create a session to organize your chats';
        
        elements.createSessionBtn.disabled = false;
        elements.closeSessionBtn.disabled = true;
        
        // Update status
        updateStatus('Extension Ready', 'ready');
      }
    });
  }

  function updateChatCounts() {
      chrome.storage.local.get('promptVaultData', function(result) {
        try {
          const data = result.promptVaultData || {
            sessions: {},
            randomChats: []
          };

          const sessionCount = Object.keys(data.sessions || {}).length;
          const randomCount = (data.randomChats || []).length;

        if (elements.sessionCount) {
          elements.sessionCount.textContent = sessionCount.toString();
        }
        if (elements.randomCount) {
          elements.randomCount.textContent = randomCount.toString();
        }
        } catch (error) {
          console.error('Error updating chat counts:', error);
        }
      });
  }

  // Event Handlers
  function handleCreateSession() {
    const sessionName = prompt('Enter session name:');
    if (!sessionName || !sessionName.trim()) return;

      const session = {
        id: Date.now().toString(),
        name: sessionName.trim(),
        createdAt: new Date().toISOString(),
        chats: []
      };

    // Add loading state
    elements.createSessionBtn.disabled = true;
    const originalText = elements.createSessionBtn.querySelector('.btn-text').textContent;
    elements.createSessionBtn.querySelector('.btn-text').textContent = 'Creating...';

      chrome.storage.local.set({ currentSession: session }, function() {
        if (chrome.runtime.lastError) {
          console.error('Error creating session:', chrome.runtime.lastError);
        updateStatus('Failed to create session', 'error');
        
        // Reset button
        elements.createSessionBtn.disabled = false;
        elements.createSessionBtn.querySelector('.btn-text').textContent = originalText;
          return;
        }

      // Add to sessions list
        chrome.storage.local.get('promptVaultData', function(result) {
          const data = result.promptVaultData || { sessions: {}, randomChats: [] };
          if (!data.sessions) data.sessions = {};
          
          data.sessions[session.id] = session;
          
          chrome.storage.local.set({ promptVaultData: data }, function() {
          updateStatus(`Session "${sessionName}" created!`, 'ready');
          updateSessionDisplay();
            updateChatCounts();
            
          // Reset button after delay
          setTimeout(() => {
            elements.createSessionBtn.querySelector('.btn-text').textContent = originalText;
          }, 1000);
        });
        });
      });
    }

  function handleCloseSession() {
    if (!confirm('Are you sure you want to close the current session?')) return;

    chrome.storage.local.remove('currentSession', function() {
      updateStatus('Session closed', 'ready');
      updateSessionDisplay();
    });
  }

  function handleViewChats() {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/pages/chats.html') });
  }

  function handleRuntimeMessage(message, sender, sendResponse) {
    if (message.action === 'chatSaved') {
      updateStatus('Chat saved successfully!', 'ready');
      updateChatCounts();

      // Show success animation
      elements.statusCard.style.transform = 'scale(1.02)';
      setTimeout(() => {
        elements.statusCard.style.transform = 'scale(1)';
      }, 200);
    }
  }

  // Utility Functions
  function updateStatus(message, type = 'ready') {
    if (elements.statusText) {
      elements.statusText.textContent = message;
    }
    
    // Update status card class
    elements.statusCard.className = 'status-card';
    if (type === 'warning') {
      elements.statusCard.classList.add('warning');
    } else if (type === 'error') {
      elements.statusCard.classList.add('danger');
    }
    
    updateStatusIcon(type);
    
    // Auto-reset status after 3 seconds for non-ready states
    if (type !== 'ready') {
      setTimeout(() => {
        updateStatus('Extension Ready', 'ready');
      }, 3000);
    }
  }

  // Add smooth transitions when popup loads
  setTimeout(() => {
    elements.container.style.opacity = '1';
  }, 100);
});
