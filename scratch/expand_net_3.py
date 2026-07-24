from generate_dynamodb_and_backend import inject_into_de_blog_data

subnet_masks_md = r"""# Subnet Masks: IPv4 Bitwise Calculations & Network Boundary Routing

A **Subnet Mask** is a 32-bit binary bitmask used in IPv4 networking to divide an IP address into two distinct structural components: the **Network Address** (identifying the logical subnet) and the **Host Address** (identifying the specific device node on that subnet).

---

## 1. Bitwise Subnet Mask Calculation Mechanics

A subnet mask consists of contiguous `1` bits followed by contiguous `0` bits. Performing a bitwise `AND` operation between an IPv4 address and its Subnet Mask extracts the exact Network Address.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="netBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#netBg)" stroke="#38bdf8" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f0f6fc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Bitwise Subnet Mask Breakdown (192.168.1.50 /24)</text>

  <!-- Row 1: IP Address -->
  <g transform="translate(60, 90)">
    <rect width="780" height="50" rx="6" fill="#0369a1" stroke="#7dd3fc" stroke-width="1.5"/>
    <text x="20" y="32" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">IP Address: 192.168.1.50</text>
    <text x="320" y="32" fill="#bae6fd" font-family="monospace" font-size="13">11000000 . 10101000 . 00000001 . 00110010</text>
  </g>

  <!-- Row 2: Subnet Mask -->
  <g transform="translate(60, 160)">
    <rect width="780" height="50" rx="6" fill="#075985" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="20" y="32" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">Subnet Mask: /24</text>
    <text x="320" y="32" fill="#38bdf8" font-family="monospace" font-size="13">11111111 . 11111111 . 11111111 . 00000000</text>
  </g>

  <!-- Row 3: Result (Bitwise AND) -->
  <g transform="translate(60, 230)">
    <rect width="780" height="60" rx="6" fill="#0f172a" stroke="#10b981" stroke-width="2"/>
    <text x="20" y="36" fill="#10b981" font-family="monospace" font-weight="700" font-size="14">Network Address (AND)</text>
    <text x="320" y="36" fill="#6ee7b7" font-family="monospace" font-weight="700" font-size="14">192.168.1.0  (Hosts: 192.168.1.1 to 192.168.1.254)</text>
  </g>
</svg>

### Mathematical Formula for Host Capacity
For a subnet mask with $H$ zero bits (where $H = 32 - \text{prefix\_length}$):
$$\text{Total Usable Hosts} = 2^H - 2$$

*(Subtracting 2 accounting for the reserved Network ID and Broadcast ID).*

---

## 2. Production Python Subnet Bitwise Calculator

```python
import socket
import struct

def calculate_subnet(ip_str, cidr_prefix):
    # Convert IP to 32-bit unsigned int
    ip_int = struct.unpack("!I", socket.inet_aton(ip_str))[0]
    
    # Calculate mask int
    mask_int = (0xFFFFFFFF << (32 - cidr_prefix)) & 0xFFFFFFFF
    
    # Network and Broadcast addresses
    network_int = ip_int & mask_int
    broadcast_int = network_int | (~mask_int & 0xFFFFFFFF)
    
    network_ip = socket.inet_ntoa(struct.pack("!I", network_int))
    broadcast_ip = socket.inet_ntoa(struct.pack("!I", broadcast_int))
    usable_hosts = (2 ** (32 - cidr_prefix)) - 2 if cidr_prefix < 31 else 0

    return {
        "network_ip": network_ip,
        "broadcast_ip": broadcast_ip,
        "first_usable": socket.inet_ntoa(struct.pack("!I", network_int + 1)),
        "last_usable": socket.inet_ntoa(struct.pack("!I", broadcast_int - 1)),
        "usable_hosts": usable_hosts
    }

res = calculate_subnet("192.168.1.50", 24)
print("Subnet Calculation Results:", res)
```

---

## Frequently Asked Questions (FAQs)

### Q1: Why can't the first and last IP addresses in a subnet be assigned to individual hosts?
The first IP address in a subnet (all host bits set to `0`) is reserved as the **Network Identifier**, used by routing protocols to identify the subnet block. The last IP address (all host bits set to `1`) is reserved as the **Broadcast Address**, used to send packet traffic to all host interfaces connected within that local network segment.
"""

