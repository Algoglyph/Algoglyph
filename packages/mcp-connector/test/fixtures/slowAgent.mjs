process.stdout.write('{"status":"slow-fixture-started"}\n');
await new Promise((resolve) => setTimeout(resolve, 750));
process.stdout.write('{"status":"slow-fixture-complete"}');
