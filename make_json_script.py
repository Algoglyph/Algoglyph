import json

article1 = """# Data Serving

Data serving is the final, crucial phase of the data engineering lifecycle. After data has been ingested, transformed, and modeled, it must be delivered to consumers. These consumers range from Business Intelligence (BI) dashboards and machine learning models to operational applications and reverse ETL pipelines. The serving layer's primary responsibility is to provide low-latency, highly concurrent access to analytical data.

## Serving Architectures

A serving layer must bridge the gap between heavy, batch-oriented data warehouses and the sub-second response times expected by end users. This is typically achieved through specialized query engines, in-memory caches, or real-time OLAP databases.

### Columnar Memory Layouts

To understand why serving layers are fast, you must understand their memory layouts. Operational databases (OLTP) use row-major layouts, storing all fields of a record contiguously. Analytical serving layers (OLAP) use column-major layouts, storing values of the same column contiguously. This allows the CPU to load only the required columns into cache and vectorize operations.

<svg viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="320" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="14" font-family="sans-serif" font-weight="bold">Row-Oriented vs Column-Oriented Disk Reads</text>
  
  <text x="30" y="70" fill="#fff" font-size="12" font-family="sans-serif">Row-Oriented (PostgreSQL)</text>
  <rect x="30" y="85" width="540" height="40" rx="4" fill="#18181b" stroke="#3f3f46" stroke-width="1"/>
  <rect x="30" y="85" width="100" height="40" rx="4" fill="#ef4444" opacity="0.8"/>
  <text x="80" y="110" fill="#fff" font-size="12" font-family="monospace" text-anchor="middle">ID:1</text>
  <rect x="130" y="85" width="160" height="40" rx="4" fill="#3b82f6" opacity="0.2"/>
  <text x="210" y="110" fill="#fff" font-size="12" font-family="monospace" text-anchor="middle">Name:Alice</text>
  <rect x="290" y="85" width="140" height="40" rx="4" fill="#10b981" opacity="0.8"/>
  <text x="360" y="110" fill="#fff" font-size="12" font-family="monospace" text-anchor="middle">Rev:100</text>
  <rect x="430" y="85" width="100" height="40" rx="4" fill="#ef4444" opacity="0.8"/>
  <text x="480" y="110" fill="#fff" font-size="12" font-family="monospace" text-anchor="middle">ID:2</text>
  <text x="280" y="145" fill="#a1a1aa" font-size="11" font-family="sans-serif" text-anchor="middle">Query: SELECT SUM(Rev) FROM tbl. Loads entire rows into memory.</text>
  
  <text x="30" y="200" fill="#fff" font-size="12" font-family="sans-serif">Column-Oriented (ClickHouse / Parquet)</text>
  <rect x="30" y="215" width="540" height="40" rx="4" fill="#18181b" stroke="#3f3f46" stroke-width="1"/>
  <rect x="30" y="215" width="100" height="40" rx="4" fill="#ef4444" opacity="0.2"/>
  <text x="80" y="240" fill="#fff" font-size="12" font-family="monospace" text-anchor="middle">ID:1</text>
  <rect x="130" y="215" width="100" height="40" rx="4" fill="#ef4444" opacity="0.2"/>
  <text x="180" y="240" fill="#fff" font-size="12" font-family="monospace" text-anchor="middle">ID:2</text>
  <rect x="230" y="215" width="160" height="40" rx="4" fill="#3b82f6" opacity="0.2"/>
  <text x="310" y="240" fill="#fff" font-size="12" font-family="monospace" text-anchor="middle">Name:Alice...</text>
  <rect x="390" y="215" width="90" height="40" rx="4" fill="#10b981" opacity="0.8"/>
  <text x="435" y="240" fill="#fff" font-size="12" font-family="monospace" text-anchor="middle">Rev:100</text>
  <rect x="480" y="215" width="90" height="40" rx="4" fill="#10b981" opacity="0.8"/>
  <text x="525" y="240" fill="#fff" font-size="12" font-family="monospace" text-anchor="middle">Rev:250</text>
  <text x="280" y="275" fill="#a1a1aa" font-size="11" font-family="sans-serif" text-anchor="middle">Query reads contiguous block of 'Rev' values. Skipped columns are never read from disk.</text>
</svg>

## Analytical Query Engine Example

To serve data efficiently to applications, engineers often expose an in-memory OLAP engine via a lightweight API. Here is a practical example using DuckDB, which acts as an embedded analytical database serving a Parquet file over a FastAPI endpoint.

```python
import duckdb
from fastapi import FastAPI, HTTPException
import uvicorn

app = FastAPI()
# Connect to an in-memory DuckDB instance
con = duckdb.connect(database=':memory:', read_only=False)

# Create a view over a highly optimized Parquet file
con.execute(\"\"\"
    CREATE VIEW sales_data AS 
    SELECT * FROM read_parquet('s3://data-lake/serving/sales_agg.parquet')
\"\"\")

@app.get("/api/v1/revenue/region/{region_id}")
def get_revenue_by_region(region_id: str):
    try:
        # DuckDB pushes down the region filter to the Parquet reader
        # It only reads the 'revenue' and 'region_id' columns from disk
        query = \"\"\"
            SELECT sum(revenue) as total_rev
            FROM sales_data
            WHERE region_id = ?
        \"\"\"
        result = con.execute(query, [region_id]).fetchone()
        return {"region_id": region_id, "total_revenue": result[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Comparison of Serving Paradigms

Depending on the latency requirements and the consumer type, data engineering teams utilize different serving patterns.

| Serving Paradigm | Storage Format | Typical Latency | Primary Consumers | Example Technologies |
| :--- | :--- | :--- | :--- | :--- |
| **Data Warehouse** | Internal Columnar | 1s to minutes | BI Tools, Ad-hoc Analysis | Snowflake, BigQuery |
| **Real-Time OLAP** | Indexed Segments | 50ms to 500ms | User-facing Dashboards | Apache Druid, ClickHouse |
| **Data API** | Parquet, In-Memory | 10ms to 100ms | Web Applications, Microservices | DuckDB, Cube.dev |
| **Reverse ETL** | OLTP Database | N/A (Push-based) | SaaS Apps (Salesforce, Zendesk) | Hightouch, Census |

## Caching and High Concurrency

When serving thousands of concurrent users, querying the underlying data warehouse directly will result in massive compute costs and queueing delays. Serving layers implement semantic caching. Instead of caching exact SQL strings, they cache the logical multidimensional cube.

If a user requests revenue for North America, and another requests revenue for the United States (a subset of North America), a semantic layer like Cube.dev knows it can serve the second request by filtering the cached aggregate of the first, drastically reducing load on the primary warehouse.

- [ClickHouse Architecture](https://clickhouse.com/docs/en/architecture): Learn how real-time analytical databases achieve millisecond latency. **Why this is useful:** Explains the internals of primary keys, sparse indexes, and vectorized query execution in modern serving engines.
"""

