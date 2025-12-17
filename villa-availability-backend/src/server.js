const app = require('./app');
const { port } = require('./config/env');
const { verifyConnection } = require('./config/db');

async function start() {
  try {
    // Ensure DB is reachable before starting HTTP server
    await verifyConnection();

    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();


