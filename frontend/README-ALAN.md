# Alan AI Voice Commands Setup

## Setup Instructions

1. **Alan AI Studio Setup (IMPORTANT - This fixes the chat issue):**
   - Go to https://studio.alan.app/
   - Login to your account
   - Find your project or create new one
   - Click on your project to open it
   
2. **Disable Chat Mode (Critical Step):**
   - In Alan AI Studio, look for the **Settings** tab (gear icon)
   - OR look for **Project Settings** in the left sidebar
   - Find **"Interface"** or **"Chat Settings"** section
   - **TURN OFF** "Enable Chat" or "Chat Mode"
   - **TURN ON** "Voice Only" if available
   - Click **Save** or **Apply**

3. **Add Voice Script:**
   - Go to the **Scripts** tab in Alan AI Studio
   - Delete any existing code
   - Copy ALL contents from `alan-script.js` file
   - Paste into the script editor
   - Click **Save** button
   - Click **Deploy** or **Publish** button

4. **Get Your Key:**
   - In Alan AI Studio, find **"Integrations"** tab
   - Copy the **SDK Key** (starts with letters/numbers)
   - Open `src/hooks/useAlan.js`
   - Replace the existing key with your copied key

## Available Voice Commands

- **Navigation:**
  - "Go to home" / "Take me home"
  - "Show properties" / "Search properties"
  - "Go to login" / "Sign in"
  - "Go to register" / "Sign up"
  - "Go to dashboard"
  - "Go to profile"
  - "My rentals"

- **General:**
  - "Hello" / "Hi" - Greeting
  - "Help" / "What can you do" - Show available commands

## How It Works

1. Alan AI button appears in bottom-right corner
2. Click and hold to speak commands
3. Voice commands trigger navigation and actions
4. No web chat interface - pure voice interaction

## Troubleshooting Chat Issue

**If Alan AI still shows chat instead of voice:**

1. **Check Project Type:**
   - In Alan AI Studio, look for "Project Type" or "Template"
   - Should be set to "Voice Assistant" NOT "Chatbot"

2. **Look for these settings in Alan AI Studio:**
   - **"Chat Interface"** - Turn OFF
   - **"Voice Interface"** - Turn ON
   - **"Enable Chat"** - Uncheck/Disable
   - **"Voice Only Mode"** - Enable if available

3. **Alternative locations to find settings:**
   - Top menu: Settings → Interface
   - Left sidebar: Project Settings → Interface
   - Bottom of script editor: Interface Settings
   - Project dashboard: Configuration tab

4. **After changing settings:**
   - Always click **Save**
   - Click **Deploy** or **Publish**
   - Refresh your website
   - Clear browser cache if needed

## Other Troubleshooting

- Ensure microphone permissions are granted
- Check browser console for errors
- Verify Alan AI key is correct
- Make sure voice script is deployed in Alan AI Studio