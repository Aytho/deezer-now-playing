const WebSocket = require('ws');

class WebSocketService {
  constructor(port) {
    this.port = port;
    this.server = null;
  }

  start() {
    try {
      this.server = new WebSocket.Server({ port: this.port });
      console.log(`WebSocket started on ws://localhost:${this.port}`);

      // Connection management
      this.server.on('connection', (ws) => {
        console.log('New customer logged in');

        ws.on('close', () => {
          console.log('Client disconnected');
        });

        ws.on('error', (error) => {
          console.error('WebSocket client error:', error);
        });
      });

    } catch (err) {
      console.error('WebSocket error:', err);
    }
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        console.log('No WebSocket server to close');
        return resolve();
      }

      console.log('Attempt to close the WebSocket server...');

      // Security timeout: if the server does not close within 2 seconds, we force it to close.
      const timeout = setTimeout(() => {
        console.warn('Timeout: forced closure of the WebSocket');
        this.server = null;
        resolve();
      }, 2000);

      try {
        // Close all client connections first
        if (this.server.clients && this.server.clients.size > 0) {
          console.log(`Closure of ${this.server.clients.size} client(s)...`);
          this.server.clients.forEach(client => {
            try {
              client.terminate(); // Force immediate closure
            } catch (err) {
              console.error('Error closing a client:', err);
            }
          });
        }

        // Shut down the server
        this.server.close((err) => {
          clearTimeout(timeout);

          if (err) {
            console.error('Error closing WebSocket:', err);
            this.server = null;
            reject(err);
          } else {
            console.log('WebSocket server successfully closed');
            this.server = null;
            // Wait a moment to free up the port
            setTimeout(() => resolve(), 500);
          }
        });

      } catch (err) {
        clearTimeout(timeout);
        console.error('Critical error during shutdown:', err);
        this.server = null;
        reject(err);
      }
    });
  }

  broadcast(data) {
    if (!this.server) {
      console.warn('Unable to broadcast: server not started');
      return;
    }

    if (!this.server.clients || this.server.clients.size === 0) {
      return;
    }

    let sentCount = 0;
    this.server.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(JSON.stringify(data));
          sentCount++;
        } catch (err) {
          console.error('Error sending to a customer:', err);
        }
      }
    });
  }
}

module.exports = WebSocketService;