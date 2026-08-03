import json

# We define the 11 blogs as a dictionary of articles
articles = {}

# 1. Basic AWS Services (EC2, S3, VPC)
articles["basic-aws-services"] = {
    "title": "Basic AWS Services: EC2, S3 & VPC Cloud Architecture",
    "tagline": "Master virtual cloud networks, compute node instances, object buckets, and security group rules.",
    "category": "Full Stack Development",
    "readTime": 15,
    "prerequisites": ["checkpoint-complete-app"],
    "related": ["checkpoint-deployment", "mesh-like-structures"],
    "practiceProblems": [],
    "markdown": """# Basic AWS Services: EC2, S3 & VPC Cloud Architecture

Cloud computing has shifted infrastructure management from physical hardware servers to software-defined cloud resources. Amazon Web Services (AWS) is a leading provider of these services. This article covers the essentials of cloud network architecture: Virtual Private Clouds (VPC), EC2 virtual compute instances, S3 object storage buckets, and security group firewalls.

---

## 1. Virtual Private Cloud (VPC) & Subnetting Mechanics

A **VPC (Virtual Private Cloud)** is a logically isolated virtual network allocated to your AWS account. It defines the IP address range using Classless Inter-Domain Routing (CIDR) blocks (e.g. `10.0.0.0/16`).

Inside your VPC, you divide the network space into **Subnets**:
- **Public Subnets**: Connected directly to an **Internet Gateway (IGW)**, allowing resources inside (like web servers) to receive public internet traffic.
- **Private Subnets**: Isolated from the public internet. Resources inside (like databases) can only access the internet indirectly via a **NAT Gateway** located in a public subnet.

```
                  [Public Internet]
                          │
                  [Internet Gateway]
                          │
                  ┌───────┴───────┐
                  ▼               ▼
           [Public Subnet] [Private Subnet]
            (Web Server)    (Database Node)
                  │               ▲
                  └─[NAT Gateway]─┘
```

---

## 2. Elastic Compute Cloud (EC2) Virtual Instances

**EC2 (Elastic Compute Cloud)** provides resizable virtual virtual machines (instances) running on AWS hardware:
- **AMI (Amazon Machine Image)**: Prefabricated template configurations (OS, pre-installed software) used to launch instances.
- **Instance Types**: Tailored combinations of CPU, memory, and storage optimized for different workloads (e.g., General Purpose `t3`, Compute Optimized `c5`).
- **EBS (Elastic Block Store)**: High-performance block storage volumes mounted to EC2 instances, persisting data independently of the instance lifespan.

---

## 3. Simple Storage Service (S3) Object Storage

Unlike block storage (which acts like a raw hard drive), **S3 (Simple Storage Service)** is a flat **Object Storage** system designed for storing static assets, backups, and user uploads:
- **Buckets & Keys**: Files (objects) are stored in flat containers called buckets, and accessed using a unique string identifier (key).
- **Metadata**: S3 attaches custom key-value pairs (like content-type or creation date) directly to objects.
- **Access Policies**: S3 buckets are private by default. Access permissions are controlled using S3 Bucket Policies and IAM role controls.

---

## 4. Security Groups & Network Access Control Lists (NACLs)

AWS manages network security using dual firewall layers:
1. **Security Groups**: Stateful firewalls acting at the **instance level**. They govern allowed ports and source IPs. Since they are stateful, allowing inbound traffic on a port automatically permits response outbound traffic.
2. **Network ACLs (NACLs)**: Stateless firewalls acting at the **subnet level**. They govern inbound and outbound rules explicitly. Because they are stateless, response traffic must be allowed explicitly using rules.

---

## 5. Frequently Asked Questions (FAQs)

### Q1: What is the main difference between Public and Private subnets in a VPC?
Public subnets are connected directly to an Internet Gateway and contain resources accessible from the public internet. Private subnets have no gateway connection and hold isolated assets like databases.

### Q2: Why are Security Groups described as 'stateful' firewalls?
Stateful firewalls remember active connection requests. If you allow inbound traffic on port \`80\`, the firewall automatically allows outbound responses on that connection without needing an explicit outbound rule.

### Q3: When should I choose S3 Object Storage over EBS Block Storage?
Use \`S3\` for static assets, backups, and user uploads that need to be accessed via URLs. Use \`EBS\` for active database files or application runtimes that require low-latency block access.

### Q4: What is the role of a NAT Gateway in a VPC?
A NAT Gateway allows resources in private subnets (like databases) to download security updates from the internet while preventing external systems from initiating connections to them.

### Q5: What does an EC2 Instance Store represent?
An Instance Store provides temporary block-level storage located physically on the host computer. Data on it is ephemeral and is lost when the instance is stopped or terminated.
"""
}

