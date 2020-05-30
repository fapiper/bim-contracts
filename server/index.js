const app = require('./app');

async function init() {
  // Start the server
  const PORT = 8888;

  app.listen(PORT, () => {
    console.log('Server is listening on http://localhost:' + PORT);
  });
}

init();
