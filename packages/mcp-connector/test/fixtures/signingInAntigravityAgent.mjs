process.stdout.write([
  'Welcome to the Antigravity CLI. You are currently not signed in.',
  'Signing in...',
  '',
].join('\r\n'));

setTimeout(() => {
  void import('./warmAntigravityAgent.mjs');
}, 100);