# 2. Checkpoint - Deployment
articles["checkpoint-deployment"] = {
    "title": "Checkpoint - Deployment: Scalable Servers, Proxies & Monitoring",
    "tagline": "Configure cloud host machines, build assets, chain reverse proxies, and monitor daemon runs.",
    "category": "Full Stack Development",
    "readTime": 10,
    "prerequisites": ["basic-aws-services"],
    "related": ["mesh-like-structures", "ansible-configuration"],
    "practiceProblems": [],
    "markdown": """# Checkpoint - Deployment: Scalable Servers, Proxies & Monitoring

This checkpoint guides you through configuring and deploying a secure web application onto a live cloud server. We focus on launching instances, installing runtimes, compiling static assets, configuring reverse proxies, and maintaining uptime with process managers.

---

## 1. Provisioning Servers & Installing Host Runtime Packages

Deploying starts with launching an EC2 virtual machine (usually running Ubuntu Linux):
1. **SSH Access Keys**: Generate a secure SSH keypair (`.pem` file) to authenticate admin connections.
2. **Package Isolation**: Run updates and install necessary runtime systems (Node.js, PostgreSQL client, git) using the system package manager:

```bash
# Update Ubuntu package indices and install Node.js
sudo apt update
sudo apt install -y nodejs npm git
```

---

## 2. Compilation, Build Pipelines & Environment Configurations

When deploying code:
1. **Repository Cloning**: Clone the application repository onto the server.
2. **Installing Dependencies**: Run `npm install --production` to ignore development tools and keep the footprint small.
3. **Build Compilations**: Build the client bundle:

```bash
# Compile React static client bundles on the host
npm run build
```

4. **Environment Variables**: Create a production `.env` configuration file to store active credentials (database URLs, port mappings, JWT secret keys) without committing them to git.

---

## 3. Reversing Proxy Routing with NGINX

To handle incoming traffic efficiently, we route port `80` (HTTP) and `443` (HTTPS) requests through NGINX, proxying internal calls to the Express application running on port `3000`:

```nginx
# /etc/nginx/sites-available/default
server {
    listen 80;
    server_name myapp.com;

    location / {
        root /var/www/myapp/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 4. PM2 Daemon Control

To ensure the backend application restarts automatically after server reboots or crashes, manage it using the process manager PM2:

```bash
# Start backend process as a background daemon
pm2 start server.js --name "node-api"

# Configure PM2 to launch on system startup
pm2 startup
pm2 save
```

---

## 5. Frequently Asked Questions (FAQs)

### Q1: Why is using a reverse proxy recommended over exposing Node.js directly?
A reverse proxy like NGINX offloads SSL decryption overhead, hides internal Node.js port details from attackers, and handles client buffer queues efficiently.

### Q2: What is the purpose of the try_files directive in NGINX layouts?
The \`try_files\` directive instructs NGINX to look for physical files on disk first. If the file is not found, it redirects the request to \`index.html\`, letting React Router handle client routing.

### Q3: How do I resolve permission denied errors during port 80 routing?
In Unix systems, binding to ports below \`1024\` requires root privileges. Always run NGINX as root (sudo) and have it proxy traffic to unprivileged user ports like \`3000\`.

### Q4: When should I run pm2 save command?
Run \`pm2 save\` after starting, stopping, or updating your process instances to persist the active configuration to disk, ensuring it restarts correctly after reboot.

### Q5: How do I securely update application code on a running server?
Pull the latest code from git, install dependencies, run the compilation build pipeline, and trigger a graceful reload using \`pm2 reload node-api\` to prevent downtime.
"""
}

# 3. Mesh-like Structures & Topologies
articles["mesh-like-structures"] = {
    "title": "Mesh-like Structures & Topologies: Networks Routing & Service Architecture",
    "tagline": "Explore peer-to-peer routing structures, service mesh architectures, and redundant path routing.",
    "category": "Full Stack Development",
    "readTime": 12,
    "prerequisites": ["checkpoint-deployment"],
    "related": ["ansible-configuration", "terraform-iac"],
    "practiceProblems": [],
    "markdown": """# Mesh-like Structures & Topologies: Networks Routing & Service Architecture

As web systems scale, communication structures transition from simple point-to-point connections to mesh-like topologies. This design is critical for both physical networks and microservice control layers. This article covers peer-to-peer topologies, routing path calculations, service meshes, and redundancy.

---

## 1. Network Topologies: Star vs. Mesh

In traditional **Star Topologies**, all nodes connect through a single central hub:
- **Cons**: The central hub is a single point of failure; traffic bottlenecks can occur during scale events.

**Mesh Topologies** connect nodes directly and dynamically to multiple peers:
- **Full Mesh**: Every node connects directly to every other node, providing maximum redundancy but requiring massive cabling/routing overhead.
- **Partial Mesh**: Nodes connect to only a subset of adjacent peers, balancing connection costs and redundancy.

```
    [Star Topology]                 [Mesh Topology]
         Node                            Node
          │                               │  ╲
    Node─[Hub]─Node                 Node──┴──Node
          │                               │  ╱
         Node                            Node
```

---

## 2. Peer-to-Peer Routing Path Calculations

Mesh nodes determine the optimal path for data packets using routing algorithms:
- **Link-State Routing**: Nodes map the complete network topology locally and compute paths using Dijkstra's shortest path algorithm.
- **Distance-Vector Routing**: Nodes periodically share local routing tables with adjacent neighbors to resolve path destinations.
- **Load Balancing**: Routing pathways adjust dynamically based on active link capacities, diverting packets from congested nodes.

---

## 3. Microservice Infrastructure: Service Mesh Control Tiers

In complex microservice systems, managing node communication (authentication, retries, load balancing, logging) inside application code is highly inefficient. We solve this using a **Service Mesh** (e.g., Istio, Linkerd):
- **Sidecar Proxy**: Deploying a proxy (like Envoy) alongside each service container. All inbound and outbound traffic goes through the sidecar.
- **Data Plane**: The collection of sidecar proxies that handle network data routing.
- **Control Plane**: The central manager that configures routing policies, security certificates, and access rules.

```
       [Service Node A]                  [Service Node B]
              │                                 ▲
              ▼                                 │
     [Sidecar Proxy A] ──(Data Plane Routing)──>[Sidecar Proxy B]
```

---

## 4. Path Redundancy & Fault Recovery

The primary benefit of mesh architecture is its resilience:
- **Self-Healing Networks**: If a node fails, adjacent nodes detect the link failure and recalculate routing paths immediately.
- **Dynamic Failovers**: Traffic is automatically rerouted around failing links, preventing localized hardware failures from causing system-wide outages.

---

## 5. Frequently Asked Questions (FAQs)

### Q1: What is the main benefit of a Service Mesh sidecar proxy pattern?
It offloads cross-cutting networking concerns (like load balancing, traffic encryption, retries, and metrics collection) from application code to a separate helper process.

### Q2: How does a link-state routing protocol calculate paths?
Each node constructs a complete topological map of the network and runs Dijkstra's algorithm locally to find the shortest path to every destination.

### Q3: What is the difference between the Data Plane and the Control Plane?
The Data Plane contains the sidecar proxies that actively route traffic between services. The Control Plane is the manager that configures and coordinates the proxies.

### Q4: Why is a Full Mesh topology impractical for large-scale systems?
A full mesh requires every node to connect to all other nodes. The number of connections scales quadratically ($O(N^2)$), causing configuration and network management overhead to balloon.

### Q5: How do service meshes implement mutual TLS (mTLS)?
The sidecar proxies automatically negotiate TLS handshakes, verify identities, and encrypt communication channel payloads between services without requiring code modifications.
"""
}

