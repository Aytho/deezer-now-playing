const fs = require('fs');
const path = require('path');

function getConfig() {
  const configPath = path.join(__dirname, '../config.json');
  let config = null;

  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      config = JSON.parse(configData);
      if (typeof config.webserverPort !== 'number' || config.webserverPort <= 0 || config.webserverPort > 65535) {
        throw new Error('Invalid WebServer port');
      }
      if (typeof config.websocketPort !== 'number' || config.websocketPort <= 0 || config.websocketPort > 65535) {
        throw new Error('Invalid WebSocket port');
      }
      console.log('Configuration loaded :', config);
    } else {
      throw new Error('config.json file does not exist');
    }
  } catch (error) {
    console.warn('Configuration error :', error.message);
    config = { webserverPort: 3000, websocketPort: 8080 };
    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log('Default configuration created');
    } catch (writeError) {
      console.error('Configuration writing error :', writeError.message);
    }
  }

  return config;
}

module.exports = { getConfig };
