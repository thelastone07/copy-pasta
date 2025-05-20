if (!window.hasRunCopyPastaContentScript) {
    window.hasRunCopyPastaContentScript = true;

    let readingModeActive = false;

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'enableReadingMode') {
            readingModeActive = true;
            // console.log('Reading mode enabled');
        } else if (message.action === 'disableReadingMode') {
            readingModeActive = false;
            // console.log('Reading mode disabled');
        }
    });

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);

    function handleSelection() {
        if (!readingModeActive) return;
        const selection = window.getSelection();
        const selectedText = selection ? selection.toString().trim() : '';
        if (selectedText) {
            storeSelectedText(selectedText);
        }
    }

    function storeSelectedText(selectedText) {
        chrome.storage.local.get(['data'], (result) => {
            let data = result.data || [];
            data.push({
                text: selectedText,
                url: window.location.href,
                timestamp: new Date().toISOString()
            });
            chrome.storage.local.set({ data });
            console.log('Stored selection:', selectedText);
        });
    }

    document.addEventListener('keydown',(e) => {
        if (readingModeActive && e.altKey && (e.key === 'z' || e.key === 'Z')) {
            e.preventDefault();
            undoLastSelection();
        }
    });

    document.addEventListener('keydown', (e)=> {
        if (e.altKey && (e.key === 'n' || e.key === 'N')) {
            handleNote(e); 
        }
    });


    function handleNote(event) {
    const existingBox = document.getElementById('copy-pasta-note-box');
    if (existingBox) existingBox.remove();

   
    const noteBox = document.createElement('textarea');
    noteBox.id = 'copy-pasta-note-box';
    noteBox.placeholder = 'Add your note and press Enter...';
    noteBox.style.position = 'fixed';
    noteBox.style.zIndex = 999999;
    noteBox.style.padding = '10px';
    noteBox.style.width = '250px';
    noteBox.style.height = '80px';
    noteBox.style.borderRadius = '8px';
    noteBox.style.border = '1px solid #888';
    noteBox.style.fontSize = '1em';
    noteBox.style.background = '#fff';
    noteBox.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    noteBox.style.resize = 'vertical';
    noteBox.style.overflowY = 'auto';
    noteBox.style.color = '#000';


 
    let x = 100, y = 100; 
    if (event && typeof event.clientX === 'number' && typeof event.clientY === 'number') {
        x = event.clientX + 10; 
        y = event.clientY + 10; 
    }
    const maxX = window.innerWidth - 270;
    const maxY = window.innerHeight - 120;
    noteBox.style.left = Math.min(x, maxX) + 'px';
    noteBox.style.top = Math.min(y, maxY) + 'px';

    document.body.appendChild(noteBox);
    noteBox.focus();

    noteBox.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const newNote = noteBox.value.trim();
            if (newNote) {
                chrome.storage.local.get(['data'], (result) => {
                    let data = result.data || [];
                    if (data.length > 0) {
                        const last = data.pop();
                        const combinedNote = last.note ? last.note + ' \n ' + newNote : newNote;
                        data.push({
                            ...last,
                            note: combinedNote
                        });
                        chrome.storage.local.set({data}, () => {
                            console.log('Note saved:', combinedNote);
                        });
                    }
                });
            }
            noteBox.remove();
        }

        if (e.key === 'Escape') {
            noteBox.remove();
        }
    });
}

    function undoLastSelection() {
        chrome.storage.local.get(['data'], (result) => {
            let data = result.data || [];
            if (data.length > 0) {
                const removed = data.pop();
                chrome.storage.local.set({ data }, () => {
                    console.log('Undo: removed last selection:', removed.text);
                });
            }
        });
    }
}
