// Background script for PromptVault extension
console.log('PromptVault background script initialized');

// Store for chat data from different AI platforms
const chatStorage = {
  // Initialize storage structure
  init: function() {
    chrome.storage.local.get('promptVaultData', function(result) {
      if (!result.promptVaultData) {
        // Create empty storage structure if it doesn't exist
        chrome.storage.local.set({
          promptVaultData: {
            sessions: {}, // sessionId: { id, name, createdAt, chats: [] }
            randomChats: [] // chats saved when no session is active
          }
        });
      } else {
        // Migrate old data structure if needed
        const data = result.promptVaultData;
        if (data.chatgpt || data.claude || data.grok || data.gemini) {
          console.log('Migrating old data structure to new session-based structure');
          
          const migratedData = {
            sessions: {},
            randomChats: []
          };

          // Migrate all old platform chats to random chats
          ['chatgpt', 'claude', 'grok', 'gemini'].forEach(platform => {
            if (data[platform] && Array.isArray(data[platform])) {
              migratedData.randomChats.push(...data[platform]);
            }
          });

          chrome.storage.local.set({ promptVaultData: migratedData });
        }
      }
    });
  },

  // Save a chat from a specific platform - now returns a Promise-like callback pattern
  saveChat: function(platform, chatData, callback) {
    try {
      // First check if there's an active session
      chrome.storage.local.get(['currentSession', 'promptVaultData'], function(result) {
        try {
          const currentSession = result.currentSession;
          const data = result.promptVaultData || {
            sessions: {},
            randomChats: []
          };

          // Add timestamp to chat data
          chatData.timestamp = new Date().toISOString();

          if (currentSession) {
            // Save to current session
            console.log(`Saving chat to session: ${currentSession.name}`);
            
            // Update the session in the main data structure
            if (!data.sessions[currentSession.id]) {
              data.sessions[currentSession.id] = {
                id: currentSession.id,
                name: currentSession.name,
                createdAt: currentSession.createdAt,
                chats: []
              };
            }
            
            data.sessions[currentSession.id].chats.push(chatData);
            
            // Also update the current session
            currentSession.chats = data.sessions[currentSession.id].chats;
            
            // Save both the main data and current session
            chrome.storage.local.set({ 
              promptVaultData: data,
              currentSession: currentSession
            }, function() {
              if (chrome.runtime.lastError) {
                console.error('Error saving to storage:', chrome.runtime.lastError);
                callback({ status: 'error', message: chrome.runtime.lastError.message });
                return;
              }
              
              chatStorage.notifySuccess(platform, currentSession.name);
              callback({ status: 'success', sessionName: currentSession.name });
            });

          } else {
            // Save to random chats
            console.log('Saving chat to random chats (no active session)');
            data.randomChats.push(chatData);

            chrome.storage.local.set({ promptVaultData: data }, function() {
              if (chrome.runtime.lastError) {
                console.error('Error saving to storage:', chrome.runtime.lastError);
                callback({ status: 'error', message: chrome.runtime.lastError.message });
                return;
              }
              
              chatStorage.notifySuccess(platform, null);
              callback({ status: 'success', sessionName: null });
            });
          }
        } catch (innerError) {
          console.error('Error processing chat data:', innerError);
          callback({ status: 'error', message: innerError.message });
        }
      });
    } catch (error) {
      console.error('Error accessing storage:', error);
      callback({ status: 'error', message: error.message });
    }
  },

  // Send notifications after successful save
  notifySuccess: function(platform, sessionName) {
    // Send notification to popup if it's open
    try {
      chrome.runtime.sendMessage({
        action: 'chatSaved',
        platform: platform,
        sessionName: sessionName
      });
    } catch (e) {
      console.warn('Failed to send message to popup:', e);
      // Continue even if popup messaging fails
    }

    // Show a Chrome notification
    try {
      const message = sessionName 
        ? `Chat from ${platform} saved to session "${sessionName}"!`
        : `Chat from ${platform} saved to random chats!`;
        
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon-128.png',
        title: 'PromptVault',
        message: message
      });
    } catch (e) {
      console.warn('Failed to create notification:', e);
      // Continue even if notification fails
    }
  }
};

// Initialize storage on extension load
chatStorage.init();

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'saveChat') {
    try {
      // Use callback pattern to wait for async operation
      chatStorage.saveChat(message.platform, message.data, function(result) {
        sendResponse(result);
      });
      
      // Return true to indicate we'll send a response asynchronously
      return true;
    } catch (error) {
      console.error('Error saving chat:', error);
      sendResponse({ status: 'error', message: error.message });
    }
  } else if (message.action === 'ping') {
    // Simple ping to check if background script is responsive
    sendResponse({ status: 'connected' });
  }

  // Return false for other actions
  return false;
});
