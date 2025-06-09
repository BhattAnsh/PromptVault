# PromptVault Extension Testing Instructions

## Quick Setup
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked" and select this folder
4. The PromptVault extension should now appear in your extensions list

## Testing the Selective Save Feature

### ChatGPT Testing (chat.openai.com or chatgpt.com)
1. **Navigate to ChatGPT**: Go to https://chat.openai.com or https://chatgpt.com
2. **Start a conversation**: Ask any question (e.g., "What is artificial intelligence?")
3. **Wait for response**: Let ChatGPT respond completely
4. **Look for save button**: You should see a small save icon appear in the action button area next to copy, thumbs up/down buttons on the AI response
5. **Click save button**: Click the save icon to save that specific question-answer pair
6. **Verify saving**: 
   - Button should show loading spinner briefly
   - Then show success checkmark
   - After 2 seconds, return to normal save icon
7. **Test multiple conversations**: Ask another question and verify each response gets its own save button
8. **Test popup**: Click the extension icon to open PromptVault and verify your saved conversations appear

### Claude Testing (claude.ai)
1. **Navigate to Claude**: Go to https://claude.ai
2. **Start a conversation**: Ask any question
3. **Check for save buttons**: Look for save icons on Claude's responses
4. **Test saving**: Click save buttons and verify the same behavior as ChatGPT

### Other Platforms
- **Grok**: https://grok.x.ai or https://x.ai/grok
- **Gemini**: https://gemini.google.com
- **Brave Chat**: https://chat.brave.com
- **You.com**: https://you.com (chat feature)
- **Poe**: https://poe.com

## Expected Behavior

### Selective Save Feature
- ✅ Individual save buttons appear on each AI response
- ✅ Save buttons are styled to match the platform's existing action buttons
- ✅ Clicking save only saves that specific question-answer pair
- ✅ Loading state with spinner during save
- ✅ Success state with checkmark after successful save
- ✅ Button returns to normal state after 2 seconds
- ✅ No global "Save All" button - only selective saving

### Button Appearance
- **Position**: Next to existing action buttons (copy, thumbs up/down, etc.)
- **Style**: Matches platform design (subtle, gray color)
- **Hover**: Slight background highlight
- **Icon**: Clean SVG save icon (professional appearance)
- **Size**: 30x30px to match other action buttons

### Platform Detection
- ✅ Extension should work on all 7 supported platforms
- ✅ Save buttons should appear regardless of platform
- ✅ Conversation pairing should work correctly (user question + AI response)

### Data Storage
- ✅ Each saved conversation should appear in the popup
- ✅ Conversations should be properly paired (question + answer)
- ✅ Platform information should be correctly detected
- ✅ Timestamps should be accurate

## Troubleshooting

### No Save Buttons Appearing
1. Check if you're on a supported platform
2. Try refreshing the page
3. Check browser console for any errors (F12 → Console tab)
4. Verify extension is loaded and enabled

### Save Button Not Working
1. Check network connectivity
2. Look for error messages in console
3. Verify extension permissions are granted
4. Try reloading the extension

### Wrong Platform Detection
1. Check the URL matches supported patterns
2. Look for console logs showing platform detection
3. Verify the platform is in the supported list

### Save Buttons in Wrong Location
1. Different platforms may have different UI structures
2. The extension tries to find existing action button areas
3. If no action area found, it creates its own container

## Development Notes

### Platform-Specific Behavior
- **ChatGPT**: Save buttons integrate with existing action button bar
- **Claude**: May create own action container if none exists
- **Other platforms**: Adaptive approach based on available UI elements

### Message Detection
- Uses conversation turn detection to find question-answer pairs
- Employs multiple strategies for role detection (user vs AI)
- Filters out UI elements and system messages
- Handles dynamic content loading

### Error Handling
- Graceful fallbacks if platform structure changes
- Console logging for debugging
- User-friendly error messages
- Button state management for edge cases

## Reporting Issues
When reporting bugs, please include:
1. **Platform**: Which AI platform you were using
2. **Browser**: Chrome version
3. **Error messages**: Any console errors (F12 → Console)
4. **Screenshots**: What you expected vs what you saw
5. **Steps**: Exact steps to reproduce the issue

## Success Criteria
- [ ] Save buttons appear on all 7 platforms
- [ ] Buttons integrate well with existing UI
- [ ] Saving works reliably
- [ ] Proper conversation pairing
- [ ] Data appears correctly in popup
- [ ] No interference with platform functionality
- [ ] Clean, professional appearance 