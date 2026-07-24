import re
import sys
sys.path.append('.')
from scratch.replace_de_blog import replace_de_blog_slug

dynamodb_full_article = """# AWS DynamoDB: Partition Keys, Global Secondary Indexes & Single-Table Design

AWS DynamoDB is a fully managed, serverless key-value and document NoSQL database designed for single-digit millisecond performance at any scale. Rather than relying on traditional relational tables and SQL joins, DynamoDB partitions data across physical storage nodes using consistent hashing algorithms. Understanding its internal routing mechanics, index structures, and single-table data modeling patterns is essential for building scalable backend architectures.

---

## 1. Request Routing and Physical Partition Mechanics

At its core, DynamoDB decouples storage partitions from client request routers. When an application issues a `GetItem` or `PutItem` request, it communicates with a stateless Request Router fleet.

<svg viewBox="0 0 900 400" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ddbBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="routerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="partGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
  </defs>
  <rect width="900" height="400" rx="12" fill="url(#ddbBg)" stroke="#334155" stroke-width="2"/>
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">DynamoDB Request Router & Storage Partition Architecture</text>

  <!-- Client App -->
  <rect x="40" y="150" width="140" height="100" rx="8" fill="#334155" stroke="#64748b" stroke-width="1.5"/>
  <text x="110" y="195" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-weight="600" font-size="14">SDK Client</text>
  <text x="110" y="215" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="11">PutItem(PK="USER#101")</text>

  <!-- Request Router -->
  <rect x="240" y="120" width="180" height="160" rx="8" fill="url(#routerGrad)" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="330" y="160" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="700" font-size="15">Request Router</text>
  <text x="330" y="190" text-anchor="middle" fill="#fef3c7" font-family="monospace" font-size="11">MD5(Partition Key)</text>
  <text x="330" y="210" text-anchor="middle" fill="#fef3c7" font-family="monospace" font-size="11">→ Hash Range Lookup</text>
  <text x="330" y="240" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="10">Locates Partition Node</text>

  <!-- Connection Arrows -->
  <path d="M 180 200 L 240 200" stroke="#f59e0b" stroke-width="2.5" />
  <path d="M 420 170 L 500 120" stroke="#3b82f6" stroke-width="2" />
  <path d="M 420 200 L 500 200" stroke="#3b82f6" stroke-width="2" />
  <path d="M 420 230 L 500 280" stroke="#3b82f6" stroke-width="2" />

  <!-- Partition Storage Fleet -->
  <g transform="translate(500, 70)">
    <rect width="340" height="80" rx="6" fill="url(#partGrad)" stroke="#60a5fa" stroke-width="1.5"/>
    <text x="170" y="32" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="700" font-size="13">Storage Partition 1 (Hash Range 0x0000..0x5555)</text>
    <text x="170" y="55" text-anchor="middle" fill="#bfdbfe" font-family="monospace" font-size="11">Leader (B-Tree SSD Storage Engine)</text>
  </g>

  <g transform="translate(500, 160)">
    <rect width="340" height="80" rx="6" fill="url(#partGrad)" stroke="#60a5fa" stroke-width="1.5"/>
    <text x="170" y="32" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="700" font-size="13">Storage Partition 2 (Hash Range 0x5556..0xAAAA)</text>
    <text x="170" y="55" text-anchor="middle" fill="#bfdbfe" font-family="monospace" font-size="11">Leader (PK="USER#101" stored here)</text>
  </g>

  <g transform="translate(500, 250)">
    <rect width="340" height="80" rx="6" fill="url(#partGrad)" stroke="#60a5fa" stroke-width="1.5"/>
    <text x="170" y="32" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="700" font-size="13">Storage Partition 3 (Hash Range 0xAAAB..0xFFFF)</text>
    <text x="170" y="55" text-anchor="middle" fill="#bfdbfe" font-family="monospace" font-size="11">Leader (B-Tree SSD Storage Engine)</text>
  </g>
</svg>

### Partition Allocation Rules
DynamoDB allocates new storage partitions based on two criteria:
1. **Storage Limits:** A single physical storage partition holds a maximum of **10 GB** of data. When a partition exceeds 10 GB, DynamoDB automatically splits the partition key range in half and provisions a new node.
2. **Throughput Limits:** A single partition supports up to **1,000 WCUs** (Write Capacity Units) or **3,000 RCUs** (Read Capacity Units). If your application requires 4,000 WCUs, DynamoDB provisions at least 4 physical partitions, splitting your throughput limit across them (1,000 WCUs per partition).

---

## 2. Partition Keys, Sort Keys, and Index Structures

DynamoDB tables support two primary key schemas:
- **Simple Primary Key (Partition Key only):** A 1D key. DynamoDB hashes the partition key (`PK`) to assign the item to a physical partition. No two items can share the same `PK`.
- **Composite Primary Key (Partition Key + Sort Key):** A 2D key. All items with the same `PK` are stored together on the same physical partition, sorted in ascending order by the Sort Key (`SK`).

### Secondary Indexes: LSI vs. GSI

To support alternate query patterns without scanning the entire table, DynamoDB provides two types of secondary indexes:

| Dimension | Local Secondary Index (LSI) | Global Secondary Index (GSI) |
| :--- | :--- | :--- |
| **Partition Key** | Must be the **same** as the base table `PK`. | Can be **different** from the base table `PK`. |
| **Sort Key** | Must be a **different** attribute than base table `SK`. | Optional (can specify a custom `SK`). |
| **Creation Time** | Must be defined at table creation time only. | Can be added or removed dynamically at any time. |
| **Storage & Quota** | Shares the 10 GB partition size limit per `PK`. | Has its own independent storage and throughput capacity. |
| **Consistency** | Supports both Strong & Eventual Consistency. | Supports **Eventually Consistent** reads only. |

---

## 3. Single-Table Design Patterns

In relational databases (RDBMS), data normalization splits entities across multiple tables (e.g. `Users`, `Orders`, `OrderItems`). Querying requires expensive SQL `JOIN` operations at runtime.

In DynamoDB, `JOIN` operations do not exist. To fetch a user and all of their recent orders in a single sub-10ms network round-trip, data engineers utilize **Single-Table Design**. Multiple distinct entities are co-located in a single table using generic attribute names `PK` and `SK`.

### Example Single-Table Schema Layout

```text
========================================================================================
PK              | SK                | Type   | Name / Detail       | TotalAmount
========================================================================================
USER#1001       | METADATA#1001     | USER   | Alice Smith         | NULL
USER#1001       | ORDER#2026-0001   | ORDER  | Status: SHIPPED     | $149.50
USER#1001       | ORDER#2026-0002   | ORDER  | Status: PROCESSING  | $89.00
USER#1002       | METADATA#1002     | USER   | Bob Jones           | NULL
USER#1002       | ORDER#2026-0003   | ORDER  | Status: DELIVERED   | $450.00
========================================================================================
```

### Query Mechanics
To fetch Alice's user profile AND all of her orders in one API call:
- Issue a `Query` operation where `PK = "USER#1001"`.
- DynamoDB navigates directly to the storage partition housing `USER#1001` and scans the contiguous B-Tree range for `SK` starting with `METADATA#` and `ORDER#`.
- All matching items return in a single response payload without table scans.

---

## 4. Complete Implementation: Python Boto3 & Single-Table Client

The following Python program demonstrates how to model a Single-Table design using `boto3`, execute transactional writes, and issue partition queries.

```python
import boto3
from botocore.exceptions import ClientError
from typing import Dict, Any, List, Optional

class SingleTableDynamoClient:
    def __init__(self, table_name: str, endpoint_url: Optional[str] = None):
        self.dynamodb = boto3.resource('dynamodb', endpoint_url=endpoint_url)
        self.table = self.dynamodb.Table(table_name)

    def create_user_with_initial_order(self, user_id: str, name: str, email: str, order_id: str, amount: float):
        user_pk = f"USER#{user_id}"
        user_sk = f"METADATA#{user_id}"
        order_sk = f"ORDER#{order_id}"

        user_item = {
            'PK': user_pk,
            'SK': user_sk,
            'EntityType': 'USER',
            'Name': name,
            'Email': email
        }

        order_item = {
            'PK': user_pk,
            'SK': order_sk,
            'EntityType': 'ORDER',
            'OrderId': order_id,
            'Amount': str(amount),
            'Status': 'PLACED'
        }

        print(f"[DynamoDB TransactWrite] Writing User {user_id} and Order {order_id} atomically...")
        try:
            client = self.table.meta.client
            client.transact_write_items(
                TransactItems=[
                    {'Put': {'TableName': self.table.name, 'Item': user_item}},
                    {'Put': {'TableName': self.table.name, 'Item': order_item}}
                ]
            )
            print("[DynamoDB] Transaction succeeded!")
        except ClientError as e:
            print(f"[Error] Transaction failed: {e.response['Error']['Message']}")

    def get_user_and_all_orders(self, user_id: str) -> Dict[str, Any]:
        user_pk = f"USER#{user_id}"
        print(f"\\n[DynamoDB Query] Fetching PK = '{user_pk}'...")
        
        response = self.table.query(
            KeyConditionExpression="PK = :pk",
            ExpressionAttributeValues={":pk": user_pk}
        )

        items = response.get('Items', [])
        user_profile = None
        orders = []

        for item in items:
            if item.get('EntityType') == 'USER':
                user_profile = item
            elif item.get('EntityType') == 'ORDER':
                orders.append(item)

        return {
            'user': user_profile,
            'orders': orders,
            'total_items_fetched': len(items)
        }

if __name__ == "__main__":
    client = SingleTableDynamoClient("AppSingleTable", endpoint_url="http://localhost:8000")
    client.create_user_with_initial_order("U1001", "Alice Smith", "alice@example.com", "ORD-9901", 149.99)
    data = client.get_user_and_all_orders("U1001")
    print(data)
```

---

## 5. Capacity Calculation & Cost Optimization

DynamoDB measures operational capacity using capacity units:

### Read Capacity Units (RCUs)
- **1 RCU** represents **one Strongly Consistent read**, or **two Eventually Consistent reads**, for an item up to **4 KB** in size.
- Items larger than 4 KB consume additional RCUs. For example, reading an 8 KB item strongly consistent requires 2 RCUs.

### Write Capacity Units (WCUs)
- **1 WCU** represents **one write** per second for an item up to **1 KB** in size.
- A 3.5 KB item write rounded up consumes 4 WCUs.

---

## Frequently Asked Questions (FAQs)

### Q1: What is the difference between a Partition Key and a Sort Key in DynamoDB?
A Partition Key (`PK`) determines which physical storage partition holds the item via an MD5 hashing algorithm. A Sort Key (`SK`) orders items within that partition on disk using a B-Tree index, enabling efficient range queries using condition operators like `begins_with`, `between`, and comparison operators (`>`, `<`).

### Q2: What is Single-Table Design in DynamoDB and why is it preferred?
Single-Table Design models multiple application entities (Users, Orders, Items) inside a single DynamoDB table using generic overloaded attributes (`PK`, `SK`). It is preferred because DynamoDB does not support native SQL joins; co-locating related items under the same partition key allows developers to retrieve a parent entity and all child records in a single sub-10ms network round-trip.

### Q3: What is the difference between a Local Secondary Index (LSI) and a Global Secondary Index (GSI)?
An LSI shares the base table's partition key but uses a different sort key, must be defined when the table is created, and shares the 10 GB partition limit. A GSI can define an entirely new partition key and sort key, can be created or destroyed on an existing table at any time, has its own provisioned read/write capacity, and only supports eventual consistency.

### Q4: How does DynamoDB handle hot partitions and throttling?
When traffic is unevenly distributed across partition keys, a single partition can exceed its physical ceiling of 1,000 WCUs or 3,000 RCUs, resulting in `ProvisionedThroughputExceededException` errors. To prevent hot partitions, developers should append a random suffix (salting) to partition keys or use burst capacity and DynamoDB Accelerator (DAX) in-memory caching.

### Q5: How do DynamoDB Streams enable event-driven architectures?
DynamoDB Streams captures a time-ordered sequence of item-level modifications (INSERT, MODIFY, REMOVE) in near real-time. AWS Lambda functions can subscribe to these streams to trigger downstream processes such as updating Elasticsearch indices, sending notification emails, or replicating state across regions.
"""

with open('src/config/deBlogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_content, ok = replace_de_blog_slug(content, 'nosql-dynamodb', dynamodb_full_article)
if ok:
    with open('src/config/deBlogData.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESSFULLY INJECTED FULL DYNAMODB ARTICLE into deBlogData.ts!")
else:
    print("FAILED TO REPLACE DYNAMODB ARTICLE IN deBlogData.ts")
