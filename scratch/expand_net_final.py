from generate_dynamodb_and_backend import inject_into_de_blog_data

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

## 3. Cisco IOS Configuration Comparison

### Static Route Command syntax
```text
Router(config)# ip route 10.200.0.0 255.255.0.0 192.168.1.1 130
```

### OSPF Dynamic Routing Configuration
```text
Router(config)# router ospf 1
Router(config-router)# network 10.0.0.0 0.255.255.255 area 0
```

---

## 4. Production Python Route Table Simulator

```python
class RoutingTable:
    def __init__(self):
        self.routes = []

    def add_route(self, prefix, next_hop, ad_value):
        self.routes.append({
            "prefix": prefix,
            "next_hop": next_hop,
            "ad": ad_value
        })
        # Sort routes by Administrative Distance (ascending = highest priority)
        self.routes.sort(key=lambda r: r["ad"])

    def lookup(self, dest_ip):
        # Return route with lowest Administrative Distance
        return self.routes[0] if self.routes else None

table = RoutingTable()
table.add_route("10.0.0.0/8", "192.168.1.1", ad_value=110) # OSPF
table.add_route("10.0.0.0/8", "172.16.0.1", ad_value=1)   # Static Route

best = table.lookup("10.1.2.3")
print("Selected Best Route via AD:", best)
```

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

## 2. 5G NR Spectrum & Architectures

| Band Type | Frequency Range | Throughput | Propagation Distance |
| :--- | :--- | :--- | :--- |
| **Low-Band (Sub-1 GHz)** | 600 - 900 MHz | 50 - 250 Mbps | High (covers 10+ miles) |
| **Mid-Band (Sub-6 GHz)** | 2.5 - 4.2 GHz | 100 - 900 Mbps | Medium (covers 1-3 miles) |
| **High-Band (mmWave)** | 24 - 39 GHz | 1 - 4 Gbps | Short (< 150 meters, blocked by walls) |

---

## 3. Python NDEF Payload Structure Example

```python
# NDEF (NFC Data Exchange Format) Message Parser
class NDEFRecord:
    def __init__(self, tnf, record_type, payload):
        self.tnf = tnf # Type Name Format
        self.record_type = record_type
        self.payload = payload

    def encode(self):
        # Header byte + Type Length + Payload Length
        header = 0x91 if self.tnf == 0x01 else 0x11
        return bytes([header, len(self.record_type), len(self.payload)]) + self.record_type + self.payload

rec = NDEFRecord(tnf=0x01, record_type=b'U', payload=b'\x04github.com')
print("Encoded NDEF Bytes:", rec.encode().hex())
```

---

## Frequently Asked Questions (FAQs)

### Q1: How does NFC Card Emulation maintain security during mobile payment transactions?
Mobile payment transactions use a Secure Element (or Host Card Emulation - HCE) combined with **Tokenization**. The physical credit card number (PAN) is never transmitted over RF; instead, a dynamic single-use cryptogram token is generated per transaction.
"""

inject_into_de_blog_data('static-dynamic', static_dynamic_md)
inject_into_de_blog_data('nfc-mobile', nfc_mobile_md)
