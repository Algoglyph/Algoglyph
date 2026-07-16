import json

articles = {
    "de-message-tools": """# Message Brokers and Event Streaming

Message brokers and event streaming platforms form the central nervous system of modern data architectures. While often used interchangeably, traditional message queues (like RabbitMQ) and log-based event streaming platforms (like Apache Kafka) have fundamentally different storage mechanisms, delivery guarantees, and consumption models.

### Queue-Based vs. Log-Based Architectures

<svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="600" height="280" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  
  <!-- RabbitMQ (Queue-based) -->
  <text x="30" y="30" fill="#f59e0b" font-size="13" font-family="sans-serif" font-weight="bold">Message Queue (e.g., RabbitMQ)</text>
  <g transform="translate(30, 50)">
    <!-- Publisher -->
    <rect x="0" y="20" width="80" height="40" rx="4" fill="#27272a" stroke="#f59e0b"/>
    <text x="40" y="44" fill="#f4f4f5" font-size="11" font-family="sans-serif" text-anchor="middle">Publisher</text>
    
    <!-- Exchange to Queue -->
    <path d="M 80 40 L 130 40" stroke="#f4f4f5" stroke-width="2" marker-end="url(#arrow)"/>
    <circle cx="150" cy="40" r="20" fill="#3b82f6"/>
    <text x="150" y="44" fill="#000" font-size="10" font-family="sans-serif" text-anchor="middle">Exchange</text>
    
    <path d="M 170 40 L 220 40" stroke="#f4f4f5" stroke-width="2"/>
    
    <!-- Queue -->
    <rect x="220" y="25" width="120" height="30" rx="4" fill="#10b981" fill-opacity="0.2" stroke="#10b981"/>
    <!-- Messages in queue -->
    <rect x="225" y="30" width="20" height="20" fill="#10b981"/>
    <rect x="250" y="30" width="20" height="20" fill="#10b981"/>
    <rect x="275" y="30" width="20" height="20" fill="#10b981"/>
    <text x="280" y="15" fill="#10b981" font-size="10" font-family="sans-serif" text-anchor="middle">Queue (Transient)</text>
    
    <!-- Consumer (Destructive Read) -->
    <path d="M 340 40 L 390 40" stroke="#ef4444" stroke-width="2" stroke-dasharray="4"/>
    <text x="365" y="35" fill="#ef4444" font-size="10" font-family="sans-serif" text-anchor="middle">ACK / DELETE</text>
    
    <rect x="390" y="20" width="80" height="40" rx="4" fill="#27272a" stroke="#a855f7"/>
    <text x="430" y="44" fill="#f4f4f5" font-size="11" font-family="sans-serif" text-anchor="middle">Consumer</text>
  </g>

  <!-- Kafka (Log-based) -->
  <text x="30" y="150" fill="#3b82f6" font-size="13" font-family="sans-serif" font-weight="bold">Event Streaming (e.g., Apache Kafka)</text>
  <g transform="translate(30, 170)">
    <!-- Producer -->
    <rect x="0" y="20" width="80" height="40" rx="4" fill="#27272a" stroke="#3b82f6"/>
    <text x="40" y="44" fill="#f4f4f5" font-size="11" font-family="sans-serif" text-anchor="middle">Producer</text>
    
    <path d="M 80 40 L 130 40" stroke="#f4f4f5" stroke-width="2"/>
    
    <!-- Partition Log -->
    <rect x="130" y="25" width="210" height="30" rx="4" fill="#a855f7" fill-opacity="0.2" stroke="#a855f7"/>
    <!-- Events -->
    <rect x="135" y="30" width="20" height="20" fill="#a855f7"/>
    <rect x="160" y="30" width="20" height="20" fill="#a855f7"/>
    <rect x="185" y="30" width="20" height="20" fill="#a855f7"/>
    <rect x="210" y="30" width="20" height="20" fill="#a855f7"/>
    <rect x="235" y="30" width="20" height="20" fill="#a855f7"/>
    <text x="235" y="15" fill="#a855f7" font-size="10" font-family="sans-serif" text-anchor="middle">Partition Log (Immutable, Persistent)</text>
    
    <!-- Consumers (Independent Offsets) -->
    <path d="M 170 55 L 170 70 L 390 70" stroke="#10b981" stroke-width="2" fill="none"/>
    <path d="M 220 25 L 220 10 L 390 10" stroke="#f59e0b" stroke-width="2" fill="none"/>
    
    <rect x="390" y="-5" width="80" height="30" rx="4" fill="#27272a" stroke="#f59e0b"/>
    <text x="430" y="14" fill="#f4f4f5" font-size="10" font-family="sans-serif" text-anchor="middle">App 1 (Offset 3)</text>
    
    <rect x="390" y="55" width="80" height="30" rx="4" fill="#27272a" stroke="#10b981"/>
    <text x="430" y="74" fill="#f4f4f5" font-size="10" font-family="sans-serif" text-anchor="middle">App 2 (Offset 1)</text>
  </g>
</svg>

In **RabbitMQ**, messages are routed via Exchanges into Queues. When a consumer reads and acknowledges a message, it is physically deleted from the queue. This is a "smart broker, dumb consumer" model.
In **Apache Kafka**, events are appended to an immutable, append-only log (partition). The broker persists the data to disk for a configured retention period (e.g., 7 days, or indefinitely). Consumers track their own reading position via an "offset." Multiple independent consumer groups can read the exact same data at different paces without destroying it. This is a "dumb broker, smart consumer" model.

### Deep Dive: Apache Kafka Mechanisms

Kafka scales horizontally by splitting a **Topic** into multiple **Partitions**. Each partition is distributed across different brokers.

1. **Producer Routing**: When writing to Kafka, producers use a partitioner to decide which partition an event lands in. If a key is provided (e.g., `user_id`), Kafka hashes the key to ensure all events for that user land in the same partition, guaranteeing strict ordering per user.
2. **Consumer Groups**: A consumer group is a collection of consumers working together to process a topic. Kafka assigns each partition to exactly one consumer within the group, allowing parallel processing up to the number of partitions.
3. **Replication and ISR**: To survive broker failures, partitions are replicated. The leader handles reads/writes, while followers passively replicate. If a follower is up-to-date, it belongs to the In-Sync Replica (ISR) list.

#### Implementing a Producer and Consumer (Python)

Using `confluent-kafka` (which wraps librdkafka for high performance), we can implement a highly available producer and consumer.

```python
from confluent_kafka import Producer, Consumer
import json

# --- PRODUCER ---
producer_conf = {
    'bootstrap.servers': 'broker-1:9092,broker-2:9092',
    'client.id': 'python-producer',
    'acks': 'all',  # Wait for leader and all ISR to acknowledge
    'enable.idempotence': True # Prevent duplicates on network retries
}
producer = Producer(producer_conf)

def delivery_report(err, msg):
    if err:
        print(f"Delivery failed: {err}")
    else:
        print(f"Delivered to {msg.topic()} [{msg.partition()}] at offset {msg.offset()}")

# Produce an event with a key for strict ordering
event_data = {"user_id": 42, "action": "checkout"}
producer.produce(
    topic='user-clicks',
    key=str(event_data["user_id"]),
    value=json.dumps(event_data),
    callback=delivery_report
)
producer.flush() # Block until all messages are delivered

# --- CONSUMER ---
consumer_conf = {
    'bootstrap.servers': 'broker-1:9092,broker-2:9092',
    'group.id': 'analytics-click-processor',
    'auto.offset.reset': 'earliest', # Start from beginning if no offset is committed
    'enable.auto.commit': False      # Manual commit for exactly-once semantics
}
consumer = Consumer(consumer_conf)
consumer.subscribe(['user-clicks'])

while True:
    msg = consumer.poll(1.0)
    if msg is None: continue
    if msg.error():
        print(f"Consumer error: {msg.error()}")
        continue
        
    print(f"Processing: {msg.value().decode('utf-8')}")
    # Explicitly commit offset only after successful processing
    consumer.commit(msg)
```

### System Architecture Trade-offs

| Feature | RabbitMQ (Message Queue) | Apache Kafka (Event Streaming) | Apache Pulsar (Next-Gen) |
| :--- | :--- | :--- | :--- |
| **Storage Model** | Transient (Delete on ACK) | Persistent (Append-only Log) | Persistent (Tiered Storage via BookKeeper) |
| **Replayability** | No (Once consumed, it's gone) | Yes (By resetting consumer offsets) | Yes (Offset and cursor management) |
| **Routing Flexibility** | High (Complex Exchange bindings) | Low (Static partitioning by key) | Medium (Subscription modes) |
| **Latency vs Throughput** | Sub-millisecond latency, lower throughput | Low latency, extreme throughput | Low latency, extreme throughput |

### Real-World Usage

Companies like Netflix and LinkedIn (where Kafka was invented) use Kafka to process trillions of messages daily. They rely on its disk-based persistence and zero-copy data transfer to decouple massive microservice architectures. When an ML team at Uber wants to train a model on historical ride data, they simply spin up a new consumer group and read the last 30 days of data from Kafka, without impacting the real-time surge pricing microservices that are reading the exact same topic.

### Practice Links
* [Confluent Kafka Python Client Docs](https://docs.confluent.io/kafka-clients/python/current/overview.html): Master idempotent producers and manual offset commits.
  * *Why this is useful:* Teaches you to handle distributed system edge cases like network partitions and duplicate deliveries.
* [RabbitMQ Tutorials (Python/Pika)](https://www.rabbitmq.com/tutorials): Learn Exchange routing topologies.
  * *Why this is useful:* Demonstrates how topic-based pub/sub routing works in traditional AMQP brokers.
""",
    "de-testing-types": """# Testing in Data Engineering

Testing data pipelines is fundamentally different from traditional software testing. In software engineering, if the code is correct, the output is correct. In data engineering, perfect code will still produce broken dashboards if the upstream API silently changes its date format from `MM-DD-YYYY` to `YYYY-MM-DD`. We must test the code (Logic) and test the data (State).

### The Data Testing Pyramid

<svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="600" height="280" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  
  <!-- Pyramid Base: Unit Tests -->
  <polygon points="100,240 500,240 450,180 150,180" fill="#3b82f6" fill-opacity="0.2" stroke="#3b82f6" stroke-width="2"/>
  <text x="300" y="215" fill="#3b82f6" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle">Unit Testing (Code Logic)</text>
  <text x="300" y="232" fill="#f4f4f5" font-size="10" font-family="sans-serif" text-anchor="middle">Fast, deterministic. Mocks data. Runs in CI.</text>

  <!-- Pyramid Middle: Integration Tests -->
  <polygon points="160,170 440,170 390,110 210,110" fill="#a855f7" fill-opacity="0.2" stroke="#a855f7" stroke-width="2"/>
  <text x="300" y="145" fill="#a855f7" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle">Integration Testing</text>
  <text x="300" y="162" fill="#f4f4f5" font-size="10" font-family="sans-serif" text-anchor="middle">Tests against real engines (Postgres, Spark). Runs in CI.</text>

  <!-- Pyramid Top: Data Quality Tests -->
  <polygon points="220,100 380,100 300,30" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="2"/>
  <text x="300" y="75" fill="#10b981" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle">Data Quality</text>
  <text x="300" y="92" fill="#f4f4f5" font-size="10" font-family="sans-serif" text-anchor="middle">Tests production data. Runs in CD / Pipeline.</text>
</svg>

### 1. Unit Testing Data Transformations

Unit tests verify that specific transformation functions work exactly as expected. In Python/Spark environments, we use tools like `pytest` and `chispa` to assert equality between small, hardcoded mock DataFrames and the output of our functions.

```python
import pytest
from chispa.dataframe_comparer import assert_df_equality
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, StringType, IntegerType

def anonymize_users(df):
    \"\"\"Hashes the user_id and drops the plaintext email.\"\"\"
    from pyspark.sql.functions import sha2, col
    return df.withColumn("hashed_id", sha2(col("user_id").cast("string"), 256)) \\
             .drop("email")

def test_anonymize_users(spark: SparkSession):
    # 1. Arrange: Create mock input data
    input_schema = StructType([
        StructField("user_id", IntegerType()),
        StructField("email", StringType())
    ])
    input_df = spark.createDataFrame([
        (1, "alice@example.com"),
        (2, "bob@example.com")
    ], input_schema)
    
    # 2. Act: Run the transformation
    result_df = anonymize_users(input_df)
    
    # 3. Assert: Define expected output and compare
    # Note: sha2(256) of "1" is "6b86b273..."
    expected_df = spark.createDataFrame([
        (1, "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b"),
        (2, "d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35")
    ], ["user_id", "hashed_id"])
    
    assert_df_equality(result_df, expected_df, ignore_nullable=True)
```

### 2. Integration Testing

Integration tests verify that your code interacts correctly with external systems. Instead of mocking the database, modern data engineering relies on **Testcontainers**—spinning up transient, lightweight Docker containers of PostgreSQL, Kafka, or LocalStack (AWS mock) for the duration of the test.

Integration tests catch issues like syntax errors in your SQL queries or schema mismatches that unit tests miss because unit tests use DataFrame logic instead of actual database engines.

### 3. Data Quality Testing (Data Contracts)

While unit and integration tests run during CI (before code is merged), **Data Quality Tests** run in production as part of your Airflow/Prefect DAG. They evaluate the actual state of the data flowing through the pipeline.

**dbt (data build tool)** popularized this by making data tests first-class citizens using declarative YAML configurations.

```yaml
version: 2
models:
  - name: fct_transactions
    description: "Fact table for cleared financial transactions."
    columns:
      - name: transaction_id
        description: "Primary key"
        tests:
          - unique
          - not_null
      - name: amount
        description: "Transaction amount in USD cents."
        tests:
          - accepted_values:
              values: [">0"] # Custom macro to prevent negative transactions
      - name: customer_id
        tests:
          - relationships:
              to: ref('dim_customers')
              field: customer_id
```
When `dbt test` runs, it compiles these YAML definitions into raw SQL `SELECT` statements that search for violating rows. If any row is returned, the pipeline fails, preventing corrupted data from bleeding into downstream BI dashboards.

### Framework Trade-offs

| Testing Layer | Tooling ecosystem | Cost of execution | Catch Rate for "Silent Failures" |
| :--- | :--- | :--- | :--- |
| **Unit Tests** | `pytest`, `chispa`, `unittest` | Very Low (milliseconds) | Low (Data schemas change silently) |
| **Integration Tests** | `testcontainers`, `moto` | Medium (seconds to minutes) | Medium (Catches dialect mismatches) |
| **Data Quality Tests** | `dbt`, Great Expectations | High (Requires full DB scans) | High (Catches nulls, duplicates, anomalies) |

### Real-World Usage

Companies like Airbnb enforce strict **Data Contracts**. Before a software engineering team can deploy a change that drops a column from an upstream transactional database, the CI pipeline checks the data contract registry. If a downstream data engineering pipeline relies on that column (validated via Great Expectations), the pull request is blocked until the downstream pipeline is updated.

### Practice Links
* [dbt Testing Documentation](https://docs.getdbt.com/docs/build/tests): Learn how to implement schema tests and custom SQL data tests.
  * *Why this is useful:* Shows how declarative YAML compiles down to SQL assertions for production data quality.
* [Chispa GitHub Repository](https://github.com/MrPowers/chispa): Explore PySpark DataFrame equality functions.
  * *Why this is useful:* Essential for building fast, robust unit tests for Spark transformations without managing temporary tables.
""",
    "de-iac-concepts": """# Infrastructure as Code (IaC) in Data Engineering

Infrastructure as Code (IaC) is the practice of provisioning and managing cloud resources using machine-readable definition files, rather than physical hardware configuration or interactive configuration tools (like clicking through the AWS Console). For data engineers, IaC ensures that complex distributed systems—such as Spark clusters, Kafka brokers, IAM roles, and Airflow deployments—are reproducible, version-controlled, and immutable.

### Imperative vs. Declarative Infrastructure

<svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="600" height="280" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  
  <!-- Declarative Model -->
  <text x="30" y="30" fill="#a855f7" font-size="13" font-family="sans-serif" font-weight="bold">Declarative IaC (e.g., Terraform)</text>
  <g transform="translate(30, 50)">
    <!-- Config -->
    <rect x="0" y="20" width="100" height="80" rx="4" fill="#27272a" stroke="#a855f7"/>
    <text x="50" y="40" fill="#a855f7" font-size="11" font-family="sans-serif" text-anchor="middle">State File</text>
    <text x="50" y="60" fill="#f4f4f5" font-size="9" font-family="sans-serif" text-anchor="middle">"I want 3 nodes"</text>
    <text x="50" y="80" fill="#f4f4f5" font-size="9" font-family="sans-serif" text-anchor="middle">"and 1 S3 bucket"</text>
    
    <!-- Engine -->
    <path d="M 110 60 L 160 60" stroke="#f4f4f5" stroke-width="2" marker-end="url(#arrow)"/>
    <circle cx="190" cy="60" r="25" fill="#3b82f6"/>
    <text x="190" y="64" fill="#000" font-size="10" font-family="sans-serif" text-anchor="middle">Plan/Apply</text>
    
    <!-- Drift Detection -->
    <path d="M 220 60 L 270 60" stroke="#f4f4f5" stroke-width="2"/>
    
    <!-- Cloud State -->
    <rect x="270" y="10" width="140" height="100" rx="4" fill="#10b981" fill-opacity="0.2" stroke="#10b981"/>
    <text x="340" y="30" fill="#10b981" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="middle">AWS Environment</text>
    <rect x="290" y="45" width="20" height="20" fill="#10b981"/>
    <rect x="320" y="45" width="20" height="20" fill="#10b981"/>
    <rect x="350" y="45" width="20" height="20" fill="#10b981"/>
    <text x="340" y="85" fill="#f4f4f5" font-size="9" font-family="sans-serif" text-anchor="middle">3 Nodes Running</text>
    
    <!-- Continuous loop for drift -->
    <path d="M 340 10 L 340 -10 L 190 -10 L 190 35" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4" fill="none"/>
    <text x="265" y="-15" fill="#ef4444" font-size="9" font-family="sans-serif" text-anchor="middle">Drift Detection</text>
  </g>
</svg>

In an **imperative** model (like a bash script using the AWS CLI), you write step-by-step commands: "Create a bucket, then attach a policy, then launch a cluster." If the script fails halfway, running it again will attempt to recreate the bucket, throwing an error.
In a **declarative** model (like Terraform), you describe the *desired end state*: "An S3 bucket must exist with this policy." The IaC engine reads the current reality (via Cloud APIs), compares it against a tracked **state file**, computes a directed acyclic graph (DAG) of dependencies, and performs exactly the delta operations (create, update, or delete) required to bridge the gap.

### Deep Dive: Terraform State & Execution

When you run `terraform plan`, Terraform performs the following mathematical reconciliation:
`Desired Configuration (HCL)` - `Current State File (JSON)` = `Execution Delta`

For data engineering, IAM (Identity and Access Management) is the hardest part to get right. Here is an example of spinning up an S3 data lake bucket with a strictly scoped read-only policy for an analytical IAM user, using HashiCorp Configuration Language (HCL):

```hcl
# main.tf

# 1. Define the Bucket
resource "aws_s3_bucket" "datalake_raw" {
  bucket = "company-datalake-raw-zone-prod"
}

# 2. Block public access securely
resource "aws_s3_bucket_public_access_block" "datalake_raw_public_block" {
  bucket                  = aws_s3_bucket.datalake_raw.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 3. Define the minimal read policy dynamically
data "aws_iam_policy_document" "athena_read_policy" {
  statement {
    actions   = ["s3:GetObject", "s3:ListBucket"]
    resources = [
      aws_s3_bucket.datalake_raw.arn,
      "${aws_s3_bucket.datalake_raw.arn}/*"
    ]
  }
}

# 4. Attach policy to an existing analytics role
resource "aws_iam_role_policy" "athena_s3_access" {
  name   = "athena_raw_read_access"
  role   = "data-analyst-role"
  policy = data.aws_iam_policy_document.athena_read_policy.json
}
```

By referencing `aws_s3_bucket.datalake_raw.arn`, Terraform infers a dependency graph. It guarantees the bucket will be created *before* the IAM policy is generated, without you having to write explicit orchestration logic.

### Modern IaC: Pulumi and CDK

While Terraform's HCL is an industry standard, general-purpose languages are increasingly used to define infrastructure. Tools like **Pulumi** and **AWS CDK** allow data engineers to write IaC in Python, TypeScript, or Go.

```python
# Pulumi Python Example
import pulumi
import pulumi_aws as aws

raw_bucket = aws.s3.Bucket("company-datalake-raw-zone-prod",
    acl="private",
    tags={"Environment": "Prod", "Team": "DataEngineering"})

# Pulumi exports the resulting ARN to the state output
pulumi.export('bucket_arn', raw_bucket.arn)
```
Using Python allows for `for` loops, native testing (`pytest`), and generating hundreds of IAM roles programmatically from a list of dataset names, which is cumbersome in raw declarative HCL.

### System Architecture Trade-offs

| IaC Tool | Language | State Management | Cloud Provider Support |
| :--- | :--- | :--- | :--- |
| **Terraform** | HCL (HashiCorp Config) | Requires remote backend (S3/GCS) | Universal (AWS, GCP, Azure, Snowflake, Databricks) |
| **AWS CloudFormation** | JSON/YAML | Managed by AWS seamlessly | AWS Only |
| **Pulumi** | Python, TS, Go | Managed by Pulumi Service or S3 | Universal |

### Real-World Usage

Data teams at scale utilize a **GitOps** workflow. Infrastructure code lives in a repository. When an engineer wants to add a new Kafka topic or a Snowflake warehouse, they open a Pull Request. A CI tool like Atlantis runs `terraform plan` and posts the delta as a comment on the PR. Once a senior engineer reviews and approves the delta, merging the code triggers `terraform apply`. No human ever logs into the cloud console to click buttons.

### Practice Links
* [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs): Learn the resource schemas for S3, EMR, and IAM.
  * *Why this is useful:* Provides the exact declarative syntax required to provision real AWS resources.
* [Pulumi Architecture Patterns](https://www.pulumi.com/docs/using-pulumi/architecture-patterns/): Read about deploying Data Lakes via Python IaC.
  * *Why this is useful:* Demonstrates how imperative programming paradigms apply to declarative state machines.
"""
}

with open("/Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/articles.json", "w") as f:
    json.dump(articles, f, indent=2)
