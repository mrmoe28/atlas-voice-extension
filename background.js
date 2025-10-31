// Import update manager
import { updateManager } from './lib/update-manager.js';

// ===== Background Service Worker Keepalive =====
// Prevents service worker from going to sleep
let keepaliveInterval = null;

function startKeepalive() {
  if (keepaliveInterval) return;

  // Ping every 20 seconds to keep worker alive
  keepaliveInterval = setInterval(() => {
    chrome.runtime.getPlatformInfo(() => {
      // This empty callback keeps the worker active
      console.log('🔄 Keepalive ping');
    });
  }, 20000);

  console.log('✅ Background keepalive started');
}

function stopKeepalive() {
  if (keepaliveInterval) {
    clearInterval(keepaliveInterval);
    keepaliveInterval = null;
    console.log('⏸️ Background keepalive stopped');
  }
}

// Start keepalive when extension loads
startKeepalive();

// Ensure the side panel can be opened across pages.
chrome.runtime.onInstalled.addListener(async (details) => {
  // For Chrome
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  }

  // Initialize update manager on install or update
  if (details.reason === 'install' || details.reason === 'update') {
    console.log(`Atlas ${details.reason}ed: v${chrome.runtime.getManifest().version}`);
    await updateManager.initialize();

    // Show updated notification if this was an update
    if (details.reason === 'update') {
      chrome.notifications.create('atlas-updated', {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('assets/icon-128.png'),
        title: 'Atlas Updated!',
        message: `Successfully updated to v${chrome.runtime.getManifest().version}`,
        priority: 1
      });
    }

    // Show background mode instructions on first install
    if (details.reason === 'install') {
      chrome.notifications.create('atlas-background-mode', {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('assets/icon-128.png'),
        title: 'Enable Background Mode',
        message: 'To use wake word detection when Chrome is minimized, enable "Continue running background apps when Chrome is closed" in Chrome Settings → System.',
        priority: 2
      });
    }
  }

  // Start keepalive
  startKeepalive();
});

chrome.action.onClicked.addListener(async (tab) => {
  if (chrome.sidePanel && chrome.sidePanel.open) {
    await chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Initialize update manager and keepalive on startup
chrome.runtime.onStartup.addListener(async () => {
  console.log('Atlas starting up...');
  await updateManager.initialize();
  startKeepalive();
});

// Listen for messages from sidepanel (for wake word control)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'wakeword-enabled') {
    console.log('👂 Wake word detection enabled in background');
    startKeepalive();
  } else if (message.type === 'wakeword-disabled') {
    console.log('🔇 Wake word detection disabled in background');
    // Keep keepalive running for other features
  }

  sendResponse({ success: true });
  return true;
});
