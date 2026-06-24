const { spawn } = require('child_process');
const child = spawn('npx', ['--yes', 'create-video@latest', 'dsadelta-promo', '--template', 'blank']);
child.stdout.on('data', (d) => {
  const output = d.toString();
  console.log(output);
  if (output.includes('Choose a template')) {
    child.stdin.write('\r');
  }
});
child.stderr.on('data', (d) => {
  console.error(d.toString());
});
child.on('exit', () => console.log('Done'));