# 4. Ansible Automations
articles["ansible-configuration"] = {
    "title": "Ansible Automations: Declarative Playbooks, Host Inventories & Idempotency",
    "tagline": "Configure remote host systems, orchestrate configuration tasks, and write declarative plays.",
    "category": "Full Stack Development",
    "readTime": 12,
    "prerequisites": ["checkpoint-deployment"],
    "related": ["terraform-iac", "checkpoint-automation"],
    "practiceProblems": [],
    "markdown": """# Ansible Automations: Declarative Playbooks, Host Inventories & Idempotency

Manual server configuration is error-prone and hard to replicate. Configuration management tools solve this by automating system setups. Ansible is an agentless, declarative automation tool. This article covers declarative configurations, host inventories, playbooks, execution tasks, and the invariant of idempotency.

---

## 1. Agentless Push Architecture vs. Agent-Based Architectures

Ansible uses a **Push Architecture**:
- It runs on a control machine and connects to target servers over standard SSH.
- It does not require installing background agents on target machines, minimizing server overhead and simplifying setup.
- Config updates are pushed immediately from the control machine when triggered.

In contrast, agent-based tools (like Chef or Puppet) pull configurations from a master server periodically, requiring client daemons to run continuously on each node.

---

## 2. Host Inventories & YAML Configuration Formats

Ansible manages target servers using an **Inventory File** (INI or YAML). The inventory lists host addresses and organizes them into groups:

```ini
# /etc/ansible/hosts (INI Format)
[webservers]
web1.myapp.com ansible_user=ubuntu
web2.myapp.com ansible_user=ubuntu

[databases]
db1.myapp.com ansible_user=ubuntu
```

Ansible playbooks are defined in **YAML** format, mapping groups to structured configuration plays:

```yaml
---
- name: Configure Webservers
  hosts: webservers
  become: yes
  tasks:
    - name: Ensure NGINX is installed
      apt:
        name: nginx
        state: present
```

---

## 3. Ansible Plays, Tasks & Execution Modules

- **Playbooks**: A YAML file containing one or more plays.
- **Plays**: Maps a group of hosts to a list of tasks.
- **Tasks**: Sequential execution actions. Each task executes a specific **Module** (e.g. `apt`, `template`, `service`).

When a playbook runs, Ansible executes tasks in order. If a task fails on a host, Ansible halts execution for that host, preventing corrupt states.

---

## 4. The Invariant of Idempotency

The core principle of Ansible is **Idempotency**: running a playbook multiple times on a target server must produce the same result, without side-effects or duplicate configurations.

### How Idempotency Works
Before executing a task, Ansible checks the current state of the system:
- If NGINX is already installed, the `apt` task does nothing (`ok`).
- If NGINX is missing, it installs the package (`changed`).

```
              [Execute Ansible Task]
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
    (State Matches)        (State Diverges)
             │                     │
         [Do Nothing]      [Apply Changes]
             │                     │
             └──────────┬──────────┘
                        ▼
               [Target State Reached]
```

This prevents tasks from executing redundant operations (like restarting a service unnecessarily), keeping deployments fast and reliable.

---

## 5. Frequently Asked Questions (FAQs)

### Q1: Why is Ansible called an 'agentless' automation system?
Because it connects over standard SSH to run tasks, avoiding the need to install or run background agent software on the target servers.

### Q2: What does idempotency guarantee during server updates?
It guarantees that running the playbook multiple times will only apply modifications where the system's actual state differs from the declared configuration.

### Q3: What is the difference between a task and a module in Ansible?
A task defines a specific step of work (like copying a config file). A module is the underlying Python script (like \`copy\`) that Ansible executes to perform the work.

### Q4: How do I manage passwords or API keys securely in Ansible playbooks?
Use \`Ansible Vault\` to encrypt sensitive variables or files, unlocking them only at runtime using password prompts or key files.

### Q5: What is the role of Ansible handlers?
Handlers are special tasks that trigger only when notified by another task (e.g., restarting NGINX only when a configuration file changes).
"""
}

