const { writeFileSync } = require('node:fs');

// `node --version` has no script entry in process.argv. If a version probe
// inherits NODE_OPTIONS from its connector parent, this preload records the
// inherited secret. A correctly isolated probe never loads this file.
if (process.argv.length === 1 && process.env.ALGOGLYPH_TEST_VERSION_MARKER) {
  writeFileSync(
    process.env.ALGOGLYPH_TEST_VERSION_MARKER,
    process.env.ALGOGLYPH_TEST_PARENT_SECRET || 'parent-secret-missing',
    'utf8',
  );
}
