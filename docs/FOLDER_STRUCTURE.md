# PromptVault Extension - Folder Structure

## Overview

The PromptVault extension has been organized into a clean, modular folder structure that follows Chrome extension best practices.

## Directory Structure

```
PromptVault/
├── manifest.json                    # Extension manifest (root level)
├── src/                            # Source code directory
│   ├── background/                 # Background script
│   │   └── background.js           # Service worker for extension
│   ├── content/                    # Content scripts
│   │   └── content.js              # Injected into AI platforms
│   ├── popup/                      # Extension popup
│   │   ├── popup.html              # Popup interface
│   │   ├── popup.js                # Popup functionality
│   │   └── popup.css               # Popup styling
│   ├── pages/                      # Extension pages
│   │   ├── chats.html              # Chat list page
│   │   ├── chats.js                # Chat list functionality
│   │   ├── chat-detail.html        # Individual chat view
│   │   ├── chat-detail.js          # Chat detail functionality
│   │   ├── options.html            # Settings page
│   │   └── options.js              # Settings functionality
│   ├── styles/                     # Shared styles (currently empty)
│   └── utils/                      # Utility functions
│       └── icon.js                 # Icon generation utilities
├── assets/                         # Static assets
│   └── icons/                      # Extension icons
│       ├── icon-16.png
│       ├── icon-32.png
│       ├── icon-48.png
│       └── icon-128.png
└── docs/                          # Documentation
    ├── README.md                  # Main documentation
    ├── TESTING.md                 # Original testing notes
    ├── TEST_INSTRUCTIONS.md       # Comprehensive testing guide
    └── FOLDER_STRUCTURE.md        # This file
```

## File Descriptions

### Core Files

- **`manifest.json`**: Extension configuration and permissions
- **`src/background/background.js`**: Service worker that handles extension lifecycle and storage
- **`src/content/content.js`**: Injected into AI platform pages to detect and extract chats

### User Interface

- **`src/popup/`**: Extension popup (click on extension icon)
  - Shows platform status and chat counts
  - Navigation to main features
  
- **`src/pages/chats.html`**: Main chat management interface
  - Lists all saved chats by platform
  - Search, filter, and bulk operations
  
- **`src/pages/chat-detail.html`**: Individual chat viewer
  - Displays full conversation
  - Export options and tagging
  
- **`src/pages/options.html`**: Extension settings
  - Platform toggles and preferences

### Assets

- **`assets/icons/`**: Extension icons in multiple sizes for toolbar and Chrome store

## Path References

All file paths in the extension have been updated to reflect this structure:

- Manifest references: `src/popup/popup.html`, `src/background/background.js`, etc.
- Navigation links: Updated to use relative paths within the same directories
- Chrome runtime URLs: Updated with full paths from extension root

## Benefits of This Structure

1. **Modularity**: Each component type has its own directory
2. **Maintainability**: Easy to find and modify specific functionality
3. **Scalability**: Simple to add new features without cluttering
4. **Standards Compliance**: Follows Chrome extension development best practices
5. **Clear Separation**: Content scripts, background logic, and UI are separated

## Development Workflow

When working on specific features:

- **Chat detection logic**: Edit `src/content/content.js`
- **Data storage/sync**: Edit `src/background/background.js`
- **Main UI**: Edit files in `src/pages/`
- **Extension popup**: Edit files in `src/popup/`
- **Styling**: CSS is embedded in HTML files for simplicity
- **Documentation**: Add to `docs/` directory

## Loading the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the **root PromptVault directory** (contains manifest.json)
5. The extension will load with the organized structure 