# 5. Terraform IaC Provisions
articles["terraform-iac"] = {
    "title": "Terraform IaC Provisions: Declarative Syntax, Resource Blocks & State Files",
    "tagline": "Provision cloud infrastructure resources, track state mappings, and write configuration HCL files.",
    "category": "Full Stack Development",
    "readTime": 15,
    "prerequisites": ["checkpoint-deployment"],
    "related": ["checkpoint-automation", "checkpoint-infrastructure"],
    "practiceProblems": [],
    "markdown": """# Terraform IaC Provisions: Declarative Syntax, Resource Blocks & State Files

Infrastructure as Code (IaC) allows developers to define, provision, and version cloud infrastructure using configuration files. Terraform is an open-source IaC tool. This article covers declarative infrastructure configurations, HashiCorp Configuration Language (HCL), tracking resources with state files, planning executions, and resource dependency management.

---

## 1. Declarative Infrastructure Configs & HCL Syntax

Unlike imperative scripting (like writing custom shell scripts to call AWS CLI commands), Terraform uses a **Declarative Model**:
- You declare the target state of the infrastructure (e.g. "I want a VPC with 2 subnets and an EC2 instance").
- Terraform calculates the differences between the current setup and the target state, and executes the API calls required to reach the target state.

Terraform configs are written in **HCL (HashiCorp Configuration Language)**:

```hcl
# Define a provider configuration
provider "aws" {
  region = "us-east-1"
}

# Declare a VPC resource block
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  
  tags = {
    Name = "main-vpc"
  }
}
```

---

## 2. Infrastructure State Tracking & The State File

To track resources, Terraform stores metadata in a local or remote JSON file called the **State File (`terraform.tfstate`)**:
- **Source of Truth**: Maps declared resources in config files to physical resources in the cloud.
- **Performance**: Caches resource metadata to avoid querying cloud APIs constantly.
- **State Locking**: Remote backends (like S3 with DynamoDB) lock the state file during runs, preventing multiple developers from running configurations simultaneously and corrupting states.

---

## 3. Plan, Apply & Execution Operations

Terraform executes configurations through a strict workflow:
1. `terraform init`: Downloads the required provider plugins (e.g. AWS or Google Cloud).
2. `terraform plan`: Inspects the state file, queries active cloud resources, and displays a dry-run diff of the changes that will be made.
3. `terraform apply`: Executes the API calls to build or update the infrastructure, and updates the state file.
4. `terraform destroy`: Removes all resources managed by the configuration.

```
[terraform plan] ──> [Inspect Diff] ──> [terraform apply] ──> [Update Cloud]
```

---

## 4. Resource Dependency Graphs & Implicit Mapping

Terraform automatically calculates resource dependencies:
- **Implicit Dependencies**: Terraform infers dependencies when one resource references an attribute of another (e.g. an EC2 instance references a security group ID).
- **Explicit Dependencies**: Declared manually using the `depends_on` parameter.

Using this information, Terraform constructs a **Dependency Graph** to determine which resources can be built in parallel and which must wait for dependencies to complete.

---

## 5. Frequently Asked Questions (FAQs)

### Q1: Why is the state file critical to Terraform operations?
The state file maps configurations to actual cloud assets, tracks dependencies, and cached metadata, allowing Terraform to identify changes correctly.

### Q2: What is the benefit of a remote backend with state locking?
It allows team members to share the same state file securely. State locking prevents concurrent runs from overwriting configurations and corrupting the state file.

### Q3: How do implicit and explicit dependencies differ in HCL?
Implicit dependencies are resolved by Terraform automatically through variables references. Explicit dependencies are declared manually using \`depends_on\`.

### Q4: When should I run terraform refresh?
\`terraform refresh\` queries active cloud APIs to update the state file directly, aligning it with any manual changes made outside of Terraform.

### Q5: What is the role of Terraform input variables?
Variables allow developers to parameterize configurations (like setting regions or instance types), making the code reusable across staging and production environments.
"""
}

