// Script for the chats.html page to display saved chats with session management
document.addEventListener('DOMContentLoaded', function() {
  // Variables to track current state
  let currentTab = 'sessions'; // 'sessions' or 'random'
  let selectedSession = null; // Currently selected session ID
  let selectedChats = []; // Array to store selected chat indices
  let lastCheckedIndex = null; // For Shift+Click functionality
  let allTags = new Set(); // To store all unique tags
  let currentChats = []; // Currently displayed chats
  
  // DOM elements
  const chatContainer = document.getElementById('chat-container');
  const tabs = document.querySelectorAll('.tab');
  const sessionSelector = document.getElementById('session-selector');
  const sessionList = document.getElementById('session-list');
  const bulkActionsToolbar = document.getElementById('bulk-actions');
  const selectedCountDisplay = document.querySelector('.selected-count');
  const exportJsonButton = document.getElementById('export-json');
  const exportMarkdownButton = document.getElementById('export-markdown');
  const exportTextButton = document.getElementById('export-text');
  const exportHtmlButton = document.getElementById('export-html');
  const deleteSelectedBtn = document.getElementById('delete-selected');
  const cancelSelectionBtn = document.getElementById('cancel-selection');
  const tagFilterDropdown = document.getElementById('tag-filter');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  
  // Check for dark mode preference
  const initTheme = () => {
    const savedTheme = localStorage.getItem('promptVaultTheme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggleBtn.innerHTML = Icons.get('sun');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      themeToggleBtn.innerHTML = Icons.get('moon');
    }
  };

  // Initialize icons
  const initIcons = () => {
    // Search icon
    const searchIcon = document.getElementById('search-icon');
    if (searchIcon) {
      searchIcon.innerHTML = Icons.get('search');
    }
    
    // Export icon
    const exportIcon = document.getElementById('export-icon');
    if (exportIcon) {
      exportIcon.innerHTML = Icons.get('export');
    }
    
    // Delete icon
    const deleteIcon = document.getElementById('delete-icon');
    if (deleteIcon) {
      deleteIcon.innerHTML = Icons.get('delete');
    }
    
    // Export option icons
    document.querySelectorAll('.export-option-icon').forEach(icon => {
      const format = icon.getAttribute('data-format');
      switch(format) {
        case 'json':
          icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`;
          break;
        case 'markdown':
          icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="10" y1="12" x2="14" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="10" y1="16" x2="14" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`;
          break;
        case 'text':
          icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`;
          break;
        case 'html':
          icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`;
          break;
      }
    });
  };

  // Initialize theme and icons
  initTheme();
  initIcons();
  
  // Toggle dark/light mode
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('promptVaultTheme', newTheme);
    
    // Update button icon
    themeToggleBtn.innerHTML = newTheme === 'dark' ? Icons.get('sun') : Icons.get('moon');
  });
  
  // Function to load sessions
  const loadSessions = () => {
    chrome.storage.local.get('promptVaultData', function(result) {
      const data = result.promptVaultData || { sessions: {}, randomChats: [] };
      const sessions = data.sessions || {};
      
      if (Object.keys(sessions).length === 0) {
        sessionList.innerHTML = '<div class="no-chats">No sessions created yet. Create a session from the extension popup.</div>';
        chatContainer.innerHTML = '<div class="no-chats">Select a session to view chats.</div>';
        return;
      }
      
      // Display sessions
      let sessionsHTML = '';
      Object.values(sessions).forEach(session => {
        const chatCount = session.chats ? session.chats.length : 0;
        const createdDate = new Date(session.createdAt).toLocaleDateString();
        
        sessionsHTML += `
          <div class="session-item" data-session-id="${session.id}">
            <div class="session-name">${session.name}</div>
            <div class="session-info">${chatCount} chats • Created ${createdDate}</div>
          </div>
        `;
      });
      
      sessionList.innerHTML = sessionsHTML;
      
      // Add click handlers to session items
      document.querySelectorAll('.session-item').forEach(item => {
        item.addEventListener('click', function() {
          const sessionId = this.getAttribute('data-session-id');
          selectSession(sessionId);
        });
      });
    });
  };
  
  // Function to select a session and load its chats
  const selectSession = (sessionId) => {
    // Update visual selection
    document.querySelectorAll('.session-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    const sessionItem = document.querySelector(`[data-session-id="${sessionId}"]`);
    if (sessionItem) {
      sessionItem.classList.add('selected');
    }
    
    selectedSession = sessionId;
    
    // Load chats for this session
    chrome.storage.local.get('promptVaultData', function(result) {
      const data = result.promptVaultData || { sessions: {}, randomChats: [] };
      const session = data.sessions[sessionId];
      
      if (!session || !session.chats || session.chats.length === 0) {
        chatContainer.innerHTML = '<div class="no-chats">No chats in this session yet.</div>';
        return;
      }
      
      currentChats = session.chats;
      collectAllTags();
      displayChats(session.chats);
    });
  };
  
  // Function to load random chats
  const loadRandomChats = () => {
    chrome.storage.local.get('promptVaultData', function(result) {
      const data = result.promptVaultData || { sessions: {}, randomChats: [] };
      const randomChats = data.randomChats || [];
      
      if (randomChats.length === 0) {
        chatContainer.innerHTML = '<div class="no-chats">No random chats saved yet.</div>';
        return;
      }
      
      currentChats = randomChats;
      collectAllTags();
      displayChats(randomChats);
    });
  };
  
  // Function to switch between tabs
  const switchTab = (tab) => {
    currentTab = tab;
    selectedSession = null;
    clearSelection();
    
    // Update tab UI
    tabs.forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    if (tab === 'sessions') {
      sessionSelector.classList.add('active');
      loadSessions();
    } else {
      sessionSelector.classList.remove('active');
      loadRandomChats();
    }
  };
  
  // Function to update UI based on selection state
  const updateSelectionUI = () => {
    if (selectedChats.length > 0) {
      bulkActionsToolbar.style.display = 'flex';
      selectedCountDisplay.textContent = `${selectedChats.length} chat${selectedChats.length > 1 ? 's' : ''} selected`;
    } else {
      bulkActionsToolbar.style.display = 'none';
    }
  };
  
  // Function to clear all selections
  const clearSelection = () => {
    selectedChats = [];
    document.querySelectorAll('.chat-checkbox').forEach(checkbox => {
      checkbox.checked = false;
    });
    document.querySelectorAll('.chat-item').forEach(item => {
      item.classList.remove('selected');
    });
    updateSelectionUI();
  };
  
  // Function to collect all tags from current chats
  const collectAllTags = () => {
    allTags.clear();
    
    currentChats.forEach(chat => {
      if (chat.tags && Array.isArray(chat.tags)) {
        chat.tags.forEach(tag => allTags.add(tag));
      }
    });
    
    updateTagFilterOptions();
  };
  
  // Function to update tag filter dropdown
  const updateTagFilterOptions = () => {
    const tagOptions = Array.from(allTags).sort();
    
    let optionsHTML = '<option value="">All tags</option>';
    tagOptions.forEach(tag => {
      optionsHTML += `<option value="${tag}">${tag}</option>`;
    });
    
    tagFilterDropdown.innerHTML = optionsHTML;
  };
  
  // Function to display chats
  const displayChats = (chats) => {
    // Get sorting preference
    const sortBy = document.getElementById('sort-by').value;
    
    // Sort chats based on selection
    const sortedChats = [...chats]; // Create a copy to sort
    
    switch (sortBy) {
      case 'date-desc':
        sortedChats.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        break;
      case 'date-asc':
        sortedChats.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        break;
      case 'title-asc':
        sortedChats.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'title-desc':
        sortedChats.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
    }
    
    // Build chat list HTML
    let chatListHTML = '<div class="chat-list">';
    
    sortedChats.forEach((chat, index) => {
      // Format the date
      const date = new Date(chat.timestamp);
      const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      
      // Create a preview text
      const previewText = chat.title || 'Chat session';
      
      // Build tags HTML if any
      let tagsHTML = '';
      if (chat.tags && chat.tags.length > 0) {
        tagsHTML += '<div class="chat-tags">';
        chat.tags.forEach(tag => {
          tagsHTML += `<span class="tag">${tag}</span>`;
        });
        tagsHTML += '</div>';
      }

      // Platform indicator
      const platformHTML = chat.platform ? `<span class="chat-platform">${chat.platform.toUpperCase()}</span>` : '';
      
      chatListHTML += `
        <div class="chat-item" data-index="${index}">
          <input type="checkbox" class="chat-checkbox" data-index="${index}">
          <div class="chat-content">
            <div class="chat-title">${previewText}</div>
            <div class="chat-date">${formattedDate}</div>
            ${platformHTML}
            ${tagsHTML}
            <div class="chat-preview">
              Click to view full conversation
            </div>
          </div>
        </div>
      `;
    });
    
    chatListHTML += '</div>';
    chatContainer.innerHTML = chatListHTML;
    
    // Add click event listeners to chat items and checkboxes
    document.querySelectorAll('.chat-item').forEach(item => {
      const contentArea = item.querySelector('.chat-content');
      contentArea.addEventListener('click', function() {
        const index = parseInt(item.getAttribute('data-index'));
        viewChat(index);
      });
    });
    
    // Add event listeners to checkboxes
    document.querySelectorAll('.chat-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', function(e) {
        e.stopPropagation();
        const index = parseInt(this.getAttribute('data-index'));
        const chatItem = document.querySelector(`.chat-item[data-index="${index}"]`);
        
        if (this.checked) {
          if (!selectedChats.includes(index)) {
            selectedChats.push(index);
          }
          chatItem.classList.add('selected');
        } else {
          selectedChats = selectedChats.filter(i => i !== index);
          chatItem.classList.remove('selected');
        }
        
        updateSelectionUI();
      });
    });
  };
  
  // Function to view a specific chat
  const viewChat = (index) => {
    if (currentChats[index]) {
      const chat = currentChats[index];
      const chatData = {
        chat: chat,
        source: currentTab === 'sessions' ? 'session' : 'random',
        sessionId: selectedSession,
        index: index
      };
      
      // Store chat data for the detail page
      sessionStorage.setItem('viewingChat', JSON.stringify(chatData));
      
      // Open chat detail page
      window.open(chrome.runtime.getURL('src/pages/chat-detail.html'), '_blank');
    }
  };
  
  // Export functions
  const exportSelectedAsJson = () => {
    const chatsToExport = selectedChats.map(index => currentChats[index]);
    
    const exportData = {
      source: currentTab,
      sessionId: selectedSession,
      sessionName: selectedSession ? document.querySelector(`[data-session-id="${selectedSession}"] .session-name`)?.textContent : null,
      exportDate: new Date().toISOString(),
      chats: chatsToExport
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `promptvault-${currentTab}-export-${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    clearSelection();
  };
  
  // Similar functions for other export formats (markdown, text, html)
  const exportSelectedAsMarkdown = () => {
    const chatsToExport = selectedChats.map(index => currentChats[index]);
    
    let markdownContent = `# PromptVault Export\n\n`;
    markdownContent += `**Source:** ${currentTab}\n`;
    markdownContent += `**Export Date:** ${new Date().toISOString()}\n\n`;
    
    chatsToExport.forEach((chat, index) => {
      markdownContent += `## Chat ${index + 1}\n\n`;
      markdownContent += `**Platform:** ${chat.platform || 'Unknown'}\n`;
      markdownContent += `**Date:** ${new Date(chat.timestamp).toLocaleString()}\n\n`;
      
      if (chat.messages) {
        chat.messages.forEach(message => {
          markdownContent += `### ${message.role === 'user' ? 'User' : 'Assistant'}\n\n`;
          markdownContent += `${message.content}\n\n`;
        });
      }
      
      markdownContent += `---\n\n`;
    });
    
    const dataUri = 'data:text/markdown;charset=utf-8,'+ encodeURIComponent(markdownContent);
    const exportFileDefaultName = `promptvault-${currentTab}-export-${new Date().toLocaleDateString().replace(/\//g, '-')}.md`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    clearSelection();
  };
  
  // Add event listeners for tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      switchTab(tabName);
    });
  });
  
  // Add event listeners for controls
  document.getElementById('select-all').addEventListener('click', () => {
    document.querySelectorAll('.chat-checkbox').forEach(checkbox => {
      checkbox.checked = true;
      const index = parseInt(checkbox.getAttribute('data-index'));
      const chatItem = document.querySelector(`.chat-item[data-index="${index}"]`);
      
      if (!selectedChats.includes(index)) {
        selectedChats.push(index);
      }
      
      chatItem.classList.add('selected');
    });
    
    updateSelectionUI();
  });
  
  document.getElementById('select-none').addEventListener('click', clearSelection);
  
  // Add event listeners for export options
  exportJsonButton.addEventListener('click', exportSelectedAsJson);
  exportMarkdownButton.addEventListener('click', exportSelectedAsMarkdown);
  
  // Add event listener for delete button
  deleteSelectedBtn.addEventListener('click', () => {
    if (selectedChats.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedChats.length} selected chat(s)?`)) {
      // Sort indices in descending order to avoid index shifting issues
      const sortedIndices = selectedChats.sort((a, b) => b - a);
      
      chrome.storage.local.get('promptVaultData', function(result) {
        const data = result.promptVaultData || { sessions: {}, randomChats: [] };
        
        if (currentTab === 'sessions' && selectedSession) {
          // Remove from session
          if (data.sessions[selectedSession]) {
            sortedIndices.forEach(index => {
              data.sessions[selectedSession].chats.splice(index, 1);
            });
          }
        } else {
          // Remove from random chats
          sortedIndices.forEach(index => {
            data.randomChats.splice(index, 1);
          });
        }
        
        chrome.storage.local.set({ promptVaultData: data }, function() {
          // Reload current view
          if (currentTab === 'sessions') {
            selectSession(selectedSession);
          } else {
            loadRandomChats();
          }
        });
      });
    }
  });
  
  // Add event listener for cancel selection button
  cancelSelectionBtn.addEventListener('click', clearSelection);
  
  // Search functionality
  document.getElementById('search-button').addEventListener('click', performSearch);
  document.getElementById('search-input').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      performSearch();
    }
  });
  
  function performSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    
    if (!searchTerm) {
      displayChats(currentChats);
      return;
    }
    
    const filteredChats = currentChats.filter(chat => {
      // Search in title
      if ((chat.title || '').toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Search in messages
      if (chat.messages && chat.messages.length > 0) {
        return chat.messages.some(message => 
          message.content.toLowerCase().includes(searchTerm)
        );
      }
      
      return false;
    });
    
    if (filteredChats.length === 0) {
      chatContainer.innerHTML = `
        <div class="no-chats">
          No chats matching "${searchTerm}" found.
        </div>
      `;
      return;
    }
    
    displayChats(filteredChats);
  }
  
  // Initialize the page
  switchTab('sessions');
  
  console.log('PromptVault chats page initialized with session management');
});
