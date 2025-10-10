// Safari Vim Navigator - Background Script

// Listen for extension icon clicks
browser.action.onClicked.addListener((tab) => {
  // Toggle vim navigation on/off
  browser.tabs.sendMessage(tab.id, { action: 'toggle' });
});

// Handle installation
browser.runtime.onInstalled.addListener(() => {
  console.log('Safari Vim Navigator installed successfully!');
});
