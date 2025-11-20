chrome.runtime.onConnect.addListener((tunnel) => {
  tunnel.onMessage.addListener((request) => {

    // Send track data to the music player webserver
    if (tunnel.name === "UPDATE_TRACK") {
      fetch(`http://localhost:${request.data.webserverPort}/update`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(request.data.track)
      }).catch(err => console.error(err));
    }

    // Send webserver status
    if (tunnel.name === "SERVERS_STATUS") {
      fetch(`http://localhost:${request.data.webserverPort}/status`)
        .then(response => {
          if (!response.ok) throw new Error('Server not accessible');
          return response.json();
        })
        .then(status => {
          if(status.http && status.websocket) {
            tunnel.postMessage({ type: "SERVERS_STATUS", online: true });
          } else throw new Error('Websocket or webserver are offline');
        })
        .catch(err => {
          console.error(err);
        });
    }
  });
})