# 6. Checkpoint - Automation
articles["checkpoint-automation"] = {
    "title": "Checkpoint - Automation: Configuration Management & Ansible Deployment",
    "tagline": "Orchestrate configuration tasks, configure remote host machines, and deploy application updates.",
    "category": "Full Stack Development",
    "readTime": 10,
    "prerequisites": ["ansible-configuration"],
    "related": ["terraform-iac", "checkpoint-infrastructure"],
    "practiceProblems": [],
    "markdown": """# Checkpoint - Automation: Configuration Management & Ansible Deployment

This checkpoint focuses on automating software installation and system updates across multiple cloud hosts using Ansible. We cover inventory routing, writing playbooks, installing dependencies, template management, and automating deploys.

---

## 1. Inventory Configuration & Key Management

Before running tasks, Ansible must connect to target servers securely:
1. **Configuring Access Paths**: Add host IP addresses to the inventory file.
2. **SSH Authentication**: Store the SSH private key (`.pem` file) on the control machine, and map connection options in the inventory:

```ini
[webservers]
web1 ansible_host=203.0.113.10 ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/key.pem
```

---

## 2. Writing Modular Playbooks & Packages Installation

To configure web hosts, write playbooks that run sequential tasks to set up runtimes (Node.js) and install key packages (NGINX):

```yaml
# deploy.yml
- name: Configure Web Application
  hosts: webservers
  become: yes
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes

    - name: Install NGINX
      apt:
        name: nginx
        state: present

    - name: Install Node.js
      apt:
        name: nodejs
        state: present
```

---

## 3. Configuration Templating with Jinja2

To update configuration files (like NGINX virtual hosts or database settings) dynamically based on host environments, use **Jinja2 Templates**:
- Save templates as `.j2` files containing variable placeholders:
  ```nginx
  # nginx.conf.j2
  server {
      listen {{ http_port }};
      server_name {{ domain_name }};
  }
  ```
- Use the `template` module to copy and render the template on the target machine:
  ```yaml
  - name: Copy NGINX Configuration
    template:
      src: nginx.conf.j2
      dest: /etc/nginx/sites-available/default
    notify: Restart NGINX
  ```

---

## 4. Triggering Service Handlers

Use **Handlers** to restart services only when configurations change:
- Handlers run once at the end of the play, avoiding redundant service restarts.

```yaml
  handlers:
    - name: Restart NGINX
      service:
        name: nginx
        state: restarted
```

---

## 5. Frequently Asked Questions (FAQs)

### Q1: How does the template module differ from the copy module?
The \`copy\` module duplicates files exactly as they are. The \`template\` module parses Jinja2 placeholders first, replacing them with runtime variables before copying.

### Q2: Why are Ansible handlers run at the end of the play?
To avoid restarting services repeatedly. If multiple tasks modify configurations, the handler executes a single service restart at the very end.

### Q3: How do I test playbooks before applying changes to production servers?
Use the \`--check\` flag to run the playbook in dry-run mode, which checks target states without making physical modifications on the servers.

### Q4: What is the purpose of become: yes in playbooks?
It instructs Ansible to execute the play tasks with root (sudo) privileges on the target machines, which is necessary for installing packages and modifying configurations.

### Q5: How do I manage environment variables across inventory hosts?
Define variable dictionaries inside host files (under \`host_vars/\` or \`group_vars/\`) to dynamically customize paths, ports, or domains for staging and production targets.
"""
}

# 7. Checkpoint - Infrastructure
articles["checkpoint-infrastructure"] = {
    "title": "Checkpoint - Infrastructure: Cloud Network Design & Resource Provisioning",
    "tagline": "Configure software-defined networks, create security bounds, and provision resources using Terraform.",
    "category": "Full Stack Development",
    "readTime": 10,
    "prerequisites": ["terraform-iac"],
    "related": ["github-actions-cicd", "monit-monitoring"],
    "practiceProblems": [],
    "markdown": """# Checkpoint - Infrastructure: Cloud Network Design & Resource Provisioning

This checkpoint focuses on designing and provisioning cloud networks and compute resources using Terraform. We cover defining providers, creating VPC configurations, laying out public and private subnets, managing firewalls, and provisioning instances.

---

## 1. Provider Setup & Backend Configs

To provision resources, configure the target cloud provider and backend settings:
- **Provider Block**: Tells Terraform which API packages to load (e.g. AWS).
- **Backend Configuration**: Stores the state file in a remote location (like an S3 bucket) for secure collaboration.

```hcl
# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "my-tf-state-bucket"
    key    = "state/prod.tfstate"
    region = "us-east-1"
  }
}
```

---

## 2. Constructing Software-Defined VPC Subnets & Gateways

Build the network topology from scratch:
1. **VPC creation**: Declare the IP address block.
2. **Subnets Layout**: Create a public subnet for front-facing web servers and a private subnet for backend databases.
3. **Internet Access**: Provision an Internet Gateway to route traffic to the public subnet.

```hcl
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
}
```

---

## 3. Firewall Declarations & Port Mappings

Define access policies using Security Groups:
- **Inbound Rules**: Allow SSH (port 22) from your IP and web traffic (ports 80/443) from all sources.
- **Outbound Rules**: Permit all egress traffic so instances can fetch package updates.

```hcl
resource "aws_security_group" "web_sg" {
  name   = "web-server-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

---

## 4. Compute Resource Allocations

Provision compute resources and associate them with your network and security configurations:

```hcl
resource "aws_instance" "app_server" {
  ami                    = "ami-0c7217cdde317cfec" # Ubuntu AMI
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web_sg.id]

  tags = {
    Name = "prod-app-server"
  }
}
```

---

## 5. Frequently Asked Questions (FAQs)

### Q1: Why should the Terraform state bucket be configured outside the active state config?
Because Terraform cannot manage the storage bucket containing the state file it needs to track itself, requiring developers to pre-create the bucket manually or in a bootstrap step.

### Q2: What happens if I modify cloud resources manually outside of Terraform?
Terraform detects the drift during the next \`plan\` or \`apply\` run and attempts to overwrite the manual modifications to match the state declared in the configuration files.

### Q3: How do I manage credentials safely in Terraform configuration files?
Never hardcode credentials in configurations. Instead, load them using environment variables (e.g. \`TF_VAR_db_password\`) or retrieve them from secure vault systems at runtime.

### Q4: What is the benefit of a remote state lock?
State locking prevents concurrent deployments from modifying the state file simultaneously, preventing conflicts and database corruption.

### Q5: How do I configure resource cleanup securely?
Run \`terraform destroy\`. This scans the state file and removes managed resources in the correct order, avoiding dependency conflicts.
"""
}

