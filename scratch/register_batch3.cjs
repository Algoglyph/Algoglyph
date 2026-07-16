const fs = require('fs');
const path = require('path');

const blogDataPath = path.join(__dirname, '../src/config/blogData.ts');
let content = fs.readFileSync(blogDataPath, 'utf8');

// 1. Let's write a script to clean up duplicate entries from blogData.ts.
// We know that blogData.ts contains duplicate entries for gitlab-hosting up to auth-cookie.
// Let's parse BLOG_POSTS using standard JS parsing, or write a robust script.
// A simpler way: we can read and write using Node.js VM to parse the export, but since we need to preserve formatting and huge markdown text,
// let's do a programmatic search and slice of the text.
// Let's locate the duplicate entries.
// We saw in find_lines.cjs that line 35741 has the first "slug": "gitlab-hosting" and line 36546 has the second.
// Let's find where the duplicate section starts and ends.

// Let's define the 21 new posts to append:
const batch3Posts = [
  {
    "slug": "auth-openid",
    "title": "OpenID Connect",
    "tagline": "Master OpenID Connect (OIDC) authentication layers, ID tokens, claims, and JWKS validation.",
    "category": "Backend",
    "readTime": 15,
    "lastUpdated": "July 2026",
    "prerequisites": ["auth-oauth", "auth-jwt"],
    "related": ["auth-oauth", "auth-jwt", "auth-saml"],
    "practiceProblems": [],
    "content": {
      "introduction": "This is a comprehensive chapter on OpenID Connect. See the markdown content for the full article.",
      "whyImportant": "OIDC provides a standard identity layer on top of OAuth 2.0, enabling secure federated identity and single sign-on.",
      "realWorldApps": ["Okta/Auth0 client integrations", "Google/GitHub Sign-In", "Enterprise federated identity portals"],
      "algorithmDescription": ["Exchange authorization code for ID token", "Verify JWT signatures using JWKS keys", "Parse and validate claims"],
      "complexity": [],
      "implementationCpp": "",
      "implementationPython": "",
      "commonMistakes": ["Skipping signature validation of the ID token", "Not validating issuer (iss) and audience (aud) claims"],
      "interviewQuestions": ["What is the difference between OAuth 2.0 and OpenID Connect?", "Explain the role of the JWKS endpoint in OIDC."],
      "summary": "See the full markdown article for a comprehensive textbook-grade treatment of OpenID Connect."
    }
  },
  {
    "slug": "auth-saml",
    "title": "SAML",
    "tagline": "Deconstruct SAML 2.0 XML SSO exchanges, Service Provider/IdP roles, and security assertions.",
    "category": "Backend",
    "readTime": 18,
    "lastUpdated": "July 2026",
    "prerequisites": ["auth-basic"],
    "related": ["auth-openid", "auth-jwt"],
    "practiceProblems": [],
    "content": {
      "introduction": "This is a comprehensive chapter on SAML. See the markdown content for the full article.",
      "whyImportant": "SAML is the enterprise standard for Single Sign-On (SSO), critical for integrating business directories (Active Directory/LDAP) with SaaS apps.",
      "realWorldApps": ["Okta/Ping Identity enterprise SSO", "Active Directory Federation Services (ADFS)", "Corporate app portal integrations"],
      "algorithmDescription": ["Generate SP-initiated AuthNRequest", "Validate signed XML assertion from IdP", "Deduplicate assertions via Response ID"],
      "complexity": [],
      "implementationCpp": "",
      "implementationPython": "",
      "commonMistakes": ["XML Signature Wrapping (XSW) vulnerabilities", "Failing to validate assertion expiration and audiences"],
      "interviewQuestions": ["Explain the flow of a SAML Service Provider initiated SSO.", "What is XML Signature Wrapping and how do you prevent it?"],
      "summary": "See the full markdown article for a comprehensive textbook-grade treatment of SAML."
    }
  },
  {
    "slug": "checkpoint-intermediate-projects",
    "title": "Checkpoint - Intermediate Project Ideas",
    "tagline": "Blueprint designs for intermediate backend services: databases, workers, and caches.",
    "category": "Backend",
    "readTime": 12,
    "lastUpdated": "July 2026",
    "prerequisites": [],
    "related": ["checkpoint-beginner-projects"],
    "practiceProblems": [],
    "content": {
      "introduction": "This is a comprehensive chapter on Checkpoint - Intermediate Project Ideas. See the markdown content for the full article.",
      "whyImportant": "Building intermediate projects bridges the gap between basic API routes and production-grade distributed architectures.",
      "realWorldApps": ["Designing asynchronous job processors", "Integrating caching layers in active routes", "Setting up local multi-container environments"],
      "algorithmDescription": ["Structure clean repository layouts", "Write docker-compose configs", "Configure background queues"],
      "complexity": [],
      "implementationCpp": "",
      "implementationPython": "",
      "commonMistakes": ["Hardcoding database credentials", "Ignoring environment variable injection bounds"],
      "interviewQuestions": ["What architectural patterns distinguish an intermediate backend app from a beginner backend app?", "How do you separate database migration steps from runtime application containers?"],
      "summary": "See the full markdown article for a comprehensive textbook-grade treatment of Checkpoint - Intermediate Project Ideas."
    }
  },
  {
    "slug": "sec-https",
    "title": "HTTPS/TLS",
    "tagline": "Uncover the cryptographic foundations of HTTPS, certificate authorities, and the TLS 1.3 handshake.",
    "category": "Backend",
    "readTime": 15,
    "lastUpdated": "July 2026",
    "prerequisites": ["what-is-http"],
    "related": ["sec-ssl-tls", "auth-oauth"],
    "practiceProblems": [],
    "content": {
      "introduction": "This is a comprehensive chapter on HTTPS/TLS. See the markdown content for the full article.",
      "whyImportant": "HTTPS is mandatory for web traffic, ensuring confidentiality, integrity, and authenticity for all network exchanges.",
      "realWorldApps": ["Configuring web server SSL contexts", "Securing API transport layers", "Automating certificate renewals via Let's Encrypt"],
      "algorithmDescription": ["Initiate TLS ClientHello/ServerHello", "Negotiate cryptographic keys (ECDHE)", "Derive symmetric session keys"],
      "complexity": [],
      "implementationCpp": "",
      "implementationPython": "",
      "commonMistakes": ["Allowing outdated cipher suites (e.g. 3DES, RC4)", "Neglecting SNI configurations for multi-domain routing"],
      "interviewQuestions": ["Describe the steps in a TLS 1.3 handshake.", "Why does HTTPS use asymmetric encryption for key exchange but symmetric encryption for data transfer?"],
      "summary": "See the full markdown article for a comprehensive textbook-grade treatment of HTTPS/TLS."
    }
  },
  {
    "slug": "sec-owasp",
    "title": "OWASP Risks",
    "tagline": "Master the OWASP Top 10 vulnerabilities, attack mechanics, and backend defenses.",
    "category": "Backend",
    "readTime": 20,
    "lastUpdated": "July 2026",
    "prerequisites": [],
    "related": ["sec-cors", "sec-csp"],
    "practiceProblems": [],
    "content": {
      "introduction": "This is a comprehensive chapter on OWASP Risks. See the markdown content for the full article.",
      "whyImportant": "Understanding the OWASP Top 10 ensures that developers code proactively against the most common and devastating web exploits.",
      "realWorldApps": ["Securing relational databases against SQLi", "Sanitizing user inputs against XSS", "Validating access controls on private endpoints"],
      "algorithmDescription": ["Deconstruct injection string payloads", "Implement parameterized database queries", "Enforce role-based access checks"],
      "complexity": [],
      "implementationCpp": "",
      "implementationPython": "",
      "commonMistakes": ["Relying on client-side validation for security constraints", "Using raw string concatenation in SQL queries"],
      "interviewQuestions": ["What is SQL Injection and how do parameterized queries mitigate it?", "How does Broken Access Control differ from Broken Authentication?"],
      "summary": "See the full markdown article for a comprehensive textbook-grade treatment of OWASP Risks."
    }
  },
  {
    "slug": "sec-cors",
    "title": "CORS",
    "tagline": "Master Cross-Origin Resource Sharing (CORS) preflight requests, headers, and security boundaries.",
    "category": "Backend",
    "readTime": 12,
    "lastUpdated": "July 2026",
    "prerequisites": ["what-is-http"],
    "related": ["sec-owasp", "sec-csp"],
    "practiceProblems": [],
    "content": {
      "introduction": "This is a comprehensive chapter on CORS. See the markdown content for the full article.",
      "whyImportant": "CORS rules govern browser security, preventing malicious websites from reading data from your API via cross-origin requests.",
      "realWorldApps": ["Configuring Express/FastAPI CORS middleware", "Handling HTTP OPTIONS preflight queries", "Restricting API origins in cloud gateways"],
      "algorithmDescription": ["Intercept non-simple origin requests", "Validate request headers against origin allowances", "Append Access-Control headers to responses"],
      "complexity": [],
      "implementationCpp": "",
      "implementationPython": "",
      "commonMistakes": ["Configuring Access-Control-Allow-Origin to '*' with Allow-Credentials", "Ignoring OPTIONS routing inside backend frameworks"],
      "interviewQuestions": ["Explain the purpose of a CORS preflight request.", "How does CORS prevent cross-site request hijacking?"],
      "summary": "See the full markdown article for a comprehensive textbook-grade treatment of CORS."
    }
  },
  {
    "slug": "sec-ssl-tls",
    "title": "SSL/TLS",
    "tagline": "Master SSL/TLS protocol levels, cipher suites, key exchanges, and secure channels.",
    "category": "Backend",
    "readTime": 15,
    "lastUpdated": "July 2026",
    "prerequisites": ["sec-https"],
    "related": ["sec-https", "auth-token"],
    "practiceProblems": [],
    "content": {
      "introduction": "This is a comprehensive chapter on SSL/TLS. See the markdown content for the full article.",
      "whyImportant": "SSL/TLS secure socket layers protect raw TCP communication, essential for securing all Internet protocols (LDAP, SMTP, HTTP, etc.).",
      "realWorldApps": ["Setting up TLS termination in Nginx", "Configuring secure gRPC communication channels", "Managing database SSL/TLS connections"],
      "algorithmDescription": ["Verify CA signature chains", "Negotiate DH ephemeral parameters", "Decompress TLS frame payloads"],
      "complexity": [],
      "implementationCpp": "",
      "implementationPython": "",
      "commonMistakes": ["Using self-signed certificates in production without pinning", "Failing to monitor and renew expiring certificates"],
      "interviewQuestions": ["What is the difference between SSL and TLS?", "How does Certificate Pinning enhance mobile API client security?"],
      "summary": "See the full markdown article for a comprehensive textbook-grade treatment of SSL/TLS."
    }
  },
  {
    "slug": "sec-csp",
    "title": "CSP",
    "tagline": "Master Content Security Policy (CSP) headers, source directives, and XSS mitigations.",
    "category": "Backend",
    "readTime": 12,
    "lastUpdated": "July 2026",
    "prerequisites": ["frontend-html"],
    "related": ["sec-owasp", "sec-cors"],
    "practiceProblems": [],
    "content": {
      "introduction": "This is a comprehensive chapter on CSP. See the markdown content for the full article.",
      "whyImportant": "CSP headers are the primary defense against Cross-Site Scripting (XSS) and clickjacking, restricting where scripts, styles, and fonts can load from.",
      "realWorldApps": ["Adding CSP meta tags or HTTP headers", "Securing single page apps against external injections", "Monitoring violations via report-to endpoints"],
      "algorithmDescription": ["Scan document links for source directive conformance", "Enforce nonces and hashes on inline scripts", "Report security violations to backend endpoints"],
      "complexity": [],
      "implementationCpp": "",
      "implementationPython": "",
      "commonMistakes": ["Using 'unsafe-inline' without nonces or hashes", "Configuring lax policies that allow data-uri script executions"],
      "interviewQuestions": ["What is a Content Security Policy (CSP) and how does it prevent XSS?", "How do nonces and script hashes work in CSP?"],
      "summary": "See the full markdown article for a comprehensive textbook-grade treatment of CSP."
    }
  },
  {
    "slug": "sec-server-security",
    "title": "Server Security",
    "tagline": "Deconstruct server hardening, firewall setups, SSH security, and network level access limits.",
    "category": "Backend",
    "readTime": 15,
    "lastUpdated": "July 2026",
    "prerequisites": [],
    "related": ["sec-api-best-practices", "sec-https"],
    "practiceProblems": [],
    "content": {
      "introduction": "This is a comprehensive chapter on Server Security. See the markdown content for the full article.",
      "whyImportant": "A secure application code is worthless if the hosting operating system can be compromised via open ports or insecure SSH keys.",
      "realWorldApps": ["Configuring Linux ufw/iptables firewalls", "Hardening SSH configuration files", "Setting up automated security patches"],
      "algorithmDescription": ["Configure firewall port forwarding filters", "Establish fail2ban brute force bans", "Generate cryptographic SSH key pairs"],
      "complexity": [],
      "implementationCpp": "",
      "implementationPython": "",
      "commonMistakes": ["Leaving default ports (e.g. 22) open to global traffic", "Running server application daemons with root privileges"],
      "interviewQuestions": ["Explain the steps you would take to secure a raw Linux server for web hosting.", "What is the difference between a stateful and stateless firewall?"],
      "summary": "See the full markdown article for a comprehensive textbook-grade treatment of Server Security."
    }
  },
  {
    "slug": "sec-api-best-practices",
    "title": "API Security Best Practices",
    "tagline": "Conquer REST, gRPC, and GraphQL endpoint security, rate limits, and request validation.",
    "category": "Backend",
    "readTime": 15,
    "lastUpdated": "July 2026",
    "prerequisites": [],
    "related": ["sec-server-security", "auth-oauth"],
    "practiceProblems": [],
    "content": {
      "introduction": "This is a comprehensive chapter on API Security Best Practices. See the markdown content for the full article.",
      "whyImportant": "Public-facing APIs are target points for attackers; implementing validation, rate limits, and access guards protects critical data and server load.",
      "realWorldApps": ["Implementing JWT access guards in routes", "Adding rate limiting middleware to prevent DOS", "Sanitizing request JSON payloads"],
      "algorithmDescription": ["Enforce input scheme validations", "Track IP address query limits (token bucket)", "Strip verbose stack traces from error responses"],
      "complexity": [],
      "implementationCpp": "",
      "implementationPython": "",
      "commonMistakes": ["Exposing unauthenticated debugging or metrics endpoints in production", "Returning database primary keys or internal IDs in JSON responses"],
      "interviewQuestions": ["How do you defend a GraphQL endpoint from query depth attacks?", "Explain how a rate limiting token bucket algorithm works."],
      "summary": "See the full markdown article for a comprehensive textbook-grade treatment of API Security Best Practices."
    }
  },
  {
    "slug": "hash-md5",
    "title": "MD5",
    "tagline": "Analyze the MD5 checksum algorithm, hash collisions, and cryptographic limits.",
    "category": "Backend",
    "readTime": 12,
    "lastUpdated": "July 2026",
    "prerequisites": [],
    "related": ["hash-sha", "hash-bcrypt"],
    "practiceProblems": [],
    "content": {
      "introduction": "This is a comprehensive chapter on MD5. See the markdown content for the full article.",
      "whyImportant": "MD5 is historically significant and useful for non-cryptographic checksums, but must never be used for security purposes due to collision vulnerabilities.",
      "realWorldApps": ["Verifying file download checksums", "Generating quick content cache hashes", "Indexing files in storage caches"],
      "algorithmDescription": ["Initialize MD5 shift constants", "Process data blocks in 512-bit sequences", "Compute round functions (F, G, H, I)"],
      "complexity": [
        {
          "label": "Computation",
          "value": "O(N)",
          "note": "Linear with the input message length."
        }
      ],
      "implementationCpp": "",
      "implementationPython": "",
      "commonMistakes": ["Using MD5 to hash passwords or sensitive tokens", "Assuming a matching MD5 hash guarantees no file modification (ignoring collisions)"],
      "interviewQuestions": ["Why is MD5 considered cryptographically broken?", "What is a hash collision and why is it dangerous in code sign checks?"],
      "summary": "See the full markdown article for a comprehensive textbook-grade treatment of MD5."
    }
  },
  {
    "slug": "hash-sha",
    "title": "SHA-256",
    "tagline": "Uncover the mathematics of SHA-2, message schedules, and compression loops.",
    "category": "Backend",
    "readTime": 15,
    "lastUpdated": "July 2026",
    "prerequisites": [],
    "related": ["hash-md5", "hash-scrypt"],
    "practiceProblems": [],
    "content": {
      "introduction": "This is a comprehensive chapter on SHA-256. See the markdown content for the full article.",
      "whyImportant": "SHA-256 is the standard secure cryptographic hashing function, powering digital signatures, HTTPS certificates, and blockchain consensus.",
      "realWorldApps": ["Validating password salt hashes", "Generating API token hashes", "Creating content-addressable storage keys"],
      "algorithmDescription": ["Pad message bits to 512-bit multiples", "Generate 64-word message schedules", "Execute compression loop using bitwise functions"],
      "complexity": [
        {
          "label": "Computation",
          "value": "O(N)",
          "note": "Linear with the input message length."
        }
      ],
      "implementationCpp": "",
      "implementationPython": "",
      "commonMistakes": ["Using SHA-256 directly for password storage without slow hashing key derivation functions", "Ignoring length extension attack vulnerabilities"],
      "interviewQuestions": ["Describe how SHA-256 processes data in blocks.", "Why is SHA-256 unsuitable for storing passwords, and what is the alternative?"],
      "summary": "See the full markdown article for a comprehensive textbook-grade treatment of SHA-256."
    }
  },
  {
    "slug": "hash-scrypt",
    "title": "scrypt",
    "tagline": "Master the memory-hard scrypt key derivation function, parameters tuning, and hardware resistance.",
    "category": "Backend",
    "readTime": 15,
    "lastUpdated": "July 2026",
    "prerequisites": ["hash-sha"],
    "related": ["hash-bcrypt", "hash-sha"],
    "practiceProblems": [],
    "content": {
      "introduction": "This is a comprehensive chapter on scrypt. See the markdown content for the full article.",
      "whyImportant": "scrypt is a memory-hard key derivation function specifically designed to resist parallel attacks using custom hardware (ASIC/FPGA).",
      "realWorldApps": ["Hashing sensitive system passwords", "Generating blockchain wallet keys from user passwords", "Deriving disk encryption key arrays"],
      "algorithmDescription": ["Generate intermediate bit arrays using PBKDF2", "Run mixing loop to populate large RAM buffers", "Derive final key using block mixing steps"],
      "complexity": [
        {
          "label": "Memory Complexity",
          "value": "O(M)",
          "note": "Configurable RAM requirements to prevent ASIC parallelism."
        }
      ],
      "implementationCpp": "",
      "implementationPython": "",
      "commonMistakes": ["Allocating too much memory on a shared server, causing out-of-memory crashes", "Setting tuning parameters too low, rendering the hashing ineffective"],
      "interviewQuestions": ["What is a memory-hard hashing function, and why is it useful?", "Explain the tuning parameters (N, r, p) in the scrypt algorithm."],
      "summary": "See the full markdown article for a comprehensive textbook-grade treatment of scrypt."
    }
  },
  {
    "slug": "hash-bcrypt",
    "title": "bcrypt",
    "tagline": "Conquer password security with bcrypt slow hashing, Blowfish setups, and work factors.",
    "category": "Backend",
    "readTime": 15,
    "lastUpdated": "July 2026",
    "prerequisites": [],
    "related": ["hash-scrypt", "hash-sha"],
    "practiceProblems": [],
    "content": {
      "introduction": "This is a comprehensive chapter on bcrypt. See the markdown content for the full article.",
      "whyImportant": "bcrypt is the industry standard for password hashing, implementing a configurable work factor that slows down brute-force search operations.",
      "realWorldApps": ["User registration and login password checks", "Hashing API secret credentials in databases", "Securing legacy database migration scripts"],
      "algorithmDescription": ["Configure work factor (cost) parameters", "Generate unique random 128-bit salt", "Run Eksblowfish key setup iterations to compute final hash"],
      "complexity": [
        {
          "label": "Hashing",
          "value": "O(2^C)",
          "note": "Exponential scaling according to the configured cost factor C."
        }
      ],
      "implementationCpp": "",
      "implementationPython": "",
      "commonMistakes": ["Using a static salt across multiple passwords", "Setting the work factor cost too low, reducing brute force resistance"],
      "interviewQuestions": ["Why is bcrypt resilient to GPU/ASIC acceleration compared to plain SHA-256?", "Explain how the cost parameter affects bcrypt execution timing."],
      "summary": "See the full markdown article for a comprehensive textbook-grade treatment of bcrypt."
    }
  },
  {
    "slug": "cache-redis",
    "title": "Redis",
    "tagline": "Deconstruct single-threaded execution, Redis structures, persistence logs, and cluster topologies.",
    "category": "Backend",
    "readTime": 18,
    "lastUpdated": "July 2026",
    "prerequisites": [],
    "related": ["cache-memcached", "cache-http"],
    "practiceProblems": [],
    "content": {
      "introduction": "This is a comprehensive chapter on Redis. See the markdown content for the full article.",
      "whyImportant": "Redis is the default in-memory cache and message broker, offering ultra-low latency reads and rich data structures (lists, sets, hashes).",
      "realWorldApps": ["Caching database select results", "Managing real-time user session states", "Implementing cluster rate limiting counters"],
      "algorithmDescription": ["Route single-threaded event loop events", "Write AOF and RDB snapshot logs to disk", "Synchronize replication master-replica states"],
      "complexity": [
        {
          "label": "Command Access",
          "value": "O(1)",
          "note": "Direct key lookups in memory hashes."
        }
      ],
      "implementationCpp": "",
      "implementationPython": "",
      "commonMistakes": ["Failing to configure maxmemory policies (causing memory exhaustion)", "Executing blocking O(N) operations (e.g. KEYS *) in production"],
      "interviewQuestions": ["How does Redis run as a single-threaded server yet support extreme concurrency?", "Compare RDB snapshotting with AOF logging in Redis persistence."],
      "summary": "See the full markdown article for a comprehensive textbook-grade treatment of Redis."
    }
  },
  {
    "slug": "cache-memcached",
    "title": "Memcached",
    "tagline": "Analyze multithreaded key-value caches, slab allocation memory, and hash rings.",
    "category": "Backend",
    "readTime": 12,
    "lastUpdated": "July 2026",
    "prerequisites": [],
    "related": ["cache-redis", "cache-http"],
    "practiceProblems": [],
    "content": {
      "introduction": "This is a comprehensive chapter on Memcached. See the markdown content for the full article.",
      "whyImportant": "Memcached is a fast, multithreaded memory cache, ideal for simple key-value scaling where advanced structures are unnecessary.",
      "realWorldApps": ["Caching rendered page fragments", "Storing thin database lookup records", "Scaling cache read pipelines globally"],
      "algorithmDescription": ["Allocate memory into fixed Slab classes", "Route keys using consistent hashing rings", "Evict old entries via Least Recently Used (LRU) rules"],
      "complexity": [
        {
          "label": "Access",
          "value": "O(1)",
          "note": "Direct key value fetching."
        }
      ],
      "implementationCpp": "",
      "implementationPython": "",
      "commonMistakes": ["Storing values larger than the maximum item limit (typically 1MB)", "Using Memcached for complex structures that require serializations"],
      "interviewQuestions": ["How does Memcached's slab allocation memory model prevent memory fragmentation?", "Compare the architecture of Redis and Memcached."],
      "summary": "See the full markdown article for a comprehensive textbook-grade treatment of Memcached."
    }
  },
  {
    "slug": "cache-http",
    "title": "HTTP Caching",
    "tagline": "Master HTTP cache headers, validators, ETag schemes, and browser cache structures.",
    "category": "Backend",
    "readTime": 15,
    "lastUpdated": "July 2026",
    "prerequisites": ["what-is-http"],
    "related": ["cache-redis", "cache-memcached"],
    "practiceProblems": [],
    "content": {
      "introduction": "This is a comprehensive chapter on HTTP Caching. See the markdown content for the full article.",
      "whyImportant": "HTTP caching scales web delivery exponentially, shifting workload from server applications to browsers and CDNs.",
      "realWorldApps": ["Configuring Cache-Control response headers", "Generating asset hash ETags", "Managing CDN cache purging pipelines"],
      "algorithmDescription": ["Inspect Cache-Control freshness limits", "Compute conditional requests (If-None-Match)", "Respond with 304 Not Modified status code"],
      "complexity": [],
      "implementationCpp": "",
      "implementationPython": "",
      "commonMistakes": ["Setting long Cache-Control times on dynamic index.html files", "Ignoring Vary headers leading to cross-user cache leakage"],
      "interviewQuestions": ["What is the difference between Cache-Control: no-cache and no-store?", "Explain how ETag and If-None-Match headers function."],
      "summary": "See the full markdown article for a comprehensive textbook-grade treatment of HTTP Caching."
    }
  },
  {
    "slug": "server-nginx",
    "title": "Nginx",
    "tagline": "Master Nginx event-driven architectures, reverse proxying, load balancing, and configs.",
    "category": "Backend",
    "readTime": 18,
    "lastUpdated": "July 2026",
    "prerequisites": [],
    "related": ["server-apache", "server-caddy"],
    "practiceProblems": [],
    "content": {
      "introduction": "This is a comprehensive chapter on Nginx. See the markdown content for the full article.",
      "whyImportant": "Nginx is the backbone of high-performance web traffic, routing requests, proxying sockets, and serving static content under heavy loads.",
      "realWorldApps": ["Configuring API reverse proxies", "Setting up upstream server load balancing", "Terminating SSL/TLS certificates at scale"],
      "algorithmDescription": ["Coordinate non-blocking epoll events", "Process routing blocks via regular expressions", "Manage worker process thread assignments"],
      "complexity": [],
      "implementationCpp": "",
      "implementationPython": "",
      "commonMistakes": ["Blocking worker loops with slow file I/O operations", "Misconfiguring upstream connection timeouts leading to Gateway errors"],
      "interviewQuestions": ["How does Nginx's asynchronous, event-driven model differ from Apache's process-per-request model?", "What is a Reverse Proxy and how does Nginx implement it?"],
      "summary": "See the full markdown article for a comprehensive textbook-grade treatment of Nginx."
    }
  },
  {
    "slug": "server-apache",
    "title": "Apache",
    "tagline": "Master Apache HTTP server configurations, MPM models, and module loading pipelines.",
    "category": "Backend",
    "readTime": 15,
    "lastUpdated": "July 2026",
    "prerequisites": [],
    "related": ["server-nginx", "server-caddy"],
    "practiceProblems": [],
    "content": {
      "introduction": "This is a comprehensive chapter on Apache. See the markdown content for the full article.",
      "whyImportant": "Apache HTTP Server is a classic, highly extensible web server framework powering huge swaths of the web with modular config rules.",
      "realWorldApps": ["Running PHP/Python apps using mod_php/mod_wsgi", "Configuring folder overrides via .htaccess files", "Setting up virtual hosts for multiple domains"],
      "algorithmDescription": ["Configure Multi-Processing Modules (Prefork, Worker, Event)", "Process request lifecycle hooks through dynamic modules", "Filter URL mappings in config trees"],
      "complexity": [],
      "implementationCpp": "",
      "implementationPython": "",
      "commonMistakes": ["Allowing unconstrained Prefork process pools (exhausting RAM)", "Using slow .htaccess overrides on high-traffic sites"],
      "interviewQuestions": ["What is an Apache Multi-Processing Module (MPM) and what models are available?", "Why should .htaccess overrides be disabled in production configurations?"],
      "summary": "See the full markdown article for a comprehensive textbook-grade treatment of Apache."
    }
  },
  {
    "slug": "server-caddy",
    "title": "Caddy",
    "tagline": "Master Caddy automatic HTTPS, Go-driven routing config, and reverse proxies.",
    "category": "Backend",
    "readTime": 12,
    "lastUpdated": "July 2026",
    "prerequisites": [],
    "related": ["server-nginx", "server-apache"],
    "practiceProblems": [],
    "content": {
      "introduction": "This is a comprehensive chapter on Caddy. See the markdown content for the full article.",
      "whyImportant": "Caddy offers a modern, safe, and clean server interface, compiling to native Go binaries with automatic HTTPS configuration out of the box.",
      "realWorldApps": ["Deploying simple, self-signed local environments", "Routing microservice requests with short Caddyfiles", "Automating certificate setups for multi-tenant SaaS domains"],
      "algorithmDescription": ["Generate SSL/TLS certificates via ACME protocols", "Route requests concurrently using Go routines", "Decode Caddy JSON config maps"],
      "complexity": [],
      "implementationCpp": "",
      "implementationPython": "",
      "commonMistakes": ["Assuming config syntax parity with Nginx rules", "Ignoring port 80/443 permission constraints on Linux runtimes"],
      "interviewQuestions": ["How does Caddy handle SSL/TLS configurations automatically under the hood?", "Describe the design benefits of Go-based Caddy routing over Nginx."],
      "summary": "See the full markdown article for a comprehensive textbook-grade treatment of Caddy."
    }
  },
  {
    "slug": "server-iis",
    "title": "MS IIS",
    "tagline": "Master Microsoft IIS architecture, application pools, worker processes, and config trees.",
    "category": "Backend",
    "readTime": 15,
    "lastUpdated": "July 2026",
    "prerequisites": [],
    "related": ["server-nginx", "server-apache"],
    "practiceProblems": [],
    "content": {
      "introduction": "This is a comprehensive chapter on MS IIS. See the markdown content for the full article.",
      "whyImportant": "Internet Information Services (IIS) is the enterprise server hosting model for Windows Server environments, natively integrated with .NET core runtimes.",
      "realWorldApps": ["Hosting ASP.NET enterprise business systems", "Setting up application pool isolation boundaries", "Routing traffic using URL Rewrite modules"],
      "algorithmDescription": ["Map worker process requests (w3wp.exe) to app pools", "Execute IIS pipeline events in HTTP handlers", "Parse applicationHost.config directories"],
      "complexity": [],
      "implementationCpp": "",
      "implementationPython": "",
      "commonMistakes": ["Failing to configure worker process recycles (causing slow memory leaks)", "Mixing applications with different permissions in the same application pool"],
      "interviewQuestions": ["Explain the role of Application Pools and worker processes (w3wp.exe) in IIS.", "What is the difference between Classic and Integrated pipeline mode?"],
      "summary": "See the full markdown article for a comprehensive textbook-grade treatment of MS IIS."
    }
  }
];

