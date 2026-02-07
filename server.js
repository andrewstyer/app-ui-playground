#!/usr/bin/env node
/**
 * App UI Playground Development Server
 *
 * Serves static files and provides an API endpoint to trigger iOS sync.
 *
 * Usage:
 *   node server.js
 *   node server.js --port 3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const url = require('url');

// ============================================================
// Configuration
// ============================================================

const args = process.argv.slice(2);
let PORT = 8080;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && args[i + 1]) {
    PORT = parseInt(args[i + 1], 10);
  }
}

const ROOT = __dirname;

// App configurations for sync
// Add new apps here with their iOS source paths
const APP_CONFIGS = {
  narrativ: {
    iosPath: '../narrativ/Narrativ',
  },
  // Add more apps as needed:
  // 'my-app': { iosPath: '../my-app/MyApp' },
};

// ============================================================
// MIME Types
// ============================================================

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// ============================================================
// Static File Server
// ============================================================

function serveStaticFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}

// ============================================================
// Sync API Handler
// ============================================================

function handleSyncRequest(req, res, appName, options = {}) {
  const config = APP_CONFIGS[appName];

  if (!config) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: `Unknown app: ${appName}. Configure it in server.js APP_CONFIGS.`
    }));
    return;
  }

  const scriptPath = path.join(ROOT, 'scripts', 'sync-from-ios.js');
  const iosPath = path.resolve(ROOT, config.iosPath);

  // Build arguments
  const args = ['--ios-path', iosPath, '--app', appName];
  if (options.dryRun) args.push('--dry-run');
  if (options.tokensOnly) args.push('--tokens-only');
  if (options.screensOnly) args.push('--screens-only');

  console.log(`\n🔄 Sync triggered for ${appName}`);
  console.log(`   Running: node ${scriptPath} ${args.join(' ')}`);

  const child = spawn('node', [scriptPath, ...args], {
    cwd: ROOT,
  });

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (data) => {
    stdout += data.toString();
    process.stdout.write(data);
  });

  child.stderr.on('data', (data) => {
    stderr += data.toString();
    process.stderr.write(data);
  });

  child.on('close', (code) => {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify({
      success: code === 0,
      exitCode: code,
      output: stdout,
      error: stderr || null,
    }));
  });

  child.on('error', (err) => {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: err.message,
    }));
  });
}

// ============================================================
// Request Handler
// ============================================================

function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // API: Sync from iOS
  if (pathname === '/api/sync' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const appName = data.app || 'narrativ';
        handleSyncRequest(req, res, appName, {
          dryRun: data.dryRun,
          tokensOnly: data.tokensOnly,
          screensOnly: data.screensOnly,
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // API: Import new app from iOS
  if (pathname === '/api/import' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        if (!data.iosPath || !data.app) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'iosPath and app are required' }));
          return;
        }

        const scriptPath = path.join(ROOT, 'scripts', 'import-ios-app.js');
        const iosPath = path.resolve(ROOT, data.iosPath);
        const args = ['--ios-path', iosPath, '--app', data.app];

        console.log(`\n📦 Import triggered for ${data.app}`);
        console.log(`   Running: node ${scriptPath} ${args.join(' ')}`);

        const child = spawn('node', [scriptPath, ...args], { cwd: ROOT });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (chunk) => {
          stdout += chunk.toString();
          process.stdout.write(chunk);
        });

        child.stderr.on('data', (chunk) => {
          stderr += chunk.toString();
          process.stderr.write(chunk);
        });

        child.on('close', (code) => {
          // If successful, add to APP_CONFIGS dynamically
          if (code === 0) {
            APP_CONFIGS[data.app] = { iosPath: data.iosPath };
          }

          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(JSON.stringify({
            success: code === 0,
            exitCode: code,
            output: stdout,
            error: stderr || null,
            app: data.app,
          }));
        });

        child.on('error', (err) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // API: Get app config
  if (pathname === '/api/config') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify({
      apps: Object.keys(APP_CONFIGS),
      configs: APP_CONFIGS,
    }));
    return;
  }

  // Static files
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(ROOT, filePath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Try index.html for SPA-style routing
      if (!path.extname(filePath)) {
        filePath = path.join(ROOT, 'index.html');
      }
    }
    serveStaticFile(res, filePath);
  });
}

// ============================================================
// Start Server
// ============================================================

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║              App UI Playground Dev Server                  ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Local:   http://localhost:${PORT.toString().padEnd(28)}║
║                                                            ║
║  Apps configured for sync:                                 ║
${Object.keys(APP_CONFIGS).map(app => `║    - ${app.padEnd(50)}║`).join('\n')}
║                                                            ║
║  Press Ctrl+C to stop                                      ║
╚════════════════════════════════════════════════════════════╝
`);
});