# 8. GitHub Actions CI/CD
articles["github-actions-cicd"] = {
    "title": "GitHub Actions CI/CD: Workflow Automation, YAML Schemas & Pipelines",
    "tagline": "Configure automated delivery pipelines, parse YAML workflow schemas, and manage environment secrets.",
    "category": "Full Stack Development",
    "readTime": 12,
    "prerequisites": ["checkpoint-infrastructure"],
    "related": ["monit-monitoring", "checkpoint-cicd"],
    "practiceProblems": [],
    "markdown": """# GitHub Actions CI/CD: Workflow Automation, YAML Schemas & Pipelines

Continuous Integration (CI) and Continuous Delivery (CD) automate testing, building, and deploying applications when changes are pushed to repository branches. GitHub Actions is a native workflow execution runner engine integrated with GitHub. This article covers YAML workflow structures, event triggers, virtual runners, environment secrets, caching mechanisms, and job dependencies.

---

## 1. CI/CD Lifecycle & Automated Build Gates

The CI/CD lifecycle is designed to catch bugs early and deploy updates safely:
- **Continuous Integration (CI)**: Automatically runs linters, security audits, and unit tests when developers push updates.
- **Continuous Delivery (CD)**: Automatically compiles assets, builds container images, and deploys packages to staging or production environments after the CI gates pass.

```
[Git Push] ──> [Run Linters & Tests (CI)] ──> [Build & Bundle Assets (CD)] ──> [Deploy to Server]
```

---

## 2. YAML Workflow Schemas & Event Triggers

GitHub Actions workflows are defined in **YAML** files located under `.github/workflows/`:

```yaml
# .github/workflows/ci.yml
name: Web App CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Run Tests
        run: |
          npm ci
          npm test
```

### Event Triggers
The `on` parameter defines the repository events that trigger the workflow (e.g., `push`, `pull_request`, `release`, or custom cron schedules).

---

## 3. Runners, Environments & Access Secrets

- **Runners**: Virtual machines managed by GitHub (or self-hosted) that execute the workflow jobs. Each job runs in a clean, isolated environment.
- **Secrets Management**: Sensitive parameters (like database credentials, AWS access keys, or SSH deployment keys) should never be committed to YAML files. Instead, store them in GitHub Repository Secrets, and reference them securely using the `secrets` context:

```yaml
      - name: Deploy to Cloud Host
        env:
          SSH_KEY: ${{ secrets.DEPLOY_SSH_PRIVATE_KEY }}
        run: |
          echo "$SSH_KEY" > key.pem
          # Run deployment commands
```

---

## 4. Cache Optimizations & Execution Matrix

### Caching Dependencies
Downloading packages (like `node_modules`) on every run is slow and resource-intensive. Using caching modules allows runners to preserve dependencies across executions, cutting build times significantly:

```yaml
      - name: Cache Node Modules
        uses: actions/cache@v4
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### Build Matrix
The `matrix` parameter allows developers to execute jobs across multiple OS versions and runtime environments simultaneously (e.g., testing on Node 18, 20, and 22 in parallel).

---

## 5. Frequently Asked Questions (FAQs)

### Q1: What is the difference between npm install and npm ci in workflows?
\`npm install\` can modify \`package-lock.json\` if dependencies mismatch. \`npm ci\` installs exact locked package versions from \`package-lock.json\` and wipes existing \`node_modules\`, ensuring reproducible builds.

### Q2: How do job dependencies work in GitHub Actions?
Jobs run in parallel by default. To make jobs execute sequentially, define dependencies using the \`needs\` key (e.g., \`needs: [test, build]\` before a deploy job).

### Q3: How do I prevent concurrent deployment jobs from colliding?
Configure concurrency groups in your YAML workflow (e.g. \`concurrency: production\`). This cancels older runs in progress when a new run is triggered, preventing race conditions.

### Q4: What are GitHub Actions self-hosted runners?
Self-hosted runners are virtual or physical servers managed by your team that run the GitHub Actions agent, providing control over hardware and networks.

### Q5: How do environment secrets access boundaries work?
Repository secrets are encrypted at rest and masked in execution logs. They are injected as environment variables only within specific steps that declare them.
"""
}

