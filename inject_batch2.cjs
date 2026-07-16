const fs = require('fs');

const blogs = [
  {
    slug: 'cicd-integration',
    title: 'Continuous Integration (CI)',
    author: 'DevOps Team',
    date: '2026-07-13',
    readTime: '6 min read',
    category: 'CI/CD & DevOps',
    tags: ['CI', 'DevOps', 'Automation', 'Testing'],
    excerpt: 'Continuous Integration is the practice of automating the integration of code changes from multiple contributors into a single software project.',
    markdown: `# Continuous Integration (CI)

Continuous Integration (CI) is a software development practice where developers regularly merge their code changes into a central repository, after which automated builds and tests are run. The primary goal of CI is to find and address bugs quicker, improve software quality, and reduce the time it takes to validate and release new software updates.

## Core Concepts

1. **Single Source Repository**: All source code is managed in a version control system like Git.
2. **Automated Build**: The system can compile and build the software automatically from the source repository.
3. **Automated Testing**: Once built, the software is subjected to an automated suite of tests (unit, integration) to ensure the new code hasn't broken anything.
4. **Frequent Commits**: Developers commit their changes frequently (often daily or multiple times a day).

## Why CI Matters

Without CI, integration is often a painful, lengthy process ("integration hell") that occurs at the end of a development cycle. By integrating constantly, errors are caught when they are small and easy to fix. CI also ensures that the ` + '`main`' + ` branch is always in a working state.

## Popular CI Tools
- Jenkins
- GitHub Actions
- GitLab CI
- CircleCI
- Travis CI`
  },
  {
    slug: 'cicd-deployment',
    title: 'Continuous Deployment (CD)',
    author: 'DevOps Team',
    date: '2026-07-13',
    readTime: '7 min read',
    category: 'CI/CD & DevOps',
    tags: ['CD', 'Deployment', 'DevOps', 'Release'],
    excerpt: 'Continuous Deployment automates the release of validated code to production, enabling rapid and reliable software delivery.',
    markdown: `# Continuous Deployment (CD)

Continuous Deployment is the natural extension of Continuous Integration. While CI focuses on automatically building and testing code, CD focuses on automatically releasing that validated code into the production environment without manual intervention.

## Continuous Delivery vs. Continuous Deployment

It's important to distinguish between Continuous Delivery and Continuous Deployment:
- **Continuous Delivery**: The software is built, tested, and ready to be released to production at any time. However, the actual release requires a human to click an "Approve" button.
- **Continuous Deployment**: Every change that passes all stages of the production pipeline is released to customers automatically. There is no human intervention.

## Prerequisites for Continuous Deployment

Because CD automatically ships code to real users, it requires a highly mature engineering culture:
1. **Exceptional Test Coverage**: The automated test suite must be robust enough to catch almost any regression.
2. **Feature Flags**: New features are often hidden behind toggles so they can be turned on or off without redeploying the code.
3. **Monitoring and Rollbacks**: The system must have comprehensive observability. If a bad deployment occurs, the system should automatically detect error spikes and roll back to the previous version.

## Benefits
By removing the manual bottlenecks of release management, teams can ship smaller, less risky updates multiple times a day, leading to faster feedback loops from users.`
  },
  {
    slug: 'test-integration',
    title: 'Integration Testing',
    author: 'QA Engineering',
    date: '2026-07-13',
    readTime: '6 min read',
    category: 'Testing',
    tags: ['Testing', 'QA', 'Architecture'],
    excerpt: 'Integration testing verifies that different modules or services in a software application work correctly when combined.',
    markdown: `# Integration Testing

In modern software architecture, an application is rarely a single monolithic block of code. Instead, it relies on multiple interacting components, such as databases, external APIs, cache layers, and microservices. 

**Integration Testing** is the phase in software testing where individual units or modules are combined and tested as a group. Its purpose is to expose faults in the interaction between integrated units.

## The Problem It Solves

Unit tests ensure that a specific function works in isolation. However, a function might pass its unit test but fail when it tries to write to a real database due to a missing table column or a network timeout. Integration tests catch these "glue" errors.

## Approaches to Integration Testing

1. **Big Bang**: All components are integrated simultaneously, after which everything is tested as a whole. This is generally discouraged for large systems because isolating the cause of a failure is difficult.
2. **Top-Down**: Testing takes place from top to bottom, following the control flow of the architectural structure. Stubs are used to simulate lower-level modules.
3. **Bottom-Up**: Testing takes place from the bottom of the control flow upwards. Drivers are used to simulate higher-level modules.
4. **Sandwich/Hybrid**: A combination of top-down and bottom-up testing.

## Tools
Popular tools for integration testing include Postman (for API testing), Testcontainers (for spinning up temporary Docker databases), and Cypress.`
  },
  {
    slug: 'test-unit',
    title: 'Unit Testing',
    author: 'Software Engineering',
    date: '2026-07-13',
    readTime: '5 min read',
    category: 'Testing',
    tags: ['Testing', 'TDD', 'Code Quality'],
    excerpt: 'Unit testing is the foundation of software quality, focusing on verifying the smallest testable parts of an application in isolation.',
    markdown: `# Unit Testing

Unit testing is the lowest level of software testing. A "unit" refers to the smallest testable part of an application—typically a single function, method, or class.

The goal of unit testing is to isolate each part of the program and show that the individual parts are correct. 

## Key Characteristics of a Good Unit Test

1. **Fast**: Unit tests should run in milliseconds. A test suite might contain thousands of unit tests, and developers need to run them frequently without waiting.
2. **Isolated**: A unit test should not rely on external dependencies like a database, filesystem, or network. Instead, dependencies should be "mocked" or "stubbed."
3. **Repeatable**: A unit test should yield the same result every time it runs, regardless of the environment or the order in which tests are executed.
4. **Self-Checking**: The test should automatically detect if it passed or failed without human inspection.

## Test-Driven Development (TDD)

Unit testing is the core of TDD, a methodology where developers write the test *before* they write the production code:
1. Write a failing test.
2. Write just enough code to make the test pass.
3. Refactor the code for clarity and performance while keeping the test green.

## Popular Frameworks
- JavaScript/TypeScript: Jest, Mocha, Vitest
- Python: pytest, unittest
- Java: JUnit
- C#: NUnit, xUnit`
  },
  {
    slug: 'test-functional',
    title: 'Functional Testing',
    author: 'QA Engineering',
    date: '2026-07-13',
    readTime: '6 min read',
    category: 'Testing',
    tags: ['Testing', 'E2E', 'QA'],
    excerpt: 'Functional testing evaluates software against business requirements, ensuring the application behaves exactly as the user expects.',
    markdown: `# Functional Testing

Functional testing is a type of black-box testing that evaluates the software against the business requirements or specifications. Unlike unit or integration testing, functional testing is not concerned with the source code or how the system is implemented internally. It simply asks: "Does the system do what the user expects it to do?"

## How It Works

Functional testing involves:
1. Identifying the functions the software is expected to perform.
2. Creating input data based on the function's specifications.
3. Determining the expected output.
4. Executing the test case.
5. Comparing the actual and expected outputs.

## Types of Functional Testing

- **Smoke Testing**: A high-level test to ensure the most critical functions work before conducting deeper testing.
- **Sanity Testing**: Testing a specific component or feature after a minor code change to ensure the bug was fixed and no new issues arose.
- **Regression Testing**: Ensuring that recent code changes haven't broken previously working features.
- **User Acceptance Testing (UAT)**: The final phase of testing, often performed by the actual end-users or clients to verify the system meets their business needs.

## End-to-End (E2E) Testing

E2E testing is a common form of functional testing where the entire application flow is tested from start to finish. Tools like Selenium, Cypress, or Playwright are used to programmatically click buttons and fill out forms in a real web browser to simulate user behavior.`
  },
  {
    slug: 'db-transactions',
    title: 'Database Transactions',
    author: 'Database Engineering',
    date: '2026-07-13',
    readTime: '7 min read',
    category: 'Databases',
    tags: ['Databases', 'SQL', 'Transactions'],
    excerpt: 'Transactions ensure data integrity by grouping multiple database operations into a single, all-or-nothing unit of work.',
    markdown: `# Database Transactions

A database transaction is a sequence of one or more database operations (like INSERT, UPDATE, or DELETE) that are executed as a single, indivisible unit of work. 

## The Classic Bank Transfer Example

Imagine you want to transfer $100 from Account A to Account B. This involves two steps:
1. Deduct $100 from Account A.
2. Add $100 to Account B.

If the system crashes after step 1 but before step 2, Account A loses money, but Account B never receives it. The money has vanished. 

Transactions solve this by ensuring that both steps succeed, or neither step succeeds.

## Transaction Controls

In SQL, transactions are typically managed using specific commands:
- ` + '`BEGIN TRANSACTION`' + `: Starts the transaction block.
- ` + '`COMMIT`' + `: Saves all the changes made during the transaction to the database permanently.
- ` + '`ROLLBACK`' + `: Undoes all changes made during the transaction if an error occurs.

## Concurrency and Isolation

When multiple transactions occur simultaneously, they can interfere with each other (e.g., two users trying to buy the last ticket to a concert). Databases offer different **Isolation Levels** to handle this:
- **Read Uncommitted**: A transaction can see uncommitted changes from other transactions (leads to "Dirty Reads").
- **Read Committed**: A transaction can only see committed changes.
- **Repeatable Read**: Ensures that if a transaction reads a row twice, it sees the same data both times.
- **Serializable**: The strictest level; executes transactions sequentially, preventing all concurrency issues but severely impacting performance.`
  },
  {
    slug: 'db-orms',
    title: 'Object-Relational Mapping (ORMs)',
    author: 'Backend Engineering',
    date: '2026-07-13',
    readTime: '6 min read',
    category: 'Databases',
    tags: ['Databases', 'ORM', 'Backend', 'SQL'],
    excerpt: 'ORMs bridge the gap between object-oriented programming languages and relational databases.',
    markdown: `# Object-Relational Mapping (ORMs)

Object-Relational Mapping (ORM) is a programming technique used to convert data between incompatible type systems—specifically, between an Object-Oriented Programming (OOP) language and a Relational Database.

## The Impedance Mismatch

In OOP languages (like Python, Java, or TypeScript), developers work with objects, classes, and inheritance. In relational databases (like PostgreSQL or MySQL), data is stored in tables, rows, and columns, linked by foreign keys.

This structural difference is known as the "Object-Relational Impedance Mismatch." ORMs act as a bridge across this gap.

## How ORMs Work

Instead of writing raw SQL queries as strings:
` + '```sql' + `
SELECT * FROM users WHERE age > 18;
` + '```' + `

Developers interact with the database using native programming objects:
` + '```typescript' + `
const adults = await User.find({ where: { age: MoreThan(18) } });
` + '```' + `

The ORM library automatically translates the object-oriented code into the appropriate SQL dialect, executes it, and maps the result set back into objects.

## Pros and Cons

**Advantages**:
- **Developer Speed**: Less context-switching between SQL and code.
- **Database Agnosticism**: You can often switch from MySQL to PostgreSQL simply by changing a configuration variable.
- **Security**: ORMs inherently use parameterized queries, which prevents SQL Injection attacks.

**Disadvantages**:
- **Performance Overhead**: Generated SQL is sometimes inefficient. For highly complex queries, writing raw SQL is often much faster.
- **The "Leaky Abstraction"**: To optimize an ORM, developers still need to understand the underlying SQL it generates (e.g., understanding the N+1 query problem).`
  },
  {
    slug: 'db-acid',
    title: 'ACID Properties',
    author: 'Database Engineering',
    date: '2026-07-13',
    readTime: '6 min read',
    category: 'Databases',
    tags: ['Databases', 'ACID', 'Architecture'],
    excerpt: 'ACID is a set of guiding principles that guarantee database transactions are processed reliably.',
    markdown: `# ACID Properties

In the realm of databases, **ACID** is an acronym that refers to a set of four key properties that guarantee database transactions are processed reliably, even in the event of hardware failures, power outages, or concurrent access.

## 1. Atomicity (The "All or Nothing" Rule)
Atomicity ensures that a transaction is treated as a single, indivisible logical unit of work. If a transaction consists of multiple statements, either *all* of them succeed and are committed to the database, or *none* of them are. If an error occurs halfway through, the database rolls back to its exact state before the transaction began.

## 2. Consistency
Consistency ensures that a transaction can only bring the database from one valid state to another valid state. This means the database must abide by all defined rules, constraints, cascades, and triggers. For example, if a column requires a ` + '`UNIQUE`' + ` constraint, a transaction that attempts to insert a duplicate value will violate consistency and be rolled back.

## 3. Isolation
In a busy application, multiple transactions happen at the exact same time. Isolation ensures that the concurrent execution of transactions leaves the database in the same state as if the transactions were executed sequentially. This prevents transactions from reading intermediate, uncommitted "dirty" data from other ongoing transactions.

## 4. Durability
Durability guarantees that once a transaction has been committed, it will remain committed even in the case of a system failure (like a power outage or a crash). This is typically achieved by writing the transaction logs to non-volatile memory (like a hard drive or SSD) before the database acknowledges the commit to the user.`
  },
  {
    slug: 'db-normalization-advanced',
    title: 'Database Normalization',
    author: 'Data Architecture',
    date: '2026-07-13',
    readTime: '8 min read',
    category: 'Databases',
    tags: ['Databases', 'Schema Design', 'Data Modeling'],
    excerpt: 'Database normalization is the process of structuring a relational database to reduce data redundancy and improve data integrity.',
    markdown: `# Database Normalization

Database Normalization is a systematic approach to organizing data in a database. The primary goals are to eliminate redundant data (storing the same data in more than one table) and ensure data dependencies make sense (only storing related data in a table).

## Why Normalize?

Imagine a table storing customer orders. If you store the customer's ` + '`shipping_address`' + ` on every single order row, and the customer moves, you have to update thousands of historical order rows. If you miss one, your data is inconsistent. Normalization extracts the customer data into its own table, linked by a ` + '`customer_id`' + `. Update the address once, and all orders point to the new address.

## The Normal Forms

Normalization is categorized into stages called "Normal Forms" (NF).

### First Normal Form (1NF)
- Each table cell must contain a single, atomic value. (No comma-separated lists in a single column).
- Each record needs to be unique (usually via a Primary Key).

### Second Normal Form (2NF)
- Must be in 1NF.
- **No Partial Dependency**: All non-key columns must depend on the *entire* primary key. This only applies if you have a composite primary key (a key made of multiple columns). 

### Third Normal Form (3NF)
- Must be in 2NF.
- **No Transitive Dependency**: A non-key column cannot depend on another non-key column. For example, if a table has ` + '`Author_ID`' + `, ` + '`Author_Name`' + `, and ` + '`Author_Nationality`' + `, the Name and Nationality depend on the Author_ID, not the Book. They should be moved to an ` + '`Authors`' + ` table.

## Denormalization

While strict normalization is mathematically beautiful and excellent for OLTP (Online Transaction Processing) databases with heavy write loads, it can require expensive ` + '`JOIN`' + ` operations for reading data. In analytics or heavy-read scenarios, engineers deliberately **Denormalize** the database—reintroducing redundancy to speed up read query performance.`
  },
  {
    slug: 'db-failure-modes',
    title: 'Database Failure Modes',
    author: 'Site Reliability',
    date: '2026-07-13',
    readTime: '7 min read',
    category: 'Databases',
    tags: ['SRE', 'Reliability', 'Databases'],
    excerpt: 'Understanding how databases fail is critical to designing resilient systems that can survive outages and data corruption.',
    markdown: `# Database Failure Modes

Databases are the stateful heart of any software architecture. When stateless compute nodes fail, you can simply spin up new ones. When a database fails, you risk losing user data, corrupting state, or taking down the entire platform. Understanding how databases fail is the first step in designing resilient systems.

## 1. Hardware Failures
The most basic failure mode is physical hardware dying. Hard drives crash, SSDs reach their write limits, network interface cards burn out, or an entire data center loses power. 
**Mitigation**: Replication. Write data to multiple physical nodes simultaneously (e.g., Master-Slave replication) so a standby node can immediately take over if the primary node dies.

## 2. Connection Pool Exhaustion
Applications connect to databases using a limited pool of TCP connections. If the application suddenly opens thousands of connections (perhaps due to a traffic spike), the database will exhaust its connection limit and reject new queries, taking down the app.
**Mitigation**: Use connection poolers like PgBouncer, and implement strict timeouts on the application side.

## 3. The "Thundering Herd" and Lock Contention
If thousands of users try to update the exact same database row simultaneously (e.g., buying the last ticket to a concert), the database must lock the row to maintain ACID properties. The queue of waiting transactions builds up, spiking CPU usage and causing massive latency.
**Mitigation**: Row-level locking optimization, or offloading high-velocity state changes to an in-memory datastore like Redis before persisting to the main database.

## 4. Split-Brain Syndrome
In a distributed database cluster, if the network connection between Node A and Node B fails, both nodes might assume the other is dead. Both nodes then promote themselves to the "Primary/Master" role and start accepting writes. When the network heals, the database has conflicting data that is nearly impossible to merge safely.
**Mitigation**: Strict quorum algorithms (like Paxos or Raft) where a node requires a majority vote from the cluster to become the leader.`
  },
  {
    slug: 'db-performance-profiling',
    title: 'Profiling Database Performance',
    author: 'Database Engineering',
    date: '2026-07-13',
    readTime: '8 min read',
    category: 'Databases',
    tags: ['Performance', 'Databases', 'SQL', 'Optimization'],
    excerpt: 'Learn how to diagnose slow queries and optimize database performance using indexing and execution plans.',
    markdown: `# Profiling Database Performance

As an application scales from thousands to millions of rows, queries that used to take milliseconds can suddenly take seconds or even minutes, crippling the user experience. Profiling and optimizing database performance is a critical skill for backend engineers.

## 1. The Slow Query Log
The first step in profiling is identifying the culprits. Most databases (like PostgreSQL and MySQL) have a feature called the "Slow Query Log." You can configure the database to log any query that takes longer than a specific threshold (e.g., 500ms). This gives you a clear target list of queries to optimize.

## 2. Reading the Execution Plan (EXPLAIN)
Once you have a slow query, you need to understand *how* the database is executing it. Prepended the ` + '`EXPLAIN`' + ` (or ` + '`EXPLAIN ANALYZE`' + `) keyword to your SQL query.

The database will return an Execution Plan detailing:
- Which indexes it decided to use.
- What type of joins it performed (Hash Join, Nested Loop).
- If it had to perform a **Sequential Scan** (Seq Scan or Table Scan).

**The Sequential Scan is usually the enemy.** It means the database couldn't find an index and had to read every single row in the table from the hard drive to find your data.

## 3. The Power of Indexing
If your ` + '`EXPLAIN`' + ` reveals a Sequential Scan on a ` + '`WHERE`' + ` clause, the solution is usually an Index. An index creates a separate, highly optimized data structure (like a B-Tree) that allows the database to find rows in logarithmic time instead of linear time.

However, indexes are not free. Every time you ` + '`INSERT`' + `, ` + '`UPDATE`' + `, or ` + '`DELETE`' + ` a row, the database must also update the index, which slows down write performance. 

## 4. Analyzing the N+1 Query Problem
Often, the problem isn't one slow query, but hundreds of fast queries. The N+1 problem occurs when an ORM loads a parent entity, and then executes a separate query for every single child entity. Profiling tools like New Relic or Datadog are excellent for visualizing these query spikes, which are usually solved using eager loading (SQL ` + '`JOIN`' + `s).`
  }
];

