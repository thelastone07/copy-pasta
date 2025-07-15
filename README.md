## copy-pasta

### Overview

Client Side

User clicks on the extension name. Clicking on the enable session activates the extension. Now, on selecting the text gets stored in the browser storage. Once enabled, the session is limited to a window. On new windows, the same process has to be followed. The users can pause, resume, stop the sessions. They can discard the data or export in .txt format.

Shortcuts 

- Alt + Z - to erase the last copied text into storage
- Alt + N - to open Note UI. Add any notes. Press Enter
- Press Esc to close the Notebox

### Repo contents

- /icons - contains icons.

- /src - contains script logic

- /src/background - contains script that runs in the background. This stores the window Ids and tab Ids. Popup sends messages containing information about ReadingMode and sessionState and background script manipulates injection of content script accordingly. This script also contain the logic for exporting the copied data. For any new export format, the logic has to be included here.

- /src/content - this script has access to the DOM of any page where it is inserted. First, content is inserted. Content script further requires information such as readingMode state. This contains the logic of storing the selected text and the metadata. It also contains the logic of UI and various shortcuts that works with this. 

- /src/popup - contains html, css and js files for popup. Popup is the application interface that you see when you click on icon on the extensions page. It contains logic for sending message on session state, reading mode and export. 

- manifest.json - this contains the permissions, shortcuts,  that this extension requires, paths, etc.

### How to use this extension locally?

1. Download the files into a folder
2. Go to chrome://extensions and switch on developer mode
3. Go to load unpacked and load the folder.

DONE!!!


Go to future_works.txt to see my future plans for this extension. If you want to contribute, feel free to go for it.

You can find my socials in the profile to contact me. :) 


