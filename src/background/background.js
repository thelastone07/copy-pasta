const activeWindows = new Map();
const windowActiveTabs = new Map();

chrome.runtime.onMessage.addListener((request, sender) => {
    console.log(request);
    if (request.action === 'toggleReadingMode') {
        const tab = request.tab;
        if (tab && typeof tab.windowId === 'number' && typeof tab.id === 'number') {
            const windowId = tab.windowId;
            const tabId = tab.id;
            if (request.enable) {
                activeWindows.set(windowId, true);
                updateActiveTabForWindow(windowId, tabId);
            } else {
                activeWindows.delete(windowId);
                cleanupWindowState(windowId, tabId);
            }
        } else {
            console.warn('toggleReadingMode: tab info missing from request');
        }
    }
});

chrome.tabs.onActivated.addListener(({tabId, windowId}) => {
    console.log('Tab changed:', tabId, windowId);
    const prevActiveTab = windowActiveTabs.get(windowId);
    if (prevActiveTab && activeWindows.has(windowId)) {
        disableReadingModeForTab(prevActiveTab);
    }
    windowActiveTabs.set(windowId, tabId);
    if (activeWindows.has(windowId)) {
        enableReadingModeForTab(tabId);
    }
});

chrome.windows.onRemoved.addListener((windowId) => {
    activeWindows.delete(windowId);
    windowActiveTabs.delete(windowId);      
});

function updateActiveTabForWindow(windowId, tabId) {
    if (tabId) {
        windowActiveTabs.set(windowId, tabId);
        enableReadingModeForTab(tabId);
    }
}

function cleanupWindowState(windowId, tabId) {
    if (tabId) {
        disableReadingModeForTab(tabId);
    } else {
        chrome.tabs.query({windowId}, (tabs) => {
            tabs.forEach(tab => disableReadingModeForTab(tab.id));
        });
    }
    windowActiveTabs.delete(windowId);
}

function enableReadingModeForTab(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    if (tab && tab.url && /^https?:\/\//.test(tab.url)) {
      chrome.scripting.executeScript({
        target: {tabId},
        files: ['src/content/content.js']
      }).then(() => {
        chrome.tabs.sendMessage(tabId, {action: 'enableReadingMode'});
      }).catch(console.warn);
    } else {
      console.warn('Cannot inject content script into this tab:', tab ? tab.url : tabId);
    }
  });
}


function disableReadingModeForTab(tabId) {
    chrome.tabs.sendMessage(tabId, {action: 'disableReadingMode'})
        .catch(console.warn);
}
