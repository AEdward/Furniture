// Custom Node server for hosts that need a plain .js entry point rather
// than an npm script — specifically cPanel's "Setup Node.js App"
// (Phusion Passenger), which requires() this file directly and expects
// it to start listening on the port Passenger hands it via PORT. Local
// dev and `next start` don't use this file at all; it only matters for
// that kind of deployment.
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, () => {
    console.log(`> Ready on port ${port} (${dev ? "development" : "production"})`);
  });
});