static_dynamic_md = r"""# Static vs. Dynamic Routing: BGP, OSPF & Autonomous Administrative Distance

In enterprise network engineering, routing is the process of forwarding IP packets across interconnected networks. Routing tables can be configured either via **Static Routing** (manually defined routes entered by network administrators) or **Dynamic Routing** (automated discovery and path computation via protocols like OSPF, BGP, EIGRP, and RIP).

---

## 1. Dynamic Routing Protocols & Administrative Distance (AD)

When multiple routing sources advertise a route to the exact same destination network, routers select the path with the lowest **Administrative Distance (AD)** value.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="routeBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#routeBg)" stroke="#818cf8" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#e0e7ff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">Router Administrative Distance (AD) Preference Order</text>

  <!-- Route AD Priority Stack -->
  <g transform="translate(100, 90)">
    <rect width="700" height="40" rx="6" fill="#4338ca" stroke="#c7d2fe" stroke-width="1.5"/>
    <text x="20" y="25" fill="#ffffff" font-family="monospace" font-weight="700" font-size="13">Connected Interface (AD = 0)</text>
    <text x="500" y="25" fill="#a5b4fc" font-family="monospace" font-size="12">Highest Trust Level</text>
  </g>

  <g transform="translate(100, 145)">
    <rect width="700" height="40" rx="6" fill="#3730a3" stroke="#818cf8" stroke-width="1.5"/>
    <text x="20" y="25" fill="#ffffff" font-family="monospace" font-weight="700" font-size="13">Static Route (AD = 1)</text>
    <text x="500" y="25" fill="#a5b4fc" font-family="monospace" font-size="12">Manual Admin Override</text>
  </g>

  <g transform="translate(100, 200)">
    <rect width="700" height="40" rx="6" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.5"/>
    <text x="20" y="25" fill="#ffffff" font-family="monospace" font-weight="700" font-size="13">eBGP (AD = 20) / EIGRP (AD = 90) / OSPF (AD = 110)</text>
    <text x="500" y="25" fill="#818cf8" font-family="monospace" font-size="12">Dynamic Convergence</text>
  </g>
</svg>

---

## 2. Dynamic Routing Evaluation Matrix

| Metric | Static Routing | Dynamic Routing (OSPF / BGP) |
| :--- | :--- | :--- |
| **Configuration Overhead** | High (manual per-router entry) | Low (protocol handles neighbors) |
| **CPU / Memory Usage** | Zero overhead | Moderate to High (SPF calculations) |
| **Failover Convergence** | Requires IP SLA / Track scripts | Automatic sub-second rerouting |
| **Scalability Limit** | Small sites (< 20 routes) | Unlimited (Internet BGP global table) |

---

## Frequently Asked Questions (FAQs)

### Q1: What is a Floating Static Route?
A Floating Static Route is a manually configured backup route configured with a higher Administrative Distance (e.g., AD = 130) than the primary dynamic routing protocol (e.g., OSPF AD = 110). It remains inactive in the routing table until the dynamic protocol link fails.
"""

nfc_mobile_md = r"""# NFC & Mobile Cellular Networks: 13.56 MHz RF Signals, 5G NR & eSIM Protocols

**Near Field Communication (NFC)** and **Mobile Cellular Networks (4G LTE, 5G NR)** form the foundation of modern wireless mobile communications. From contactless payment transactions (Apple Pay, Google Wallet) operating at 13.56 MHz to high-throughput 5G mmWave cellular base stations, these technologies enable secure, ubiquitous device connectivity.

---

## 1. Near Field Communication (NFC) Operating Modes

NFC is a short-range wireless connectivity technology operating at **13.56 MHz** with data transfer rates up to 424 kbps within a physical range under 10 cm.

<svg viewBox="0 0 900 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="nfcBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
  </defs>
  <rect width="900" height="360" rx="12" fill="url(#nfcBg)" stroke="#34d399" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#ecfdf5" font-family="system-ui, sans-serif" font-size="20" font-weight="700">NFC Operating Modes & Mobile Radio Frequency</text>

  <!-- Card Emulation Mode -->
  <g transform="translate(60, 100)">
    <rect width="230" height="180" rx="8" fill="#065f46" stroke="#34d399" stroke-width="1.5"/>
    <text x="115" y="30" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">Card Emulation</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Apple / Google Pay</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Secure Element (eSE)</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Acts as Passive Card</text>
  </g>

  <!-- Reader / Writer Mode -->
  <g transform="translate(335, 100)">
    <rect width="230" height="180" rx="8" fill="#047857" stroke="#6ee7b7" stroke-width="1.5"/>
    <text x="115" y="30" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">Reader / Writer</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Scans NFC Tags</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• Reads NDEF Data</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Smart Posters & Transport</text>
  </g>

  <!-- Peer-to-Peer Mode -->
  <g transform="translate(610, 100)">
    <rect width="230" height="180" rx="8" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="115" y="30" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="14">Peer-to-Peer (P2P)</text>
    <text x="15" y="70" fill="#a7f3d0" font-family="system-ui" font-size="12">• Android Beam / Exchange</text>
    <text x="15" y="100" fill="#a7f3d0" font-family="system-ui" font-size="12">• ISO/IEC 18092 Standard</text>
    <text x="15" y="130" fill="#a7f3d0" font-family="system-ui" font-size="12">• Bidirectional Transfer</text>
  </g>
</svg>

---

## Frequently Asked Questions (FAQs)

### Q1: How does NFC Card Emulation maintain security during mobile payment transactions?
Mobile payment transactions use a Secure Element (or Host Card Emulation - HCE) combined with **Tokenization**. The physical credit card number (PAN) is never transmitted over RF; instead, a dynamic single-use cryptogram token is generated per transaction.
"""

inject_into_de_blog_data('subnet-masks', subnet_masks_md)
inject_into_de_blog_data('static-dynamic', static_dynamic_md)
inject_into_de_blog_data('nfc-mobile', nfc_mobile_md)
