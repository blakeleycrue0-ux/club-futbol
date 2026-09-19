const http = require('node:http');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const { createStore } = require('./store');

const PORT = Number(process.env.PORT || 4173);
const store = createStore(path.join(__dirname, 'data', 'world.json'));
const mimeTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };

function json(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  response.end(JSON.stringify(body));
}
async function bodyOf(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new Error('JSON inválido.'); }
}
async function serveFile(request, response, pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.resolve(__dirname, `.${requested}`);
  if (!filePath.startsWith(__dirname)) return json(response, 403, { error: 'Ruta no permitida.' });
  try {
    const content = await readFile(filePath);
    response.writeHead(200, { 'content-type': mimeTypes[path.extname(filePath)] || 'application/octet-stream' });
    response.end(content);
  } catch { json(response, 404, { error: 'No encontrado.' }); }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  try {
    if (request.method === 'GET' && url.pathname === '/api/state') return json(response, 200, await store.state());
    if (request.method === 'POST' && url.pathname === '/api/routes/analyse') return json(response, 200, await store.analyse(await bodyOf(request)));
    if (request.method === 'POST' && url.pathname === '/api/flights') return json(response, 201, await store.schedule(await bodyOf(request)));
    if (request.method === 'POST' && url.pathname === '/api/maintenance') return json(response, 200, await store.maintain(await bodyOf(request)));
    if (request.method === 'POST' && url.pathname === '/api/reset') return json(response, 200, await store.reset());
    if (request.method === 'GET') return serveFile(request, response, url.pathname);
    return json(response, 405, { error: 'Método no permitido.' });
  } catch (error) { return json(response, error.statusCode || 400, { error: error.message || 'Error inesperado.' }); }
});
setInterval(() => store.advance().catch((error) => console.error('Simulation worker error:', error)), 2_000).unref();
server.listen(PORT, () => console.log(`Aerovia listening on http://localhost:${PORT}`));
