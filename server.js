import { createServer } from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const dataDirectory = join(root, 'data');
const stateFile = join(dataDirectory, 'state.json');
const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

async function loadState() {
  try { return await readFile(stateFile); }
  catch {
    await mkdir(dataDirectory, { recursive: true });
    const initial = await readFile(join(root, 'seed.json'));
    await writeFile(stateFile, initial, { mode: 0o600 });
    return initial;
  }
}

createServer(async (request, response) => {
  if (request.url === '/api/state' && request.method === 'GET') {
    response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    response.end(await loadState());
    return;
  }
  if (request.url === '/api/state' && request.method === 'PUT') {
    let body = '';
    request.on('data', chunk => { body += chunk; });
    request.on('end', async () => {
      try {
        const state = JSON.parse(body);
        if (!Array.isArray(state.list) || !Array.isArray(state.pantry) || !Array.isArray(state.profiles)) throw new Error('Invalid state');
        await mkdir(dataDirectory, { recursive: true });
        await writeFile(stateFile, JSON.stringify(state, null, 2), { mode: 0o600 });
        response.writeHead(204).end();
      } catch { response.writeHead(400).end('Invalid state'); }
    });
    return;
  }
  const requested = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  const pathname = normalize(join(root, requested));
  if (!pathname.startsWith(root)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const file = await stat(pathname);
    if (!file.isFile()) throw new Error('Not a file');
    response.writeHead(200, {
      'Content-Type': mime[extname(pathname)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    response.end(await readFile(pathname));
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(process.env.PORT || 4173, () => {
  console.log(`Pantry Pilot running at http://localhost:${process.env.PORT || 4173}`);
});
