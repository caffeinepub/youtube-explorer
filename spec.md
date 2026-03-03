# YouTube Explorer + Chat

## Current State
The app is a YouTube Explorer with a featured video grid, category filters, a search bar, and an embedded video player modal. Backend stores video entries with title, channelName, category, and videoId.

## Requested Changes (Diff)

### Add
- A "Chat" tab/page accessible from the main navigation header alongside the current YouTube explorer.
- A ChatGPT-style chat interface: message input at the bottom, scrollable message thread above, user messages on the right and assistant messages on the left.
- Backend: store chat history (messages with role: user/assistant, text content, timestamp). Provide APIs: sendMessage (user sends text, backend responds with a simulated reply), getChatHistory, clearHistory.
- The chat assistant responds with simple canned/simulated replies (no external AI API, just friendly pre-defined responses).

### Modify
- App header: add navigation tabs to switch between "YouTube" and "Chat" views.

### Remove
- Nothing removed.

## Implementation Plan
1. Update Motoko backend to add Chat data types and actor methods: sendMessage, getChatHistory, clearChatHistory.
2. Update frontend to add navigation between "YouTube" and "Chat" tabs.
3. Build ChatPage component with scrollable message thread and bottom input bar styled like ChatGPT.
4. Wire frontend to backend chat APIs.
