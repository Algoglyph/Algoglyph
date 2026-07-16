import re

SOURCES_CONTENT = r"""
# Comprehensive Guide to Data Sources in Modern Data Engineering

> [!NOTE]
> **Reading Time**: ~25 minutes  
> **Prerequisites**: Basic understanding of databases and network protocols.

Before data can be engineered, transformed, or analyzed, it must be generated and captured. In the modern data ecosystem, the variety, velocity, and volume of data sources have exploded. Data Engineers must be proficient in extracting data from highly structured relational databases, messy application logs, rate-limited APIs, and real-time IoT streams. 

This guide provides a deep, technical dive into the primary categories of data sources, how they operate under the hood, and the industry-standard methods for ingesting them into your data platform.

---

## 1. Operational Databases (OLTP)

The bedrock of most business data is the Operational Database. These are Online Transaction Processing (OLTP) systems designed for fast, frequent read/write operations by user-facing applications. 

### Characteristics
*   **Systems**: PostgreSQL, MySQL, SQL Server, Oracle.
*   **Data Structure**: Highly normalized, relational schemas enforced by foreign keys and constraints.
*   **Challenges**: Extracting data without locking tables or degrading performance for the live application.

### Extraction Method: Change Data Capture (CDC)
Historically, engineers used batch jobs to run `SELECT * FROM table WHERE updated_at > ?`. This is inefficient and puts a heavy load on the database. The modern standard is **Change Data Capture (CDC)**.

CDC tools do not query the tables directly. Instead, they read the database's internal transaction logs (e.g., the Write-Ahead Log or WAL in PostgreSQL, the Binlog in MySQL). Every insert, update, and delete is recorded in these logs before being applied to the disk.

**Architecture of a CDC Pipeline:**
```mermaid
graph LR
    A[PostgreSQL Primary DB] -->|Writes to| B[(WAL Log)]
    B -->|Reads stream| C[Debezium Connector]
    C -->|Produces JSON| D[Apache Kafka Topic]
    D -->|Consumes stream| E[Data Warehouse/Lake]
```

### Code Example: Debezium Connector Configuration
Debezium is the open-source standard for CDC. Here is an example of a Kafka Connect configuration to stream changes from a Postgres database:

```json
{
  "name": "inventory-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "tasks.max": "1",
    "database.hostname": "postgres.local",
    "database.port": "5432",
    "database.user": "postgres",
    "database.password": "postgres",
    "database.dbname" : "inventory",
    "database.server.name": "dbserver1",
    "plugin.name": "pgoutput",
    "table.include.list": "public.orders,public.customers"
  }
}
```

When a user updates their email, Debezium pushes a message to Kafka that looks like this:
```json
{
  "before": { "id": 1, "email": "old@example.com" },
  "after": { "id": 1, "email": "new@example.com" },
  "op": "u", 
  "ts_ms": 1612452054321
}
```

---

## 2. Application APIs (REST & GraphQL)

Modern companies rely heavily on SaaS (Software as a Service). Customer support data lives in Zendesk, payment data in Stripe, and CRM data in Salesforce. To analyze this data holistically, it must be ingested via APIs.

### Challenges of API Ingestion
1.  **Rate Limiting**: APIs strictly limit how many requests you can make per minute (e.g., HTTP 429 Too Many Requests).
2.  **Pagination**: You cannot download 10 million rows in one request. You must page through the data using cursors or offsets.
3.  **Authentication**: OAuth 2.0 token refreshes, API keys, or JWTs.
4.  **Schema Instability**: SaaS providers can (and will) change their JSON response payloads without notifying you.

### Code Example: Robust API Extraction with Python
A naive `requests.get()` is not enough. You need exponential backoff and pagination handling.

```python
import requests
import time
from typing import List, Dict

def fetch_data_with_backoff(api_url: str, api_key: str, max_retries: int = 5) -> List[Dict]:
    headers = {"Authorization": f"Bearer {api_key}"}
    results = []
    next_page_url = api_url
    
    while next_page_url:
        for attempt in range(max_retries):
            response = requests.get(next_page_url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                results.extend(data.get('items', []))
                # Grab the cursor for the next page
                next_page_url = data.get('pagination', {}).get('next_cursor_url')
                break # Success, exit retry loop
                
            elif response.status_code == 429: # Rate Limited
                retry_after = int(response.headers.get("Retry-After", 2 ** attempt))
                print(f"Rate limited. Waiting {retry_after} seconds.")
                time.sleep(retry_after)
                
            else:
                response.raise_for_status()
                
        else:
            raise Exception(f"Max retries exceeded for URL {next_page_url}")
            
    return results
```

---

## 3. Log Files and Telemetry

Servers, containers, and applications generate massive amounts of log data. Logs are critical for security auditing, performance monitoring, and debugging.

### Characteristics
*   **Format**: Can be structured (JSON lines) or highly unstructured (plain text).
*   **Volume**: Enormous. A single web cluster can generate terabytes of logs daily.
*   **Velocity**: Continuous stream.

### Log Shipping Architecture
Data Engineers rarely write custom scripts to move logs. Instead, they use "Log Shippers" or "Agents" deployed directly on the servers.

1.  **Filebeat/Fluent Bit**: Lightweight agents installed on the edge nodes. They tail log files and forward them.
2.  **Logstash/Fluentd**: Heavier aggregators that receive logs from edge agents, parse them (e.g., using Regex/Grok), and route them to destinations.
3.  **Destinations**: Elasticsearch (for text search) or AWS S3 (for cheap, long-term archival).

### Code Example: Parsing Unstructured Logs
If you are forced to process unstructured logs (like old Apache web server logs), you often need complex regular expressions.

```python
import re

log_line = '127.0.0.1 - frank [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326'

# The standard Common Log Format regex
log_pattern = re.compile(
    r'(?P<ip>\d+\.\d+\.\d+\.\d+) - '
    r'(?P<user>\S+) '
    r'\[(?P<timestamp>.*?)\] '
    r'"(?P<method>\S+) (?P<path>\S+) (?P<protocol>\S+)" '
    r'(?P<status>\d+) '
    r'(?P<bytes>\d+)'
)

match = log_pattern.match(log_line)
if match:
    parsed_dict = match.groupdict()
    print(parsed_dict)
```

---

## 4. Event Streams and Clickstream Data

Understanding user behavior requires tracking every interaction: clicks, scrolls, form submissions, and page views. This is known as clickstream data.

### Characteristics
*   **Tools**: Snowplow, Segment, Amplitude.
*   **Challenge**: The sheer volume of data can overwhelm a standard HTTP API. If your database goes down, you lose the events permanently.

### Architecture: The Buffer Pattern
To handle high-throughput event streams, engineers always place a distributed message broker (like Apache Kafka or AWS Kinesis) between the event producers and the database. This acts as a shock absorber.

```mermaid
graph TD
    A[Web Browser Frontend] -->|HTTP POST JSON| B[API Gateway]
    C[iOS/Android App] -->|HTTP POST JSON| B
    B -->|Produce| D[Apache Kafka Cluster]
    D -->|Consume (Batch)| E[Snowflake / BigQuery]
    D -->|Consume (Real-time)| F[Fraud Detection Model]
```

### Code Example: Kafka Event Producer
Here is how an application backend might asynchronously fire an event to a Kafka topic when a user makes a purchase.

```python
from kafka import KafkaProducer
import json

# Initialize producer with JSON serialization
producer = KafkaProducer(
    bootstrap_servers=['kafka-broker1:9092', 'kafka-broker2:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

def track_purchase(user_id: int, item_id: str, price: float):
    event_payload = {
        "event_type": "purchase_completed",
        "user_id": user_id,
        "item_id": item_id,
        "price": price,
        "timestamp_utc": "2023-10-27T14:32:00Z"
    }
    
    # Asynchronously send the event to the 'clickstream' topic
    producer.send(
        topic='clickstream', 
        key=str(user_id).encode('utf-8'),
        value=event_payload
    )

track_purchase(8472, "SKU-992", 149.99)
producer.flush() 
```

---

## 5. Mobile Apps and IoT (Internet of Things)

IoT devices (smart thermostats, connected cars, industrial sensors) introduce a unique set of data generation challenges.

### Challenges
1.  **Unreliable Networks**: Cars drive through tunnels; sensors lose Wi-Fi. Devices will drop offline and suddenly upload 4 hours of buffered data at once.
2.  **Out-of-Order Events**: Because of network issues, an event that happened at 1:00 PM might arrive at the server *after* an event that happened at 1:05 PM.
3.  **Protocol limitations**: HTTP is often too heavy for embedded devices.

### IoT Solutions
*   **Protocols**: **MQTT** (Message Queuing Telemetry Transport) is the standard. It is incredibly lightweight and operates on a pub/sub model optimized for high latency networks.
*   **Storage**: Time-Series Databases (TSDB) like InfluxDB or TimescaleDB. These are optimized for fast ingestion of millions of data points indexed strictly by time.

---

## 6. Unstructured Data (Media and Documents)

Not all data fits into neat JSON objects or SQL tables. Unstructured data accounts for an estimated 80% of all data generated today.

### Types of Unstructured Data
*   **Media**: Images, Video, Audio.
*   **Documents**: PDFs, Emails, raw text files.

### Engineering Pipeline for Unstructured Data
You do not store unstructured data in a database. You store it in an Object Store (Data Lake) and extract *metadata* about it.

1.  **Ingestion**: Files are uploaded directly to AWS S3, Google Cloud Storage, or Azure Blob Storage.
2.  **Trigger**: The upload triggers an event (e.g., an AWS Lambda function).
3.  **Processing**: The function analyzes the file using ML APIs (e.g., AWS Rekognition for images).
4.  **Storage**: The extracted metadata is saved to a relational database or search index (Elasticsearch), linking back to the S3 URI.

---

## Summary and Best Practices

When designing a data ingestion architecture, refer to this matrix to choose the right approach:

| Source Type | Example | Ingestion Pattern | Best Tooling | Challenge |
| :--- | :--- | :--- | :--- | :--- |
| **Relational DB** | PostgreSQL, MySQL | Change Data Capture (CDC) | Debezium, Fivetran | Avoiding locking tables; schema drift. |
| **SaaS API** | Salesforce, Zendesk | Scheduled Batch/Micro-batch | Airbyte, Custom Python, dbt | Rate limits, pagination, changing endpoints. |
| **Application Logs**| Web Servers, k8s pods | Streaming Agents | FluentBit, Filebeat | Huge volumes, parsing unstructured text. |
| **Clickstream** | Website tracking | Event Streaming via Broker | Snowplow, Apache Kafka | High throughput, requiring exactly-once semantics. |
| **IoT / Edge** | Sensors, Vehicles | Lightweight Pub/Sub | MQTT, AWS IoT Core | Out-of-order data, intermittent network drops. |
| **Unstructured** | PDFs, Images, Audio | Object Storage + ML processing| AWS S3, Azure Blob | Difficult to query without pre-processing ML models. |

> [!TIP]
> **Always decouple ingestion from processing.** Whether pulling from an API or receiving a webhook, your ingestion layer's *only* job is to save the raw data as fast as possible to a Data Lake or Message Queue. Do not attempt to transform the data during the initial extraction phase; if the transformation fails, you risk losing the raw data entirely.
"""

