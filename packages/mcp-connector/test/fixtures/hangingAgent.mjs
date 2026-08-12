process.stdout.write(JSON.stringify({ cwd: process.cwd(), pid: process.pid }));
setInterval(() => undefined, 1_000);
