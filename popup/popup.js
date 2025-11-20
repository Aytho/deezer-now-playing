const saveBtn = document.getElementById('saveBtn');

// Function for polling until servers are active
function pollUntilActive(maxTime = 60000, interval = 1500) {  // 60 seconds max, check every 1.5 seconds
  let elapsed = 0;
  const pollInterval = setInterval(() => {
    elapsed += interval;

    chrome.storage.sync.get(['webserverPort'], (result) => {
      const port = result.webserverPort || 3000;
      fetch(`http://localhost:${port}/status`)
        .then(response => {
          if (!response.ok) {
            saveBtn.disabled = false;
            throw new Error('Server not accessible');
          }
          return response.json();
        })
        .then(status => {
          if (status.http && status.websocket) {
            // Active servers: stop polling
            clearInterval(pollInterval);
            setServerStatus('Active', 'Active', 'active', 'active');
            document.getElementById('status').textContent = 'Restart completed successfully !';
            document.getElementById('status').className = 'status-message success';
            saveBtn.disabled = false;
          } else {
            // Still in progress: continue polling
            setServerStatus('Restarting...', 'Restarting...', 'restarting', 'restarting');
          }
        })
        .catch(err => {
          // Error: continue polling (may be temporary)
          setServerStatus('Restarting...', 'Restarting...', 'restarting', 'restarting');
        });
    });

    // Timeout: stop after maxTime
    if (elapsed >= maxTime) {
      clearInterval(pollInterval);
      setServerStatus('Timeout', 'Timeout', 'inactive', 'inactive');
      document.getElementById('status').textContent = 'Timeout: restart failed. Check the server logs.';
      document.getElementById('status').className = 'status-message error';
      saveBtn.disabled = false;
    }
  }, interval);
}

// Function to set the status of servers (unchanged)
function setServerStatus(httpText, wsText, httpClass = 'inactive', wsClass = 'inactive') {
  const httpEl = document.getElementById('httpStatus');
  const wsEl = document.getElementById('wsStatus');

  httpEl.textContent = httpText;
  httpEl.className = `status ${httpClass}`;

  wsEl.textContent = wsText;
  wsEl.className = `status ${wsClass}`;
}

// Function to check and display the status of servers (unchanged, but can be called directly)
function checkServerStatus() {
  chrome.storage.sync.get(['webserverPort'], (result) => {
    const port = result.webserverPort || 3000;
    fetch(`http://localhost:${port}/status`)
      .then(response => {
        if (!response.ok) throw new Error('Server not accessible');
        return response.json();
      })
      .then(status => {
        setServerStatus(
          status.http ? 'Active' : 'Inactive',
          status.websocket ? 'Active' : 'Inactive',
          status.http ? 'active' : 'inactive',
          status.websocket ? 'active' : 'inactive'
        );
      })
      .catch(err => {
        setServerStatus('Inactive', 'Inactive', 'inactive', 'inactive');
      });
  });
}

// When loading the popup (unchanged)
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['webserverPort', 'websocketPort'], (result) => {
    document.getElementById('webserverPort').value = result.webserverPort || 3000;
    document.getElementById('websocketPort').value = result.websocketPort || 8080;
  });

  checkServerStatus();
  setInterval(checkServerStatus, 5000);  // Normal polling every 5 seconds
});

// Save and send to server
saveBtn.addEventListener('click', () => {
  saveBtn.disabled = true;
  const config = {
    webserverPort: parseInt(document.getElementById('webserverPort').value, 10),
    websocketPort: parseInt(document.getElementById('websocketPort').value, 10)
  };

  // Validation
  if (isNaN(config.webserverPort) || config.webserverPort <= 0 || config.webserverPort > 65535) {
    document.getElementById('status').textContent = 'Error: Invalid web server port (1-65535)';
    document.getElementById('status').className = 'status-message error';
    saveBtn.disabled = false;
    return;
  }
  if (isNaN(config.websocketPort) || config.websocketPort <= 0 || config.websocketPort > 65535) {
    document.getElementById('status').textContent = 'Error: Invalid WebSocket port (1-65535)';
    document.getElementById('status').className = 'status-message error';
    saveBtn.disabled = false;
    return;
  }

  // Start the “Restarting...” status
  setServerStatus('Restarting...', 'Restarting...', 'restarting', 'restarting');
  document.getElementById('status').textContent = 'Sending the configuration...';
  document.getElementById('status').className = 'status-message';

  // Load the old configuration to send to the correct port
  chrome.storage.sync.get(['webserverPort'], (result) => {
    const oldPort = result.webserverPort || 3000;
    fetch(`http://localhost:${oldPort}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
      .then(response => {
        if (response.ok) {
          document.getElementById('status').textContent = 'Configuration sent! Waiting for restart...';
          document.getElementById('status').className = 'status-message';

          // Save locally after successful sending
          chrome.storage.sync.set(config, () => {
            // Start smart polling
            pollUntilActive();
          });
        } else {
          document.getElementById('status').textContent = 'Server error : ' + response.status;
          document.getElementById('status').className = 'status-message error';
          saveBtn.disabled = false;
          checkServerStatus();  // Reset actual status
        }
      })
      .catch(err => {
        document.getElementById('status').textContent = 'Error : ' + err.message;
        document.getElementById('status').className = 'status-message error';
        saveBtn.disabled = false;
        checkServerStatus();  // Reset actual status
      });
  });
});
