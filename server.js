import { createServer } from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const dataDirectory = join(root, 'data');
const stateFile = join(dataDirectory, 'state.json');
const pendingSms = new Map();
const smsSecret = process.env.PANTRY_PILOT_SMS_WEBHOOK_SECRET;
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
  if (request.url === '/api/auth/pending' && request.method === 'POST') {
    let body = '';
    request.on('data', chunk => { body += chunk; });
    request.on('end', () => {
      try {
        const { accountId, did } = JSON.parse(body);
        if (!accountId || !did) throw new Error('Missing account or DID');
        pendingSms.set(String(did).replace(/\D/g, ''), { accountId: String(accountId), expiresAt: Date.now() + 5 * 60_000 });
        response.writeHead(204).end();
      } catch { response.writeHead(400).end('Invalid request'); }
    });
    return;
  }
  if (request.url === '/api/webhooks/crazytel' && request.method === 'POST') {
    let raw = '';
    request.on('data', chunk => { raw += chunk; });
    request.on('end', () => {
      try {
        if (!smsSecret) throw new Error('Webhook is not configured');
        const signature = request.headers['x-crazyapi-signature'];
        const timestamp = request.headers['x-crazyapi-timestamp'];
        if (typeof timestamp !== 'string' || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) throw new Error('Stale callback');
        const expected = createHmac('sha256', smsSecret).update(`${timestamp}.${raw}`).digest('hex');
        if (typeof signature !== 'string' || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new Error('Invalid signature');
        const payload = JSON.parse(raw);
        const did = String(payload.original_did || payload.to || payload.did || '').replace(/\D/g, '');
        const pending = pendingSms.get(did);
        const code = String(payload.message || payload.text || payload.body || payload.sms?.text || '').match(/\b\d{4,8}\b/)?.[0];
        if (!pending || pending.expiresAt < Date.now() || !code) throw new Error('No matching authentication request');
        pendingSms.delete(did);
        response.writeHead(204).end();
      } catch { response.writeHead(401).end('Rejected'); }
    });
    return;
  }
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