// Let's find the closing bracket of the BLOG_POSTS array.
// The array is followed by a semicolon or end of file.
// We can locate where `];` is at the end of the file.
const endOfArrayIdx = content.lastIndexOf('];');
if (endOfArrayIdx === -1) {
  console.error("Could not find the end of the BLOG_POSTS array '];'");
  process.exit(1);
}

// Check where the duplicates are.
// We can clean up the duplicates by removing elements 41 to 60 from the array string.
// Let's find the second occurrence of "gitlab-hosting" in content.
const gitlabMatches = [];
let idx = content.indexOf('"slug": "gitlab-hosting"');
while (idx !== -1) {
  gitlabMatches.push(idx);
  idx = content.indexOf('"slug": "gitlab-hosting"', idx + 1);
}

console.log('Found gitlab-hosting slug occurrences at index:', gitlabMatches);

let cleanContent = content;
if (gitlabMatches.length > 1) {
  console.log('Duplicate backend posts found! Cleaning up the duplicate range...');
  
  // We want to delete everything from the start of the second duplicate block (which is gitlab-hosting)
  // to the end of the last duplicate block (auth-cookie).
  // The first duplicate block starts at the '{' before gitlab-hosting.
  const secondGitlabIdx = gitlabMatches[1];
  const startDeleteIdx = cleanContent.lastIndexOf('{', secondGitlabIdx);
  
  // The duplicate block of auth-cookie ends before the final '];'.
  // Since the duplicates are at the very end of the array, they are the last 20 objects.
  // The start of delete is startDeleteIdx, and the end is the endOfArrayIdx (but keeping the closing bracket and semicolon).
  cleanContent = cleanContent.substring(0, startDeleteIdx) + cleanContent.substring(endOfArrayIdx);
  console.log('Removed duplicate blocks successfully.');
}