# 9. Monit Health Monitoring
articles["monit-monitoring"] = {
    "title": "Monit Health Monitoring: Daemon Controls, Alerting & Process Checks",
    "tagline": "Configure resource threshold checks, set service alert scripts, and automate service recovery.",
    "category": "Full Stack Development",
    "readTime": 12,
    "prerequisites": ["checkpoint-complete-app"],
    "related": ["checkpoint-cicd", "checkpoint-monitoring"],
    "practiceProblems": [],
    "markdown": """# Monit Health Monitoring: Daemon Controls, Alerting & Process Checks

A production application must remain responsive. System administrators use monitoring utilities to track system metrics and recover crashed applications automatically. Monit is a lightweight health monitoring program. This article covers resource checking rules, alert notifications, daemon configurations, and automated recovery actions.

---

## 1. Process Control, Health Checks & System Metrics

Monit runs as a background daemon process, polling resource states at configured intervals:
- **System Metrics**: Monitors CPU, memory, and disk space limits.
- **Process Checks**: Tracks process status via PID files or system ports.
- **Port Checks**: Queries TCP/UDP ports to verify services are responsive.

```
             [Monit Daemon Poll Cycle]
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
    (Service Healthy)      (Service Crashed)
             │                     │
         [Do Nothing]      [Trigger Restart]
             │                     │
             └──────────┬──────────┘
                        ▼
             [Service Repaired & Alert Sent]
```

---

## 2. Configuration Schemas & Daemon Polling Intervals

Monit is configured using a control file (`monitrc`):

```monit
# /etc/monit/monitrc
set daemon 30            # Poll service states every 30 seconds
set log /var/log/monit.log

# Monitor System resources
check system myapp-server
    if memory usage > 85% then alert
    if cpu usage > 90% for 5 cycles then alert
```

---

## 3. Monitoring Processes & Port Checks

To monitor an application (like an Express server), direct Monit to watch its PID file, define start/stop scripts, and query its socket port:

```monit
check process node-api with pidfile /var/run/node-api.pid
    start program = "/usr/bin/pm2 start /var/www/myapp/server.js --name node-api"
    stop program  = "/usr/bin/pm2 stop node-api"
    if failed port 3000 protocol http then restart
    if 3 restarts within 5 cycles then timeout
```

If the Express server crashes or fails to respond on port `3000`, Monit executes the stop program, runs the start program to recover it, and logs the action.

---

## 4. Alert Notifications & Alerting Rules

Monit integrates with SMTP servers to send alerts when resource thresholds are exceeded or services are restarted:

```monit
set mailserver smtp.gmail.com port 587
    username "monitor@myapp.com" password "secret"
    using tlsv1

set alert admin@myapp.com
```

This ensures administrators receive immediate notification when service anomalies occur.

---

## 5. Frequently Asked Questions (FAQs)

### Q1: What is the main difference between PM2 and Monit?
\`PM2\` is a runtime process manager for Node.js applications. \`Monit\` is a system-wide monitoring tool that tracks system metrics, files, folders, network sockets, and non-Node services (like NGINX or PostgreSQL).

### Q2: Why is the polling interval interval value important?
A short interval (e.g. 10 seconds) detects crashes faster, but increases CPU polling overhead. A long interval (e.g. 5 minutes) consumes fewer resources but increases downtime before a crash is resolved.

### Q3: What happens when Monit hits its restart timeout?
If a service fails to start after configured restart limits, Monit stops attempting restarts and flags the service as timed out, preventing infinite restart loops that chew CPU.

### Q4: How does Monit check custom protocols?
Monit supports built-in protocols (like http, mysql, or smtp) and allows custom TCP send/expect strings to validate specific application socket responses.

### Q5: How do I verify monitrc configuration syntax before restarting?
Validate the configuration file syntax by running the command \`monit -t\` in your server terminal.
"""
}

