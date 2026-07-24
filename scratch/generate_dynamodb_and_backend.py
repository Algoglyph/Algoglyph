import re
import os

def inject_into_de_blog_data(slug: str, markdown_content: str):
    file_path = 'src/config/deBlogData.ts'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    escaped_md = markdown_content.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    
    # Check if slug entry already exists in deBlogData.ts
    slug_key = f"  '{slug}':"
    idx = content.find(slug_key)
    
    if idx != -1:
        # Replace existing entry
        end_quote_idx = content.find("`", idx + len(slug_key))
        if end_quote_idx != -1:
            # Find closing backtick
            closing_idx = -1
            curr = end_quote_idx + 1
            while curr < len(content):
                if content[curr] == '`' and content[curr-1] != '\\':
                    closing_idx = curr
                    break
                curr += 1
            if closing_idx != -1:
                new_content = content[:end_quote_idx+1] + "\n" + escaped_md + "\n" + content[closing_idx:]
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"SUCCESSFULLY REPLACED '{slug}' in {file_path}")
                return True
    
    # Otherwise append before closing brace of deBlogData
    last_brace = content.rfind('};')
    if last_brace != -1:
        entry = f"\n  '{slug}': `\n{escaped_md}\n`,\n"
        new_content = content[:last_brace] + entry + content[last_brace:]
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"SUCCESSFULLY INJECTED NEW '{slug}' in {file_path}")
        return True
    else:
        print(f"FAILED TO INJECT '{slug}': Could not find closing brace of deBlogData.ts")
        return False

