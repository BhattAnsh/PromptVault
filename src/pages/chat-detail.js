// Script for the chat-detail.html page
document.addEventListener('DOMContentLoaded', function() {
  // Get chat data from sessionStorage instead of URL parameters
  const chatDataStr = sessionStorage.getItem('viewingChat');
  if (!chatDataStr) {
    showError("No chat data found. Please return to the chats page and select a chat to view.");
    return;
  }
  
  let chatData;
  try {
    chatData = JSON.parse(chatDataStr);
  } catch (e) {
    showError("Invalid chat data. Please return to the chats page and select a chat to view.");
    return;
  }
  
  const { chat, source, sessionId, index } = chatData;
  
  // DOM elements
  const metadataContainer = document.getElementById('metadata');
  const conversationContainer = document.getElementById('conversation');
  const tagsContainer = document.getElementById('tags-container');
  const backButton = document.getElementById('back-button');
  const exportJsonButton = document.getElementById('export-json');
  const exportMarkdownButton = document.getElementById('export-markdown');
  const exportTextButton = document.getElementById('export-text');
  const exportHtmlButton = document.getElementById('export-html');
  const tagButton = document.getElementById('tag-button');
  const deleteButton = document.getElementById('delete-button');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  
  // Current chat data
  let currentChat = chat;
  
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
    // Back icon
    const backIcon = document.getElementById('back-icon');
    if (backIcon) {
      backIcon.innerHTML = Icons.get('back');
    }
    
    // Export icon
    const exportIcon = document.getElementById('export-single-icon');
    if (exportIcon) {
      exportIcon.innerHTML = Icons.get('export');
    }
    
    // Delete icon
    const deleteIcon = document.getElementById('delete-single-icon');
    if (deleteIcon) {
      deleteIcon.innerHTML = Icons.get('delete');
    }
    
    // Tag icon
    const tagIcon = document.getElementById('tag-icon');
    if (tagIcon) {
      tagIcon.innerHTML = Icons.get('tag');
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
  
  // Initialize theme and load chat data
  initTheme();
  initIcons();
  
  // Load and display the chat data
  displayChatData(currentChat);
  displayTags(currentChat);
  
  // Toggle dark/light mode
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('promptVaultTheme', newTheme);
    
    // Update button icon
    themeToggleBtn.innerHTML = newTheme === 'dark' ? Icons.get('sun') : Icons.get('moon');
  });
  
  // Display error message
  const showError = (message) => {
    metadataContainer.innerHTML = `<div class="error">${message}</div>`;
    conversationContainer.innerHTML = '';
  };
  
  // Display tags
  const displayTags = (chat) => {
    // Initialize tags if not present
    if (!chat.tags) {
      chat.tags = [];
    }
    
    // Clear current tags
    tagsContainer.innerHTML = '';
    
    // Display tags or a message if none
    if (chat.tags.length === 0) {
      tagsContainer.innerHTML = '<span class="no-tags">No tags yet. Click "Add Tags" to categorize this chat.</span>';
    } else {
      chat.tags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag';
        tagElement.innerHTML = `
          ${tag}
          <span class="remove-tag" data-tag="${tag}">×</span>
        `;
        tagsContainer.appendChild(tagElement);
      });
      
      // Add event listeners to remove tag buttons
      document.querySelectorAll('.remove-tag').forEach(button => {
        button.addEventListener('click', function() {
          const tagToRemove = this.getAttribute('data-tag');
          removeTag(tagToRemove);
        });
      });
    }
  };
  
  // Add a tag to the current chat
  const addTag = () => {
    // Prompt user for tag name
    const tagName = prompt("Enter a tag name (e.g., 'programming', 'work', 'personal'):");
    
    if (!tagName || tagName.trim() === '') {
      return; // User cancelled or entered empty tag
    }
    
    // Initialize tags array if it doesn't exist
    if (!currentChat.tags) {
      currentChat.tags = [];
    }
    
    // Check if tag already exists
    if (currentChat.tags.includes(tagName)) {
      alert(`Tag "${tagName}" already exists!`);
      return;
    }
    
    // Add the tag
    currentChat.tags.push(tagName);
    
    // Save the updated chat
    saveChat();
    
    // Update the display
    displayTags(currentChat);
  };
  
  // Remove a tag from the current chat
  const removeTag = (tagName) => {
    if (!currentChat.tags) return;
    
    // Remove the tag from the array
    currentChat.tags = currentChat.tags.filter(tag => tag !== tagName);
    
    // Save the updated chat
    saveChat();
    
    // Update the display
    displayTags(currentChat);
  };
  
  // Save the current chat back to storage
  const saveChat = () => {
    chrome.storage.local.get('promptVaultData', function(result) {
      const data = result.promptVaultData || { sessions: {}, randomChats: [] };
      
      if (source === 'session' && sessionId) {
        // Update chat in session
        if (data.sessions[sessionId] && data.sessions[sessionId].chats[index]) {
          data.sessions[sessionId].chats[index] = currentChat;
        }
      } else {
        // Update chat in random chats
        if (data.randomChats[index]) {
          data.randomChats[index] = currentChat;
        }
      }
      
      chrome.storage.local.set({ promptVaultData: data });
    });
  };
  
  // Display chat metadata and conversation
  const displayChatData = (chat) => {
    // Format the date
    const date = new Date(chat.timestamp);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    
    // Display metadata
    const sourceInfo = source === 'session' ? 
      `Session: ${sessionId}` : 
      'Random Chat';
    
    metadataContainer.innerHTML = `
      <div class="metadata-item">
        <strong>Platform:</strong> ${chat.platform ? chat.platform.toUpperCase() : 'Unknown'}
      </div>
      <div class="metadata-item">
        <strong>Source:</strong> ${sourceInfo}
      </div>
      <div class="metadata-item">
        <strong>Date:</strong> ${formattedDate}
      </div>
      <div class="metadata-item">
        <strong>Title:</strong> ${chat.title || 'Chat Session'}
      </div>
      ${chat.url ? `<div class="metadata-item">
        <strong>URL:</strong> <a href="${chat.url}" target="_blank">${chat.url}</a>
      </div>` : ''}
    `;
    
    // Display conversation
    conversationContainer.innerHTML = '';
    
    if (!chat.messages || chat.messages.length === 0) {
      conversationContainer.innerHTML = '<div class="no-messages">No messages in this chat.</div>';
      return;
    }
    
    // Add each message
    chat.messages.forEach(message => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${message.role}-message`;
      
      // Create message header
      const headerDiv = document.createElement('div');
      headerDiv.className = 'message-header';
      
      // Role name with icon
      const roleName = message.role === 'user' ? 'You' : 'Assistant';
      headerDiv.innerHTML = `<strong>${roleName}</strong>`;
      
      // Message content
      const contentDiv = document.createElement('div');
      contentDiv.className = 'message-content';
      contentDiv.textContent = message.content;
      
      messageDiv.appendChild(headerDiv);
      messageDiv.appendChild(contentDiv);
      conversationContainer.appendChild(messageDiv);
    });
  };
  
  // Export functions
  const exportAsJson = () => {
    const exportData = {
      source: source,
      sessionId: sessionId,
      exportDate: new Date().toISOString(),
      chat: currentChat
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `promptvault-chat-${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const exportAsMarkdown = () => {
    let markdownContent = `# Chat Export\n\n`;
    markdownContent += `**Platform:** ${currentChat.platform || 'Unknown'}\n`;
    markdownContent += `**Source:** ${source === 'session' ? `Session ${sessionId}` : 'Random Chat'}\n`;
    markdownContent += `**Date:** ${new Date(currentChat.timestamp).toLocaleString()}\n`;
    markdownContent += `**Title:** ${currentChat.title || 'Chat Session'}\n\n`;
    
    if (currentChat.tags && currentChat.tags.length > 0) {
      markdownContent += `**Tags:** ${currentChat.tags.join(', ')}\n\n`;
    }
    
    markdownContent += `## Conversation\n\n`;
    
    if (currentChat.messages && currentChat.messages.length > 0) {
      currentChat.messages.forEach(message => {
        const role = message.role === 'user' ? '**You**' : '**Assistant**';
        markdownContent += `${role}:\n\n${message.content}\n\n---\n\n`;
      });
    } else {
      markdownContent += `No messages in this chat.\n\n`;
    }
    
    const dataUri = 'data:text/markdown;charset=utf-8,'+ encodeURIComponent(markdownContent);
    const exportFileDefaultName = `promptvault-chat-${new Date().toLocaleDateString().replace(/\//g, '-')}.md`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const exportAsText = () => {
    let textContent = `Chat Export\n`;
    textContent += `===========================================\n\n`;
    textContent += `Platform: ${currentChat.platform || 'Unknown'}\n`;
    textContent += `Source: ${source === 'session' ? `Session ${sessionId}` : 'Random Chat'}\n`;
    textContent += `Date: ${new Date(currentChat.timestamp).toLocaleString()}\n`;
    textContent += `Title: ${currentChat.title || 'Chat Session'}\n`;
    
    if (currentChat.tags && currentChat.tags.length > 0) {
      textContent += `Tags: ${currentChat.tags.join(', ')}\n`;
    }
    
    textContent += `\nConversation:\n\n`;
    
    if (currentChat.messages && currentChat.messages.length > 0) {
      currentChat.messages.forEach(message => {
        const role = message.role === 'user' ? 'You' : 'Assistant';
        textContent += `${role}:\n${message.content}\n\n`;
      });
    } else {
      textContent += `No messages in this chat.\n\n`;
    }
    
    const dataUri = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(textContent);
    const exportFileDefaultName = `promptvault-chat-${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const exportAsHtml = () => {
    let htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>PromptVault Chat Export</title>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1, h2 {
      color: #4285F4;
    }
    .metadata {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    .message {
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 4px;
    }
    .user-message {
      background-color: #E8F0FE;
      margin-left: 50px;
    }
    .assistant-message {
      background-color: #f5f5f5;
      margin-right: 50px;
    }
    .message-header {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .user-message .message-header {
      color: #1967D2;
    }
    .tags {
      margin: 15px 0;
    }
    .tag {
      background-color: #e0e0e0;
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 14px;
      margin-right: 5px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <h1>Chat Export</h1>
  
  <div class="metadata">
    <div><strong>Platform:</strong> ${currentChat.platform || 'Unknown'}</div>
    <div><strong>Source:</strong> ${source === 'session' ? `Session ${sessionId}` : 'Random Chat'}</div>
    <div><strong>Date:</strong> ${new Date(currentChat.timestamp).toLocaleString()}</div>
    <div><strong>Title:</strong> ${currentChat.title || 'Chat Session'}</div>`;
    
    if (currentChat.tags && currentChat.tags.length > 0) {
      htmlContent += `
    <div class="tags">
      <strong>Tags:</strong> `;
      
      currentChat.tags.forEach(tag => {
        htmlContent += `<span class="tag">${tag}</span>`;
      });
      
      htmlContent += `
    </div>`;
    }
    
    htmlContent += `
  </div>
  
  <h2>Conversation</h2>`;
    
    if (currentChat.messages && currentChat.messages.length > 0) {
      currentChat.messages.forEach(message => {
        const messageClass = message.role === 'user' ? 'user-message' : 'assistant-message';
        const roleName = message.role === 'user' ? 'You' : 'Assistant';
        
        htmlContent += `
  <div class="message ${messageClass}">
    <div class="message-header">${roleName}</div>
    <div class="message-content">${message.content}</div>
  </div>`;
      });
    } else {
      htmlContent += `
  <p>No messages in this chat.</p>`;
    }
    
    htmlContent += `
</body>
</html>`;
    
    const dataUri = 'data:text/html;charset=utf-8,'+ encodeURIComponent(htmlContent);
    const exportFileDefaultName = `promptvault-chat-${new Date().toLocaleDateString().replace(/\//g, '-')}.html`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  // Delete chat function
  const deleteChat = () => {
    if (confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      chrome.storage.local.get('promptVaultData', function(result) {
        const data = result.promptVaultData || { sessions: {}, randomChats: [] };
        
        if (source === 'session' && sessionId) {
          // Remove from session
          if (data.sessions[sessionId] && data.sessions[sessionId].chats) {
            data.sessions[sessionId].chats.splice(index, 1);
          }
        } else {
          // Remove from random chats
          data.randomChats.splice(index, 1);
        }
        
        chrome.storage.local.set({ promptVaultData: data }, function() {
          // Go back to chats page
          window.close();
        });
      });
    }
  };
  
  // Event listeners
  backButton.addEventListener('click', () => {
    window.close();
  });
  
  tagButton.addEventListener('click', addTag);
  deleteButton.addEventListener('click', deleteChat);
  
  // Export event listeners
  exportJsonButton.addEventListener('click', exportAsJson);
  exportMarkdownButton.addEventListener('click', exportAsMarkdown);
  exportTextButton.addEventListener('click', exportAsText);
  exportHtmlButton.addEventListener('click', exportAsHtml);
  
  console.log('PromptVault chat detail page initialized with session support');
});
