// Script for the options.html page
document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const autoSaveCheckbox = document.getElementById('autoSave');
  const savePlatformInfoCheckbox = document.getElementById('savePlatformInfo');
  const enableChatGPTCheckbox = document.getElementById('enableChatGPT');
  const enableClaudeCheckbox = document.getElementById('enableClaude');
  const enableGrokCheckbox = document.getElementById('enableGrok');
  const enableGeminiCheckbox = document.getElementById('enableGemini');
  const clearAllDataButton = document.getElementById('clearAllData');
  const saveOptionsButton = document.getElementById('saveOptions');
  const statusDiv = document.getElementById('status');
  
  // Load saved options
  const loadOptions = () => {
    chrome.storage.local.get('promptVaultOptions', function(result) {
      const options = result.promptVaultOptions || {
        autoSave: true,
        savePlatformInfo: true,
        enabledPlatforms: {
          chatgpt: true,
          claude: true,
          grok: true,
          gemini: true
        }
      };
      
      // Update checkboxes
      autoSaveCheckbox.checked = options.autoSave;
      savePlatformInfoCheckbox.checked = options.savePlatformInfo;
      enableChatGPTCheckbox.checked = options.enabledPlatforms.chatgpt;
      enableClaudeCheckbox.checked = options.enabledPlatforms.claude;
      enableGrokCheckbox.checked = options.enabledPlatforms.grok;
      enableGeminiCheckbox.checked = options.enabledPlatforms.gemini;
    });
  };
  
  // Save options
  const saveOptions = () => {
    const options = {
      autoSave: autoSaveCheckbox.checked,
      savePlatformInfo: savePlatformInfoCheckbox.checked,
      enabledPlatforms: {
        chatgpt: enableChatGPTCheckbox.checked,
        claude: enableClaudeCheckbox.checked,
        grok: enableGrokCheckbox.checked,
        gemini: enableGeminiCheckbox.checked
      }
    };
    
    chrome.storage.local.set({ promptVaultOptions: options }, function() {
      // Show success message
      statusDiv.textContent = 'Options saved!';
      statusDiv.className = 'status success';
      statusDiv.style.display = 'block';
      
      // Hide message after 2 seconds
      setTimeout(function() {
        statusDiv.style.display = 'none';
      }, 2000);
    });
  };
  
  // Clear all saved chat data
  const clearAllData = () => {
    if (confirm('Are you sure you want to delete all saved chats? This cannot be undone.')) {
      chrome.storage.local.get('promptVaultData', function(result) {
        const emptyData = {
          chatgpt: [],
          claude: [],
          grok: [],
          gemini: []
        };
        
        chrome.storage.local.set({ promptVaultData: emptyData }, function() {
          // Show success message
          statusDiv.textContent = 'All chat data cleared!';
          statusDiv.className = 'status success';
          statusDiv.style.display = 'block';
          
          // Hide message after 2 seconds
          setTimeout(function() {
            statusDiv.style.display = 'none';
          }, 2000);
        });
      });
    }
  };
  
  // Add event listeners
  saveOptionsButton.addEventListener('click', saveOptions);
  clearAllDataButton.addEventListener('click', clearAllData);
  
  // Load options when page opens
  loadOptions();
});