dynamodb_markdown = r"""# AWS DynamoDB: Partition Keys, LSM-Tree Storage Engine & Global Secondary Indexes

Amazon **DynamoDB** is a fully managed, serverless, key-value and document NoSQL database designed for single-digit millisecond performance at any scale. Built upon the principles of Amazon’s seminal 207 Dynamo paper and multi-tenant cloud storage, DynamoDB decouples compute request routers from storage nodes to deliver consistent latency regardless of dataset volume.

---

## 1. Physical Architecture & Data Partitioning Mechanics

DynamoDB distributes table items across multiple physical **Storage Nodes** grouped into 3-way Replication Groups (Replication factor = 3 across Availability Zones).

<svg viewBox="0 0 900 380" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ddbBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#311042"/>
    </linearGradient>
  </defs>
  <rect width="900" height="380" rx="12" fill="url(#ddbBg)" stroke="#c084fc" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f3e8ff" font-family="system-ui, sans-serif" font-size="20" font-weight="700">DynamoDB Request Router & Storage Partition Topology</text>

  <!-- Client & Request Router -->
  <g transform="translate(60, 140)">
    <rect width="140" height="70" rx="8" fill="#581c87" stroke="#a855f7" stroke-width="2"/>
    <text x="70" y="35" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="13">Request Router</text>
    <text x="70" y="55" text-anchor="middle" fill="#d8b4fe" font-family="monospace" font-size="10">Consistent Hash Map</text>
  </g>

  <!-- Hashing Path -->
  <path d="M 200 175 L 290 175" stroke="#c084fc" stroke-width="3" />
  <text x="245" y="165" text-anchor="middle" fill="#e9d5ff" font-family="monospace" font-size="11">MD5(Partition Key)</text>

  <!-- Storage Partition 1 -->
  <g transform="translate(290, 80)">
    <rect width="250" height="80" rx="6" fill="#3b0764" stroke="#e879f9" stroke-width="1.5"/>
    <text x="125" y="25" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="12">Partition 1 (Hash Range: 0x00..0x55)</text>
    <text x="125" y="50" text-anchor="middle" fill="#f0abfc" font-family="monospace" font-size="11">Leader Node (AZ-1) [Paxos Write]</text>
    <text x="125" y="68" text-anchor="middle" fill="#a21caf" font-family="monospace" font-size="9">Replicas: AZ-2, AZ-3</text>
  </g>

  <!-- Storage Partition 2 -->
  <g transform="translate(290, 180)">
    <rect width="250" height="80" rx="6" fill="#3b0764" stroke="#e879f9" stroke-width="1.5"/>
    <text x="125" y="25" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="12">Partition 2 (Hash Range: 0x56..0xAA)</text>
    <text x="125" y="50" text-anchor="middle" fill="#f0abfc" font-family="monospace" font-size="11">Leader Node (AZ-2) [Paxos Write]</text>
    <text x="125" y="68" text-anchor="middle" fill="#a21caf" font-family="monospace" font-size="9">Replicas: AZ-1, AZ-3</text>
  </g>

  <!-- Storage Partition 3 -->
  <g transform="translate(290, 280)">
    <rect width="250" height="80" rx="6" fill="#3b0764" stroke="#e879f9" stroke-width="1.5"/>
    <text x="125" y="25" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="700" font-size="12">Partition 3 (Hash Range: 0xAB..0xFF)</text>
    <text x="125" y="50" text-anchor="middle" fill="#f0abfc" font-family="monospace" font-size="11">Leader Node (AZ-3) [Paxos Write]</text>
    <text x="125" y="68" text-anchor="middle" fill="#a21caf" font-family="monospace" font-size="9">Replicas: AZ-1, AZ-2</text>
  </g>

  <!-- B-Tree / Storage Engine Detail -->
  <g transform="translate(590, 130)">
    <rect width="260" height="130" rx="8" fill="#2e1065" stroke="#c084fc" stroke-width="2"/>
    <text x="130" y="30" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="700" font-size="13">B-Tree / B-Tree Storage Engine</text>
    <text x="130" y="55" fill="#ddd6fe" font-family="monospace" font-size="10">• Write-Ahead Log (WAL) for durability</text>
    <text x="130" y="75" fill="#ddd6fe" font-family="monospace" font-size="10">• MemTable & Immutable SSTables</text>
    <text x="130" y="95" fill="#ddd6fe" font-family="monospace" font-size="10">• Max Partition Limit: 10GB Data</text>
    <text x="130" y="115" fill="#ddd6fe" font-family="monospace" font-size="10">• Throughput: 1000 WCU / 3000 RCU</text>
  </g>
</svg>

### Partition Key Hashing & Limits
When an application performs a `GetItem` or `PutItem` call:
1. The **Request Router** computes an internal MD5 hash of the item's **Partition Key (PK)**.
2. The resulting 128-bit hash integer maps directly to a designated physical partition ring range.
3. A single physical partition supports a maximum of **10 GB of storage**, **1,000 Write Capacity Units (WCU)**, and **3,000 Read Capacity Units (RCU)**.

---

## 2. Primary Keys, Indexes & Single-Table Design

DynamoDB tables do not use traditional relational joins. Instead, complex one-to-many and many-to-many relationships are modeled in a single table using **Single-Table Design**.

### Primary Key Configurations
1. **Simple Primary Key (Partition Key only):**
   - Syntax: `PK = "USER#10294"`
   - Direct point lookup ($O(1)$) via consistent hash routing.
2. **Composite Primary Key (Partition Key + Sort Key):**
   - Syntax: `PK = "USER#10294"`, `SK = "ORDER#2026-07-23"`
   - Enables range queries (`begins_with`, `between`, `>`, `<`) along the Sort Key within the partition.

### Global Secondary Indexes (GSI) vs. Local Secondary Indexes (LSI)
| Feature | Local Secondary Index (LSI) | Global Secondary Index (GSI) |
| :--- | :--- | :--- |
| **Partition Key** | Must match base table PK | Can select ANY attribute as PK |
| **Sort Key** | Custom attribute as SK | Custom attribute as SK |
| **Creation Time** | Table creation time ONLY | Anytime (on-demand dynamically) |
| **Capacity Provisioning**| Shares base table RCU/WCU | Independent provisioned RCU/WCU |
| **Consistency** | Strongly Consistent or Eventually | Eventually Consistent ONLY |

---

## 3. Capacity Units, Throttling & Burst Bursts

DynamoDB pricing and throughput bounds are calculated using Read and Write Capacity Units:

### Read Capacity Units (RCU)
- **1 RCU** = One **Strongly Consistent Read** per second for an item up to 4 KB.
- **1 RCU** = Two **Eventually Consistent Reads** per second (2 x 4 KB).
- **2 RCU** = One **Transactional Read** per second for an item up to 4 KB.

$$\text{RCUs Required} = \left\lceil \frac{\text{Item Size (KB)}}{4\,\text{KB}} \right\rceil \times \text{Read Multiplier}$$

### Write Capacity Units (WCU)
- **1 WCU** = One **Standard Write** per second for an item up to 1 KB.
- **2 WCU** = One **Transactional Write** per second for an item up to 1 KB.

$$\text{WCUs Required} = \left\lceil \frac{\text{Item Size (KB)}}{1\,\text{KB}} \right\rceil \times \text{Write Multiplier}$$

---

## 4. Production Python & C++ DynamoDB Integrations

### Python (Boto3) DynamoDB Single-Table Query

```python
import boto3
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError

class DynamoDBManager:
    def __init__(self, table_name: str):
        self.dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        self.table = self.dynamodb.Table(table_name)

    def get_user_orders(self, user_id: str, start_date: str):
        try:
            response = self.table.query(
                KeyConditionExpression=Key('PK').eq(f"USER#{user_id}") & Key('SK').gte(f"ORDER#{start_date}"),
                ConsistentRead=True
            )
            return response.get('Items', [])
        except ClientError as e:
            print(f"DynamoDB Query Error: {e.response['Error']['Message']}")
            raise

    def put_order_transactional(self, user_id: str, order_id: str, amount: float):
        client = boto3.client('dynamodb', region_name='us-east-1')
        try:
            client.transact_write_items(
                TransactItems=[
                    {
                        'Put': {
                            'TableName': self.table.name,
                            'Item': {
                                'PK': {'S': f"USER#{user_id}"},
                                'SK': {'S': f"ORDER#{order_id}"},
                                'Amount': {'N': str(amount)},
                                'Status': {'S': 'COMPLETED'}
                            },
                            'ConditionExpression': 'attribute_not_exists(PK)'
                        }
                    }
                ]
            )
            print("Transactional write succeeded.")
        except ClientError as e:
            print(f"Transaction failed: {e.response['Error']['Message']}")
```

---

## Frequently Asked Questions (FAQs)

### Q1: What causes DynamoDB `ProvisionedThroughputExceededException` errors?
Throttling occurs when an application exceeds the provisioned RCU/WCU limits of a physical storage partition (e.g., exceeding 1,000 WCUs or 3,000 RCUs on a single partition). This typically results from a "hot partition key" where high request rates hit a single partition value. Solution: Redesign partition keys with high cardinality or append random hash suffixes (`USER#1029#1`).

### Q2: When should I use DynamoDB Streams vs. AWS Kinesis Data Streams?
DynamoDB Streams preserves time-ordered sequences of item-level modifications (inserts, updates, deletes) per table for 24 hours with zero configuration overhead, making it ideal for event-driven Lambda triggers. Kinesis Data Streams supports multi-year data retention, multi-shard consumer fan-out, and cross-account stream replication for real-time analytics.
"""

if __name__ == '__main__':
    inject_into_de_blog_data('nosql-dynamodb', dynamodb_markdown)