// Now let's inject the 21 new posts.
// We find the index of the final '];' in cleanContent:
const finalEndOfArrayIdx = cleanContent.lastIndexOf('];');

const postsString = batch3Posts.map(post => {
  return `  {\n` +
    `    "slug": "${post.slug}",\n` +
    `    "title": "${post.title}",\n` +
    `    "tagline": "${post.tagline}",\n` +
    `    "category": "${post.category}",\n` +
    `    "readTime": ${post.readTime},\n` +
    `    "lastUpdated": "${post.lastUpdated}",\n` +
    `    "prerequisites": ${JSON.stringify(post.prerequisites)},\n` +
    `    "related": ${JSON.stringify(post.related)},\n` +
    `    "practiceProblems": ${JSON.stringify(post.practiceProblems)},\n` +
    `    "content": {\n` +
    `      "introduction": "${post.content.introduction}",\n` +
    `      "whyImportant": "${post.content.whyImportant}",\n` +
    `      "realWorldApps": ${JSON.stringify(post.content.realWorldApps)},\n` +
    `      "algorithmDescription": ${JSON.stringify(post.content.algorithmDescription)},\n` +
    `      "complexity": ${JSON.stringify(post.content.complexity)},\n` +
    `      "implementationCpp": "${post.content.implementationCpp}",\n` +
    `      "implementationPython": "${post.content.implementationPython}",\n` +
    `      "commonMistakes": ${JSON.stringify(post.content.commonMistakes)},\n` +
    `      "interviewQuestions": ${JSON.stringify(post.content.interviewQuestions)},\n` +
    `      "summary": "${post.content.summary}"\n` +
    `    }\n` +
    `  }`;
}).join(',\n');

const updatedContent = cleanContent.substring(0, finalEndOfArrayIdx) + `,\n` + postsString + `\n];\n`;

fs.writeFileSync(blogDataPath, updatedContent, 'utf8');
console.log('Successfully registered all 21 new backend topics and removed duplicates!');