let injectedData = fs.readFileSync('src/config/blogData.ts', 'utf8');
let nextId = 0;
const idMatches = injectedData.match(/id:\s*(\d+)/g);
if (idMatches) {
  for (const match of idMatches) {
    const id = parseInt(match.replace(/[^\d]/g, ''), 10);
    if (id > nextId) nextId = id;
  }
}

for (const blog of blogs) {
  if (injectedData.indexOf('slug: "' + blog.slug + '"') === -1) {
    nextId++;
    const blogString = `
  {
    id: ${nextId},
    title: ${JSON.stringify(blog.title)},
    slug: "${blog.slug}",
    author: "${blog.author}",
    date: "${blog.date}",
    readTime: "${blog.readTime}",
    category: "${blog.category}",
    tags: ${JSON.stringify(blog.tags)},
    excerpt: ${JSON.stringify(blog.excerpt)},
    markdown: ${JSON.stringify(blog.markdown)}
  },`;
    
    const closingIndex = injectedData.lastIndexOf('];');
    if (closingIndex !== -1) {
      injectedData = injectedData.substring(0, closingIndex) + blogString + '\n' + injectedData.substring(closingIndex);
    }
  }
}

fs.writeFileSync('src/config/blogData.ts', injectedData, 'utf8');
console.log('Batch 2 blogs injected successfully.');