article2 = """# Database Normalization

Database normalization is the formal process of structuring a relational database to reduce data redundancy and improve data integrity. By breaking large, poorly structured tables into smaller, well-defined tables linked by foreign keys, engineers eliminate the risk of data anomalies during insertions, updates, and deletions.

## Understanding Data Anomalies

An unnormalized table suffers from three primary types of anomalies:
- **Update Anomaly**: If a piece of information is duplicated across multiple rows, updating it requires modifying every instance. If one instance is missed, the database becomes inconsistent.
- **Insertion Anomaly**: If a table records both employee and department data, you cannot add a new department until an employee is hired into it.
- **Deletion Anomaly**: If you delete the last employee in a department, the information about the department itself is lost forever.

## The Normal Forms

Normalization progresses through stages called Normal Forms (NF). Each stage introduces stricter rules about how columns must relate to the primary key.

### First Normal Form (1NF)

To achieve 1NF, a table must satisfy two conditions. First, every column must contain atomic (indivisible) values. Second, there must be no repeating groups of columns. For example, storing an array of phone numbers in a single column violates 1NF.

### Second Normal Form (2NF)

A table is in 2NF if it is in 1NF and contains no partial dependencies. A partial dependency occurs in tables with a composite primary key, where a non-key column depends on only a part of the primary key, rather than the whole key.

<svg viewBox="0 0 600 350" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="350" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="14" font-family="sans-serif" font-weight="bold">Resolving Partial Dependencies (1NF to 2NF)</text>
  
  <text x="30" y="70" fill="#fff" font-size="12" font-family="sans-serif">Unnormalized Table (Composite Key: StudentID, CourseID)</text>
  <rect x="30" y="85" width="540" height="30" rx="4" fill="#18181b" stroke="#3f3f46" stroke-width="1"/>
  <text x="70" y="105" fill="#f87171" font-size="12" font-family="monospace" text-anchor="middle">StudentID</text>
  <text x="170" y="105" fill="#f87171" font-size="12" font-family="monospace" text-anchor="middle">CourseID</text>
  <text x="270" y="105" fill="#fff" font-size="12" font-family="monospace" text-anchor="middle">StudentName</text>
  <text x="410" y="105" fill="#fff" font-size="12" font-family="monospace" text-anchor="middle">CourseFee</text>
  <text x="510" y="105" fill="#fff" font-size="12" font-family="monospace" text-anchor="middle">Grade</text>
  
  <path d="M 70 125 L 70 150 L 270 150 L 270 120" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4"/>
  <text x="170" y="165" fill="#ef4444" font-size="11" font-family="sans-serif" text-anchor="middle">Partial Dependency (Name depends only on StudentID)</text>
  
  <text x="30" y="220" fill="#fff" font-size="12" font-family="sans-serif">2NF Normalized Tables</text>
  
  <!-- Students Table -->
  <rect x="30" y="235" width="180" height="30" rx="4" fill="#18181b" stroke="#3f3f46" stroke-width="1"/>
  <text x="70" y="255" fill="#10b981" font-size="12" font-family="monospace" text-anchor="middle">StudentID</text>
  <text x="150" y="255" fill="#fff" font-size="12" font-family="monospace" text-anchor="middle">StudentName</text>
  
  <!-- Courses Table -->
  <rect x="230" y="235" width="150" height="30" rx="4" fill="#18181b" stroke="#3f3f46" stroke-width="1"/>
  <text x="270" y="255" fill="#10b981" font-size="12" font-family="monospace" text-anchor="middle">CourseID</text>
  <text x="340" y="255" fill="#fff" font-size="12" font-family="monospace" text-anchor="middle">CourseFee</text>
  
  <!-- Grades Table -->
  <rect x="400" y="235" width="170" height="30" rx="4" fill="#18181b" stroke="#3f3f46" stroke-width="1"/>
  <text x="440" y="255" fill="#3b82f6" font-size="12" font-family="monospace" text-anchor="middle">StudentID</text>
  <text x="510" y="255" fill="#3b82f6" font-size="12" font-family="monospace" text-anchor="middle">CourseID</text>
  <text x="560" y="255" fill="#fff" font-size="12" font-family="monospace" text-anchor="middle">Grade</text>
  
  <text x="315" y="310" fill="#a1a1aa" font-size="11" font-family="sans-serif" text-anchor="middle">All non-key attributes now depend on the ENTIRE primary key of their respective tables.</text>
</svg>

### Third Normal Form (3NF)

A table is in 3NF if it is in 2NF and contains no transitive dependencies. A transitive dependency happens when a non-key column depends on another non-key column. For instance, if a table has `ZipCode` and `City`, `City` depends on `ZipCode`. To reach 3NF, you must extract `ZipCode` and `City` into a separate lookup table.

## Implementing Constraints in SQL

Normalization is enforced using Primary Keys (PK) and Foreign Keys (FK). Here is how you implement the 2NF schema from the diagram above using PostgreSQL:

```sql
-- The entities are isolated into independent tables
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL
);

CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    course_fee DECIMAL(10, 2) NOT NULL
);

-- The relationship and grade (which depends on both) is mapped here
CREATE TABLE enrollments (
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    grade CHAR(2),
    PRIMARY KEY (student_id, course_id),
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);
```

## Normalization vs Denormalization Trade-offs

In Data Engineering, you must balance data integrity (OLTP) against read performance (OLAP). Highly normalized databases require complex, CPU-heavy JOIN operations to reconstruct data for analytics. 

| Property | Highly Normalized (3NF) | Denormalized (Star Schema) |
| :--- | :--- | :--- |
| **Primary Use Case** | Operational systems (OLTP) | Data Warehousing (OLAP) |
| **Write Performance** | Excellent (No redundant updates) | Poor (Requires updating many rows) |
| **Read Performance** | Poor (Requires multi-table JOINs) | Excellent (Fewer JOINs, wide rows) |
| **Storage Footprint** | Minimal (No duplication) | Large (High data redundancy) |
| **Data Integrity** | Enforced structurally by FKs | Enforced by application logic/ETL |

- [PostgreSQL Dependency Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html): Official documentation on implementing referential integrity. **Why this is useful:** Teaches the mechanics of `ON DELETE CASCADE` and how the database engine enforces normalization rules.
"""

