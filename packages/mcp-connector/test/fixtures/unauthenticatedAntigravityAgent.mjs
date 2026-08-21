process.stdout.write([
  'Welcome to the Antigravity CLI. You are currently not signed in.',
  'Signing in...',
  'Select login method:',
  '> 1. Google OAuth',
  '  2. Use a Google Cloud project',
  '',
].join('\r\n'));

setInterval(() => undefined, 1_000);