CONSIDERATIONS_CONTENT = r"""
# Architectural Considerations for Data Collection at Scale

> [!NOTE]
> **Reading Time**: ~25 minutes  
> **Prerequisites**: Familiarity with ETL pipelines and distributed systems.

Data collection is rarely as simple as writing a Python script that copies files from an SFTP server to Amazon S3. In a production environment, data pipelines are complex, distributed software systems that must operate continuously. They will encounter network timeouts, malformed payloads, API changes, and hardware failures. 

A Junior Data Engineer writes a script that works when everything is perfect. A Senior Data Engineer designs a system that expects failure, mitigates damage, and recovers automatically. This guide explores the critical architectural considerations for robust data collection.

---

## 1. Schema Evolution and Data Contracts

One of the most frequent causes of pipeline failure is **Schema Drift**. This occurs when the structure of the incoming data changes unexpectedly.

*   A software engineer renames the `customer_id` column to `user_id` in the production database.
*   A third-party API changes a `price` field from a float (`19.99`) to a string (`"$19.99"`).
*   A new column is added to a table, and the pipeline isn't aware of it.

If your pipeline rigidly expects a specific schema, it will crash. If it is too flexible, it might load garbage data into your pristine Data Warehouse, destroying trust in the analytics platform.

### The Solution: Data Contracts and Schema Registries
A **Data Contract** is an agreement between the data producers (software engineers) and the data consumers (data engineers). It defines the exact schema, data types, and SLA of the data being generated.

To enforce this programmatically, systems like Kafka use a **Schema Registry**. Data is serialized using strict formats like **Avro** or **Protobuf** instead of flexible JSON.

### Code Example: Defining an Avro Schema
Here is an Avro schema definition. If a producer attempts to send a message that violates this schema (e.g., omitting the required `email` field), the Schema Registry will reject it *before* it enters the pipeline.

```json
{
  "type": "record",
  "namespace": "com.company.events",
  "name": "UserSignup",
  "fields": [
    { "name": "user_id", "type": "string" },
    { "name": "email", "type": "string" },
    { "name": "signup_date", "type": {"type": "long", "logicalType": "timestamp-millis"} },
    { "name": "marketing_opt_in", "type": "boolean", "default": false },
    { "name": "age", "type": ["null", "int"], "default": null } 
  ]
}
```

---

## 2. State Management and Watermarking

When a batch extraction job runs daily at 2:00 AM, how does it know which records to pull? It cannot pull the entire database every night (Full Load) because the data volume will eventually become too large. It must perform an **Incremental Load**.

### Watermarking
A watermark (or high-water mark) is a pointer that tracks the last successfully processed record. Usually, this is a timestamp (`updated_at`) or a sequential integer (`id`).

**The workflow:**
1.  The pipeline starts and queries the orchestration metadata DB: *"What was my last watermark?"* -> `2023-10-25 14:00:00`
2.  The pipeline queries the source: `SELECT * FROM orders WHERE updated_at > '2023-10-25 14:00:00'`
3.  The data is extracted and loaded into the Data Lake.
4.  The pipeline updates the metadata DB with the new maximum `updated_at` timestamp it processed.

### Code Example: Managing a Watermark in Python

```python
import sqlite3
import pandas as pd
from datetime import datetime

def extract_incremental_data(source_conn):
    # 1. Connect to our internal metadata DB
    meta_conn = sqlite3.connect('pipeline_metadata.db')
    cursor = meta_conn.cursor()
    
    # 2. Get the last watermark
    cursor.execute("SELECT last_watermark FROM state WHERE table_name='orders'")
    result = cursor.fetchone()
    last_watermark = result[0] if result else '1970-01-01 00:00:00'
    
    # 3. Extract new data from the source
    query = f"SELECT * FROM source_orders WHERE updated_at > '{last_watermark}'"
    new_data = pd.read_sql(query, source_conn)
    
    if not new_data.empty:
        # 4. Save data to Data Lake
        new_data.to_parquet(f"s3://datalake/orders/{datetime.now().isoformat()}.parquet")
        
        # 5. Update watermark
        new_max_watermark = new_data['updated_at'].max()
        cursor.execute(
            "REPLACE INTO state (table_name, last_watermark) VALUES ('orders', ?)", 
            (str(new_max_watermark),)
        )
        meta_conn.commit()
        
    meta_conn.close()
```

---

## 3. Idempotency and Exactly-Once Semantics

In distributed systems, networks fail. A pipeline might extract data, send it to the Data Warehouse, but crash before it can update its watermark. The orchestration tool (like Airflow) will automatically retry the failed job.

If your code is not written carefully, that retry will result in **duplicate data**. 

> [!IMPORTANT]
> **Idempotency** is the most critical concept in Data Engineering. An operation is idempotent if running it multiple times produces the *exact same result* as running it once.

### Achieving Idempotency
1.  **Overwrite over Append**: Instead of appending data to a table, write the batch of data to a specific partition directory (e.g., `s3://data/year=2023/month=10/day=26/`). If the job retries, it simply overwrites the files in that specific folder.
2.  **SQL MERGE (Upsert)**: When loading into a relational warehouse, use `MERGE` or `INSERT ... ON CONFLICT UPDATE`.

### Code Example: Idempotent SQL Upsert
If a job runs twice, this PostgreSQL query will update existing rows rather than creating duplicates.

```sql
INSERT INTO dim_orders (order_id, customer_id, total_amount, updated_at)
VALUES 
    (101, 55, 99.99, '2023-10-26 10:00:00'),
    (102, 12, 15.50, '2023-10-26 10:05:00')
ON CONFLICT (order_id) 
DO UPDATE SET 
    customer_id = EXCLUDED.customer_id,
    total_amount = EXCLUDED.total_amount,
    updated_at = EXCLUDED.updated_at;
```

---

## 4. Security, PII, and Compliance

Data Engineers are the gatekeepers of corporate data. Moving data from secure production environments into analytical environments creates massive risk.

### Regulations
*   **GDPR (Europe)** & **CCPA (California)**: Mandate strict controls over Personally Identifiable Information (PII) and grant users the "Right to be Forgotten".
*   **HIPAA (USA)**: Extremely strict regulations regarding healthcare and medical data.

### Mitigation Strategies at Collection
Do not allow raw PII to land in the Data Lake in plain text. It should be handled *in flight* during the extraction phase.

1.  **Drop Columns**: If the analytics team doesn't need the `social_security_number`, do not `SELECT *`. Explicitly omit the column during extraction.
2.  **Hashing**: Convert emails or IDs into irreversible hashes. Analysts can still JOIN tables using the hash, but they cannot see the actual email address.

### Code Example: Hashing PII in Python

```python
import hashlib
import pandas as pd

def mask_pii_data(df: pd.DataFrame) -> pd.DataFrame:
    SECRET_SALT = "x8f9d2a1" 
    
    def hash_email(email):
        if pd.isna(email): return None
        salted_email = email.lower().strip() + SECRET_SALT
        return hashlib.sha256(salted_email.encode()).hexdigest()

    # Apply the hash function to the email column
    if 'email' in df.columns:
        df['email_hash'] = df['email'].apply(hash_email)
        # Drop the original plain-text email column entirely
        df = df.drop(columns=['email'])
        
    return df
```

---

## 5. Handling Bad Data: The Dead Letter Queue (DLQ)

Validation will inevitably fail. An upstream system will send a corrupted JSON payload, or a string will appear where an integer was expected. 

**Do not let one bad record crash the entire batch pipeline.** 
If you are processing 1,000,000 rows and row #999,999 is malformed, failing the entire job is incredibly expensive.

Instead, implement a **Dead Letter Queue (DLQ)** pattern. 

### DLQ Architecture
When the pipeline encounters a record it cannot parse or validate, it catches the exception, routes the *bad* record to a separate, isolated storage area (the DLQ), and continues processing the rest of the healthy data.

```mermaid
graph TD
    A[Raw Data Stream] --> B{Validation Logic}
    B -->|Schema Matches| C[Data Warehouse (Clean)]
    B -->|Schema Mismatch / Corrupt| D[Dead Letter Queue S3 Bucket]
    D --> E[Alert to Data Engineering Team]
    E --> F[Manual Fix & Replay Script]
```
Engineers can later inspect the DLQ, fix the parsing logic, and replay the failed messages without affecting the main pipeline flow.

---

## 6. Impact on Source Systems

Data collection must never degrade the performance of the systems generating the data. If an analytical query locks the `users` table and prevents new customers from signing up, the Data Engineer has failed.

### Strategies to Minimize Impact
1.  **Never query the Primary DB**: Analytical extraction should always run against a **Read Replica** database. 
2.  **Off-Peak Execution**: Schedule heavy batch extractions for 3:00 AM on Sundays.
3.  **Change Data Capture (CDC)**: As discussed in the Sources guide, reading the WAL logs via Debezium creates near-zero impact on the database's query performance, making it the safest extraction method for high-traffic databases.

> [!WARNING]
> **Beware of N+1 API Calls**: When extracting from APIs, do not fetch a list of 10,000 User IDs, and then execute a `GET /user/{id}` request inside a for-loop 10,000 times. This will immediately trigger API rate limits and potentially DDOS the SaaS provider. Always utilize bulk export endpoints (e.g., `GET /users?batch=true`) if available.
"""

def main():
    filepath = "src/config/deBlogData.ts"
    with open(filepath, "r") as f:
        content = f.read()

    # Escape all backticks for JS template literal
    safe_sources = SOURCES_CONTENT.replace('`', '\\`')
    safe_cons = CONSIDERATIONS_CONTENT.replace('`', '\\`')

    # Replace the contents
    pattern_sources = re.compile(r"('de-gen-sources':\s*)`.*?`(,)", re.DOTALL)
    content = pattern_sources.sub(lambda m: f"{m.group(1)}`{safe_sources}`{m.group(2)}", content)

    pattern_cons = re.compile(r"('de-gen-considerations':\s*)`.*?`(,)", re.DOTALL)
    content = pattern_cons.sub(lambda m: f"{m.group(1)}`{safe_cons}`{m.group(2)}", content)

    with open(filepath, "w") as f:
        f.write(content)
        
    print("Fixed syntax errors by escaping backticks!")

if __name__ == "__main__":
    main()
