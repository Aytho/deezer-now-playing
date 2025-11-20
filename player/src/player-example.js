/**
 * PLAYER EXAMPLE FOR OBS
 *
 * This file is a basic example. To customize:
 * 1. Copy this file and rename it to “player.js”
 * 2. Copy “player-example.html” to “player.html”
 * 3. Copy “player-example.css” to “player.css”
 * 4. Customize as needed!
 */

let lastTrack = null;

/**
 * Updates the player display
 */
function updatePlayer(track) {
  const titleEl = document.getElementById('title');
  const artistEl = document.getElementById('artist');
  const coverEl = document.getElementById('cover');
  const progressBar = document.getElementById('progress-bar');

  // Title update
  if (track.title) {
    titleEl.textContent = track.title;
  }

  // Artist update
  if (track.subtitle) {
    artistEl.textContent = track.subtitle;
  }

  // Cover update
  if (track.cover && track.cover !== lastTrack?.cover) {
    coverEl.src = track.cover;
  }

  // Progress update
  if (track.progress !== undefined) {
    progressBar.style.width = `${track.progress}%`;
  }

  lastTrack = track;
}

/**
 * Connecting to WebSocket
 */
window.addEventListener('DOMContentLoaded', () => {
  // Server configuration recovery
  fetch('/config')
    .then(response => response.json())
    .then(config => {
      const wsUrl = `ws://localhost:${config.websocketPort}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Connected to the WebSocket server');
      };

      ws.onmessage = (event) => {
        try {
          const track = JSON.parse(event.data);
          console.log('Music received:', track);
          updatePlayer(track);
        } catch (error) {
          console.error('Error parsing data:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('Disconnected from the WebSocket server');
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          console.log('Attempt to reconnect...');
          location.reload();
        }, 3000);
      };
    })
    .catch(error => {
      console.error('Error retrieving configuration:', error);
    });
});