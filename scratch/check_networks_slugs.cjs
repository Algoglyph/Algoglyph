const fs = require('fs');
const path = require('path');

const blogDataPath = path.join(__dirname, '../src/config/blogData.ts');
const data = fs.readFileSync(blogDataPath, 'utf8');

// Slugs we saw in Network Engineering subtopics:
const sampleSlugs = [
  'tcp-ip-model',
  'two-three-tier',
  'spine-leaf',
  'routers-switches',
  'hubs-modems',
  'access-points',
  'packet-tracer',
  'gns3-eve',
  'http-https',
  'ssh-ssl-tls',
  'ftp-smtp-dhcp',
  'dns-resolution',
  'dns-servers',
  'ipv4-ipv6',
  'public-private',
  'nat-pat',
  'subnet-masks',
  'cidr-vlsm',
  'supernetting',
  'bgp-ospf',
  'rip-eigrp-mpls',
  'static-dynamic',
  'vlans-vxlan',
  'stp-mac',
  'ipsec-ssl-vpn',
  'site-to-remote',
  'mpls-gre'
];

console.log('=== Checking if slugs exist in blogData.ts ===');
for (const slug of sampleSlugs) {
  const index = data.indexOf(`"slug": "${slug}"`);
  if (index !== -1) {
    // Get the category
    const catIndex = data.indexOf('"category":', index);
    const catEnd = data.indexOf('\n', catIndex);
    const catLine = data.substring(catIndex, catEnd);
    console.log(`Slug: ${slug} -> FOUND in blogData.ts (${catLine.trim()})`);
  } else {
    console.log(`Slug: ${slug} -> NOT FOUND`);
  }
}
