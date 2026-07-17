# -*- coding: utf-8 -*-
# Data file containing Android Development Batch 1 articles

ANDROID_BATCH1_ARTICLES = [
    {
        "slug": "android-lang-kotlin",
        "title": "Kotlin for Android Development",
        "tagline": "Explore modern null safety, smart casts, extension functions, and JVM bytecode interoperability.",
        "category": "Android Development",
        "readTime": 12,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["android-lang-java", "android-kotlin-basics"],
        "practiceProblems": [],
        "markdown": """# Kotlin for Android Development

Google officially declared **Kotlin** as the preferred language for Android development in 2017. Kotlin solves many of Java's historical design challenges—specifically Verbosity, Null Pointer Exceptions, and lack of functional constructs—while maintaining 100% interoperability with the Java Virtual Machine (JVM). This chapter compares Kotlin with Java and explains its compilation mechanics.

---

## 1. Core Language Design Advantages

Kotlin improves upon Java's syntax and type safety in several key areas:

* **Null Safety:** Built directly into the type system. A variable of type `String` cannot hold `null`. To allow nulls, you must declare it as `String?`.
* **Type Inference:** The compiler automatically detects variables types:
  ```kotlin
  val message = "Hello" // Inferred as String
  ```
* **Extension Functions:** Add new functionality to existing classes without inheriting from them:
  ```kotlin
  fun String.addExclamation(): String = this + "!"
  ```

---

## 2. Compilation and JVM Interoperability

Kotlin code compiles directly to JVM bytecode, making it indistinguishable from compiled Java code to the Android runtime.

### Kotlin and Java Compilation Pipeline
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Kotlin/Java Compilation & Run Flow</text>

  {/* Source Files */}
  <g transform="translate(30, 60)">
    <rect width="110" height="50" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
    <text x="55" y="22" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Source Files</text>
    <text x="55" y="38" fill="#94a3b8" font-size="7" font-family="monospace" text-anchor="middle">.kt & .java</text>
  </g>

  {/* Compiler */}
  <g transform="translate(220, 60)">
    <rect width="140" height="50" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="70" y="20" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">kotlinc / javac</text>
    <text x="70" y="38" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">JVM Bytecode Output</text>
  </g>

  {/* DEX */}
  <g transform="translate(440, 60)">
    <rect width="120" height="50" rx="3" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
    <text x="60" y="20" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">D8 / R8 Compiler</text>
    <text x="60" y="38" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">classes.dex File</text>
  </g>

  {/* Target VM */}
  <g transform="translate(230, 160)">
    <rect width="120" height="40" rx="2" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="60" y="25" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">ART / Dalvik Runtime</text>
  </g>

  {/* Connections */}
  <path d="M 140,85 L 220,85" stroke="#3b82f6" stroke-width="1.5"/>
  <path d="M 360,85 L 440,85" stroke="#10b981" stroke-width="1.5"/>
  <path d="M 500,110 L 500,180 L 350,180" fill="none" stroke="#10b981" stroke-width="1.5"/>
</svg>

---

## 3. Comparison Matrix

| Property | Java | Kotlin |
| :--- | :--- | :--- |
| **Null Safety** | Unsafe (NullPointerException risk) | Safe (Types nullable by default) |
| **Extension Functions** | No (requires helper classes) | Yes |
| **Coroutines Support**| No (requires threads or RX) | Yes (first-class support) |
| **Data Classes** | Boilerplate (equals, hashCode) | Native `data class` declaration |
| **Syntax Verbosity** | High | Low |

---

## 4. Conceptual Check Questions

1. **How does Kotlin achieve null safety at runtime without performance loss?**
   *Answer:* Null checks are performed at compile time. The Kotlin compiler inserts checks (like `@NotNull` annotations and bytecode null checks) to catch null violations during compilation, leaving the generated JVM bytecode clean and optimized.

2. **Can a Kotlin class inherit from a Java class?**
   *Answer:* Yes. Kotlin is 100% interoperable with Java. A Kotlin class can inherit from Java classes, implement Java interfaces, and use Java libraries with zero friction.
""",
        "content": {
            "introduction": "Kotlin is the standard language for Android, providing null safety and conciseness while remaining fully interoperable with Java.",
            "whyImportant": "Writing safe, modern Android apps requires using Kotlin to avoid crashes like NullPointerExceptions.",
            "realWorldApps": ["Converting legacy Java Android applications to Kotlin.", "Using Kotlin coroutines to perform non-blocking network fetches."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "android-lang-java",
        "title": "Java on Android",
        "tagline": "Understand legacy compatibility, D8 compilation, desugaring, and JVM to ART translation.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-lang-kotlin"],
        "related": ["android-kotlin-basics", "android-ide"],
        "practiceProblems": [],
        "markdown": """# Java on Android

Although Kotlin is preferred, **Java** remains a foundational language for Android. Millions of legacy applications are built in Java, and the Android SDK itself is written primarily in Java. Understanding how Java compiles, runs, and is "desugared" to match older Android OS versions is critical. This chapter explains Java's runtime architecture on Android.

---

## 1. JVM vs. Android Runtime (ART)

Standard Java compiles to JVM bytecode (class files). Android devices do not run JVM bytecode directly; instead, they run **DEX (Dalvik Executable) bytecode** inside the **Android Runtime (ART)**:

* **Java Compilation:** `javac` compiles `.java` source code into `.class` files.
* **DEX Conversion:** The **D8 compiler** translates `.class` files into a single `classes.dex` file. This format is optimized for mobile devices with limited memory.
* **ART Execution:** ART uses a combination of Ahead-Of-Time (AOT) compilation and Just-In-Time (JIT) compilation to compile DEX bytecode to native machine instructions.

---

## 2. Java Compilation Pipeline
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">Android Java Compilation Flow</text>

  {/* Java Code */}
  <g transform="translate(30, 80)">
    <rect width="100" height="50" rx="2" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
    <text x="50" y="25" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Java Source</text>
    <text x="50" y="40" fill="#94a3b8" font-size="7" font-family="monospace" text-anchor="middle">.java files</text>
  </g>

  {/* Class Bytecode */}
  <g transform="translate(190, 80)">
    <rect width="100" height="50" rx="2" fill="#1e293b" stroke="#f59e0b" stroke-width="1"/>
    <text x="50" y="25" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Class Bytecode</text>
    <text x="50" y="40" fill="#94a3b8" font-size="7" font-family="monospace" text-anchor="middle">.class files</text>
  </g>

  {/* D8 Compiler */}
  <g transform="translate(340, 80)">
    <rect width="100" height="50" rx="2" fill="#111" stroke="#10b981" stroke-width="1.5"/>
    <text x="50" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">D8 Compiler</text>
    <text x="50" y="40" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Desugaring</text>
  </g>

  {/* DEX */}
  <g transform="translate(480, 80)">
    <rect width="90" height="50" rx="2" fill="#064e3b" stroke="#10b981" stroke-width="1"/>
    <text x="45" y="25" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">classes.dex</text>
  </g>

  {/* Paths */}
  <path d="M 130,105 L 190,105" stroke="#3b82f6" stroke-width="1.2"/>
  <path d="M 290,105 L 340,105" stroke="#f59e0b" stroke-width="1.2"/>
  <path d="M 440,105 L 480,105" stroke="#10b981" stroke-width="1.2"/>
</svg>

---

## 3. Comparison Matrix

| Feature | Standard JVM | Android Runtime (ART) |
| :--- | :--- | :--- |
| **Bytecode Format** | Java Bytecode (`.class`) | Dalvik Executable Bytecode (`.dex`) |
| **VM Architecture** | Stack-based | Register-based (more memory efficient) |
| **Compilation Model**| Just-In-Time (JIT) | Hybrid (JIT + Ahead-Of-Time AOT) |
| **Execution** | Multiple class files | Unified `classes.dex` package |

---

## 4. Conceptual Check Questions

1. **What is "Desugaring" in the Android Java compiler pipeline?**
   *Answer:* Desugaring is the process where the compiler (D8) translates modern Java features (like lambda expressions, default interface methods, or streams API) into equivalent bytecode compatible with older versions of the Android OS.

2. **Why does ART use a register-based VM structure instead of a stack-based VM like the standard JVM?**
   *Answer:* Register-based VMs require fewer instructions to execute the same operations compared to stack-based VMs. This reduces instruction fetch loops, lowering memory usage and power consumption, which is critical for mobile devices.
""",
        "content": {
            "introduction": "Java compiles to JVM bytecode which is subsequently translated into DEX bytecode to execute on the Android Runtime (ART).",
            "whyImportant": "Maintaining legacy code and understanding lower-level compilation requires knowing how Java and DEX files are processed.",
            "realWorldApps": ["Desugaring Java 8 streams for compatibility on Android KitKat devices.", "Analyzing DEX file methods limits to avoid multidex errors."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "android-git",
        "title": "Git Version Control",
        "tagline": "Master the Directed Acyclic Graph (DAG) commit structures, branching, merges, and rebasing.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["android-github", "android-gitlab"],
        "practiceProblems": [],
        "markdown": """# Git Version Control

**Git** is a distributed version control system (VCS) used to track changes in source code during software development. Unlike traditional centralized systems, Git models repository history as a **Directed Acyclic Graph (DAG)** of commits, enabling fast, local branch operations. This chapter covers the staging area, commit structures, and branching workflows.

---

## 1. The Three States of Git

Git manages files across three primary areas:

1. **Working Directory:** The local filesystem where files are edited.
2. **Staging Area (Index):** A staging file recording what will go into the next commit.
3. **Git Directory (Repository):** The database where Git stores metadata and objects for your project (`.git` folder).

---

## 2. Commit Graph & Branching Models

When you create commits, Git stores them as nodes in a Directed Acyclic Graph (DAG). A branch is simply a lightweight pointer to one of these commits.

### Git DAG: Main vs. Feature Branch Merge
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Git Commit DAG</text>

  {/* Main branch */}
  <g transform="translate(50, 100)">
    <circle cx="0" cy="0" r="10" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
    <text x="0" y="25" fill="#3b82f6" font-size="7" font-family="monospace" text-anchor="middle">C1</text>
  </g>
  <g transform="translate(150, 100)">
    <circle cx="0" cy="0" r="10" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
    <text x="0" y="25" fill="#3b82f6" font-size="7" font-family="monospace" text-anchor="middle">C2</text>
  </g>
  <g transform="translate(350, 100)">
    <circle cx="0" cy="0" r="10" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
    <text x="0" y="25" fill="#3b82f6" font-size="7" font-family="monospace" text-anchor="middle">C5 (Merge)</text>
  </g>

  {/* Feature branch */}
  <g transform="translate(250, 50)">
    <circle cx="0" cy="0" r="10" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
    <text x="0" y="22" fill="#10b981" font-size="7" font-family="monospace" text-anchor="middle">C3</text>
  </g>
  <g transform="translate(300, 50)">
    <circle cx="0" cy="0" r="10" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
    <text x="0" y="22" fill="#10b981" font-size="7" font-family="monospace" text-anchor="middle">C4</text>
  </g>

  {/* Connections */}
  <path d="M 60,100 L 140,100" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#git-arrow)"/>
  <path d="M 160,100 L 340,100" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#git-arrow)"/>
  
  {/* Feature split */}
  <path d="M 155,92 L 242,56" stroke="#10b981" stroke-width="1.5" marker-end="url(#git-arrow)"/>
  <path d="M 260,50 L 290,50" stroke="#10b981" stroke-width="1.5" marker-end="url(#git-arrow)"/>
  
  {/* Merge back */}
  <path d="M 308,56 L 342,92" stroke="#10b981" stroke-width="1.5" marker-end="url(#git-arrow)"/>

  <defs>
    <marker id="git-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Merge vs. Rebase

When integrating feature branches, teams use either merging or rebasing:

* **Merge:** Creates a new "Merge Commit" (C5 above). It preserves history exactly as it happened, showing when branches diverged and met.
* **Rebase:** Rewrites project history by moving the feature branch commits onto the tip of the target branch. It yields a clean linear history but rewrites commit hashes.

---

## 4. Basic CLI Command Summary

| Command | Action |
| :--- | :--- |
| `git init` | Initializes a new local Git repository |
| `git status` | Lists modified files in the working directory |
| `git add <file>` | Stages changes for the next commit |
| `git commit -m "msg"`| Saves staged changes as a new commit node |
| `git checkout -b <name>`| Creates a new branch and switches to it |
| `git rebase <target>`| Rewrites commits on top of the target branch |

---

## 5. Conceptual Check Questions

1. **Why should you avoid rebasing commits that have already been pushed to public repositories?**
   *Answer:* Rebasing rewrites commit hashes. If other developers are working on top of the original commits, pushing rewritten commits forces them to perform complex merges, disrupting team workflow.

2. **What does the HEAD pointer represent in Git?**
   *Answer:* `HEAD` is a pointer reference that points to the active branch or commit in your working directory.
""",
        "content": {
            "introduction": "Git tracks file histories as a Directed Acyclic Graph (DAG) of commits, facilitating branching and staging controls.",
            "whyImportant": "Collaborating on large projects requires understanding Git's branching models, merges, and rebasing techniques.",
            "realWorldApps": ["Managing code modifications across features using Git branching.", "Squashing commits before merging code to keep main linear."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "android-github",
        "title": "GitHub VCS Hosting",
        "tagline": "Configure remote workflows, open pull requests, request code reviews, and automate tests.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-git"],
        "related": ["android-bitbucket", "android-gitlab"],
        "practiceProblems": [],
        "markdown": """# GitHub VCS Hosting

While Git runs locally on your workstation, **GitHub** provides cloud hosting for Git repositories. It layers collaboration tooling on top of Git, including **Pull Requests**, code reviews, issue tracking, and automated CI/CD checks (GitHub Actions). This chapter explains remote hosting configurations and code integration workflows.

---

## 1. Remote Workflows

GitHub acts as the central coordinator ("origin"). The standard developer loop involves:

1. **Cloning:** Fetching the repository database from GitHub to your local workstation.
2. **Pushing:** Sending local commit nodes up to your remote branch on GitHub.
3. **Pulling:** Fetching changes from GitHub and merging them into your local branch.

---

## 2. Pull Requests (PR) and Review Pipeline

A Pull Request is a request to merge commits from a feature branch into a target branch (e.g. `main` or `release`):

### GitHub PR Review Pipeline
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">GitHub Pull Request Pipeline</text>

  {/* Feature Branch */}
  <g transform="translate(30, 80)">
    <rect width="100" height="60" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
    <text x="50" y="25" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Local Commits</text>
    <text x="50" y="42" fill="#94a3b8" font-size="7" font-family="monospace" text-anchor="middle">git push origin</text>
  </g>

  {/* Pull Request */}
  <g transform="translate(190, 80)">
    <rect width="110" height="60" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="55" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Open PR</text>
    <text x="55" y="42" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Triggers tests</text>
  </g>

  {/* Reviewers */}
  <g transform="translate(350, 80)">
    <rect width="100" height="60" rx="3" fill="#1e293b" stroke="#a855f7" stroke-width="1"/>
    <text x="50" y="25" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Reviewers</text>
    <text x="50" y="42" fill="#a7f3d0" font-size="7" font-family="monospace" text-anchor="middle">Approved code</text>
  </g>

  {/* Main */}
  <g transform="translate(490, 95)">
    <circle cx="20" cy="20" r="15" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="20" y="23" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle">main</text>
  </g>

  {/* Paths */}
  <path d="M 130,110 L 190,110" stroke="#3b82f6" stroke-width="1.2"/>
  <path d="M 300,110 L 350,110" stroke="#10b981" stroke-width="1.2"/>
  <path d="M 450,110 L 485,110" stroke="#10b981" stroke-width="1.2"/>
</svg>

---

## 3. Comparison Matrix

| Property | Local Git | GitHub Cloud |
| :--- | :--- | :--- |
| **Nature** | Command-line tool | Web hosting platform |
| **Storage** | Local machine disk | Distributed cloud servers |
| **Collaboration** | Manual patch transfers | Pull requests, reviews, permissions |
| **CI/CD** | None (unless configured locally) | Native workflows (GitHub Actions) |

---

## 4. Conceptual Check Questions

1. **What is the difference between origin and upstream in remote repository configurations?**
   *Answer:* `origin` refers to your fork of the repository on GitHub (the remote you push to directly). `upstream` refers to the original repository from which you cloned or forked, used to fetch updates from the main codebase.

2. **How do status checks protect branches in GitHub?**
   *Answer:* Administrators configure branch protection rules. These block pull requests from being merged until automated tests (like compiler checks or unit tests) pass on GitHub Actions.
""",
        "content": {
            "introduction": "GitHub hosts Git repositories, enabling team collaboration through pull requests, automated checks, and reviews.",
            "whyImportant": "Modern development requires understanding remote Git workflows and code validation pipelines.",
            "realWorldApps": ["Opening a PR to add a login module in an Android app.", "Using GitHub Actions to compile and sign release APK packages."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "android-bitbucket",
        "title": "Atlassian Bitbucket",
        "tagline": "Integrate Jira tracking issues, manage branch access permissions, and deploy Bitbucket pipelines.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-git"],
        "related": ["android-github", "android-gitlab"],
        "practiceProblems": [],
        "markdown": """# Atlassian Bitbucket

**Bitbucket** is Atlassian's Git repository hosting service. It is widely used in enterprise settings due to its integration with **Jira** (project management software) and **Confluence** (documentation hub). This chapter details Bitbucket workspace structure, Jira tracking hooks, and branch permissions.

---

## 1. Enterprise Ecosystem Integration

Bitbucket's core strength is its integration with Jira issue tracking:
* **Smart Commits:** Developers link commits to Jira cards by referencing the issue ID in the commit message (e.g., `git commit -m "PROJ-123: Fixed network timeouts"`).
* **Automated Transitions:** Pushing a commit or merging a pull request can automatically move Jira cards from "In Progress" to "Ready for QA".

---

## 2. Workspace Access Hierarchy

Bitbucket manages permissions hierarchically. An administrator configures access controls at the workspace level, which propagate down:

### Bitbucket Permission Hierarchy
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#0284c7" font-size="13" font-family="sans-serif" font-weight="bold">Bitbucket Permissions Cascade</text>

  {/* Workspace */}
  <g transform="translate(40, 70)">
    <rect width="130" height="100" rx="4" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="65" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Workspace</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Users & Billing</text>
  </g>

  {/* Project */}
  <g transform="translate(235, 70)">
    <rect width="130" height="100" rx="4" fill="#1e293b" stroke="#0ea5e9" stroke-width="1.5"/>
    <text x="65" y="25" fill="#0ea5e9" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Project Group</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Shared Settings</text>
  </g>

  {/* Repository */}
  <g transform="translate(430, 70)">
    <rect width="130" height="100" rx="4" fill="#111" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Repository</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Git Branching</text>
  </g>

  {/* Cascade lines */}
  <path d="M 170,120 L 235,120" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="2 1"/>
  <path d="M 365,120 L 430,120" stroke="#10b981" stroke-width="1.5" stroke-dasharray="2 1"/>
</svg>

---

## 3. Comparison Matrix

| Property | GitHub | Bitbucket |
| :--- | :--- | :--- |
| **Primary Target** | Open-source & Tech startups | Enterprise teams |
| **Issue Integration**| GitHub Issues (Native) | Jira (Deep Atlassian integration) |
| **CI/CD Configuration**| GitHub Actions (YAML) | Bitbucket Pipelines (YAML) |
| **Access Model** | User-focused repositories | Project-focused workspaces |

---

## 4. Conceptual Check Questions

1. **How do Bitbucket Branch Permissions prevent developers from bypassing code reviews?**
   *Answer:* Administrators can configure rules on the `main` or `release` branches that prevent direct pushes. All updates must be made via pull requests, requiring at least one approved code review before merging is permitted.

2. **What are Bitbucket Pipelines?**
   *Answer:* It is Bitbucket's integrated CI/CD tool. It reads a `bitbucket-pipelines.yml` file in the root of the repository to automate actions like testing and compiling when code changes.
""",
        "content": {
            "introduction": "Bitbucket is Atlassian's repository hosting service, integrating codebases with Jira issues and enterprise security groups.",
            "whyImportant": "Collaborating in enterprise environments requires configuring branch permissions and tracking tickets in Jira.",
            "realWorldApps": ["Linking commits directly to Jira task cards.", "Deploying build verification pipelines using Bitbucket Runners."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "android-gitlab",
        "title": "GitLab Version Control",
        "tagline": "Configure automated CI/CD runners, pipeline stages, and merge requests.",
        "category": "Android Development",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-git"],
        "related": ["android-github", "android-bitbucket"],
        "practiceProblems": [],
        "markdown": """# GitLab Version Control

**GitLab** is a web-based Git repository manager that provides a complete DevOps lifecycle platform. Unlike other platforms that stitch multiple tools together, GitLab includes code hosting, issue tracking, CI/CD pipelines, container registries, and monitoring in a single application. This chapter covers GitLab pipelines and self-hosted build runners.

---

## 1. GitLab CI/CD Pipeline Architecture

GitLab's automation engine reads configuration from a `.gitlab-ci.yml` file located in the root of the repository. The workflow is organized into **Stages** (e.g. Build, Test, Deploy) containing individual **Jobs**:

* **Stages:** Run sequentially. If any job in the `test` stage fails, the pipeline stops and the subsequent `deploy` stage is skipped.
* **Runners:** Execution agents that run the jobs. Developers can use GitLab's shared runners or configure local self-hosted runners to execute builds.

---

## 2. GitLab Pipeline Flow

### Sequential CI Stages
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="220" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#f97316" font-size="13" font-family="sans-serif" font-weight="bold">GitLab CI/CD Execution Pipeline</text>

  {/* Stage 1: Build */}
  <g transform="translate(40, 80)">
    <rect width="110" height="70" rx="3" fill="#1e293b" stroke="#f97316" stroke-width="1.5"/>
    <text x="55" y="25" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Stage: Build</text>
    <text x="55" y="45" fill="#cbd5e1" font-size="7" font-family="monospace" text-anchor="middle">compileDebugKotlin</text>
  </g>

  {/* Stage 2: Test */}
  <g transform="translate(240, 80)">
    <rect width="110" height="70" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="55" y="25" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Stage: Test</text>
    <text x="55" y="45" fill="#cbd5e1" font-size="7" font-family="monospace" text-anchor="middle">runUnitTests</text>
  </g>

  {/* Stage 3: Deploy */}
  <g transform="translate(440, 80)">
    <rect width="110" height="70" rx="3" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
    <text x="55" y="25" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Stage: Deploy</text>
    <text x="55" y="45" fill="#cbd5e1" font-size="7" font-family="monospace" text-anchor="middle">publishArtifacts</text>
  </g>

  {/* Connections */}
  <path d="M 150,115 L 240,115" stroke="#71717a" stroke-width="1.5" marker-end="url(#gitlab-arrow)"/>
  <path d="M 350,115 L 440,115" stroke="#71717a" stroke-width="1.5" marker-end="url(#gitlab-arrow)"/>

  <defs>
    <marker id="gitlab-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | GitHub Actions | GitLab CI/CD |
| :--- | :--- | :--- |
| **Pipeline File** | `.github/workflows/main.yml` | `.gitlab-ci.yml` |
| **Execution Block** | `jobs` | `stages` + `jobs` |
| **Host Mode** | SaaS hosting | SaaS or Self-hosted instances |
| **Agent Executer** | GitHub Runners | GitLab Runner Daemon |

---

## 4. Configuration: .gitlab-ci.yml Example

Below is a configuration file defining a build and test pipeline for an Android project:

```yaml
stages:
  - build
  - test

assemble_debug:
  stage: build
  image: openjdk:17-jdk-slim
  script:
    - ./gradlew assembleDebug
  artifacts:
    paths:
      - app/build/outputs/apk/debug/app-debug.apk

unit_tests:
  stage: test
  image: openjdk:17-jdk-slim
  script:
    - ./gradlew testDebugUnitTest
```

---

## 5. Conceptual Check Questions

1. **What is a GitLab Runner, and why would you self-host one for Android?**
   *Answer:* A GitLab Runner is the daemon process that runs pipeline jobs. Android builds require significant CPU resources and memory to compile code and run emulator tests. Self-hosting a runner on local physical hardware is faster and more cost-effective than using shared cloud runners.

2. **What does the artifacts directive accomplish in a GitLab job?**
   *Answer:* It tells GitLab to upload specified files (like compiled APKs) from the runner workspace to GitLab's servers, allowing developers to download build outputs from the web console.
""",
        "content": {
            "introduction": "GitLab provides repository hosting and integrated DevOps pipelines configured using YAML files.",
            "whyImportant": "Automating compilations and tests requires mastering GitLab's pipeline stages and execution runners.",
            "realWorldApps": ["Configuring GitLab pipelines to test and compile code on every commit.", "Setting up local physical build runners for Android compilation optimization."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "android-ide",
        "title": "Android Studio Development IDE",
        "tagline": "Configure Android SDK manager, emulator settings, memory profiles, and Gradle integrations.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["android-gradle", "android-lang-kotlin"],
        "practiceProblems": [],
        "markdown": """# Android Studio Development IDE

**Android Studio** is the official Integrated Development Environment (IDE) for Android app development, built on JetBrains' IntelliJ IDEA platform. It includes code editors, layout tools, performance profilers, and virtual emulators, all integrated with the Gradle build system. This chapter covers the IDE layout, SDK configurations, and debugging tools.

---

## 1. Core IDE Components

Android Studio integrates several components to manage the development lifecycle:

* **Android SDK Manager:** Downloads different versions of the Android platform, SDK Build-Tools, and Emulator images.
* **Gradle Wrapper (`gradlew`):** Allows building projects without installing Gradle manually. It ensures everyone compiles code with the exact same version.
* **Logcat:** A console window displaying real-time system messages and stack traces from connected emulators or physical devices.

---

## 2. IDE Architecture & Communications

Android Studio communicates with emulator virtual machines and physical devices via the **Android Debug Bridge (ADB)** daemon:

### Android Studio Communication Architecture
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">IDE Connection System</text>

  {/* Android Studio */}
  <g transform="translate(40, 80)">
    <rect width="130" height="80" rx="4" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="65" y="35" fill="#3b82f6" font-size="10" font-family="monospace" text-anchor="middle" font-weight="bold">Android Studio</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Code Editor</text>
  </g>

  {/* ADB Server */}
  <g transform="translate(240, 95)">
    <rect width="120" height="50" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="60" y="22" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">ADB Daemon</text>
    <text x="60" y="38" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Port: 5037</text>
  </g>

  {/* Target Device */}
  <g transform="translate(430, 80)">
    <rect width="130" height="80" rx="4" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="35" fill="#10b981" font-size="10" font-family="monospace" text-anchor="middle" font-weight="bold">Target Device</text>
    <text x="65" y="55" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Emulator or Phone</text>
  </g>

  {/* Paths */}
  <path d="M 170,120 L 240,120" stroke="#3b82f6" stroke-width="1.5"/>
  <path d="M 360,120 L 430,120" stroke="#10b981" stroke-width="1.5"/>
</svg>

---

## 3. Recommended Keyboard Shortcuts

Mastering keyboard shortcuts accelerates coding speed inside the IDE editor:

| Action | Windows/Linux | macOS |
| :--- | :--- | :--- |
| **Search Everywhere** | Double `Shift` | Double `Shift` |
| **Project Find/Replace** | `Ctrl + Shift + F` | `Cmd + Shift + F` |
| **Refactor / Rename** | `Shift + F6` | `Shift + F6` |
| **Reformat Code** | `Ctrl + Alt + L` | `Cmd + Option + L` |
| **Build Project** | `Ctrl + F9` | `Cmd + F9` |
| **Show Context Actions** | `Alt + Enter` | `Option + Enter` |

---

## 4. Conceptual Check Questions

1. **Why does Android Studio include a Gradle Wrapper (gradlew) instead of relying on a system-wide Gradle installation?**
   *Answer:* The Wrapper locks the Gradle version for the project. When other developers or CI/CD pipelines build the project, it automatically downloads and runs the locked version, avoiding build failures caused by version mismatches.

2. **What information does the Logcat window display during application runtime?**
   *Answer:* Logcat displays real-time log messages, exception stack traces, debug logs printed using Android's `Log` class, and system crashes occurring on the connected target device.
""",
        "content": {
            "introduction": "Android Studio is the official IDE, linking coding editors to compilers and virtual devices via ADB connections.",
            "whyImportant": "Developing apps efficiently requires understanding SDK layouts, emulators, and key shortcuts.",
            "realWorldApps": ["Monitoring CPU and memory allocations using Android Studio Profilers.", "Inspecting runtime crashes by examining Logcat stack traces."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "android-kotlin-basics",
        "title": "Basics of Kotlin Syntax",
        "tagline": "Configure mutable variables, execute null safety checks, and utilize scope functions.",
        "category": "Android Development",
        "readTime": 12,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-lang-kotlin"],
        "related": ["android-oop-basics", "android-dsa-basics"],
        "practiceProblems": [],
        "markdown": """# Basics of Kotlin Syntax

Kotlin's design promotes safe, concise coding. To write applications, developers must master its fundamental features: Variable declarations, Null safety operators, Collections, and **Scope Functions**. This chapter explains basic syntax operations and type controls.

---

## 1. Variables and Null Safety

Kotlin enforces immutability by default using different variable keywords:
* `val` (Value): Read-only references. Once assigned, they cannot be reassigned (similar to `final` in Java).
* `var` (Variable): Mutable references that can be reassigned.

### Nullability Operators
Kotlin prevents NullPointerExceptions by making types non-nullable by default. If a value can be null, it must be queried using safe call operators:
* **Safe Call (`?.`):** Executes if the object is not null: `user?.name`.
* **Elvis Operator (`?:`):** Provides a default value if the expression is null: `val name = user?.name ?: "Guest"`.
* **Assertion (`!!`):** Forces execution, throwing a NullPointerException if the value is null. Use with caution.

---

## 2. Scope Functions Selection

Scope functions (`let`, `run`, `apply`, `also`, `with`) execute a block of code within the context of an object, returning either the context object or the lambda result.

### Scope Function Decisions Flow
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Kotlin Scope Functions Matrix</text>

  {/* apply / also */}
  <g transform="translate(40, 60)">
    <rect width="230" height="130" rx="4" fill="#111" stroke="#a855f7" stroke-width="1.5"/>
    <text x="115" y="20" fill="#c084fc" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Returns: Context Object</text>
    
    <rect x="15" y="35" width="200" height="35" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    <text x="115" y="50" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">apply (context = this)</text>
    <text x="115" y="60" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">Initialize properties</text>

    <rect x="15" y="80" width="200" height="35" fill="#1e293b" rx="2" stroke="#475569" stroke-width="1"/>
    <text x="115" y="95" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">also (context = it)</text>
    <text x="115" y="105" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">Logging or side actions</text>
  </g>

  {/* let / run */}
  <g transform="translate(330, 60)">
    <rect width="230" height="130" rx="4" fill="#111" stroke="#10b981" stroke-width="1.5"/>
    <text x="115" y="20" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Returns: Lambda Result</text>
    
    <rect x="15" y="35" width="200" height="35" fill="#064e3b" rx="2" stroke="#10b981" stroke-width="1"/>
    <text x="115" y="50" fill="#a7f3d0" font-size="7" font-family="monospace" text-anchor="middle">let (context = it)</text>
    <text x="115" y="60" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Execute null checks</text>

    <rect x="15" y="80" width="200" height="35" fill="#064e3b" rx="2" stroke="#10b981" stroke-width="1"/>
    <text x="115" y="95" fill="#a7f3d0" font-size="7" font-family="monospace" text-anchor="middle">run (context = this)</text>
    <text x="115" y="105" fill="#fff" font-size="6" font-family="monospace" text-anchor="middle">Calculate values</text>
  </g>
</svg>

---

## 3. Comparison Matrix

| Function | Object Reference | Return Value | Common Use Case |
| :--- | :--- | :--- | :--- |
| **`apply`** | `this` | Context object | Object initialization/configuration |
| **`also`** | `it` | Context object | Logging, caching, side effects |
| **`let`** | `it` | Lambda result | Executing blocks on non-null objects |
| **`run`** | `this` | Lambda result | Calculations and object setup |
| **`with`** | `this` | Lambda result | Grouping function calls on an object |

---

## 4. Scope Functions Example

Below is a Kotlin code block demonstrating the differences between `apply`, `also`, and `let`:

```kotlin
data class User(var name: String, var email: String)

fun processUser(nullableUser: User?) {
    // 1. let: Execute block only if user is not null
    nullableUser?.let {
        println("Processing user: ${it.name}")
    }

    // 2. apply: Configure properties, returns the User object
    val newUser = User("", "").apply {
        name = "Alice"
        email = "alice@example.com"
    }

    // 3. also: Perform side actions (like logging), returns the User object
    val loggedUser = newUser.also {
        println("User created successfully: ${it.email}")
    }
}
```

---

## 5. Conceptual Check Questions

1. **Why is it preferred to use val over var in Kotlin?**
   *Answer:* `val` creates read-only references, promoting immutability. Immutability makes code easier to reason about, prevents accidental state changes, and is thread-safe in multi-threaded environments.

2. **If you use let on a nullable object, when is the lambda block executed?**
   *Answer:* The block is only executed if the object is not null. Combining a safe call with `let` (`object?.let { ... }`) skips execution if the object is null.
""",
        "content": {
            "introduction": "Kotlin syntax supports variables, compile-time null safety checks, and scope functions to write clean, concise code.",
            "whyImportant": "Writing expressive and safe Android code requires understanding nullable operations and scope blocks.",
            "realWorldApps": ["Configuring View object properties inside an apply block.", "Wrapping user session configurations inside a let block for null safety."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "android-oop-basics",
        "title": "Basics of OOP",
        "tagline": "Design classes, manage interface implementations, constructors, and visibility modifiers.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-kotlin-basics"],
        "related": ["android-lang-kotlin", "android-dsa-basics"],
        "practiceProblems": [],
        "markdown": """# Basics of OOP

Object-Oriented Programming (OOP) is the core paradigm of Android development. Both Kotlin and Java utilize classes, objects, inheritance, polymorphism, and encapsulation to organize code. This chapter explains constructor initialization blocks, interfaces, abstract classes, and visibility modifiers.

---

## 1. Class Inheritance & Interfaces

In Kotlin:
* **Classes are closed by default:** To allow inheritance, a class must be explicitly marked with the `open` keyword.
* **Abstract Classes:** Classes declared with `abstract` cannot be instantiated directly and can contain both abstract methods (no body) and concrete methods.
* **Interfaces:** Define a contract. They can contain abstract methods as well as default implementations for methods, but cannot hold state (properties with backing fields).

---

## 2. OOP Structure Model

Below is a model demonstrating inheritance from a base class and interface implementation:

### Interface and Abstract Class Model
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">OOP Inheritance Model</text>

  {/* Interface */}
  <g transform="translate(40, 70)">
    <rect width="130" height="80" rx="2" fill="#111" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="65" y="25" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">&lt;&lt;interface&gt;&gt;</text>
    <text x="65" y="45" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Drawable</text>
    <path d="M 15,55 L 115,55" stroke="#3b82f6" stroke-width="1"/>
    <text x="20" y="68" fill="#94a3b8" font-size="6" font-family="monospace">+ draw()</text>
  </g>

  {/* Abstract Class Shape */}
  <g transform="translate(235, 70)">
    <rect width="130" height="80" rx="2" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="65" y="25" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Shape (Abstract)</text>
    <path d="M 15,35 L 115,35" stroke="#f59e0b" stroke-width="1"/>
    <text x="20" y="48" fill="#94a3b8" font-size="6" font-family="monospace"># color: String</text>
    <path d="M 15,55 L 115,55" stroke="#f59e0b" stroke-width="1"/>
    <text x="20" y="68" fill="#94a3b8" font-size="6" font-family="monospace">+ getArea(): Double</text>
  </g>

  {/* Subclass Circle */}
  <g transform="translate(430, 70)">
    <rect width="130" height="80" rx="2" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Circle</text>
    <path d="M 15,35 L 115,35" stroke="#10b981" stroke-width="1"/>
    <text x="20" y="48" fill="#fff" font-size="6" font-family="monospace">- radius: Double</text>
    <path d="M 15,55 L 115,55" stroke="#10b981" stroke-width="1"/>
    <text x="20" y="68" fill="#fff" font-size="6" font-family="monospace">+ draw()</text>
    <text x="20" y="76" fill="#fff" font-size="6" font-family="monospace">+ getArea()</text>
  </g>

  {/* Inheritance Lines */}
  <path d="M 365,110 L 430,110" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#oop-arrow)"/>
  <path d="M 170,110 L 235,110" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="2 2" marker-end="url(#oop-arrow)"/>

  <defs>
    <marker id="oop-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Visibility Modifier | Class Level | Package Level (Java) | Module Level (Kotlin) | Subclasses |
| :--- | :--- | :--- | :--- | :--- |
| **`public`** | Accessible | Accessible | Accessible | Accessible |
| **`internal`** | N/A | N/A | Accessible within compilation module | N/A |
| **`protected`**| Accessible | Accessible | N/A | Accessible in subclasses |
| **`private`** | Accessible only in scope | N/A | N/A | N/A |

---

## 4. Kotlin OOP Implementation Example

Below is a Kotlin code block demonstrating constructors, inheritance, visibility, and interface implementation:

```kotlin
// Define the interface
interface Drawable {
    fun draw()
}

// Define the open base class (Shape)
open class Shape(protected val name: String) {
    open fun getArea(): Double = 0.0
}

// Define the subclass (Circle) inheriting Shape and implementing Drawable
class Circle(name: String, private val radius: Double) : Shape(name), Drawable {
    
    // Initializer block runs after primary constructor
    init {
        require(radius > 0.0) { "Radius must be positive" }
    }

    // Override base class function
    override fun getArea(): Double = Math.PI * radius * radius

    // Implement interface method
    override fun draw() {
        println("Drawing a $name with radius $radius")
    }
}
```

---

## 5. Conceptual Check Questions

1. **What is the purpose of the init block in a Kotlin class?**
   *Answer:* Kotlin classes use a primary constructor in the class header. Since the primary constructor cannot contain logic, the `init` block serves as the initialization body, executing immediately after instantiation.

2. **How does the internal visibility modifier in Kotlin differ from public?**
   *Answer:* `public` code can be called from anywhere. `internal` limits access to classes and files within the same compilation module (e.g. the same Gradle library or app module).
""",
        "content": {
            "introduction": "Kotlin classes enforce encapsulation using visibility modifiers and organize inheritance through open/abstract models.",
            "whyImportant": "Designing clean architecture in Android projects requires separating concerns using interfaces and class hierarchies.",
            "realWorldApps": ["Creating custom Android View widgets extending the base View class.", "Defining repository interfaces to abstract data access from UI layers."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "android-dsa-basics",
        "title": "Data Structures & Algorithms",
        "tagline": "Optimize Android collection allocations and Big-O runtimes to avoid frame drops.",
        "category": "Android Development",
        "readTime": 12,
        "lastUpdated": "July 2026",
        "prerequisites": [],
        "related": ["android-kotlin-basics", "android-oop-basics"],
        "practiceProblems": [],
        "markdown": """# Data Structures & Algorithms

In mobile development, hardware limits are strict. Inefficient code leads to high memory utilization, battery drain, and frame drops (lag). Android interfaces must update at 60 or 120 frames per second—meaning any calculation taking longer than **8ms to 16ms** will stutter. This chapter reviews core collection behaviors, lookups, and Big-O computational bounds to prevent Application Not Responding (ANR) flags.

---

## 1. Core Android Collections

Choosing the correct collection prevents execution bottleneck issues:

* **ArrayList:** Index-based array. Fast random reads (`O(1)`), but slow insertions/deletions at arbitrary indices (`O(N)`) due to element shifts.
* **LinkedList:** Double-linked node list. Fast insertions/deletions at endpoints (`O(1)`), but slow lookups (`O(N)`) since you must traverse the list.
* **HashMap:** Key-value map. Uses hashing to store values. Offers near-instant average lookups, insertions, and deletions (`O(1)`).

---

## 2. HashMap Hash Collision Internals

A HashMap stores values inside an internal array of "buckets." When a key is inserted, its hash code determines the target bucket index. If multiple keys resolve to the same index (a collision), the HashMap stores them in a linked list structure. If the list length grows past 8, it converts to a red-black tree to maintain fast lookups.

### HashMap Array Bucket Collision
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">HashMap Hash Collision Model</text>

  {/* Buckets Array */}
  <g transform="translate(40, 60)">
    <text x="45" y="20" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="middle">Bucket Array</text>
    <rect x="0" y="30" width="90" height="25" fill="#1e293b" stroke="#475569" stroke-width="1"/>
    <text x="45" y="45" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Bucket 0</text>
    
    <rect x="0" y="65" width="90" height="25" fill="#1e293b" stroke="#475569" stroke-width="1"/>
    <text x="45" y="80" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Bucket 1 (Collision)</text>

    <rect x="0" y="100" width="90" height="25" fill="#1e293b" stroke="#475569" stroke-width="1"/>
    <text x="45" y="115" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Bucket 2</text>
  </g>

  {/* Linked List Nodes */}
  <g transform="translate(200, 110)">
    <rect width="90" height="30" rx="2" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="45" y="18" fill="#f59e0b" font-size="7" font-family="monospace" text-anchor="middle">Node: Key A</text>
  </g>
  <g transform="translate(350, 110)">
    <rect width="90" height="30" rx="2" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="45" y="18" fill="#f59e0b" font-size="7" font-family="monospace" text-anchor="middle">Node: Key B</text>
  </g>

  {/* Paths */}
  <path d="M 130,127 L 190,127" stroke="#3b82f6" stroke-width="1.5"/>
  <path d="M 290,125 L 340,125" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#dsa-arrow)"/>

  <defs>
    <marker id="dsa-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Big-O Complexity Matrix

| Collection | Read (Index) | Search (Value) | Insertion (End) | Insertion (Arbitrary) |
| :--- | :--- | :--- | :--- | :--- |
| **`ArrayList`** | `O(1)` | `O(N)` | `O(1)` average | `O(N)` |
| **`LinkedList`**| `O(N)` | `O(N)` | `O(1)` | `O(1)` (with iterator) |
| **`HashMap`** | `O(1)` average | `O(N)` (search by value) | `O(1)` average | `O(1)` average |

---

## 4. Conceptual Check Questions

1. **Why does inserting an item at the beginning of an ArrayList take O(N) time?**
   *Answer:* Array elements are stored in contiguous memory indices. To insert a new item at index 0, the program must shift every existing item one index to the right, which scales linearly with the size of the array.

2. **How does an inefficient algorithm trigger an ANR (Application Not Responding) crash on Android?**
   *Answer:* Android runs UI updates on a single thread (the Main Thread). If a developer runs a complex algorithm (like nested loops or slow lookups) on the main thread that takes longer than 5 seconds, the OS flags the app as unresponsive and displays an ANR crash prompt.
""",
        "content": {
            "introduction": "Selecting the correct collection type minimizes lookups and insertion times, preventing mobile layout lags and crashes.",
            "whyImportant": "Writing high-performance Android apps requires optimizing logic to run within the 16ms frame budget.",
            "realWorldApps": ["Optimizing database querying list traversals to avoid frame lags.", "Using HashMaps to perform user profile lookups in constant time."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    },
    {
        "slug": "android-gradle",
        "title": "Gradle Build System",
        "tagline": "Deconstruct the Gradle lifecycle, write build task pipelines, and compare KTS with Groovy DSL.",
        "category": "Android Development",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["android-ide"],
        "related": ["android-lang-kotlin"],
        "practiceProblems": [],
        "markdown": """# Gradle Build System

Android Studio uses **Gradle** as its primary build engine. Gradle is an advanced, automated build system designed to compile, pack, and deploy applications. It handles dependencies, compiles Kotlin/Java files, runs optimization engines (R8), and outputs runnable APKs (Android Packages). This chapter details the Gradle build lifecycle, project files, and Kotlin DSL syntax.

---

## 1. The Three Build Phases

Every time you build an Android app, Gradle executes three distinct phases in order:

1. **Initialization:** Gradle evaluates the `settings.gradle.kts` file to identify which sub-projects (modules) participate in the build.
2. **Configuration:** Evaluates `build.gradle.kts` files for all active projects. It builds a Directed Acyclic Graph (DAG) of the tasks to execute.
3. **Execution:** Executes the required tasks in order of their dependency paths (e.g. compiling Kotlin files before packaging the APK).

---

## 2. Build Pipeline Stages

The compilation flow follows this pipeline:

### Gradle Build Lifecycle
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Gradle Lifecycle Pipeline</text>

  {/* Initialization */}
  <g transform="translate(40, 70)">
    <rect width="130" height="90" rx="3" fill="#111" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="65" y="25" fill="#3b82f6" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">1. Initialization</text>
    <text x="65" y="50" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">settings.gradle.kts</text>
    <text x="65" y="65" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">Finds active modules</text>
  </g>

  {/* Configuration */}
  <g transform="translate(235, 70)">
    <rect width="130" height="90" rx="3" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="65" y="25" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">2. Configuration</text>
    <text x="65" y="50" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">build.gradle.kts</text>
    <text x="65" y="65" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">Builds task DAG</text>
  </g>

  {/* Execution */}
  <g transform="translate(430, 70)">
    <rect width="130" height="90" rx="3" fill="#111" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">3. Execution</text>
    <text x="65" y="50" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Task Runner</text>
    <text x="65" y="65" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">Compiles & packs</text>
  </g>

  {/* Connectors */}
  <path d="M 170,115 L 235,115" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#gradle-arrow)"/>
  <path d="M 365,115 L 430,115" stroke="#10b981" stroke-width="1.5" marker-end="url(#gradle-arrow)"/>

  <defs>
    <marker id="gradle-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Comparison Matrix

| Property | Groovy DSL (`build.gradle`) | Kotlin DSL (`build.gradle.kts`) |
| :--- | :--- | :--- |
| **Language** | Groovy (Dynamic language) | Kotlin (Statically typed) |
| **Editor Support** | Low (limited autocompletion/refactoring) | High (full IDE autocomplete & type checks)|
| **Performance** | Fast startup (slower script edits) | Slightly slower initial compile (fast updates) |
| **Syntax Style** | Double quotes optional, method parenthesis skipped | Strict quotes, explicit parenthesis |

---

## 4. Kotlin DSL (build.gradle.kts) Example

Below is a typical module-level `build.gradle.kts` configuration template:

```kotlin
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.example.androidapp"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.androidapp"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    testImplementation(libs.junit)
}
```

---

## 5. Conceptual Check Questions

1. **Why does the configuration phase run even if you only execute a single task?**
   *Answer:* Gradle needs to evaluate all build scripts to compile the task graph. If tasks declare dynamic properties or dependencies, Gradle must resolve these settings during the configuration phase before running anything.

2. **What is the advantage of using implementation over api inside dependencies?**
   *Answer:* `implementation` hides sub-dependencies from compile-time classpath. If module A uses `implementation` to import module B, code depending on module A cannot access module B's classes directly. This accelerates compilation speeds and reduces classpath leak risks.
""",
        "content": {
            "introduction": "Gradle handles Android compilations, managing dependencies and executing build steps across three execution phases.",
            "whyImportant": "Optimizing compile speeds and resolving dependency tree conflicts requires mastering Gradle build configs.",
            "realWorldApps": ["Configuring product flavors for staging and production targets.", "Writing Gradle tasks to auto-increment app versions before release build packaging."],
            "algorithmDescription": [],
            "complexity": [],
            "implementationCpp": "",
            "implementationPython": "",
            "commonMistakes": [],
            "interviewQuestions": [],
            "summary": ""
        }
    }
]
