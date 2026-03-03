# YouTube Explorer

## Current State
A multi-tab app with:
- YouTube tab: browse/search curated videos, play them in a modal iframe
- Gauth AI tab: AI chat assistant powered by Gauth AI iframe

## Requested Changes (Diff)

### Add
- A new "Sound Buttons World" tab in the header navigation
- A SoundButtonsWorld component with a grid of clickable sound buttons
- Each button plays a short audio clip when clicked (using browser Audio API with publicly available sound URLs or base64 data)
- Categories/sections for different sound types (e.g. Memes, Animals, Effects, Music)
- Visual feedback when a button is playing (highlight/animation)
- Stop/replay behavior: clicking an already-playing sound restarts it; clicking another stops the current one

### Modify
- AppTab type to include "sounds" option
- Header nav to include a third tab button for Sound Buttons World
- AnimatePresence content to render SoundButtonsWorld when "sounds" tab is active
- Footer visibility logic to hide on sounds tab (or show on all)

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/components/SoundButtonsWorld.tsx` with:
   - A curated list of ~30 sound buttons across 4 categories (Memes, Animals, Effects, Music)
   - Use the Web Audio API or HTML Audio element with publicly hosted sound URLs
   - Use free/public domain sounds from freesound-compatible CDNs or well-known meme sound URLs
   - Grid layout with colored category badges
   - Playing state tracking to show active button highlight
2. Update `App.tsx`:
   - Add "sounds" to AppTab type
   - Add Sound Buttons World tab button in header nav
   - Add motion.div case for "sounds" tab in AnimatePresence
   - Import and render SoundButtonsWorld component
