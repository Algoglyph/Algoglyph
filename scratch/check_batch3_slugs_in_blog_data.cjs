const fs = require('fs');
const path = require('path');

const blogDataPath = path.join(__dirname, '../src/config/blogData.ts');
const data = fs.readFileSync(blogDataPath, 'utf8');

const nextSlugs = [
  'auth-openid',
  'auth-saml',
  'checkpoint-intermediate-projects',
  'sec-https',
  'sec-owasp',
  'sec-cors',
  'sec-ssl-tls',
  'sec-csp',
  'sec-server-security',
  'sec-api-best-practices',
  'hash-md5',
  'hash-sha',
  'hash-scrypt',
  'hash-bcrypt',
  'cache-redis',
  'cache-memcached',
  'cache-http',
  'server-nginx',
  'server-apache',
  'server-caddy',
  'server-iis'
];

console.log('=== Checking if next backend batch slugs exist in blogData.ts ===');
for (const slug of nextSlugs) {
  const index = data.indexOf(`"slug": "${slug}"`);
  if (index !== -1) {
    console.log(`Slug: ${slug} -> FOUND`);
  } else {
    console.log(`Slug: ${slug} -> NOT FOUND`);
  }
}
