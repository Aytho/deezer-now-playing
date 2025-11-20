# Installation and Usage Guide for the Chrome Extension for Deezer Player OBS

> **Note:** This extension is not an official Deezer tool. It is developed independently and is not affiliated with Deezer or its services.

## Prerequisites
- A Chrome or Chromium-based browser.
- Node.js installed on your system (required to run the local server). Download it from the official website: [https://nodejs.org/](https://nodejs.org/). Install the recommended LTS version.

## 1. Installing the Chrome Extension
To install a Chrome extension in developer mode (necessary for extensions not published on the Chrome Web Store):

1. Open Chrome and go to settings (click the three dots in the top right > Settings).
2. In the search bar, type "extensions" and click on "Extensions".
3. Enable "Developer mode" in the top right of the page.
4. Click on "Load unpacked".
5. Select the folder containing the extension files (usually the project root folder where the `manifest.json` file is located).
6. The extension should now appear in the list of installed extensions.

For more details, refer to Google's official documentation: [https://developer.chrome.com/docs/extensions/mv3/getstarted/](https://developer.chrome.com/docs/extensions/mv3/getstarted/).

Once installed, the extension icon will appear in Chrome's toolbar.

## 2. Configuring the Player
1. Navigate to the `player` folder of the project (located at the project root).
2. Copy the following files to create editable versions:
    - `player-example.html` to `player.html`
    - `player-example.js` to `player.js`
    - `player-example.css` to `player.css`

These files contain a basic example of the web player. You can modify them later to customize the appearance and behavior (for example, change CSS styles or add JavaScript features).

## 3. Installing Dependencies and Starting the Server
There is a `run.bat` script included in the project to handle the installation of dependencies and starting the servers automatically.

1. Double-click on `run.bat` (on Windows) or run it via terminal on other systems.
2. This script will install the necessary Node.js dependencies (like Express and WebSocket) and start the local web server (on port 3000 by default) and the WebSocket server (on port 8080 by default). You will see confirmation messages, such as "HTTP server started on http://localhost:3000".

The server remains active as long as the script is running. Close the terminal or script to stop the server.

## 4. Usage with Deezer and OBS
1. Open your Chrome browser and go to [deezer.com](https://www.deezer.com).
2. Start playing a track on Deezer. The extension will automatically detect the track information (title, artist, cover, progress, etc.) and transmit it via WebSocket.
3. Open OBS Studio.
4. Add a new source: Click the "+" button in the sources, select "Browser".
5. In the source settings:
    - URL: `http://localhost:3000`
    - Width and height: Adjust as needed (for example, 800x600).
    - Check "Shutdown source when not visible" if you don't want duplicate audio.
6. Click "OK". The web player should now display in OBS, showing the information of the current track on Deezer.

The player will update in real-time thanks to the extension.

## 5. Advanced Configuration (Changing Ports)
By default, the web server uses port 3000 and the WebSocket uses port 8080. To change them:

1. Click the extension icon in Chrome's toolbar (top right of the browser).
2. A popup window will open, allowing you to enter new ports for the web server and WebSocket.
3. Click "Save". If the servers are already running, they will restart automatically with the new configuration.
4. **Important:** If you change the web server port (default 3000), update the URL of the web source in OBS (for example, `http://localhost:4000` if you change to 4000). The WebSocket port does not directly affect OBS, but ensure it is consistent.

The ports are saved in a `config.json` file at `player` folder. You can edit them manually if necessary, but use the extension interface to avoid errors.

## Troubleshooting
- **Port already in use error:** Make sure no other service is using ports 3000 or 8080. Change them via the extension if needed.
- **Extension not detected:** Check that the extension is enabled and that you are on deezer.com.
- **Player not updating:** Restart the server using `run.bat` and refresh the Deezer page.
- **Node.js issues:** Check the version with `node -v` and `npm -v`. Reinstall if necessary.

If you encounter issues, check the logs in the terminal console or Chrome's developer tools (F12 > Console).

If problems persist, join our Discord for support: [https://discord.com/invite/RWVg9T86Gm](https://discord.com/invite/RWVg9T86Gm).