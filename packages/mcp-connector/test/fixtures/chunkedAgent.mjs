const chunks = [
  '{"intent":"draw",',
  '"layout":"flow-left-to-right",',
  '"elements":[{"type":"rectangle",',
  '"id":"only-node",',
  '"label":"Batched"}]}',
];

for (const chunk of chunks) {
  process.stdout.write(chunk);
  await new Promise((resolve) => setTimeout(resolve, 12));
}
