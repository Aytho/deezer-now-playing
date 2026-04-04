const { getConfig } = require('./app/config');
const WebSocketService = require('./app/websocket');
const WebServerService = require('./app/webserver');
const SysTray = require('systray2').default;
const path = require('path');
const fs = require('fs');

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

// Changing icon to base64
const iconPath = path.join(__dirname, 'icon.ico');
const icon = fs.readFileSync(iconPath).toString('base64');

const tray = new SysTray({
  menu: {
    icon,
    title: '',
    tooltip: 'Deezer Now Playing',
    items: [
      {
        title: `Server online - Webserver: ${config.webserverPort} / Websocket :${config.websocketPort}`,
        tooltip: 'Server status',
        checked: false,
        enabled: false,
      },
      SysTray.separator,
      {
        title: 'Quit',
        tooltip: 'Stop and quit the application',
        checked: false,
        enabled: true,
      },
    ],
  },
  debug: false,
  copyDir: true,
});

tray.onClick((action) => {
  if (action.item.title === 'Quit') {
    tray.kill();
    process.exit(0);
  }
});