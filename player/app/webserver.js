const express = require('express');
const path = require('path');
const fs = require('fs');
const { getRootPath } = require("./utils");

class WebServerService {
  constructor(port, wsService) {
    this.port = port;
    this.app = express();
    this.server = null;
    this.wsService = wsService;
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(getRootPath(), 'src')));

    // Page that display the player
    this.app.get('/', async (req, res) => {
      const playerPath = path.join(getRootPath(), 'src/player.html');
      const helpPath = path.join(getRootPath(), 'src/help.html');

      try {
        // Check if player.html exists
        await fs.promises.access(playerPath, fs.constants.F_OK);
        return res.sendFile(playerPath);
      } catch {
        // player.html does not exist
        try {
          // Check if help.html exists
          await fs.promises.access(helpPath, fs.constants.F_OK);
          return res.sendFile(helpPath);
        } catch {
          // No files found
          return res.status(404).send('Not files found, check files or directory in player/src');
        }
      }
    });

    // POST route to update track information via the websocket
    this.app.post('/update', (req, res) => {
      const { url, subtitle, title, cover, progress, duration, paused, isLive } = req.body;
      this.wsService.broadcast({ url, subtitle, title, cover, progress, duration, paused, isLive });
      res.send('OK');
    });

    // POST route to update the config
    this.app.post('/config', (req, res) => {
      const { webserverPort, websocketPort } = req.body;
      const newConfig = { webserverPort: parseInt(webserverPort, 10), websocketPort: parseInt(websocketPort, 10) };
      if (isNaN(newConfig.webserverPort) || newConfig.webserverPort <= 0 || newConfig.webserverPort > 65535 ||
        isNaN(newConfig.websocketPort) || newConfig.websocketPort <= 0 || newConfig.websocketPort > 65535) {
        res.status(400).send('Invalid ports');
        return;
      }
      try {
        fs.writeFileSync(path.join(__dirname, '../config.json'), JSON.stringify(newConfig, null, 2));
        res.send('Configuration saved. Restarting...');
        this.restart(newConfig);
      } catch (err) {
        console.error('Configuration backup error:', err);
        res.status(500).send('Backup error');
      }
    });

    // Route to get config
    this.app.get('/config', (req, res) => {
      try {
        const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf8'));
        res.json(config);
      } catch (err) {
        console.error('Configuration reading error:', err);
        res.json({ webserverPort: 3000, websocketPort: 8080 });
      }
    });

    // Route to get servers status
    this.app.get('/status', (req, res) => {
      const status = {
        http: this.server && this.server.listening,
        websocket: this.wsService.server && this.wsService.server.address() !== null
      };
      res.json(status);
    });
  }

  start() {
    try {
      this.server = this.app.listen(this.port, () => {
        console.log(`HTTP server started on http://localhost:${this.port}`);
      });
      this.server.on('error', (err) => {
        console.error('HTTP server error:', err);
      });
    } catch (err) {
      console.error('HTTP startup error:', err);
    }
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        console.log('No HTTP server to shut down');
        return resolve();
      }

      console.log('Attempting to shut down the HTTP server...');

      // Security timeout: if the server does not close within 2 seconds, we force it to close.
      const timeout = setTimeout(() => {
        console.warn('Timeout: forced shutdown of HTTP server');
        this.server = null;
        resolve();
      }, 2000);

      try {
        if (this.server.listening) {
          this.server.close((err) => {
            clearTimeout(timeout);
            if (err) {
              console.error('HTTP server closure error:', err);
              this.server = null;
              reject(err);
            } else {
              console.log('HTTP server shut down successfully');
              this.server = null;
              // Wait a moment to free up the port
              setTimeout(() => resolve(), 500);
            }
          });
        } else {
          clearTimeout(timeout);
          console.log('HTTP server already stopped');
          this.server = null;
          resolve();
        }
      } catch (err) {
        clearTimeout(timeout);
        console.error('Critical error during HTTP shutdown:', err);
        this.server = null;
        reject(err);
      }
    });
  }

  restart(newConfig) {
    console.log('Restarting servers with config:', newConfig);
    Promise.all([this.wsService.stop(), this.stop()])
      .then(() => {
        console.log('All servers shut down, restarting...');
        this.port = newConfig.webserverPort;
        this.wsService.port = newConfig.websocketPort;
        this.wsService.start();
        this.start();
      })
      .catch((err) => {
        console.error('Error during restart:', err);
        // Attempt a forced restart despite the error
        console.log('Attempting forced restart...');
        this.port = newConfig.webserverPort;
        this.wsService.port = newConfig.websocketPort;
        this.wsService.start();
        this.start();
      });
  }
}

module.exports = WebServerService;