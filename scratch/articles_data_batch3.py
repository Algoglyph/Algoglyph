# -*- coding: utf-8 -*-
# Data file containing Batch 3 articles

BATCH3_ARTICLES = [
    {
        "slug": "ipv4-ipv6",
        "title": "IPv4 vs. IPv6: Address Space and Header Evolution",
        "tagline": "Contrast the structures, header complexity, and mathematical bounds of 32-bit and 128-bit internet protocols.",
        "category": "Network Engineering",
        "readTime": 12,
        "lastUpdated": "July 2026",
        "prerequisites": ["packets-frames"],
        "related": ["public-private", "nat-pat"],
        "practiceProblems": [],
        "markdown": """# IPv4 vs. IPv6: Address Space and Header Evolution

Logical addressing is the foundation of global network routing. As the Internet grew, the pool of available 32-bit IPv4 addresses was exhausted, driving the transition to 128-bit IPv6 addresses. This chapter compares their mathematical bounds, address representation styles, and the header structural simplifications that optimize modern hardware processing.

---

## 1. Mathematical Bounds of the Address Space

* **IPv4 Address Space:** Uses 32 bits, yielding a theoretical maximum pool of $2^{32} \\approx 4.29 \\times 10^9$ (4.3 billion) addresses.
* **IPv6 Address Space:** Uses 128 bits, yielding a theoretical maximum pool of $2^{128} \\approx 3.40 \\times 10^{38}$ (340 undecillion) addresses.

### Header Optimization
IPv6 did not just increase address length; it simplified the packet header structure to optimize routing efficiency. 
* **Fixed Header Size:** The IPv6 header is fixed at **40 bytes**, enabling routers to process packets using hardware ASICs without parsing variable option offsets.
* **No Checksum:** IPv6 removed the header checksum field. Because Layer 2 (Ethernet FCS) and Layer 4 (TCP/UDP) already perform error checking, removing the IP checksum avoids recalculation latency at every router hop.

### IPv4 vs. IPv6 Header Layouts
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">IP Header Layout Comparison</text>

  {/* IPv4 Header */}
  <g transform="translate(40, 50)">
    <rect width="240" height="140" rx="3" fill="#111" stroke="#ef4444" stroke-width="1.5"/>
    <text x="120" y="20" fill="#ef4444" font-size="10" font-family="monospace" text-anchor="middle" font-weight="bold">IPv4 Header (20-60 Bytes)</text>
    
    <rect x="10" y="35" width="40" height="20" rx="1" fill="#1c1917" stroke="#475569" stroke-width="1"/>
    <text x="30" y="47" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Ver</text>
    <rect x="55" y="35" width="40" height="20" rx="1" fill="#1c1917" stroke="#475569" stroke-width="1"/>
    <text x="75" y="47" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">IHL</text>
    <rect x="100" y="35" width="130" height="20" rx="1" fill="#1c1917" stroke="#475569" stroke-width="1"/>
    <text x="165" y="47" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Ident / Flags / Offset</text>

    <rect x="10" y="60" width="70" height="20" rx="1" fill="#1c1917" stroke="#475569" stroke-width="1"/>
    <text x="45" y="72" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">TTL</text>
    <rect x="85" y="60" width="145" height="20" rx="1" fill="#991b1b" stroke="#ef4444" stroke-width="1"/>
    <text x="157" y="72" fill="#fca5a5" font-size="7" font-family="monospace" text-anchor="middle">Header Checksum</text>

    <rect x="10" y="85" width="220" height="20" rx="1" fill="#1c1917" stroke="#3b82f6" stroke-width="1"/>
    <text x="120" y="97" fill="#60a5fa" font-size="7" font-family="monospace" text-anchor="middle">Source IP (32 bits)</text>
    <rect x="10" y="110" width="220" height="20" rx="1" fill="#1c1917" stroke="#3b82f6" stroke-width="1"/>
    <text x="120" y="122" fill="#60a5fa" font-size="7" font-family="monospace" text-anchor="middle">Dest IP (32 bits)</text>
  </g>

  {/* IPv6 Header */}
  <g transform="translate(320, 50)">
    <rect width="240" height="140" rx="3" fill="#111" stroke="#10b981" stroke-width="1.5"/>
    <text x="120" y="20" fill="#10b981" font-size="10" font-family="monospace" text-anchor="middle" font-weight="bold">IPv6 Header (Fixed 40 Bytes)</text>
    
    <rect x="10" y="35" width="220" height="20" rx="1" fill="#1c1917" stroke="#475569" stroke-width="1"/>
    <text x="120" y="47" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Ver / Traffic Class / Flow Label</text>

    <rect x="10" y="60" width="100" height="20" rx="1" fill="#1c1917" stroke="#475569" stroke-width="1"/>
    <text x="60" y="72" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Payload Length</text>
    <rect x="115" y="60" width="60" height="20" rx="1" fill="#1c1917" stroke="#475569" stroke-width="1"/>
    <text x="145" y="72" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Next Hdr</text>
    <rect x="180" y="60" width="50" height="20" rx="1" fill="#1c1917" stroke="#475569" stroke-width="1"/>
    <text x="205" y="72" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Hop Limit</text>

    <rect x="10" y="85" width="220" height="20" rx="1" fill="#064e3b" stroke="#10b981" stroke-width="1"/>
    <text x="120" y="97" fill="#34d399" font-size="7" font-family="monospace" text-anchor="middle">Source IPv6 (128 bits)</text>
    <rect x="10" y="110" width="220" height="20" rx="1" fill="#064e3b" stroke="#10b981" stroke-width="1"/>
    <text x="120" y="122" fill="#34d399" font-size="7" font-family="monospace" text-anchor="middle">Dest IPv6 (128 bits)</text>
  </g>
</svg>

---

## 2. Comparison Matrix

| Property | IPv4 | IPv6 |
| :--- | :--- | :--- |
| **Address Length** | 32 bits (4 bytes) | 128 bits (16 bytes) |
| **Notation** | Dotted Decimal (e.g., `192.168.1.1`) | Hexadecimal Colon (e.g., `2001:db8::1`) |
| **Header Checksum** | Yes (recalculated at every hop) | No (error checking offloaded) |
| **NAT Support** | Required (to preserve address space) | Optional (not needed due to address abundance) |

---

## 3. Conceptual Check Questions

1. **Why does the omission of the header checksum in IPv6 improve routing throughput?**
   *Answer:* In IPv4, every router that forwards a packet must decrement the TTL field. Decrementing the TTL changes the header bytes, forcing the router to recalculate the header checksum before forwarding. Removing this field in IPv6 eliminates this CPU bottleneck at every routing hop.

2. **What does the double colon ( `::` ) represent in an IPv6 address?**
   *Answer:* It represents a contiguous sequence of groups containing only zeros. This shorthand notation can only be used once in an IPv6 address to prevent ambiguity during expansion.
""",
        "content": {
            "introduction": "IPv4 uses 32-bit addresses and variable headers, while IPv6 provides a 128-bit address space with a simplified, fixed 40-byte header.",
            "whyImportant": "Transitioning systems to IPv6 requires understanding how to parse hex addresses and handle networks without NAT overlays.",
            "realWorldApps": ["ISP backbones routing native IPv6 traffic.", "Cloud architectures provisioning dual-stack subnets for global APIs."],
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
        "slug": "public-private",
        "title": "Public vs. Private IP Addresses",
        "tagline": "Deconstruct RFC 1918 allocations and the boundary between private subnets and routed public WAN networks.",
        "category": "Network Engineering",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["ipv4-ipv6"],
        "related": ["nat-pat"],
        "practiceProblems": [],
        "markdown": """# Public vs. Private IP Addresses

To prevent the premature exhaustion of the IPv4 address space, network architects partitioned logical addresses into two functional domains: **Public IP Addresses** (which route across the global Internet) and **Private IP Addresses** (which are reserved for local networks). This chapter details the RFC 1918 allocations, link-local routing rules, and address conflicts.

---

## 1. RFC 1918 Private IP Allocations

The Internet Engineering Task Force (IETF) reserved three blocks of the IPv4 address space for private networks under **RFC 1918**:

* **Class A Private Range:** `10.0.0.0` to `10.255.255.255` (CIDR: `10.0.0.0/8`)
  * *Capacity:* $1$ network with $16,777,216$ host addresses.
* **Class B Private Range:** `172.16.0.0` to `172.31.255.255` (CIDR: `172.16.0.0/12`)
  * *Capacity:* $16$ contiguous Class B subnets, each with $65,536$ host addresses.
* **Class C Private Range:** `192.168.0.0` to `192.168.255.255` (CIDR: `192.168.0.0/16`)
  * *Capacity:* $256$ subnets, each with $256$ host addresses.

### The Private-Public WAN Boundary
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="220" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">Private vs. Public IP Boundaries</text>

  {/* Local Private Subnet */}
  <g transform="translate(40, 60)">
    <rect width="200" height="120" rx="4" fill="#111" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="100" y="20" fill="#3b82f6" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Private LAN Subnet</text>
    
    <text x="20" y="55" fill="#fff" font-size="8" font-family="monospace">Host A: 192.168.1.15</text>
    <text x="20" y="80" fill="#fff" font-size="8" font-family="monospace">Host B: 192.168.1.16</text>
    <text x="100" y="105" fill="#71717a" font-size="7" font-family="monospace" text-anchor="middle">Non-Routed on Internet</text>
  </g>

  {/* Gateway Router */}
  <g transform="translate(265, 95)">
    <circle cx="35" cy="35" r="28" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="35" y="38" fill="#f59e0b" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Router</text>
    <text x="35" y="48" fill="#a1a1aa" font-size="7" font-family="monospace" text-anchor="middle">NAT Gateway</text>
  </g>

  {/* Public Internet */}
  <g transform="translate(360, 60)">
    <rect width="200" height="120" rx="4" fill="#111" stroke="#10b981" stroke-width="1.5"/>
    <text x="100" y="20" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Public WAN / Internet</text>
    
    <text x="20" y="55" fill="#fff" font-size="8" font-family="monospace">Gateway IP: 203.0.113.80</text>
    <text x="20" y="80" fill="#fff" font-size="8" font-family="monospace">Dest Web: 8.8.8.8</text>
    <text x="100" y="105" fill="#71717a" font-size="7" font-family="monospace" text-anchor="middle">Globally Routed</text>
  </g>

  <path d="M 245,120 L 260,120" stroke="#3b82f6" stroke-width="1"/>
  <path d="M 335,130 L 355,130" stroke="#10b981" stroke-width="1"/>
</svg>

---

## 2. Special IP Address Classes

* **Link-Local Range (APIPA):** `169.254.0.0/16`
  * Allocated automatically by the OS when a host fails to receive an IP from a DHCP server. These addresses cannot route past the local switch segment.
* **Loopback Address:** `127.0.0.1` (IPv4) / `::1` (IPv6)
  * Points directly back to the local host interface, bypassing the physical NIC.

---

## 3. Conceptual Check Questions

1. **Why do public internet routers drop packets with private destination IP addresses?**
   *Answer:* Private IP ranges are non-unique. Millions of homes and offices use `192.168.1.1`. If public routers attempted to route these addresses, they would have no way to determine which local network was the target.

2. **How do hosts on private subnets communicate with public web servers?**
   *Answer:* They pass traffic through a local gateway router that performs Network Address Translation (NAT), mapping private source IPs to the router's single public IP interface.
""",
        "content": {
            "introduction": "Private IP addresses are reserved under RFC 1918 for local networks and are non-routed, while public IP addresses are globally unique and routed across the internet.",
            "whyImportant": "Configuring firewalls and diagnosing routing conflicts requires understanding private address allocations.",
            "realWorldApps": ["Home routers assigning 192.168.1.x addresses to local clients.", "Enterprise datacenters using 10.x.x.x subnets for internal database replication."],
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
        "slug": "nat-pat",
        "title": "NAT & PAT: Port-Based Overload Translation",
        "tagline": "Analyze the mechanics of Network Address Translation (NAT) and Port Address Translation (PAT) session tables.",
        "category": "Network Engineering",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["public-private", "ports-sockets"],
        "related": ["lan-wan"],
        "practiceProblems": [],
        "markdown": """# NAT & PAT: Port-Based Overload Translation

Because the IPv4 address space is limited, millions of local private networks must share a tiny pool of public IP addresses to communicate with the Internet. This mapping is managed by **Network Address Translation (NAT)** and **Port Address Translation (PAT)**. This chapter details their translation tables and connection mechanics.

---

## 1. NAT Classifications

* **Static NAT (1-to-1):** Maps a single private IP address to a single public IP address. Used primarily for servers inside a private LAN that must be accessible from the outside.
* **Dynamic NAT (Many-to-Many):** Maps private IPs to an allocated pool of public IP addresses on a first-come, first-served basis.
* **Port Address Translation (PAT / NAT Overload):** Maps thousands of private IP addresses to a **single public IP address** by translating source port offsets.

---

## 2. PAT Session Table Mechanics

When Host A (`10.0.1.15`) sends an HTTP query to a Web Server (`8.8.8.8`):

1. The packet exits Host A with:
   $$\\text{Source} = 10.0.1.15:49152 \\quad \\text{Destination} = 8.8.8.8:80$$
2. The packet reaches the NAT gateway router. The router:
   * Replaces the private source IP with its public interface IP (`203.0.113.80`).
   * Allocates an available public port (e.g. `12000`) to track the connection.
   * Records this mapping in its internal **NAT Translation Table**.
3. The router forwards the modified packet:
   $$\\text{Source} = 203.0.113.80:12000 \\quad \\text{Destination} = 8.8.8.8:80$$
4. When the server replies, it sends packets to `203.0.113.80:12000`. The router reads its translation table, translates the destination back to `10.0.1.15:49152`, and forwards the frame to the client.

### Port Address Translation Session Table
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#10b981" font-size="13" font-family="sans-serif" font-weight="bold">PAT Session Mapping</text>

  {/* Host */}
  <g transform="translate(30, 80)">
    <rect width="90" height="50" rx="2" fill="#111" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="45" y="25" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Private Host</text>
    <text x="45" y="40" fill="#60a5fa" font-size="7" font-family="monospace" text-anchor="middle">10.0.1.15:49152</text>
  </g>

  {/* Router Table */}
  <g transform="translate(160, 60)">
    <rect width="280" height="110" rx="3" fill="#111" stroke="#10b981" stroke-width="1.5"/>
    <text x="140" y="18" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Router NAT Table</text>
    <text x="10" y="45" fill="#a1a1aa" font-size="7" font-family="monospace">Internal IP:Port   <->   External IP:Port</text>
    <text x="10" y="65" fill="#fff" font-size="7" font-family="monospace">10.0.1.15:49152    <->   203.0.113.80:12000</text>
    <text x="10" y="85" fill="#fff" font-size="7" font-family="monospace">10.0.1.16:49152    <->   203.0.113.80:12001</text>
  </g>

  {/* Public Web Server */}
  <g transform="translate(480, 80)">
    <rect width="90" height="50" rx="2" fill="#111" stroke="#ef4444" stroke-width="1.2"/>
    <text x="45" y="25" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Web Server</text>
    <text x="45" y="40" fill="#fca5a5" font-size="7" font-family="monospace" text-anchor="middle">8.8.8.8:80</text>
  </g>

  {/* Paths */}
  <path d="M 125,105 L 155,105" stroke="#3b82f6" stroke-width="1" marker-end="url(#arrow-nat)"/>
  <path d="M 445,115 L 475,115" stroke="#ef4444" stroke-width="1" marker-end="url(#arrow-nat)"/>

  <defs>
    <marker id="arrow-nat" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Conceptual Check Questions

1. **How many concurrent client sessions can a single public IP address support under PAT?**
   *Answer:* Because the source port field is 16 bits, a single IP can support up to $65,536$ concurrent transport sessions per destination IP address.

2. **What does a "Hairpin NAT" configuration do?**
   *Answer:* Hairpin NAT allows a client on a private network to access a local server using the server's public IP address, routing the packet back into the private network at the gateway.
""",
        "content": {
            "introduction": "NAT maps private IP addresses to public IPs, while PAT translates port offsets to allow thousands of clients to share a single public IP.",
            "whyImportant": "Debugging connection drops in Kubernetes or corporate gateways requires understanding port exhaustion limits.",
            "realWorldApps": ["Home routers mapping local devices to a single public ISP IP.", "Kubernetes NodePort routing external traffic to internal services using port maps."],
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
        "slug": "subnet-masks",
        "title": "Subnet Masks: Network Boundaries",
        "tagline": "Understand how subnet masks use bitwise AND operations to divide IP addresses into network and host portions.",
        "category": "Network Engineering",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["ipv4-ipv6"],
        "related": ["cidr-vlsm"],
        "practiceProblems": [],
        "markdown": """# Subnet Masks: Network Boundaries

An IP address contains two logical identifiers: the network identifier (which network the device belongs to) and the host identifier (the specific device on that network). To separate these two identifiers, routers use **Subnet Masks**. This chapter details the bitwise math routers use to determine subnet boundaries.

---

## 1. Bitwise Masking Operations

A subnet mask is a 32-bit value consisting of a sequence of contiguous `1` bits followed by a sequence of contiguous `0` bits.
* The `1` bits represent the **Network Portion** of the IP address.
* The `0` bits represent the **Host Portion** of the IP address.

To find the network address, the router performs a bitwise **AND** operation between the IP address and the subnet mask:

$$\\text{Network Address} = \\text{IP Address} \\text{ AND } \\text{Subnet Mask}$$

### Bitwise AND Truth Table
* `1 AND 1 = 1`
* `1 AND 0 = 0`
* `0 AND 0 = 0`

---

## 2. Mathematical Walkthrough

Let's resolve the network boundary for IP `192.168.1.85` with subnet mask `255.255.255.0`:

### Decimal Representation
* **IP Address:** `192.168.1.85`
* **Subnet Mask:** `255.255.255.0`

### Binary Calculation
```
IP Address:  11000000 . 10101000 . 00000001 . 01010101  (192.168.1.85)
Subnet Mask: 11111111 . 11111111 . 11111111 . 00000000  (255.255.255.0)
-------------------------------------------------------
AND Result:  11000000 . 10101000 . 00000001 . 00000000  (192.168.1.0)
```

The resulting network address is **`192.168.1.0`**. Any host whose address starts with `192.168.1.` is on the same local subnet.

### Subnet Boundary Bit Split
<svg viewBox="0 0 600 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="180" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">Subnet Mask Bit Partitioning</text>

  {/* Bit Representation */}
  <g transform="translate(50, 70)">
    {/* Network Portion */}
    <rect x="0" y="0" width="300" height="40" rx="2" fill="#1e1b4b" stroke="#ef4444" stroke-width="1.5"/>
    <text x="150" y="25" fill="#fca5a5" font-size="10" font-family="monospace" text-anchor="middle">Network Portion (24 Bits)</text>
    <text x="150" y="55" fill="#71717a" font-size="8" font-family="monospace" text-anchor="middle">Identifies Subnet Group</text>

    {/* Host Portion */}
    <rect x="310" y="0" width="190" height="40" rx="2" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
    <text x="405" y="25" fill="#a7f3d0" font-size="10" font-family="monospace" text-anchor="middle">Host Portion (8 Bits)</text>
    <text x="405" y="55" fill="#71717a" font-size="8" font-family="monospace" text-anchor="middle">Identifies Device on Subnet</text>
  </g>
</svg>

---

## 3. Conceptual Check Questions

1. **How many host addresses are usable in a standard Class C subnet with mask 255.255.255.0?**
   *Answer:* There are $256$ total addresses ($2^8$). However, two are reserved: the network address (all host bits set to `0`) and the broadcast address (all host bits set to `1`), leaving $254$ usable host addresses.

2. **What does a subnet mask of 255.255.255.252 (/30) indicate?**
   *Answer:* It reserves 30 bits for the network portion and 2 bits for hosts. This yields $4$ total addresses ($2^2$), leaving $2$ usable host addresses, which is ideal for point-to-point router links.
""",
        "content": {
            "introduction": "Subnet masks define network boundaries by partitioning IP addresses into network and host components using bitwise AND operations.",
            "whyImportant": "Calculating subnet bounds is essential to isolate broadcast traffic and configure local routing tables.",
            "realWorldApps": ["Hosts performing bitwise calculations to determine if destination IPs are local or require gateway routing.", "Switches grouping broadcast domains based on subnet configurations."],
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
        "slug": "cidr-vlsm",
        "title": "CIDR & VLSM: Subnet Design",
        "tagline": "Optimize address allocation using Classless Inter-Domain Routing and Variable Length Subnet Masking.",
        "category": "Network Engineering",
        "readTime": 12,
        "lastUpdated": "July 2026",
        "prerequisites": ["subnet-masks"],
        "related": ["supernetting"],
        "practiceProblems": [],
        "markdown": """# CIDR & VLSM: Subnet Design

Legacy IPv4 addressing categorized networks into rigid classes (Class A, B, and C), wasting millions of addresses. To allocate IP blocks more efficiently, network engineers introduced **Classless Inter-Domain Routing (CIDR)** and **Variable Length Subnet Masking (VLSM)**. This chapter details their calculation methods and shows how to partition networks based on host requirements.

---

## 1. Classless Inter-Domain Routing (CIDR)

CIDR replaces legacy address classes with a flexible slash notation representing the exact number of network bits (e.g. `/24` instead of `255.255.255.0`).
* **Formula for host count:**
  $$\\text{Total Hosts} = 2^{(32 - N)} \\quad \\text{Usable Hosts} = 2^{(32 - N)} - 2$$
  *(where $N$ is the CIDR prefix length).*

---

## 2. Variable Length Subnet Masking (VLSM)

**VLSM** allows engineers to partition a single parent IP block into subnets of varying sizes to match specific department host requirements, avoiding address waste.

### Subnet Allocation Rules
* **Sort Requirements:** Always sort subnets by size, from the largest host requirement to the smallest, before allocating IP blocks.
* **Network & Broadcast Limits:** Remember to add 2 to host requirements for the network and broadcast addresses.

### VLSM Subnet Hierarchy
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">VLSM Address Partitioning</text>

  {/* Parent Block */}
  <g transform="translate(50, 50)">
    <rect width="500" height="35" rx="3" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
    <text x="250" y="22" fill="#fff" font-size="10" font-family="monospace" text-anchor="middle">Parent Block: 192.168.1.0/24 (256 Addresses)</text>
  </g>

  {/* Subnet A (128 addresses) */}
  <g transform="translate(50, 110)">
    <rect width="245" height="35" rx="3" fill="#064e3b" stroke="#10b981" stroke-width="1.2"/>
    <text x="122" y="22" fill="#fff" font-size="9" font-family="monospace" text-anchor="middle">Subnet A: 192.168.1.0/25</text>
    <text x="122" y="44" fill="#a7f3d0" font-size="7" font-family="monospace" text-anchor="middle">128 IPs (126 Usable Hosts)</text>
  </g>

  {/* Subnet B (64 addresses) */}
  <g transform="translate(305, 110)">
    <rect width="120" height="35" rx="3" fill="#1c1917" stroke="#f59e0b" stroke-width="1.2"/>
    <text x="60" y="22" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Subnet B: /26</text>
    <text x="60" y="44" fill="#fde047" font-size="7" font-family="monospace" text-anchor="middle">64 IPs (62 Hosts)</text>
  </g>

  {/* Subnet C (64 addresses) */}
  <g transform="translate(430, 110)">
    <rect width="120" height="35" rx="3" fill="#1c1917" stroke="#f59e0b" stroke-width="1.2"/>
    <text x="60" y="22" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Subnet C: /26</text>
    <text x="60" y="44" fill="#fde047" font-size="7" font-family="monospace" text-anchor="middle">64 IPs (62 Hosts)</text>
  </g>
</svg>

---

## 3. VLSM Allocation Walkthrough

Let's partition the parent block **`192.168.1.0/24`** to meet the following requirements:
1. **Subnet A:** Requires $100$ hosts.
2. **Subnet B:** Requires $50$ hosts.

### Step 1: Allocate Subnet A (100 hosts)
* We need $100 + 2 = 102$ addresses. The smallest power of 2 that fits is $128$ ($2^7$).
* The subnet mask requires $32 - 7 = 25$ network bits, yielding a **`/25`** prefix.
* **Subnet A Range:** `192.168.1.0/25` (Addresses: `192.168.1.0` to `192.168.1.127`).

### Step 2: Allocate Subnet B (50 hosts)
* We need $50 + 2 = 52$ addresses. The smallest power of 2 that fits is $64$ ($2^6$).
* The subnet mask requires $32 - 6 = 26$ network bits, yielding a **`/26`** prefix.
* The next available IP address starts at `192.168.1.128`.
* **Subnet B Range:** `192.168.1.128/26` (Addresses: `192.168.1.128` to `192.168.1.191`).

---

## 4. Conceptual Check Questions

1. **Why must we allocate subnets starting with the largest host requirement when designing a VLSM network?**
   *Answer:* Allocating smaller subnets first can fragment the IP address space, leaving gaps too small to fit the larger contiguous IP blocks required by bigger subnets.

2. **For a subnet with CIDR prefix /29, how many hosts are usable?**
   *Answer:* A `/29` prefix leaves $32 - 29 = 3$ host bits. This yields $2^3 = 8$ total addresses. Subtracting 2 for network and broadcast leaves $6$ usable host addresses.
""",
        "content": {
            "introduction": "CIDR replaces legacy IP classes with slash notation prefixes, while VLSM divides parent IP blocks into subnets of varying sizes to minimize address waste.",
            "whyImportant": "Designing scalable corporate offices or cloud VPC structures requires configuring efficient CIDR/VLSM subnets.",
            "realWorldApps": ["Cloud architects allocating VPC address blocks.", "Network engineers partitioning office subnet scopes to limit broadcast domains."],
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
        "slug": "supernetting",
        "title": "Supernetting: Route Summarization",
        "tagline": "Combine contiguous subnets into aggregate routing advertisements to shrink routing tables.",
        "category": "Network Engineering",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["cidr-vlsm"],
        "related": ["bgp-ospf"],
        "practiceProblems": [],
        "markdown": """# Supernetting: Route Summarization

As global networks scale to connect millions of routes, core internet routers must store these paths in memory. If every individual subnet IP were advertised separately, routing tables would grow too large, causing CPU bottlenecks. To prevent this, engineers use **Supernetting** (also known as **Route Summarization**). This chapter details the prefix aggregation math.

---

## 1. Summarization Invariants

Supernetting combines multiple contiguous smaller subnets into a single, larger routing advertisement.
* *Contiguity Requirement:* Subnets must be contiguous (sequential in memory) to be summarized into a single prefix.
* *Aggregated Route:* The summarized route prefix represents the common binary network bits shared by all subnets in the group.

---

## 2. Route Summarization Walkthrough

Let's summarize these four contiguous subnets into a single prefix advertisement:
1. `192.168.0.0/24`
2. `192.168.1.0/24`
3. `192.168.2.0/24`
4. `192.168.3.0/24`

### Step 1: Convert the third octet to binary
We only need to inspect the octet where the addresses differ (the third octet):
* **`192.168.0.0`:** Third octet $0 \\to$ **`00000000`**
* **`192.168.1.0`:** Third octet $1 \\to$ **`00000001`**
* **`192.168.2.0`:** Third octet $2 \\to$ **`00000010`**
* **`192.168.3.0`:** Third octet $3 \\to$ **`00000011`**

### Step 2: Identify the matching bit prefix
Look at the binary columns from left to right. The first six bits are identical across all four subnets: **`000000`**. The last two bits vary.

### Step 3: Recalculate prefix length
* The first two octets share $16$ identical bits.
* The third octet shares $6$ identical bits.
* The new prefix length is $16 + 6 = 22$ bits.
* The base address starts at the first matching block: `192.168.0.0`.

The summarized routing prefix is **`192.168.0.0/22`**.

### Route Aggregation Topology
<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="200" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">Route Summarization Aggregation</text>

  {/* Individual Subnets */}
  <g transform="translate(40, 60)">
    <rect width="180" height="110" rx="4" fill="#111" stroke="#3b82f6" stroke-width="1.2"/>
    <text x="90" y="20" fill="#60a5fa" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Local Subnets</text>
    <text x="20" y="45" fill="#fff" font-size="8" font-family="monospace">192.168.0.0/24</text>
    <text x="20" y="65" fill="#fff" font-size="8" font-family="monospace">192.168.1.0/24</text>
    <text x="20" y="85" fill="#fff" font-size="8" font-family="monospace">192.168.2.0/24</text>
    <text x="20" y="100" fill="#fff" font-size="8" font-family="monospace">192.168.3.0/24</text>
  </g>

  {/* Aggregator Router */}
  <g transform="translate(265, 80)">
    <circle cx="35" cy="35" r="28" fill="#111" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="35" y="38" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Router</text>
  </g>

  {/* WAN */}
  <g transform="translate(380, 85)">
    <rect width="180" height="60" rx="4" fill="#111" stroke="#10b981" stroke-width="1.2"/>
    <text x="90" y="25" fill="#10b981" font-size="9" font-family="monospace" text-anchor="middle" font-weight="bold">Core Internet Router</text>
    <text x="90" y="45" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Advertised: 192.168.0.0/22</text>
  </g>

  <path d="M 230,115 L 260,115" stroke="#3b82f6" stroke-width="1"/>
  <path d="M 335,115 L 375,115" stroke="#10b981" stroke-width="1" marker-end="url(#arrow-sum)"/>

  <defs>
    <marker id="arrow-sum" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
    </marker>
  </defs>
</svg>

---

## 3. Conceptual Check Questions

1. **How does route summarization improve router CPU and memory performance?**
   *Answer:* It reduces the size of the routing table, meaning the router needs less memory to store routes and fewer CPU cycles to calculate the Longest Prefix Match (LPM) for incoming packets.

2. **What is a "blackhole route" in summarization designs?**
   *Answer:* When a router advertises a summary route (e.g., `192.168.0.0/22`), it claims responsibility for that entire address block. If some subnets within that block do not actually exist, the router must discard packets sent to those addresses (often routing them to interface `Null0`) to prevent routing loops.
""",
        "content": {
            "introduction": "Supernetting combines multiple contiguous subnets into a single prefix routing entry to reduce the size of global routing tables.",
            "whyImportant": "Scaling enterprise network connections requires summarizing routes to prevent routing table bloat in core routers.",
            "realWorldApps": ["ISP routers advertising single summary prefixes to represent thousands of customer subnets.", "Cloud gateways summarizing local VPC ranges before advertising them to on-premises routers."],
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
        "slug": "bgp-ospf",
        "title": "BGP & OSPF: Routing Protocols at Scale",
        "tagline": "Contrast internal link-state area routing protocols with global path-vector autonomous systems.",
        "category": "Network Engineering",
        "readTime": 12,
        "lastUpdated": "July 2026",
        "prerequisites": ["routers-switches"],
        "related": ["rip-eigrp-mpls", "static-dynamic"],
        "practiceProblems": [],
        "markdown": """# BGP & OSPF: Routing Protocols at Scale

To route packets across the globe, routers use dynamic routing protocols to share path data and calculate the fastest routes. These protocols are divided into two main classes: **Interior Gateway Protocols (IGPs)**, which route traffic within an organization, and **Exterior Gateway Protocols (EGPs)**, which route traffic between organizations. This chapter compares **OSPF** (a link-state IGP) and **BGP** (a path-vector EGP).

---

## 1. Comparing Core Protocol Types

Understanding routing at scale requires isolating the administrative domain boundaries of each protocol:

### OSPF (Open Shortest Path First) - Link-State IGP
OSPF runs within an internal Autonomous System (AS), such as a corporate campus or single datacenter network.
* **Algorithm:** Dijkstra's Shortest Path First (SPF) algorithm.
* **Metric:** Cost (calculated from interface bandwidth: $\\text{Cost} = \\frac{10^8}{\\text{Bandwidth (bps)}}$).
* **Mechanism:** Every router maintains a complete map of the local network topology (Link-State Database) and calculates the shortest path to every subnet.

### BGP (Border Gateway Protocol) - Path-Vector EGP
BGP is the routing protocol of the global Internet, routing traffic between distinct Autonomous Systems (ASes).
* **Algorithm:** Path-Vector routing.
* **Metric:** Path attributes (including AS-Path list, local preference, MED).
* **Mechanism:** Instead of calculating raw speeds, BGP routers advertise paths as a sequence of hops through different Autonomous Systems, allowing administrators to enforce business and security policies.

### Local OSPF Areas vs. Global BGP Hops
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Interior OSPF vs. Exterior BGP Routing</text>

  {/* Autonomous System 100 */}
  <g transform="translate(30, 60)">
    <rect width="220" height="140" rx="4" fill="#111" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="110" y="20" fill="#3b82f6" font-size="10" font-family="monospace" text-anchor="middle" font-weight="bold">AS 100 (Corporate OSPF)</text>
    
    <circle cx="50" cy="70" r="15" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
    <text x="50" y="73" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">R1</text>
    
    <circle cx="150" cy="70" r="15" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
    <text x="150" y="73" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">R2</text>

    <path d="M 65,70 L 135,70" stroke="#3b82f6" stroke-width="1" stroke-dasharray="2 2"/>
    <text x="100" y="60" fill="#60a5fa" font-size="8" font-family="monospace" text-anchor="middle">Dijkstra Cost</text>
  </g>

  {/* BGP Link */}
  <path d="M 255,130 L 325,130" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrow-bgp-link)"/>
  <text x="290" y="115" fill="#f59e0b" font-size="8" font-family="monospace" text-anchor="middle">BGP Peer</text>

  {/* Autonomous System 200 */}
  <g transform="translate(350, 60)">
    <rect width="220" height="140" rx="4" fill="#111" stroke="#10b981" stroke-width="1.5"/>
    <text x="110" y="20" fill="#10b981" font-size="10" font-family="monospace" text-anchor="middle" font-weight="bold">AS 200 (ISP Backbone)</text>
    
    <circle cx="110" cy="80" r="20" fill="#064e3b" stroke="#10b981" stroke-width="1"/>
    <text x="110" y="83" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Edge R</text>
  </g>

  <defs>
    <marker id="arrow-bgp-link" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
    </marker>
  </defs>
</svg>

---

## 2. Comparison Matrix

| Property | OSPF | BGP |
| :--- | :--- | :--- |
| **Scope** | IGP (Internal network routing) | EGP (Global Internet routing) |
| **Routing Algorithm** | Link-state (Dijkstra SPF) | Path-vector (BGP path attributes) |
| **Convergence Speed** | Fast (seconds) | Slow (minutes) |
| **Scale Capacity** | Under 10,000 routes | Over 1,000,000 active internet routes |

---

## 3. Conceptual Check Questions

1. **Why does BGP use TCP (Port 179) for routing updates while OSPF runs directly over raw IP (Protocol 89)?**
   *Answer:* BGP operates between physically remote networks, requiring TCP's reliable delivery, sliding window flow control, and retransmission mechanisms. OSPF runs only between directly connected local neighbors, allowing it to handle packet delivery using lightweight raw IP protocols.

2. **What does the AS-Path attribute do in BGP routing?**
   *Answer:* The AS-Path lists the Autonomous Systems a route advertisement has passed through. If a router sees its own AS number in the list, it discards the advertisement, preventing routing loops across the Internet.
""",
        "content": {
            "introduction": "OSPF is a link-state routing protocol that calculates shortest paths within a network, whereas BGP manages routing paths between global Autonomous Systems.",
            "whyImportant": "Configuring enterprise multi-site links or cloud edge routing requires understanding OSPF areas and BGP peerings.",
            "realWorldApps": ["Enterprise campuses routing internal user VLANs using OSPF.", "Edge routers advertising corporate IP prefixes to global ISPs using BGP."],
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
        "slug": "rip-eigrp-mpls",
        "title": "RIP, EIGRP, and MPLS: Alternative Routing Architectures",
        "tagline": "Deconstruct distance-vector protocols, advanced diffusion routing, and label-switched core networks.",
        "category": "Network Engineering",
        "readTime": 11,
        "lastUpdated": "July 2026",
        "prerequisites": ["routers-switches"],
        "related": ["bgp-ospf"],
        "practiceProblems": [],
        "markdown": """# RIP, EIGRP, and MPLS: Alternative Routing Architectures

Different network topologies and scale requirements demand different routing methods. This chapter compares **RIP** (a simple distance-vector protocol), **EIGRP** (an advanced hybrid protocol), and **MPLS** (a high-speed label-switching technology).

---

## 1. Comparing Core Protocol Types

Understanding route selection requires isolating the metrics and algorithms used by each framework:

### RIP (Routing Information Protocol) - Distance-Vector
A simple Interior Gateway Protocol (IGP) designed for small networks.
* **Metric:** Hop count (the number of routers along the path).
* **Vulnerability:** Maximum hop count limit is **15**. A destination 16 hops away is flagged as unreachable.
* **Mechanism:** Routers periodically broadcast their entire routing table to neighbors, leading to slow convergence and routing loops.

### EIGRP (Enhanced Interior Gateway Routing Protocol) - Hybrid
An advanced IGP developed by Cisco that combines the speed of link-state protocols with the low overhead of distance-vector protocols.
* **Algorithm:** DUAL (Diffusing Update Algorithm) to calculate loop-free paths.
* **Metric:** Composite metric based on bandwidth, delay, reliability, and load.

### MPLS (Multipoint Label Switching) - Layer 2.5 Switching
A technology that routes traffic using path labels rather than long IP lookups, speed-routing packets through ISP core backbones.
* **Mechanism:** Edge routers label incoming IP packets. Core routers forward packets by swapping these simple labels (Layer 2.5) rather than parsing the Layer 3 IP header.

### RIP Hop Path vs. MPLS Label Switching
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="220" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">RIP Hops vs. MPLS Labels</text>

  {/* RIP Hop Chain */}
  <g transform="translate(40, 60)">
    <text x="10" y="15" fill="#ef4444" font-size="9" font-family="monospace">RIP (Hop Count Metric)</text>
    {[1, 2, 3].map((num, idx) => (
      <g key={idx} transform={`translate(${idx * 70}, 25)`}>
        <circle cx="20" cy="20" r="15" fill="#111" stroke="#ef4444" stroke-width="1"/>
        <text x="20" y="23" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">R{num}</text>
      </g>
    ))}
    <path d="M 35,45 L 75,45 M 105,45 L 145,45" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow-rip)"/>
  </g>

  {/* MPLS Label Swapping */}
  <g transform="translate(300, 60)">
    <text x="10" y="15" fill="#10b981" font-size="9" font-family="monospace">MPLS (Label Swapping core)</text>
    
    <rect x="10" y="25" width="220" height="45" rx="3" fill="#111" stroke="#10b981" stroke-width="1.5"/>
    <text x="20" y="45" fill="#fff" font-size="8" font-family="monospace">Payload</text>
    <rect x="75" y="35" width="60" height="20" rx="1" fill="#064e3b" stroke="#10b981" stroke-width="1"/>
    <text x="105" y="47" fill="#a7f3d0" font-size="7" font-family="monospace" text-anchor="middle">Label: 25</text>
  </g>

  <defs>
    <marker id="arrow-rip" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
    </marker>
  </defs>
</svg>

---

## 2. Comparison Matrix

| Property | RIP | EIGRP | MPLS |
| :--- | :--- | :--- | :--- |
| **OSI Layer** | Application (Layer 7) | Network (Layer 3) | Layer 2.5 (Shim layer) |
| **Metric** | Hop Count | Bandwidth + Delay | Label Swapping |
| **Convergence** | Slow (30-second timers) | Fast (via backup routes) | Instantaneous |
| **Scope** | Small networks | Enterprise campus networks | Service provider backbones |

---

## 3. Conceptual Check Questions

1. **Why does EIGRP converge faster than OSPF during a link failure?**
   *Answer:* EIGRP pre-calculates backup routes (called Feasible Successors) using the DUAL algorithm. If the primary route fails, the router immediately switches to the backup route without running a recalculation algorithm.

2. **How does MPLS speed up routing in core networks?**
   *Answer:* Traditional routing requires looking up IP addresses in large routing tables. MPLS routers only inspect fixed-length labels in a simple hardware table, enabling fast label swapping at the ASIC level.
""",
        "content": {
            "introduction": "RIP is a legacy distance-vector protocol, EIGRP is Cisco's fast-converging hybrid protocol, and MPLS is a label-switched network technology.",
            "whyImportant": "Configuring corporate VPNs and WAN connections requires understanding EIGRP routing and MPLS label-switching.",
            "realWorldApps": ["ISP backbones routing VPN traffic over MPLS networks.", "Cisco-dominated corporate networks routing local office subnets using EIGRP."],
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
        "slug": "static-dynamic",
        "title": "Static vs. Dynamic Routing",
        "tagline": "Evaluate manually configured routing paths against automated protocol-based routing tables.",
        "category": "Network Engineering",
        "readTime": 10,
        "lastUpdated": "July 2026",
        "prerequisites": ["routers-switches"],
        "related": ["bgp-ospf"],
        "practiceProblems": [],
        "markdown": """# Static vs. Dynamic Routing

To route packets to their destinations, routers must populate their internal routing tables. This is done either manually via **Static Routing** or automatically via **Dynamic Routing**. This chapter compares their administrative overhead, failover capabilities, and Administrative Distance (AD) values.

---

## 1. Defining Route Types

Understanding how routing tables are populated requires isolating the administrative configuration methods:

### Static Routing
Routes are manually configured by a network administrator. They do not change unless the administrator logs into the router CLI and modifies the rule.
* **Control:** Low CPU overhead, secure (no protocol handshake updates), and predictable.
* **Vulnerability:** Does not scale. If a link fails, static routes cannot automatically reroute traffic, causing packet drops until manual intervention.

### Dynamic Routing
Routes are calculated automatically by routing protocols (e.g. OSPF, BGP) in response to network topology changes.
* **Scalability:** Auto-discovers paths, dynamically recalculates routes around failed links, and scales to millions of nodes.
* **Overhead:** Consumes router CPU, memory, and link bandwidth to exchange routing updates.

---

## 2. Administrative Distance (AD)

If a router learns multiple paths to the same destination from different sources, it uses **Administrative Distance (AD)** to select the most trustworthy route. A lower AD is preferred:

| Route Source | Default AD Value | Trust Level |
| :--- | :--- | :--- |
| **Directly Connected** | 0 | Absolute trust |
| **Static Route** | 1 | Extremely high trust |
| **EIGRP** | 90 | High trust |
| **OSPF** | 110 | Moderate trust |
| **RIP** | 120 | Low trust |

### Dynamic Route Selection
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="220" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Dynamic Route Selection (AD Bounds)</text>

  {/* Source Router */}
  <g transform="translate(50, 80)">
    <circle cx="25" cy="25" r="22" fill="#111" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="25" y="28" fill="#fff" font-size="9" font-family="monospace" text-anchor="middle">Router A</text>
  </g>

  {/* Paths */}
  <path d="M 110,90 Q 250,50 390,90" fill="none" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow-route)"/>
  <text x="250" y="55" fill="#ef4444" font-size="8" font-family="monospace" text-anchor="middle">Static Route (AD = 1) - SELECTED</text>

  <path d="M 110,120 Q 250,160 390,120" fill="none" stroke="#71717a" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#arrow-route)"/>
  <text x="250" y="155" fill="#71717a" font-size="8" font-family="monospace" text-anchor="middle">OSPF Route (AD = 110) - IGNORED</text>

  {/* Dest Router */}
  <g transform="translate(430, 80)">
    <circle cx="25" cy="25" r="22" fill="#111" stroke="#10b981" stroke-width="1.5"/>
    <text x="25" y="28" fill="#fff" font-size="9" font-family="monospace" text-anchor="middle">Router B</text>
  </g>

  <defs>
    <marker id="arrow-route" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#71717a" />
    </marker>
  </defs>
</svg>

---

## 3. Conceptual Check Questions

1. **What is a "Floating Static Route"?**
   *Answer:* A floating static route is a manually configured route with an administrative distance higher than that of the active dynamic routing protocol (e.g. AD = 130). It remains inactive in the routing table until the dynamic protocol path fails.

2. **Why do network administrators use static routes to direct traffic to a default gateway?**
   *Answer:* A default gateway represents the single exit path (default route `0.0.0.0/0`) from a local network. Since this path does not change, using a static route avoids protocol overhead.
""",
        "content": {
            "introduction": "Static routes are manually configured by administrators, while dynamic routing protocols automatically calculate and adjust paths.",
            "whyImportant": "Designing redundant corporate gateways requires combining static routes with dynamic protocols using administrative distance configurations.",
            "realWorldApps": ["Corporate offices using static default routes to guide local traffic to ISPs.", "Datacenter routers dynamically updating OSPF tables to reroute traffic around broken switch links."],
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
        "slug": "vlans-vxlan",
        "title": "VLANs & VXLAN: Layer 2 Segmentation and Overlays",
        "tagline": "Contrast local 802.1Q virtual VLAN tag partitions with Layer 3 encapsulated VXLAN tunnels.",
        "category": "Network Engineering",
        "readTime": 12,
        "lastUpdated": "July 2026",
        "prerequisites": ["lan-wan"],
        "related": ["stp-mac"],
        "practiceProblems": [],
        "markdown": """# VLANs & VXLAN: Layer 2 Segmentation and Overlays

As networks scale, managing broadcast domains and isolated tenants becomes increasingly difficult. While traditional **VLANs** partition local switches, modern cloud-scale datacenters use **VXLAN** (Virtual Extensible LAN) overlays to tunnel Layer 2 traffic across Layer 3 networks. This chapter compares their headers, scaling limits, and encapsulation mechanics.

---

## 1. Comparing Isolation Technologies

Understanding network isolation requires isolating the headers and encapsulation methods used by each standard:

### VLAN (IEEE 802.1Q) - Local Segmentation
Partitions a physical local switch into distinct logical broadcast domains.
* **Tag Size:** Uses a **12-bit VLAN ID** tag inside the Ethernet frame header.
* **Scaling Limit:** Max $2^{12} = 4,096$ unique segment IDs.
* **Vulnerability:** Limited to a single Layer 2 switch segment; cannot pass through Layer 3 routers.

### VXLAN (RFC 7348) - Layer 3 Overlay Tunneling
A Layer 3 encapsulation protocol that tunnels Layer 2 Ethernet frames inside Layer 3 UDP packets (Port `4789`).
* **VNI Tag Size:** Uses a **24-bit Virtual Network Identifier (VNI)**.
* **Scaling Limit:** Max $2^{24} \\approx 16,000,000$ (16 million) unique segment IDs.
* **Tunneling:** Routes virtual Layer 2 traffic across physical Layer 3 networks, making it ideal for cloud multitenancy.

### VLAN Tagging vs. VXLAN Encapsulation
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">VLAN vs. VXLAN Framing</text>

  {/* VLAN Frame */}
  <g transform="translate(40, 50)">
    <rect width="240" height="140" rx="3" fill="#111" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="120" y="20" fill="#3b82f6" font-size="10" font-family="monospace" text-anchor="middle" font-weight="bold">802.1Q VLAN Frame</text>
    
    <rect x="15" y="45" width="210" height="30" rx="2" fill="#1e293b" stroke="#475569" stroke-width="1"/>
    <text x="120" y="63" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Eth Hdr + [802.1Q Tag (12-bit ID)] + Payload</text>
    <text x="120" y="110" fill="#71717a" font-size="7" font-family="monospace" text-anchor="middle">Local Layer 2 Scope</text>
  </g>

  {/* VXLAN Encapsulated */}
  <g transform="translate(320, 50)">
    <rect width="240" height="140" rx="3" fill="#111" stroke="#10b981" stroke-width="1.5"/>
    <text x="120" y="20" fill="#10b981" font-size="10" font-family="monospace" text-anchor="middle" font-weight="bold">VXLAN Packet (UDP Tunneled)</text>
    
    <rect x="15" y="45" width="210" height="40" rx="2" fill="#064e3b" stroke="#475569" stroke-width="1"/>
    <text x="120" y="60" fill="#fff" font-size="7" font-family="monospace" text-anchor="middle">Outer IP Hdr + Outer UDP Hdr (4789)</text>
    <text x="120" y="75" fill="#34d399" font-size="7" font-family="monospace" text-anchor="middle">+[VXLAN Hdr (24-bit VNI)] + Inner L2 Frame</text>
    <text x="120" y="115" fill="#71717a" font-size="7" font-family="monospace" text-anchor="middle">Routed Layer 3 Scope</text>
  </g>
</svg>

---

## 2. Underlay vs. Overlay Networks

VXLAN establishes a clear boundary between physical and virtual networks:
* **Underlay Network:** The physical network infrastructure (switches, routers, cabling) configured with IP routing protocols (like OSPF or BGP) to ensure connectivity between all switch interfaces.
* **Overlay Network:** The virtual network tunneled on top of the underlay. Virtual machines communicate as if they are on the same local switch, unaware that their packets are being routed across physical hops.

---

## 3. Conceptual Check Questions

1. **What is a VTEP in a VXLAN configuration?**
   *Answer:* A VTEP (VXLAN Tunnel Endpoint) is the device (switch or hypervisor) that encapsulates virtual machines' Layer 2 frames in Layer 3 UDP headers before transmission, and decapsulates them on receipt.

2. **Why does VXLAN use UDP Port 4789 as its transport header?**
   *Answer:* Using UDP allows source ports to be calculated from hashes of the inner frame headers. Physical routers in the underlay can then use these varying source ports to distribute tunnel traffic evenly using ECMP load balancing.
""",
        "content": {
            "introduction": "VLANs provide local segment isolation using 12-bit tags, while VXLAN uses 24-bit tags encapsulated in UDP to tunnel Layer 2 traffic across Layer 3 networks.",
            "whyImportant": "Designing cloud architectures and hypervisor networks requires configuring VXLAN tunnels and underlay networks.",
            "realWorldApps": ["Hypervisors using VXLAN overlays to support millions of tenant networks.", "Switches partitioning local office networks into departments using VLAN tags."],
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
        "slug": "stp-mac",
        "title": "STP & MAC Tables: Loop Prevention",
        "tagline": "Analyze the Spanning Tree Protocol (STP) state machine and MAC table building loop hazards.",
        "category": "Network Engineering",
        "readTime": 12,
        "lastUpdated": "July 2026",
        "prerequisites": ["lan-wan"],
        "related": ["vlans-vxlan"],
        "practiceProblems": [],
        "markdown": """# STP & MAC Tables: Loop Prevention

Layer 2 local networks require redundant physical links to ensure uptime if a switch or cable fails. However, because Ethernet frames lack a Time-To-Live (TTL) field, redundant links can cause infinite loops, resulting in **broadcast storms** that can crash a network in seconds. This chapter details how **Spanning Tree Protocol (STP)** prevents loops by managing port states.

---

## 1. Loop Hazards: Broadcast Storms

If three switches are connected in a triangle:
1. Host A sends a broadcast frame (e.g. an ARP request).
2. Switch 1 receives the frame and forwards it out of all other ports, sending it to Switch 2 and Switch 3.
3. Switch 2 receives the frame from Switch 1 and forwards it to Switch 3. Switch 3 receives the frame and forwards it to Switch 2.
4. This loop continues infinitely, flooding links with redundant traffic, spiking switch CPU usage to 100%, and crashing the network.

---

## 2. Spanning Tree Protocol (STP - IEEE 802.1D)

STP prevents loops by calculating the network topology and placing redundant ports into a **Blocking** state, breaking the loop logically while keeping the physical link as a backup.

### The STP Port Election Cycle
1. **Root Bridge Selection:** Switches exchange Bridge Protocol Data Units (BPDUs) to elect a central Root Bridge. The switch with the lowest **Bridge ID** (Priority + MAC address) wins.
2. **Root Port Election:** Non-root switches select the port with the lowest path cost to the Root Bridge.
3. **Designated Port Election:** Switches select the port responsible for forwarding traffic onto each segment.
4. **Non-Designated Ports (Blocking):** All other ports are placed in a Blocking state, breaking the loop.

### STP Loop Prevention
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#ef4444" font-size="13" font-family="sans-serif" font-weight="bold">STP Loop Prevention Topology</text>

  {/* Switch A - Root */}
  <g transform="translate(250, 40)">
    <rect width="100" height="40" rx="3" fill="#111" stroke="#10b981" stroke-width="1.5"/>
    <text x="50" y="25" fill="#10b981" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">Switch A (ROOT)</text>
  </g>

  {/* Switch B */}
  <g transform="translate(100, 140)">
    <rect width="100" height="40" rx="3" fill="#111" stroke="#3b82f6" stroke-width="1"/>
    <text x="50" y="25" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Switch B</text>
  </g>

  {/* Switch C */}
  <g transform="translate(400, 140)">
    <rect width="100" height="40" rx="3" fill="#111" stroke="#3b82f6" stroke-width="1"/>
    <text x="50" y="25" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">Switch C</text>
    
    {/* Blocking indicator */}
    <circle cx="10" cy="20" r="6" fill="#ef4444"/>
    <text x="10" y="23" fill="#fff" font-size="8" font-family="monospace" text-anchor="middle">B</text>
  </g>

  {/* Connections */}
  <path d="M 250,60 L 150,140" stroke="#10b981" stroke-width="1.5"/>
  <path d="M 350,60 L 450,140" stroke="#10b981" stroke-width="1.5"/>
  <path d="M 200,160 L 400,160" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3 3"/>
  <text x="300" y="152" fill="#ef4444" font-size="8" font-family="monospace" text-anchor="middle">Blocked Path</text>
</svg>

---

## 3. STP Port States

* **Blocking:** Discards all data frames, only listening for BPDUs to detect network changes.
* **Listening:** Decides if the port should participate in forwarding; does not learn MAC addresses or forward frames.
* **Learning:** Populates its MAC address table by analyzing incoming frames; does not forward frames.
* **Forwarding:** Fully operational; forwards data frames and updates its MAC address table.

---

## 4. Conceptual Check Questions

1. **Why does traditional STP (802.1D) take up to 30 to 50 seconds to converge after a link failure?**
   *Answer:* When a link fails, ports transition through the Listening (15s) and Learning (15s) states to build tables and prevent transient loops, causing a 30-second delay. Rapid Spanning Tree Protocol (RSTP / 802.1w) optimizes this to under a second.

2. **How does a switch build its MAC address table?**
   *Answer:* The switch inspects the source MAC address of incoming frames. If the address is not in its table, it creates a new entry mapping that MAC address to the incoming physical switch port.
""",
        "content": {
            "introduction": "STP prevents loops on Layer 2 networks with redundant links by placing redundant ports into a blocking state.",
            "whyImportant": "Configuring redundant links between switches requires understanding STP to prevent network-wide broadcast storms.",
            "realWorldApps": ["Switches negotiating paths automatically using RSTP.", "Network administrators designating the primary root switch using bridge priority settings."],
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
