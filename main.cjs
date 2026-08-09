const { app, BrowserWindow, net, protocol, session, shell } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

const APP_ORIGIN = 'app://algoglyph';
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true },
  },
]);

const registerAppProtocol = () => {
  const distRoot = path.resolve(__dirname, 'dist');
  protocol.handle('app', (request) => {
    const url = new URL(request.url);
    if (url.host !== 'algoglyph') return new Response('Not found', { status: 404 });
    let relativePath;
    try {
      relativePath = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    } catch {
      return new Response('Bad request', { status: 400 });
    }
    const requestedPath = path.resolve(distRoot, relativePath);
    if (requestedPath !== distRoot && !requestedPath.startsWith(`${distRoot}${path.sep}`)) {
      return new Response('Forbidden', { status: 403 });
    }
    return net.fetch(pathToFileURL(requestedPath).toString());
  });
};

const installWorkspaceSecurityHeaders = () => {
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' http://127.0.0.1:* http://localhost:* https:",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
  ].join('; ');
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    if (!details.url.startsWith(`${APP_ORIGIN}/`)) return callback({ responseHeaders: details.responseHeaders });
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp],
        'X-Content-Type-Options': ['nosniff'],
        'Referrer-Policy': ['no-referrer'],
      },
    });
  });
};

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 900,
    minHeight: 600,
    autoHideMenuBar: true, // Sleek distraction-free Obsidian style window header
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Open external links in the default browser instead of replacing the Electron window content
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^(https?:|mailto:)/i.test(url)) void shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const trusted = isDev ? url.startsWith('http://localhost:5173') : url.startsWith(`${APP_ORIGIN}/`);
    if (!trusted) event.preventDefault();
  });

  // Check if we are running in dev mode or as a packaged executable
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadURL(`${APP_ORIGIN}/index.html`);
  }
}

app.whenReady().then(() => {
  if (!isDev) {
    registerAppProtocol();
    installWorkspaceSecurityHeaders();
  }
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
