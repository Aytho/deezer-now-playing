const updateTrackTunnel = chrome.runtime.connect({ name: "UPDATE_TRACK" });
const serverStatusTunnel = chrome.runtime.connect({ name: "SERVERS_STATUS" });
let webserverPort;

// Observe changes in the Deezer music player
new MutationObserver(function (mutations) {
  getWebserverPort()
  if(webserverPort) {
    serverStatusTunnel.postMessage({ data: { webserverPort: webserverPort }});
  }

}).observe(document.querySelector("body"), {subtree: true, characterData: true, childList: true});

// Send track info to background script
function sendTrackData() {
  const info = extractTrackData();
  if (info) {
    // Send the updated track info to the background script
    updateTrackTunnel.postMessage({ type: "UPDATE_TRACK", data: { webserverPort: webserverPort, track: info }});
  }
}

// Extract track information from the Deezer page
function extractTrackData() {
  try {
    let elapsedString = document.querySelector("p[data-testid='elapsed_time']")?.innerHTML
    let durationString = document.querySelector("p[data-testid='remaining_time']")?.innerHTML

    let duration = durationString?.split(":").map((x) => parseInt(x)).reduce((acc, x) => acc * 60 + x, 0)
    let elapsed = elapsedString?.split(":").map((x) => parseInt(x)).reduce((acc, x) => acc * 60 + x, 0)

    let progress = elapsed === undefined || duration === undefined ? undefined : Math.floor((elapsed / duration) * 10000) / 100;

    return {
      url: document.querySelectorAll("p[data-testid='item_title'] > a")?.item(0)?.href,
      subtitle: navigator.mediaSession.metadata?.artist,
      title: navigator.mediaSession.metadata?.title,
      cover: navigator.mediaSession.metadata?.artwork[0]?.src,
      progress: progress,
      duration: duration,
      paused: document.querySelector("button[data-testid='play_button_pause']") == null,
      isLive: false
    };
  } catch (error) {
    console.error('Extract error:', error);
    return null;
  }
}

function getWebserverPort() {
  chrome.storage.sync.get(['webserverPort'], (result) => {
    webserverPort = result.webserverPort || 3000;
  })
}

// Send track data when webserver is online
serverStatusTunnel.onMessage.addListener((request) => {
  if(request.type === "SERVERS_STATUS" && request.online) {
    sendTrackData();
  }
});