article3 = """# Database Modelling

Database modelling in data engineering focuses primarily on structuring data for analytical workloads. Unlike operational databases that use Third Normal Form (3NF) to optimize for transaction speed, analytical databases use Dimensional Modeling to optimize for query performance, understandability, and aggregations over massive datasets.

## Dimensional Modeling Concepts

Pioneered by Ralph Kimball, dimensional modeling divides data into two distinct categories: **Fact tables** and **Dimension tables**.

- **Fact Tables**: Store the quantitative metrics or measurements of a business process (e.g., sales amount, page views, transaction duration). They are generally narrow, contain millions or billions of rows, and consist primarily of foreign keys and numeric measures.
- **Dimension Tables**: Provide the context surrounding a business process (e.g., customer details, product attributes, time hierarchy). They are usually wide, contain descriptive textual information, and are heavily indexed.

<svg viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="380" rx="8" fill="#000" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="30" fill="#a855f7" font-size="14" font-family="sans-serif" font-weight="bold">Star Schema Architecture</text>
  
  <!-- Fact Table -->
  <rect x="220" y="120" width="160" height="150" rx="4" fill="#18181b" stroke="#eab308" stroke-width="2"/>
  <rect x="220" y="120" width="160" height="30" fill="#eab308" opacity="0.2"/>
  <text x="300" y="140" fill="#eab308" font-size="12" font-family="sans-serif" font-weight="bold" text-anchor="middle">FACT_SALES</text>
  <text x="230" y="170" fill="#3b82f6" font-size="11" font-family="monospace">date_id (FK)</text>
  <text x="230" y="190" fill="#3b82f6" font-size="11" font-family="monospace">product_id (FK)</text>
  <text x="230" y="210" fill="#3b82f6" font-size="11" font-family="monospace">store_id (FK)</text>
  <text x="230" y="240" fill="#10b981" font-size="11" font-family="monospace">revenue_amount</text>
  <text x="230" y="260" fill="#10b981" font-size="11" font-family="monospace">units_sold</text>
  
  <!-- Dimension Table 1 (Date) -->
  <rect x="30" y="70" width="130" height="100" rx="4" fill="#18181b" stroke="#3b82f6" stroke-width="2"/>
  <rect x="30" y="70" width="130" height="25" fill="#3b82f6" opacity="0.2"/>
  <text x="95" y="87" fill="#3b82f6" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="middle">DIM_DATE</text>
  <text x="40" y="115" fill="#fff" font-size="10" font-family="monospace">date_id (PK)</text>
  <text x="40" y="135" fill="#fff" font-size="10" font-family="monospace">full_date</text>
  <text x="40" y="155" fill="#fff" font-size="10" font-family="monospace">is_weekend</text>
  <path d="M 160 120 L 220 150" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="3"/>
  
  <!-- Dimension Table 2 (Product) -->
  <rect x="440" y="70" width="130" height="100" rx="4" fill="#18181b" stroke="#3b82f6" stroke-width="2"/>
  <rect x="440" y="70" width="130" height="25" fill="#3b82f6" opacity="0.2"/>
  <text x="505" y="87" fill="#3b82f6" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="middle">DIM_PRODUCT</text>
  <text x="450" y="115" fill="#fff" font-size="10" font-family="monospace">product_id (PK)</text>
  <text x="450" y="135" fill="#fff" font-size="10" font-family="monospace">category</text>
  <text x="450" y="155" fill="#fff" font-size="10" font-family="monospace">brand_name</text>
  <path d="M 440 120 L 380 150" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="3"/>

  <!-- Dimension Table 3 (Store) -->
  <rect x="235" y="300" width="130" height="70" rx="4" fill="#18181b" stroke="#3b82f6" stroke-width="2"/>
  <rect x="235" y="300" width="130" height="25" fill="#3b82f6" opacity="0.2"/>
  <text x="300" y="317" fill="#3b82f6" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="middle">DIM_STORE</text>
  <text x="245" y="340" fill="#fff" font-size="10" font-family="monospace">store_id (PK)</text>
  <text x="245" y="360" fill="#fff" font-size="10" font-family="monospace">region_name</text>
  <path d="M 300 300 L 300 270" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="3"/>
</svg>

## Surrogate Keys

In a data warehouse, you should never rely on the primary keys provided by the source operational systems (Natural Keys). Instead, engineers generate **Surrogate Keys**—meaningless integers used exclusively to join dimensions and facts. This protects the warehouse from source system resets and enables the tracking of historical changes over time, known as Slowly Changing Dimensions (SCDs).

## Implementation in SQL

Constructing a Star Schema involves establishing these tables and inserting foreign key constraints (or logical relationships in modern cloud data warehouses like Snowflake, which often ignore strict FK enforcement for performance but rely on the logical structure).

```sql
-- Creating a Dimension Table with a Surrogate Key
CREATE TABLE dim_product (
    product_sk BIGINT IDENTITY(1,1) PRIMARY KEY, -- Surrogate Key
    source_product_id VARCHAR(50),               -- Natural Key
    category VARCHAR(100),
    brand_name VARCHAR(100),
    is_active BOOLEAN,
    valid_from TIMESTAMP,
    valid_to TIMESTAMP
);

-- Creating a Fact Table linking to the Dimension
CREATE TABLE fact_sales (
    sales_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    date_sk BIGINT REFERENCES dim_date(date_sk),
    product_sk BIGINT REFERENCES dim_product(product_sk),
    store_sk BIGINT REFERENCES dim_store(store_sk),
    revenue_amount DECIMAL(18, 4),
    units_sold INT
);

-- Analytical Query leveraging the Star Schema
SELECT 
    p.category, 
    SUM(f.revenue_amount) AS total_revenue
FROM fact_sales f
JOIN dim_product p ON f.product_sk = p.product_sk
WHERE p.is_active = TRUE
GROUP BY p.category
ORDER BY total_revenue DESC;
```

## Modeling Paradigms Compared

As data storage has become cheaper and columnar engines more powerful, data modeling has evolved.

| Architecture | Description | Pros | Cons |
| :--- | :--- | :--- | :--- |
| **Star Schema (Kimball)** | Denormalized dimensions connected directly to central facts. | Intuitive for BI tools, optimal for relational databases. | Some data redundancy in dimensions. |
| **Snowflake Schema** | Dimensions are normalized into sub-dimensions. | Saves storage space, strictly enforces data integrity. | Complex queries requiring multiple deep JOINs. |
| **One Big Table (OBT)** | Facts and dimensions are entirely flattened into a single massive table. | No JOINs required, perfect for columnar analytical databases. | Massive storage footprint, difficult to maintain SCDs. |
| **Data Vault** | Raw data is split into Hubs (keys), Links (relationships), and Satellites (attributes). | Highly scalable, fully auditable history, decoupled sources. | Requires complex views to make data readable for end users. |

- [dbt: What is dimensional modeling?](https://www.getdbt.com/data-knowledge/data-modeling/dimensional-modeling): An industry guide on applying Kimball methodology in modern data stacks. **Why this is useful:** Explains how to implement these paradigms using modern transformation frameworks rather than legacy ETL tools.
"""

result = {
  "de-lifecycle-serving": article1,
  "de-db-normalization": article2,
  "de-db-modelling": article3
}

with open("/Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/make_json.py", "w") as f:
    json.dump(result, f, indent=2)

