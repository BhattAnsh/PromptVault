# How to Test the PromptVault Extension

This document explains how to load and test the PromptVault Chrome extension during development.

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select the PromptVault directory
4. The extension should now be installed and visible in your Chrome toolbar

## Testing Basic Functionality

### Popup Interface
- Click the extension icon in the toolbar
- You should see the PromptVault popup with:
  - Status indicator
  - "View Saved Chats" and "Settings" buttons
  - Platform status indicators (all should be gray initially)

### Testing on AI Platforms
- Visit one of the supported AI platforms:
  - ChatGPT: https://chat.openai.com/
  - Claude: https://claude.ai/
  - Grok: https://grok.x.ai/
  - Gemini: https://gemini.google.com/
- Open the extension popup while on the platform
- Verify that the corresponding platform indicator is green

### Options Page
- Click the "Settings" button in the popup
- Verify that the options page opens with:
  - General settings
  - Platform toggles
  - Clear data button

### View Saved Chats
- Click the "View Saved Chats" button in the popup
- Verify that the chats page opens (it will show "No saved chats yet" initially)

## Next Steps for Development

The extension structure is now set up. Next steps will include:
1. Implementing the chat extraction logic for each platform
2. Adding automatic saving functionality
3. Enhancing the chat viewer with better UI and organization features
4. Adding export functionality

## Debugging

- Right-click the extension icon and select "Inspect popup" to debug the popup
- Use the background page inspector in `chrome://extensions/` (click "inspect views: service worker")
- Use the browser console on AI platforms to debug the content script
