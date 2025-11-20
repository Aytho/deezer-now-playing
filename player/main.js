const { getConfig } = require('./app/config');
const WebSocketService = require('./app/websocket');
const WebServerService = require('./app/webserver');

// Get config
const config = getConfig();
if (!config) {
  console.error('Invalid configuration');
  process.exit(1);
}

// Setup servers
const wsService = new WebSocketService(config.websocketPort);
const webService = new WebServerService(config.webserverPort, wsService);

// Starting services
wsService.start();
webService.start();