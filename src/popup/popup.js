const getState = () => 
    new Promise(resolve =>
        chrome.storage.local.get(['sessionState'],resolve)
    );

const setState = (updates) =>
    chrome.storage.local.set(updates);

const readingModeState = document.getElementById('readingModeState');
const toggleReadingModeBtn = document.getElementById('toggleReadingMode');
const pauseBtn = document.getElementById('pauseSession');
const resumeBtn = document.getElementById('resumeSession');
const endBtn = document.getElementById('endSession');
const exportOptions = document.getElementById('exportOptions');
const exportBtn = document.getElementById('exportBtn');
const discardBtn = document.getElementById('discardBtn');
const exportFormat = document.getElementById('exportFormat');
const message = document.getElementById('message');

let currentSessionState = 'inactive';

function updateUI() {
    readingModeState.textContent = (currentSessionState === 'active') ? 'ON' : 'OFF';
    readingModeState.className = currentSessionState === 'active' ? 'active' : '';
    toggleReadingModeBtn.textContent = (currentSessionState === 'active') ? 'Disable Reading Mode' : 'Enable Reading Mode';
    toggleReadingModeBtn.disabled = (currentSessionState === 'paused');
    pauseBtn.disabled = (currentSessionState !== 'active');
    resumeBtn.disabled = (currentSessionState !== 'paused');
    endBtn.disabled = (currentSessionState === 'inactive');
    exportOptions.style.display = (currentSessionState === 'export') ? 'flex' : 'none';
}

function updateReadingMode(mode) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        chrome.runtime.sendMessage({
            action: 'toggleReadingMode',
            tab: tab,
            enable: mode === 'active'
        });
    });
}
   
async function discardData() {
    await setState({data : ""});    
}

getState().then( ({sessionState}) => {
    currentSessionState = sessionState || 'inactive';
    updateUI();
})


toggleReadingModeBtn.addEventListener('click', async () => {
    if (currentSessionState === 'active') {
        await setState({readingMode : false, sessionState : 'inactive'});
        currentSessionState = 'inactive';
        updateReadingMode('inactive');
        discardData();
    } else {
        await setState({readingMode : true, sessionState : 'active'});
        currentSessionState = 'active';
        updateReadingMode('active');
    }
    updateUI();
});

pauseBtn.addEventListener('click', async () => {
    await setState({sessionState : 'paused'});
    currentSessionState = 'paused';
    updateUI();
    updateReadingMode('inactive');
});

resumeBtn.addEventListener('click', async () => {
    await setState({sessionState : 'active'});
    currentSessionState = 'active';
    updateUI();
    updateReadingMode('active');
});

endBtn.addEventListener('click', async () => {
    await setState({sessionState : 'inactive'});
    currentSessionState = 'export';
    updateUI();
    updateReadingMode('inactive');
});


exportBtn.addEventListener('click', async () => {
    chrome.runtime.sendMessage({
            action: 'export',
            format : exportFormat.value
    });
});

discardBtn.addEventListener('click', async ()=>{
    await setState({sessionState : 'inactive'});
    currentSessionState = 'inactive';
    discardData();
    updateUI();     
});