# 10. Checkpoint - CI/CD
articles["checkpoint-cicd"] = {
    "title": "Checkpoint - CI/CD: Automated Pipelines, Caching & Remote Deployments",
    "tagline": "Configure automated delivery pipelines, parse YAML workflow schemas, and manage environment secrets.",
    "category": "Full Stack Development",
    "readTime": 10,
    "prerequisites": ["github-actions-cicd"],
    "related": ["checkpoint-monitoring"],
    "practiceProblems": [],
    "markdown": """# Checkpoint - CI/CD: Automated Pipelines, Caching & Remote Deployments

This checkpoint guides you through configuring an automated CI/CD pipeline using GitHub Actions to compile, test, and deploy a web application. We focus on writing workflow rules, caching package dependencies, and executing secure deployments.

---

## 1. Defining Workflow Scopes & Event Triggers

1. **Trigger Configuration**: Set up the pipeline to run when changes are pushed to the `main` branch.
2. **Build and Test**: Configure virtual runner environments to check out code, run linters, and execute unit tests:

```yaml
# .github/workflows/deploy.yml
name: Production Deployment

on:
  push:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
```

---

## 2. Cache Optimization Configurations

To keep build times fast, configure the action runner to cache package dependencies (`node_modules`) across runs, avoiding redundant downloads:

```yaml
      - name: Cache dependencies
        uses: actions/cache@v4
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-
```

---

## 3. SSH Deployments & Secrets Mapping

Once tests pass, configure the pipeline to connect to the cloud server over SSH and deploy the updates:
- **Secrets Management**: Store the server's SSH key in GitHub Repository Secrets.
- **Deployment Script**: Copy files and restart the PM2 daemon gracefully:

```yaml
  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy over SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ubuntu
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/myapp
            git pull origin main
            npm install --production
            npm run build
            pm2 reload node-api
```

---

## 4. Concurrency Controls & Rollback Policies

To prevent race conditions, limit the workflow execution to a single concurrent deployment run:

```yaml
concurrency:
  group: production-deploy
  cancel-in-progress: true
```

---

## 5. Frequently Asked Questions (FAQs)

### Q1: Why should deployment SSH keys be stored in repository secrets?
Storing private keys in version control exposes them to anyone with repository access. Storing them in Secrets encrypts keys at rest and hides them in run logs.

### Q2: What is the purpose of the needs parameter in GitHub Actions?
The \`needs\` parameter configures job dependencies, ensuring that the deployment step only executes if the build and test jobs complete successfully.

### Q3: How does dependency caching speed up pipelines?
It allows actions runners to reuse packages from previous runs instead of downloading and extracting dependencies for every build, reducing execution times.

### Q4: What is the benefit of setting cancel-in-progress: true in workflows?
It terminates older build runs in progress if a new commit is pushed, saving runner resource limits and preventing concurrent deployment conflicts.

### Q5: How do I debug failing pipeline steps?
Inspect step execution logs in the GitHub Actions UI, or configure \`ACTIONS_STEP_DEBUG\` variables to print detailed command execution trace data.
"""
}

# 11. Checkpoint - Monitoring
articles["checkpoint-monitoring"] = {
    "title": "Checkpoint - Monitoring: System Health, Alerting & Process Restoration",
    "tagline": "Configure resource threshold checks, set service alert scripts, and automate service recovery.",
    "category": "Full Stack Development",
    "readTime": 10,
    "prerequisites": ["monit-monitoring"],
    "related": [],
    "practiceProblems": [],
    "markdown": """# Checkpoint - Monitoring: System Health, Alerting & Process Restoration

This checkpoint guides you through configuring Monit on a production server to monitor system resources (CPU, memory, disk), track application processes, send alert emails, and automate recovery actions.

---

## 1. Installing Monit & Basic Configuration

1. **Installation**: Install Monit using the system package manager:
   ```bash
   sudo apt update
   sudo apt install -y monit
   ```
2. **Configuration file**: Open the main config file (`/etc/monit/monitrc`) and define basic daemon configurations:
   ```monit
   set daemon 30
   set logfile /var/log/monit.log
   ```

---

## 2. Resource Threshold Checks

Configure Monit to monitor the health of the host machine and send notifications if resources are low:

```monit
check system app-host
    if memory usage > 80% for 3 cycles then alert
    if cpu usage > 90% for 5 cycles then alert
    if space usage on / > 85% then alert
```

---

## 3. Process Checks & Automatic Restarts

Configure Monit to track your Express application (managed by PM2), restart the process if it fails, and trigger notifications:

```monit
check host node-api-port address localhost
    start program = "/usr/bin/pm2 start /var/www/myapp/server.js --name node-api"
    stop program  = "/usr/bin/pm2 stop node-api"
    if failed port 3000 protocol http then restart
```

---

## 4. Mail Alert Notifications

Configure Monit to send email alerts to administrators when thresholds are exceeded or services restart:

```monit
set mailserver smtp.mailtrap.io port 2525
    username "myuser" password "mypassword"
    using tlsv1

set alert sysadmin@myapp.com
```

---

## 5. Frequently Asked Questions (FAQs)

### Q1: How do I test if Monit's automatic restart works correctly?
Manually terminate the application process (e.g. run \`pm2 stop node-api\`). Watch the Monit log file (\`/var/log/monit.log\`) to verify that the daemon detects the port failure and executes the start program within its next poll cycle.

### Q2: What does 'for 3 cycles' represent in configuration checks?
It prevents false alarms. A cycle is the polling interval (e.g. 30 seconds). A threshold checked for 3 cycles must remain exceeded for 90 seconds before triggering an alert.

### Q3: How do I monitor the health of a database service?
Add a process check for PostgreSQL or MySQL, direct Monit to its service PID, and configure it to query the database port (e.g. \`5432\` for Postgres).

### Q4: Why does Monit fail to start custom scripts sometimes?
Monit executes scripts in a clean environment with a minimal PATH variable. Always use absolute paths (like \`/usr/bin/pm2\`) for all executable programs.

### Q5: How do I enable the built-in Monit Web Interface?
Configure the \`set httpd\` block in your monitrc file, specify the access port (e.g., \`2812\`), define user logins, and allow connections from your IP.
"""
}

# Now, we serialize this dictionary to scratch/fs_batch3.json
with open('scratch/fs_batch3.json', 'w', encoding='utf-8') as f:
    json.dump(articles, f, indent=2, ensure_ascii=False)

print("Successfully generated scratch/fs_batch3.json containing 11 articles!")
