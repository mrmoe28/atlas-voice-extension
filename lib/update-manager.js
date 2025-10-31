// Update Manager for Atlas Voice Extension
export const updateManager = {
  // Initialize update manager
  async initialize() {
    console.log('Update manager initialized');
    await this.checkForUpdates();
  },

  // Check for updates
  async checkForUpdates() {
    try {
      // Set up periodic update checks
      chrome.alarms.create('check-updates', { 
        periodInMinutes: 60 // Check every hour
      });
      
      console.log('Update check scheduled');
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  },

  // Handle version updates
  async handleUpdate(previousVersion, currentVersion) {
    console.log(`Updated from v${previousVersion} to v${currentVersion}`);
    
    // Store update info
    await chrome.storage.local.set({
      lastVersion: currentVersion,
      updateTime: Date.now()
    });
  },

  // Get current version
  getVersion() {
    return chrome.runtime.getManifest().version;
  }
};

// Listen for alarm to check updates
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'check-updates') {
    updateManager.checkForUpdates();
  }
});