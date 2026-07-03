import type { DiagramConfig } from './illustrationData';

export const DE_DIAGRAMS: Record<string, DiagramConfig> = {

  // ===========================
  // INTRODUCTION (5 topics)
  // ===========================
  'de-intro-what-is': {
    title: "What is Data Engineering?",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#3b82f6", fontSize: 12, fontWeight: "bold", textContent: "Data Pipeline Overview" },
      { type: "rect", x: 50, y: 55, width: 90, height: 50, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 95, y: 75, fill: "#ffffff", fontSize: 9, textAnchor: "middle", textContent: "Raw Data" },
      { type: "text", x: 95, y: 90, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "APIs, DBs, Logs" },
      { type: "line", x1: 140, y1: 80, x2: 185, y2: 80, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "line", x1: 180, y1: 77, x2: 185, y2: 80, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 185, y: 55, width: 90, height: 50, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 230, y: 75, fill: "#ffffff", fontSize: 9, textAnchor: "middle", textContent: "ETL / ELT" },
      { type: "text", x: 230, y: 90, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Transform" },
      { type: "line", x1: 275, y1: 80, x2: 320, y2: 80, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "line", x1: 315, y1: 77, x2: 320, y2: 80, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 320, y: 55, width: 90, height: 50, rx: 4, stroke: "#10b981", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 365, y: 75, fill: "#ffffff", fontSize: 9, textAnchor: "middle", textContent: "Warehouse" },
      { type: "text", x: 365, y: 90, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Analytics-Ready" },
      { type: "line", x1: 410, y1: 80, x2: 455, y2: 80, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "line", x1: 450, y1: 77, x2: 455, y2: 80, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 455, y: 55, width: 90, height: 50, rx: 4, stroke: "#a855f7", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 500, y: 75, fill: "#ffffff", fontSize: 9, textAnchor: "middle", textContent: "Dashboards" },
      { type: "text", x: 500, y: 90, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "BI / ML" },
      { type: "text", x: 300, y: 135, fill: "#52525b", fontSize: 8, textAnchor: "middle", textContent: "End-to-end data pipeline: ingest → transform → serve" }
    ]
  },

  'de-intro-vs-ds': {
    title: "Data Engineering vs Data Science",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#a855f7", fontSize: 12, fontWeight: "bold", textContent: "Roles Comparison" },
      { type: "rect", x: 50, y: 48, width: 160, height: 120, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 130, y: 64, fill: "#3b82f6", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "DATA ENGINEER" },
      { type: "line", x1: 60, y1: 70, x2: 200, y2: 70, stroke: "#27272a", strokeWidth: 1 },
      { type: "text", x: 62, y: 84, fill: "#ffffff", fontSize: 8, textContent: "▸ Builds pipelines" },
      { type: "text", x: 62, y: 97, fill: "#ffffff", fontSize: 8, textContent: "▸ Manages infrastructure" },
      { type: "text", x: 62, y: 110, fill: "#ffffff", fontSize: 8, textContent: "▸ Ensures data quality" },
      { type: "text", x: 62, y: 123, fill: "#ffffff", fontSize: 8, textContent: "▸ SQL, Spark, Kafka" },
      { type: "text", x: 62, y: 136, fill: "#ffffff", fontSize: 8, textContent: "▸ Focus: Reliability" },
      { type: "text", x: 62, y: 149, fill: "#71717a", fontSize: 7, textContent: "\"Make data available\"" },
      { type: "rect", x: 260, y: 48, width: 160, height: 120, rx: 4, stroke: "#ec4899", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 340, y: 64, fill: "#ec4899", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "DATA SCIENTIST" },
      { type: "line", x1: 270, y1: 70, x2: 410, y2: 70, stroke: "#27272a", strokeWidth: 1 },
      { type: "text", x: 272, y: 84, fill: "#ffffff", fontSize: 8, textContent: "▸ Builds ML models" },
      { type: "text", x: 272, y: 97, fill: "#ffffff", fontSize: 8, textContent: "▸ Statistical analysis" },
      { type: "text", x: 272, y: 110, fill: "#ffffff", fontSize: 8, textContent: "▸ Feature engineering" },
      { type: "text", x: 272, y: 123, fill: "#ffffff", fontSize: 8, textContent: "▸ Python, R, TensorFlow" },
      { type: "text", x: 272, y: 136, fill: "#ffffff", fontSize: 8, textContent: "▸ Focus: Insights" },
      { type: "text", x: 272, y: 149, fill: "#71717a", fontSize: 7, textContent: "\"Extract value from data\"" },
      { type: "line", x1: 210, y1: 108, x2: 260, y2: 108, stroke: "#a1a1aa", strokeWidth: 1, strokeDasharray: "3,3" },
      { type: "text", x: 235, y: 100, fill: "#f59e0b", fontSize: 7, textAnchor: "middle", textContent: "feeds" }
    ]
  },

  'de-intro-skills': {
    title: "Essential DE Skills",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#10b981", fontSize: 12, fontWeight: "bold", textContent: "Data Engineer Skill Map" },
      { type: "circle", cx: 220, cy: 105, r: 28, stroke: "#f59e0b", strokeWidth: 1.5, fill: "rgba(245,158,11,0.1)" },
      { type: "text", x: 220, y: 108, fill: "#f59e0b", fontSize: 8, fontWeight: "bold", textAnchor: "middle", textContent: "DE Core" },
      { type: "circle", cx: 120, cy: 75, r: 35, stroke: "#3b82f6", strokeWidth: 1.2, fill: "rgba(59,130,246,0.06)" },
      { type: "text", x: 120, y: 72, fill: "#3b82f6", fontSize: 8, fontWeight: "bold", textAnchor: "middle", textContent: "Programming" },
      { type: "text", x: 120, y: 84, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Python, SQL" },
      { type: "line", x1: 155, y1: 82, x2: 192, y2: 98, stroke: "#3b82f6", strokeWidth: 0.8, strokeDasharray: "2,2" },
      { type: "circle", cx: 320, cy: 75, r: 35, stroke: "#10b981", strokeWidth: 1.2, fill: "rgba(16,185,129,0.06)" },
      { type: "text", x: 320, y: 72, fill: "#10b981", fontSize: 8, fontWeight: "bold", textAnchor: "middle", textContent: "Databases" },
      { type: "text", x: 320, y: 84, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "RDBMS, NoSQL" },
      { type: "line", x1: 285, y1: 82, x2: 248, y2: 98, stroke: "#10b981", strokeWidth: 0.8, strokeDasharray: "2,2" },
      { type: "circle", cx: 120, cy: 145, r: 35, stroke: "#ec4899", strokeWidth: 1.2, fill: "rgba(236,72,153,0.06)" },
      { type: "text", x: 120, y: 142, fill: "#ec4899", fontSize: 8, fontWeight: "bold", textAnchor: "middle", textContent: "Cloud" },
      { type: "text", x: 120, y: 154, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "AWS, GCP" },
      { type: "line", x1: 155, y1: 138, x2: 192, y2: 118, stroke: "#ec4899", strokeWidth: 0.8, strokeDasharray: "2,2" },
      { type: "circle", cx: 320, cy: 145, r: 35, stroke: "#a855f7", strokeWidth: 1.2, fill: "rgba(168,85,247,0.06)" },
      { type: "text", x: 320, y: 142, fill: "#a855f7", fontSize: 8, fontWeight: "bold", textAnchor: "middle", textContent: "Big Data" },
      { type: "text", x: 320, y: 154, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Spark, Kafka" },
      { type: "line", x1: 285, y1: 138, x2: 248, y2: 118, stroke: "#a855f7", strokeWidth: 0.8, strokeDasharray: "2,2" }
    ]
  },

  'de-intro-lifecycle': {
    title: "Data Engineering Lifecycle",
    elements: [
      { type: "text", x: 30, y: 28, fill: "#eab308", fontSize: 12, fontWeight: "bold", textContent: "The 5-Stage Lifecycle" },
      { type: "rect", x: 30, y: 50, width: 80, height: 40, rx: 18, stroke: "#3b82f6", strokeWidth: 1.5, fill: "rgba(59,130,246,0.1)" },
      { type: "text", x: 70, y: 73, fill: "#ffffff", fontSize: 8, textAnchor: "middle", textContent: "Generation" },
      { type: "line", x1: 110, y1: 70, x2: 135, y2: 70, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "line", x1: 131, y1: 67, x2: 135, y2: 70, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 135, y: 50, width: 80, height: 40, rx: 18, stroke: "#10b981", strokeWidth: 1.5, fill: "rgba(16,185,129,0.1)" },
      { type: "text", x: 175, y: 73, fill: "#ffffff", fontSize: 8, textAnchor: "middle", textContent: "Storage" },
      { type: "line", x1: 215, y1: 70, x2: 240, y2: 70, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "line", x1: 236, y1: 67, x2: 240, y2: 70, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 240, y: 50, width: 80, height: 40, rx: 18, stroke: "#f59e0b", strokeWidth: 1.5, fill: "rgba(245,158,11,0.1)" },
      { type: "text", x: 280, y: 73, fill: "#ffffff", fontSize: 8, textAnchor: "middle", textContent: "Ingestion" },
      { type: "line", x1: 320, y1: 70, x2: 345, y2: 70, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "line", x1: 341, y1: 67, x2: 345, y2: 70, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 345, y: 50, width: 95, height: 40, rx: 18, stroke: "#ec4899", strokeWidth: 1.5, fill: "rgba(236,72,153,0.1)" },
      { type: "text", x: 393, y: 73, fill: "#ffffff", fontSize: 8, textAnchor: "middle", textContent: "Transformation" },
      { type: "line", x1: 440, y1: 70, x2: 465, y2: 70, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "line", x1: 461, y1: 67, x2: 465, y2: 70, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 465, y: 50, width: 80, height: 40, rx: 18, stroke: "#a855f7", strokeWidth: 1.5, fill: "rgba(168,85,247,0.1)" },
      { type: "text", x: 505, y: 73, fill: "#ffffff", fontSize: 8, textAnchor: "middle", textContent: "Serving" },
      { type: "rect", x: 135, y: 110, width: 300, height: 30, rx: 4, stroke: "#52525b", strokeWidth: 0.8, fill: "#18181b" },
      { type: "text", x: 285, y: 128, fill: "#71717a", fontSize: 8, textAnchor: "middle", textContent: "Undercurrents: Security · Privacy · DataOps · Orchestration · Software Eng" }
    ]
  },

  'de-intro-tech': {
    title: "Choosing Technologies",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#3b82f6", fontSize: 12, fontWeight: "bold", textContent: "Modern Data Stack vs Big Data Stack" },
      { type: "rect", x: 40, y: 48, width: 170, height: 130, rx: 4, stroke: "#10b981", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 125, y: 63, fill: "#10b981", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "MODERN DATA STACK" },
      { type: "line", x1: 50, y1: 69, x2: 200, y2: 69, stroke: "#27272a", strokeWidth: 1 },
      { type: "text", x: 52, y: 83, fill: "#ffffff", fontSize: 8, textContent: "▸ ELT approach" },
      { type: "text", x: 52, y: 96, fill: "#ffffff", fontSize: 8, textContent: "▸ Fivetran → ingestion" },
      { type: "text", x: 52, y: 109, fill: "#ffffff", fontSize: 8, textContent: "▸ Snowflake → storage" },
      { type: "text", x: 52, y: 122, fill: "#ffffff", fontSize: 8, textContent: "▸ dbt → transforms" },
      { type: "text", x: 52, y: 135, fill: "#ffffff", fontSize: 8, textContent: "▸ Looker → BI" },
      { type: "text", x: 52, y: 160, fill: "#71717a", fontSize: 7, textContent: "Cloud-native, managed services" },
      { type: "rect", x: 250, y: 48, width: 170, height: 130, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 335, y: 63, fill: "#f59e0b", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "BIG DATA STACK" },
      { type: "line", x1: 260, y1: 69, x2: 410, y2: 69, stroke: "#27272a", strokeWidth: 1 },
      { type: "text", x: 262, y: 83, fill: "#ffffff", fontSize: 8, textContent: "▸ ETL / streaming" },
      { type: "text", x: 262, y: 96, fill: "#ffffff", fontSize: 8, textContent: "▸ Kafka → streaming" },
      { type: "text", x: 262, y: 109, fill: "#ffffff", fontSize: 8, textContent: "▸ HDFS / S3 → storage" },
      { type: "text", x: 262, y: 122, fill: "#ffffff", fontSize: 8, textContent: "▸ Spark → processing" },
      { type: "text", x: 262, y: 135, fill: "#ffffff", fontSize: 8, textContent: "▸ Airflow → orchestration" },
      { type: "text", x: 262, y: 160, fill: "#71717a", fontSize: 7, textContent: "Self-managed, high control" },
      { type: "text", x: 230, y: 115, fill: "#52525b", fontSize: 8, textAnchor: "middle", textContent: "vs" }
    ]
  },

  // ===========================
  // BASICS (6 topics)
  // ===========================
  'de-basics-programming': {
    title: "Programming Languages for DE",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#3b82f6", fontSize: 12, fontWeight: "bold", textContent: "Language Ecosystem for Data Engineers" },
      { type: "rect", x: 40, y: 50, width: 100, height: 55, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 90, y: 68, fill: "#3b82f6", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "Python" },
      { type: "text", x: 90, y: 82, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "PySpark, Pandas" },
      { type: "text", x: 90, y: 93, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Most Popular" },
      { type: "rect", x: 160, y: 50, width: 100, height: 55, rx: 4, stroke: "#ef4444", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 210, y: 68, fill: "#ef4444", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "Java" },
      { type: "text", x: 210, y: 82, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Hadoop, Flink" },
      { type: "text", x: 210, y: 93, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Enterprise" },
      { type: "rect", x: 280, y: 50, width: 100, height: 55, rx: 4, stroke: "#ec4899", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 330, y: 68, fill: "#ec4899", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "Scala" },
      { type: "text", x: 330, y: 82, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Spark native" },
      { type: "text", x: 330, y: 93, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Functional" },
      { type: "rect", x: 400, y: 50, width: 100, height: 55, rx: 4, stroke: "#06b6d4", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 450, y: 68, fill: "#06b6d4", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "Go" },
      { type: "text", x: 450, y: 82, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "CLI tools" },
      { type: "text", x: 450, y: 93, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Concurrency" },
      { type: "rect", x: 40, y: 120, width: 460, height: 30, rx: 3, stroke: "#f59e0b", strokeWidth: 1, fill: "rgba(245,158,11,0.05)" },
      { type: "text", x: 270, y: 139, fill: "#f59e0b", fontSize: 8, textAnchor: "middle", textContent: "SQL — universal language across all data engineering tools" }
    ]
  },

  'de-basics-dsa': {
    title: "Data Structures & Algorithms for DE",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#10b981", fontSize: 12, fontWeight: "bold", textContent: "Key DS&A for Data Pipelines" },
      { type: "rect", x: 40, y: 50, width: 120, height: 35, rx: 3, stroke: "#3b82f6", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 100, y: 71, fill: "#3b82f6", fontSize: 9, textAnchor: "middle", textContent: "Hash Tables" },
      { type: "rect", x: 180, y: 50, width: 120, height: 35, rx: 3, stroke: "#10b981", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 240, y: 71, fill: "#10b981", fontSize: 9, textAnchor: "middle", textContent: "Trees (B-Tree)" },
      { type: "rect", x: 320, y: 50, width: 120, height: 35, rx: 3, stroke: "#f59e0b", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 380, y: 71, fill: "#f59e0b", fontSize: 9, textAnchor: "middle", textContent: "Graphs (DAG)" },
      { type: "rect", x: 40, y: 100, width: 120, height: 35, rx: 3, stroke: "#ec4899", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 100, y: 121, fill: "#ec4899", fontSize: 9, textAnchor: "middle", textContent: "Sorting/Merging" },
      { type: "rect", x: 180, y: 100, width: 120, height: 35, rx: 3, stroke: "#a855f7", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 240, y: 121, fill: "#a855f7", fontSize: 9, textAnchor: "middle", textContent: "Queues (FIFO)" },
      { type: "rect", x: 320, y: 100, width: 120, height: 35, rx: 3, stroke: "#06b6d4", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 380, y: 121, fill: "#06b6d4", fontSize: 9, textAnchor: "middle", textContent: "Big-O Analysis" },
      { type: "text", x: 240, y: 160, fill: "#52525b", fontSize: 7, textAnchor: "middle", textContent: "Used in: indexing, scheduling, partitioning, merge joins, stream buffering" }
    ]
  },

  'de-basics-git': {
    title: "Git & GitHub",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#ef4444", fontSize: 12, fontWeight: "bold", textContent: "Git Branching Model" },
      { type: "line", x1: 60, y1: 80, x2: 520, y2: 80, stroke: "#3b82f6", strokeWidth: 2 },
      { type: "text", x: 540, y: 83, fill: "#3b82f6", fontSize: 8, textContent: "main" },
      { type: "circle", cx: 100, cy: 80, r: 5, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#3b82f6" },
      { type: "circle", cx: 200, cy: 80, r: 5, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#3b82f6" },
      { type: "circle", cx: 400, cy: 80, r: 5, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#3b82f6" },
      { type: "circle", cx: 500, cy: 80, r: 5, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#3b82f6" },
      { type: "line", x1: 200, y1: 80, x2: 250, y2: 120, stroke: "#10b981", strokeWidth: 1.5 },
      { type: "line", x1: 250, y1: 120, x2: 350, y2: 120, stroke: "#10b981", strokeWidth: 2 },
      { type: "line", x1: 350, y1: 120, x2: 400, y2: 80, stroke: "#10b981", strokeWidth: 1.5 },
      { type: "circle", cx: 250, cy: 120, r: 4, stroke: "#10b981", strokeWidth: 1.5, fill: "#10b981" },
      { type: "circle", cx: 300, cy: 120, r: 4, stroke: "#10b981", strokeWidth: 1.5, fill: "#10b981" },
      { type: "circle", cx: 350, cy: 120, r: 4, stroke: "#10b981", strokeWidth: 1.5, fill: "#10b981" },
      { type: "text", x: 300, y: 145, fill: "#10b981", fontSize: 8, textAnchor: "middle", textContent: "feature/etl-pipeline" },
      { type: "text", x: 400, y: 70, fill: "#f59e0b", fontSize: 7, textAnchor: "middle", textContent: "merge" },
      { type: "text", x: 300, y: 175, fill: "#52525b", fontSize: 7, textAnchor: "middle", textContent: "commit → branch → PR → review → merge" }
    ]
  },

  'de-basics-linux': {
    title: "Linux Basics",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#f59e0b", fontSize: 12, fontWeight: "bold", textContent: "Linux Filesystem & Key Commands" },
      { type: "text", x: 120, y: 58, fill: "#f59e0b", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "/" },
      { type: "line", x1: 120, y1: 62, x2: 60, y2: 80, stroke: "#52525b", strokeWidth: 1 },
      { type: "line", x1: 120, y1: 62, x2: 120, y2: 80, stroke: "#52525b", strokeWidth: 1 },
      { type: "line", x1: 120, y1: 62, x2: 180, y2: 80, stroke: "#52525b", strokeWidth: 1 },
      { type: "text", x: 60, y: 92, fill: "#3b82f6", fontSize: 8, textAnchor: "middle", textContent: "/home" },
      { type: "text", x: 120, y: 92, fill: "#10b981", fontSize: 8, textAnchor: "middle", textContent: "/etc" },
      { type: "text", x: 180, y: 92, fill: "#ec4899", fontSize: 8, textAnchor: "middle", textContent: "/var" },
      { type: "rect", x: 260, y: 50, width: 250, height: 110, rx: 4, stroke: "#27272a", strokeWidth: 1, fill: "#0a0a0a" },
      { type: "text", x: 270, y: 67, fill: "#10b981", fontSize: 8, textContent: "$ ls -la /data/raw/" },
      { type: "text", x: 270, y: 81, fill: "#10b981", fontSize: 8, textContent: "$ grep -r 'ERROR' logs/" },
      { type: "text", x: 270, y: 95, fill: "#10b981", fontSize: 8, textContent: "$ chmod 755 pipeline.sh" },
      { type: "text", x: 270, y: 109, fill: "#10b981", fontSize: 8, textContent: "$ crontab -e" },
      { type: "text", x: 270, y: 123, fill: "#10b981", fontSize: 8, textContent: "$ ssh user@data-node-01" },
      { type: "text", x: 270, y: 137, fill: "#10b981", fontSize: 8, textContent: "$ tail -f /var/log/spark.log" },
      { type: "text", x: 270, y: 151, fill: "#71717a", fontSize: 7, textContent: "Essential for managing data servers" }
    ]
  },

  'de-basics-network': {
    title: "Networking Fundamentals",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#06b6d4", fontSize: 12, fontWeight: "bold", textContent: "OSI & Network Layers" },
      { type: "rect", x: 80, y: 48, width: 180, height: 22, rx: 2, stroke: "#ef4444", strokeWidth: 1.2, fill: "rgba(239,68,68,0.08)" },
      { type: "text", x: 170, y: 63, fill: "#ef4444", fontSize: 8, textAnchor: "middle", textContent: "7. Application (HTTP, REST, gRPC)" },
      { type: "rect", x: 80, y: 72, width: 180, height: 22, rx: 2, stroke: "#f59e0b", strokeWidth: 1.2, fill: "rgba(245,158,11,0.08)" },
      { type: "text", x: 170, y: 87, fill: "#f59e0b", fontSize: 8, textAnchor: "middle", textContent: "4. Transport (TCP / UDP)" },
      { type: "rect", x: 80, y: 96, width: 180, height: 22, rx: 2, stroke: "#10b981", strokeWidth: 1.2, fill: "rgba(16,185,129,0.08)" },
      { type: "text", x: 170, y: 111, fill: "#10b981", fontSize: 8, textAnchor: "middle", textContent: "3. Network (IP, Routing)" },
      { type: "rect", x: 80, y: 120, width: 180, height: 22, rx: 2, stroke: "#3b82f6", strokeWidth: 1.2, fill: "rgba(59,130,246,0.08)" },
      { type: "text", x: 170, y: 135, fill: "#3b82f6", fontSize: 8, textAnchor: "middle", textContent: "1-2. Physical / Data Link" },
      { type: "rect", x: 320, y: 55, width: 180, height: 90, rx: 4, stroke: "#a855f7", strokeWidth: 1, fill: "#18181b" },
      { type: "text", x: 410, y: 70, fill: "#a855f7", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "DE Protocols" },
      { type: "text", x: 332, y: 87, fill: "#ffffff", fontSize: 7, textContent: "▸ REST / GraphQL (API ingest)" },
      { type: "text", x: 332, y: 100, fill: "#ffffff", fontSize: 7, textContent: "▸ JDBC / ODBC (DB connect)" },
      { type: "text", x: 332, y: 113, fill: "#ffffff", fontSize: 7, textContent: "▸ SSH / SCP (file transfer)" },
      { type: "text", x: 332, y: 126, fill: "#ffffff", fontSize: 7, textContent: "▸ DNS (service discovery)" }
    ]
  },

  'de-basics-distributed': {
    title: "Distributed Systems Basics",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#a855f7", fontSize: 12, fontWeight: "bold", textContent: "Distributed Systems Fundamentals" },
      { type: "circle", cx: 150, cy: 90, r: 22, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 150, y: 93, fill: "#3b82f6", fontSize: 7, textAnchor: "middle", textContent: "Node A" },
      { type: "circle", cx: 280, cy: 60, r: 22, stroke: "#10b981", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 280, y: 63, fill: "#10b981", fontSize: 7, textAnchor: "middle", textContent: "Node B" },
      { type: "circle", cx: 280, cy: 120, r: 22, stroke: "#f59e0b", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 280, y: 123, fill: "#f59e0b", fontSize: 7, textAnchor: "middle", textContent: "Node C" },
      { type: "circle", cx: 410, cy: 90, r: 22, stroke: "#ec4899", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 410, y: 93, fill: "#ec4899", fontSize: 7, textAnchor: "middle", textContent: "Node D" },
      { type: "line", x1: 172, y1: 82, x2: 258, y2: 66, stroke: "#52525b", strokeWidth: 1, strokeDasharray: "3,2" },
      { type: "line", x1: 172, y1: 98, x2: 258, y2: 114, stroke: "#52525b", strokeWidth: 1, strokeDasharray: "3,2" },
      { type: "line", x1: 302, y1: 66, x2: 388, y2: 84, stroke: "#52525b", strokeWidth: 1, strokeDasharray: "3,2" },
      { type: "line", x1: 302, y1: 114, x2: 388, y2: 96, stroke: "#52525b", strokeWidth: 1, strokeDasharray: "3,2" },
      { type: "line", x1: 280, y1: 82, x2: 280, y2: 98, stroke: "#52525b", strokeWidth: 1, strokeDasharray: "3,2" },
      { type: "text", x: 280, y: 170, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Consensus · Replication · Partitioning · Fault Tolerance" }
    ]
  },

  // ===========================
  // LIFECYCLE (4 topics)
  // ===========================
  'de-lifecycle-generation': {
    title: "Data Generation",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#3b82f6", fontSize: 12, fontWeight: "bold", textContent: "Where Data Comes From" },
      { type: "rect", x: 40, y: 55, width: 80, height: 35, rx: 3, stroke: "#3b82f6", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 80, y: 76, fill: "#3b82f6", fontSize: 8, textAnchor: "middle", textContent: "Web Apps" },
      { type: "rect", x: 40, y: 100, width: 80, height: 35, rx: 3, stroke: "#10b981", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 80, y: 121, fill: "#10b981", fontSize: 8, textAnchor: "middle", textContent: "IoT Devices" },
      { type: "rect", x: 40, y: 145, width: 80, height: 35, rx: 3, stroke: "#f59e0b", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 80, y: 166, fill: "#f59e0b", fontSize: 8, textAnchor: "middle", textContent: "Databases" },
      { type: "line", x1: 120, y1: 72, x2: 200, y2: 105, stroke: "#52525b", strokeWidth: 1 },
      { type: "line", x1: 120, y1: 117, x2: 200, y2: 110, stroke: "#52525b", strokeWidth: 1 },
      { type: "line", x1: 120, y1: 162, x2: 200, y2: 115, stroke: "#52525b", strokeWidth: 1 },
      { type: "rect", x: 200, y: 85, width: 120, height: 50, rx: 4, stroke: "#a855f7", strokeWidth: 1.5, fill: "rgba(168,85,247,0.08)" },
      { type: "text", x: 260, y: 110, fill: "#a855f7", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Ingestion Layer" },
      { type: "line", x1: 320, y1: 110, x2: 380, y2: 110, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "line", x1: 375, y1: 107, x2: 380, y2: 110, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 380, y: 85, width: 120, height: 50, rx: 4, stroke: "#ec4899", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 440, y: 110, fill: "#ec4899", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Data Lake" }
    ]
  },

  'de-lifecycle-storage': {
    title: "Data Storage",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#10b981", fontSize: 12, fontWeight: "bold", textContent: "Storage Layer Architecture" },
      { type: "rect", x: 60, y: 55, width: 140, height: 40, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 130, y: 79, fill: "#3b82f6", fontSize: 9, textAnchor: "middle", textContent: "Object Store (S3)" },
      { type: "rect", x: 230, y: 55, width: 140, height: 40, rx: 4, stroke: "#10b981", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 300, y: 79, fill: "#10b981", fontSize: 9, textAnchor: "middle", textContent: "Data Lake (Delta)" },
      { type: "rect", x: 400, y: 55, width: 140, height: 40, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 470, y: 79, fill: "#f59e0b", fontSize: 9, textAnchor: "middle", textContent: "Warehouse (BQ)" },
      { type: "rect", x: 60, y: 115, width: 480, height: 40, rx: 4, stroke: "#a855f7", strokeWidth: 1, fill: "rgba(168,85,247,0.05)" },
      { type: "text", x: 300, y: 138, fill: "#a855f7", fontSize: 9, textAnchor: "middle", textContent: "Formats: Parquet · ORC · Avro · Delta · Iceberg" },
      { type: "text", x: 300, y: 180, fill: "#52525b", fontSize: 7, textAnchor: "middle", textContent: "Hot → Warm → Cold storage tiers for cost optimization" }
    ]
  },

  'de-lifecycle-ingestion': {
    title: "Data Ingestion",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#f59e0b", fontSize: 12, fontWeight: "bold", textContent: "Batch vs Stream Ingestion" },
      { type: "rect", x: 40, y: 55, width: 200, height: 50, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 140, y: 72, fill: "#3b82f6", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "BATCH" },
      { type: "text", x: 140, y: 88, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Scheduled intervals · High throughput" },
      { type: "rect", x: 40, y: 115, width: 200, height: 50, rx: 4, stroke: "#ef4444", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 140, y: 132, fill: "#ef4444", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "STREAMING" },
      { type: "text", x: 140, y: 148, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Real-time · Low latency" },
      { type: "line", x1: 240, y1: 80, x2: 300, y2: 105, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "line", x1: 240, y1: 140, x2: 300, y2: 115, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 300, y: 85, width: 150, height: 50, rx: 4, stroke: "#10b981", strokeWidth: 1.5, fill: "rgba(16,185,129,0.08)" },
      { type: "text", x: 375, y: 110, fill: "#10b981", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Target Storage" }
    ]
  },

  'de-lifecycle-serving': {
    title: "Data Serving",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#ec4899", fontSize: 12, fontWeight: "bold", textContent: "Serving Processed Data" },
      { type: "rect", x: 40, y: 55, width: 120, height: 45, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 100, y: 81, fill: "#f59e0b", fontSize: 9, textAnchor: "middle", textContent: "Data Warehouse" },
      { type: "line", x1: 160, y1: 70, x2: 220, y2: 60, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "line", x1: 160, y1: 78, x2: 220, y2: 95, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "line", x1: 160, y1: 86, x2: 220, y2: 130, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 220, y: 42, width: 140, height: 35, rx: 3, stroke: "#3b82f6", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 290, y: 63, fill: "#3b82f6", fontSize: 8, textAnchor: "middle", textContent: "BI Dashboards" },
      { type: "rect", x: 220, y: 82, width: 140, height: 35, rx: 3, stroke: "#10b981", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 290, y: 103, fill: "#10b981", fontSize: 8, textAnchor: "middle", textContent: "ML Feature Store" },
      { type: "rect", x: 220, y: 122, width: 140, height: 35, rx: 3, stroke: "#a855f7", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 290, y: 143, fill: "#a855f7", fontSize: 8, textAnchor: "middle", textContent: "REST APIs" }
    ]
  },

  // ===========================
  // DATA GENERATION (2 topics)
  // ===========================
  'de-gen-sources': {
    title: "Sources of Data",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#3b82f6", fontSize: 12, fontWeight: "bold", textContent: "Data Source Taxonomy" },
      { type: "rect", x: 40, y: 52, width: 130, height: 30, rx: 3, stroke: "#3b82f6", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 105, y: 71, fill: "#3b82f6", fontSize: 8, textAnchor: "middle", textContent: "Application DBs" },
      { type: "rect", x: 40, y: 88, width: 130, height: 30, rx: 3, stroke: "#10b981", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 105, y: 107, fill: "#10b981", fontSize: 8, textAnchor: "middle", textContent: "REST / GraphQL APIs" },
      { type: "rect", x: 40, y: 124, width: 130, height: 30, rx: 3, stroke: "#f59e0b", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 105, y: 143, fill: "#f59e0b", fontSize: 8, textAnchor: "middle", textContent: "Server Logs" },
      { type: "rect", x: 40, y: 160, width: 130, height: 30, rx: 3, stroke: "#ec4899", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 105, y: 179, fill: "#ec4899", fontSize: 8, textAnchor: "middle", textContent: "IoT Sensors" },
      { type: "line", x1: 170, y1: 67, x2: 250, y2: 100, stroke: "#52525b", strokeWidth: 0.8 },
      { type: "line", x1: 170, y1: 103, x2: 250, y2: 105, stroke: "#52525b", strokeWidth: 0.8 },
      { type: "line", x1: 170, y1: 139, x2: 250, y2: 112, stroke: "#52525b", strokeWidth: 0.8 },
      { type: "line", x1: 170, y1: 175, x2: 250, y2: 118, stroke: "#52525b", strokeWidth: 0.8 },
      { type: "rect", x: 250, y: 80, width: 160, height: 50, rx: 4, stroke: "#a855f7", strokeWidth: 1.5, fill: "rgba(168,85,247,0.08)" },
      { type: "text", x: 330, y: 105, fill: "#a855f7", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "Collector / Broker" },
      { type: "line", x1: 410, y1: 105, x2: 460, y2: 105, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 460, y: 80, width: 90, height: 50, rx: 4, stroke: "#06b6d4", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 505, y: 105, fill: "#06b6d4", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Lake" }
    ]
  },

  'de-gen-considerations': {
    title: "Data Collection Considerations",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#f59e0b", fontSize: 12, fontWeight: "bold", textContent: "Collection Design Checklist" },
      { type: "rect", x: 50, y: 52, width: 18, height: 18, rx: 3, stroke: "#10b981", strokeWidth: 1.2, fill: "rgba(16,185,129,0.15)" },
      { type: "text", x: 59, y: 64, fill: "#10b981", fontSize: 10, textAnchor: "middle", textContent: "✓" },
      { type: "text", x: 78, y: 65, fill: "#ffffff", fontSize: 9, textContent: "Schema evolution & compatibility" },
      { type: "rect", x: 50, y: 78, width: 18, height: 18, rx: 3, stroke: "#10b981", strokeWidth: 1.2, fill: "rgba(16,185,129,0.15)" },
      { type: "text", x: 59, y: 90, fill: "#10b981", fontSize: 10, textAnchor: "middle", textContent: "✓" },
      { type: "text", x: 78, y: 91, fill: "#ffffff", fontSize: 9, textContent: "Data freshness vs cost trade-offs" },
      { type: "rect", x: 50, y: 104, width: 18, height: 18, rx: 3, stroke: "#10b981", strokeWidth: 1.2, fill: "rgba(16,185,129,0.15)" },
      { type: "text", x: 59, y: 116, fill: "#10b981", fontSize: 10, textAnchor: "middle", textContent: "✓" },
      { type: "text", x: 78, y: 117, fill: "#ffffff", fontSize: 9, textContent: "Idempotency & deduplication" },
      { type: "rect", x: 50, y: 130, width: 18, height: 18, rx: 3, stroke: "#10b981", strokeWidth: 1.2, fill: "rgba(16,185,129,0.15)" },
      { type: "text", x: 59, y: 142, fill: "#10b981", fontSize: 10, textAnchor: "middle", textContent: "✓" },
      { type: "text", x: 78, y: 143, fill: "#ffffff", fontSize: 9, textContent: "Error handling & dead-letter queues" },
      { type: "rect", x: 50, y: 156, width: 18, height: 18, rx: 3, stroke: "#10b981", strokeWidth: 1.2, fill: "rgba(16,185,129,0.15)" },
      { type: "text", x: 59, y: 168, fill: "#10b981", fontSize: 10, textAnchor: "middle", textContent: "✓" },
      { type: "text", x: 78, y: 169, fill: "#ffffff", fontSize: 9, textContent: "Privacy compliance (PII masking)" }
    ]
  },

  // ===========================
  // DATABASE FUNDAMENTALS (7 topics)
  // ===========================
  'de-db-normalization': {
    title: "Data Normalization",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#3b82f6", fontSize: 12, fontWeight: "bold", textContent: "Normalization: 1NF → 2NF → 3NF" },
      { type: "rect", x: 40, y: 55, width: 130, height: 70, rx: 4, stroke: "#ef4444", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 105, y: 72, fill: "#ef4444", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Unnormalized" },
      { type: "text", x: 52, y: 88, fill: "#71717a", fontSize: 7, textContent: "id | name | orders" },
      { type: "text", x: 52, y: 100, fill: "#71717a", fontSize: 7, textContent: "1  | Joe  | A,B,C" },
      { type: "text", x: 52, y: 112, fill: "#ef4444", fontSize: 6, textContent: "Repeating groups!" },
      { type: "line", x1: 170, y1: 90, x2: 200, y2: 90, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 200, y: 55, width: 130, height: 70, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 265, y: 72, fill: "#f59e0b", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "1NF" },
      { type: "text", x: 212, y: 88, fill: "#71717a", fontSize: 7, textContent: "Atomic values" },
      { type: "text", x: 212, y: 100, fill: "#71717a", fontSize: 7, textContent: "No repeating groups" },
      { type: "line", x1: 330, y1: 90, x2: 360, y2: 90, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 360, y: 55, width: 130, height: 70, rx: 4, stroke: "#10b981", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 425, y: 72, fill: "#10b981", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "3NF" },
      { type: "text", x: 372, y: 88, fill: "#71717a", fontSize: 7, textContent: "No partial deps" },
      { type: "text", x: 372, y: 100, fill: "#71717a", fontSize: 7, textContent: "No transitive deps" },
      { type: "text", x: 300, y: 150, fill: "#52525b", fontSize: 7, textAnchor: "middle", textContent: "Trade-off: more joins vs less redundancy" }
    ]
  },

  'de-db-modelling': {
    title: "Data Modelling Techniques",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#10b981", fontSize: 12, fontWeight: "bold", textContent: "Entity-Relationship Diagram" },
      { type: "rect", x: 60, y: 60, width: 100, height: 40, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 110, y: 84, fill: "#3b82f6", fontSize: 9, textAnchor: "middle", textContent: "Customer" },
      { type: "rect", x: 250, y: 60, width: 100, height: 40, rx: 4, stroke: "#10b981", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 300, y: 84, fill: "#10b981", fontSize: 9, textAnchor: "middle", textContent: "Order" },
      { type: "rect", x: 440, y: 60, width: 100, height: 40, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 490, y: 84, fill: "#f59e0b", fontSize: 9, textAnchor: "middle", textContent: "Product" },
      { type: "line", x1: 160, y1: 80, x2: 250, y2: 80, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "text", x: 205, y: 75, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "1 : N" },
      { type: "line", x1: 350, y1: 80, x2: 440, y2: 80, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "text", x: 395, y: 75, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "N : M" },
      { type: "rect", x: 140, y: 120, width: 280, height: 35, rx: 3, stroke: "#52525b", strokeWidth: 0.8, fill: "#18181b" },
      { type: "text", x: 280, y: 141, fill: "#71717a", fontSize: 8, textAnchor: "middle", textContent: "Kimball (dimensional) vs Inmon (enterprise) vs Data Vault" }
    ]
  },

  'de-db-cap': {
    title: "CAP Theorem",
    elements: [
      { type: "text", x: 30, y: 28, fill: "#ef4444", fontSize: 12, fontWeight: "bold", textContent: "CAP Theorem Triangle" },
      { type: "line", x1: 270, y1: 50, x2: 170, y2: 150, stroke: "#52525b", strokeWidth: 1.5 },
      { type: "line", x1: 270, y1: 50, x2: 370, y2: 150, stroke: "#52525b", strokeWidth: 1.5 },
      { type: "line", x1: 170, y1: 150, x2: 370, y2: 150, stroke: "#52525b", strokeWidth: 1.5 },
      { type: "circle", cx: 270, cy: 48, r: 18, stroke: "#3b82f6", strokeWidth: 1.5, fill: "rgba(59,130,246,0.15)" },
      { type: "text", x: 270, y: 52, fill: "#3b82f6", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "C" },
      { type: "text", x: 270, y: 38, fill: "#71717a", fontSize: 6, textAnchor: "middle", textContent: "Consistency" },
      { type: "circle", cx: 168, cy: 152, r: 18, stroke: "#10b981", strokeWidth: 1.5, fill: "rgba(16,185,129,0.15)" },
      { type: "text", x: 168, y: 155, fill: "#10b981", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "A" },
      { type: "text", x: 168, y: 172, fill: "#71717a", fontSize: 6, textAnchor: "middle", textContent: "Availability" },
      { type: "circle", cx: 372, cy: 152, r: 18, stroke: "#f59e0b", strokeWidth: 1.5, fill: "rgba(245,158,11,0.15)" },
      { type: "text", x: 372, y: 155, fill: "#f59e0b", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "P" },
      { type: "text", x: 372, y: 172, fill: "#71717a", fontSize: 6, textAnchor: "middle", textContent: "Partition Tol." },
      { type: "text", x: 270, y: 110, fill: "#ec4899", fontSize: 8, fontWeight: "bold", textAnchor: "middle", textContent: "Pick 2 of 3" },
      { type: "text", x: 475, y: 75, fill: "#3b82f6", fontSize: 7, textContent: "CP: MongoDB, HBase" },
      { type: "text", x: 475, y: 90, fill: "#10b981", fontSize: 7, textContent: "AP: Cassandra, DynamoDB" },
      { type: "text", x: 475, y: 105, fill: "#f59e0b", fontSize: 7, textContent: "CA: Traditional RDBMS" }
    ]
  },

  'de-db-oltp-olap': {
    title: "OLTP vs OLAP",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#a855f7", fontSize: 12, fontWeight: "bold", textContent: "Transactional vs Analytical" },
      { type: "rect", x: 40, y: 50, width: 200, height: 120, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 140, y: 66, fill: "#3b82f6", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "OLTP" },
      { type: "line", x1: 50, y1: 72, x2: 230, y2: 72, stroke: "#27272a", strokeWidth: 1 },
      { type: "text", x: 52, y: 86, fill: "#ffffff", fontSize: 8, textContent: "▸ Row-oriented storage" },
      { type: "text", x: 52, y: 99, fill: "#ffffff", fontSize: 8, textContent: "▸ High concurrency writes" },
      { type: "text", x: 52, y: 112, fill: "#ffffff", fontSize: 8, textContent: "▸ ACID transactions" },
      { type: "text", x: 52, y: 125, fill: "#ffffff", fontSize: 8, textContent: "▸ Small, fast queries" },
      { type: "text", x: 52, y: 145, fill: "#71717a", fontSize: 7, textContent: "MySQL, PostgreSQL" },
      { type: "rect", x: 280, y: 50, width: 200, height: 120, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 380, y: 66, fill: "#f59e0b", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "OLAP" },
      { type: "line", x1: 290, y1: 72, x2: 470, y2: 72, stroke: "#27272a", strokeWidth: 1 },
      { type: "text", x: 292, y: 86, fill: "#ffffff", fontSize: 8, textContent: "▸ Column-oriented storage" },
      { type: "text", x: 292, y: 99, fill: "#ffffff", fontSize: 8, textContent: "▸ Bulk reads & aggregations" },
      { type: "text", x: 292, y: 112, fill: "#ffffff", fontSize: 8, textContent: "▸ Denormalized schemas" },
      { type: "text", x: 292, y: 125, fill: "#ffffff", fontSize: 8, textContent: "▸ Complex analytical queries" },
      { type: "text", x: 292, y: 145, fill: "#71717a", fontSize: 7, textContent: "BigQuery, Redshift, Snowflake" }
    ]
  },

  'de-model-scd': {
    title: "Slowly Changing Dimensions",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#ec4899", fontSize: 12, fontWeight: "bold", textContent: "SCD Types: How Dimensions Change" },
      { type: "rect", x: 40, y: 50, width: 150, height: 55, rx: 4, stroke: "#3b82f6", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 115, y: 66, fill: "#3b82f6", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Type 1: Overwrite" },
      { type: "text", x: 52, y: 82, fill: "#71717a", fontSize: 7, textContent: "Old value replaced" },
      { type: "text", x: 52, y: 94, fill: "#71717a", fontSize: 7, textContent: "No history kept" },
      { type: "rect", x: 210, y: 50, width: 150, height: 55, rx: 4, stroke: "#10b981", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 285, y: 66, fill: "#10b981", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Type 2: New Row" },
      { type: "text", x: 222, y: 82, fill: "#71717a", fontSize: 7, textContent: "Add row + timestamps" },
      { type: "text", x: 222, y: 94, fill: "#71717a", fontSize: 7, textContent: "Full history preserved" },
      { type: "rect", x: 380, y: 50, width: 150, height: 55, rx: 4, stroke: "#f59e0b", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 455, y: 66, fill: "#f59e0b", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Type 3: New Column" },
      { type: "text", x: 392, y: 82, fill: "#71717a", fontSize: 7, textContent: "prev_val + curr_val cols" },
      { type: "text", x: 392, y: 94, fill: "#71717a", fontSize: 7, textContent: "Limited history" },
      { type: "rect", x: 100, y: 120, width: 350, height: 35, rx: 3, stroke: "#52525b", strokeWidth: 0.8, fill: "#18181b" },
      { type: "text", x: 275, y: 141, fill: "#52525b", fontSize: 8, textAnchor: "middle", textContent: "Type 2 is most common in data warehousing" }
    ]
  },

  'de-model-scaling': {
    title: "Horizontal vs Vertical Scaling",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#06b6d4", fontSize: 12, fontWeight: "bold", textContent: "Scaling Strategies" },
      { type: "rect", x: 60, y: 55, width: 80, height: 50, rx: 4, stroke: "#3b82f6", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 100, y: 74, fill: "#3b82f6", fontSize: 8, textAnchor: "middle", textContent: "Small" },
      { type: "text", x: 100, y: 86, fill: "#3b82f6", fontSize: 8, textAnchor: "middle", textContent: "Server" },
      { type: "line", x1: 140, y1: 80, x2: 180, y2: 80, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 180, y: 45, width: 100, height: 70, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 230, y: 72, fill: "#f59e0b", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "BIGGER" },
      { type: "text", x: 230, y: 86, fill: "#f59e0b", fontSize: 8, textAnchor: "middle", textContent: "Server" },
      { type: "text", x: 230, y: 100, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "↑ Vertical" },
      { type: "rect", x: 370, y: 50, width: 45, height: 35, rx: 3, stroke: "#10b981", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 392, y: 71, fill: "#10b981", fontSize: 7, textAnchor: "middle", textContent: "Node1" },
      { type: "rect", x: 420, y: 50, width: 45, height: 35, rx: 3, stroke: "#10b981", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 442, y: 71, fill: "#10b981", fontSize: 7, textAnchor: "middle", textContent: "Node2" },
      { type: "rect", x: 470, y: 50, width: 45, height: 35, rx: 3, stroke: "#10b981", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 492, y: 71, fill: "#10b981", fontSize: 7, textAnchor: "middle", textContent: "Node3" },
      { type: "text", x: 442, y: 100, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "← Horizontal →" },
      { type: "text", x: 300, y: 145, fill: "#52525b", fontSize: 7, textAnchor: "middle", textContent: "Horizontal = more machines · Vertical = bigger machine" }
    ]
  },

  'de-model-star-snowflake': {
    title: "Star vs Snowflake Schema",
    elements: [
      { type: "text", x: 30, y: 28, fill: "#f59e0b", fontSize: 12, fontWeight: "bold", textContent: "Star Schema Layout" },
      { type: "rect", x: 210, y: 70, width: 100, height: 50, rx: 4, stroke: "#f59e0b", strokeWidth: 2, fill: "rgba(245,158,11,0.1)" },
      { type: "text", x: 260, y: 95, fill: "#f59e0b", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Fact: Sales" },
      { type: "rect", x: 60, y: 40, width: 90, height: 35, rx: 3, stroke: "#3b82f6", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 105, y: 61, fill: "#3b82f6", fontSize: 8, textAnchor: "middle", textContent: "dim_product" },
      { type: "rect", x: 370, y: 40, width: 90, height: 35, rx: 3, stroke: "#10b981", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 415, y: 61, fill: "#10b981", fontSize: 8, textAnchor: "middle", textContent: "dim_time" },
      { type: "rect", x: 60, y: 120, width: 90, height: 35, rx: 3, stroke: "#ec4899", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 105, y: 141, fill: "#ec4899", fontSize: 8, textAnchor: "middle", textContent: "dim_customer" },
      { type: "rect", x: 370, y: 120, width: 90, height: 35, rx: 3, stroke: "#a855f7", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 415, y: 141, fill: "#a855f7", fontSize: 8, textAnchor: "middle", textContent: "dim_store" },
      { type: "line", x1: 150, y1: 57, x2: 210, y2: 82, stroke: "#52525b", strokeWidth: 1 },
      { type: "line", x1: 370, y1: 57, x2: 310, y2: 82, stroke: "#52525b", strokeWidth: 1 },
      { type: "line", x1: 150, y1: 137, x2: 210, y2: 108, stroke: "#52525b", strokeWidth: 1 },
      { type: "line", x1: 370, y1: 137, x2: 310, y2: 108, stroke: "#52525b", strokeWidth: 1 }
    ]
  },

  // ===========================
  // DATA STORAGE (4 topics)
  // ===========================
  'de-storage-relational': {
    title: "Relational Databases",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#3b82f6", fontSize: 12, fontWeight: "bold", textContent: "RDBMS Architecture" },
      { type: "rect", x: 80, y: 50, width: 380, height: 25, rx: 2, stroke: "#3b82f6", strokeWidth: 1, fill: "rgba(59,130,246,0.08)" },
      { type: "text", x: 92, y: 66, fill: "#3b82f6", fontSize: 8, fontWeight: "bold", textContent: "users" },
      { type: "text", x: 160, y: 66, fill: "#71717a", fontSize: 7, textContent: "id  |  name  |  email  |  created_at" },
      { type: "rect", x: 80, y: 77, width: 380, height: 20, rx: 0, stroke: "#27272a", strokeWidth: 0.5, fill: "#18181b" },
      { type: "text", x: 92, y: 90, fill: "#71717a", fontSize: 7, textContent: "1   |  Alice |  a@x.io |  2024-01-15" },
      { type: "rect", x: 80, y: 98, width: 380, height: 20, rx: 0, stroke: "#27272a", strokeWidth: 0.5, fill: "#0a0a0a" },
      { type: "text", x: 92, y: 111, fill: "#71717a", fontSize: 7, textContent: "2   |  Bob   |  b@x.io |  2024-02-20" },
      { type: "rect", x: 80, y: 135, width: 120, height: 30, rx: 3, stroke: "#10b981", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 140, y: 154, fill: "#10b981", fontSize: 8, textAnchor: "middle", textContent: "PostgreSQL" },
      { type: "rect", x: 210, y: 135, width: 80, height: 30, rx: 3, stroke: "#f59e0b", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 250, y: 154, fill: "#f59e0b", fontSize: 8, textAnchor: "middle", textContent: "MySQL" },
      { type: "rect", x: 300, y: 135, width: 80, height: 30, rx: 3, stroke: "#ec4899", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 340, y: 154, fill: "#ec4899", fontSize: 8, textAnchor: "middle", textContent: "Aurora" },
      { type: "rect", x: 390, y: 135, width: 70, height: 30, rx: 3, stroke: "#a855f7", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 425, y: 154, fill: "#a855f7", fontSize: 8, textAnchor: "middle", textContent: "Oracle" }
    ]
  },

  'de-storage-nosql': {
    title: "NoSQL Databases",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#10b981", fontSize: 12, fontWeight: "bold", textContent: "NoSQL Database Types" },
      { type: "rect", x: 40, y: 52, width: 120, height: 55, rx: 4, stroke: "#3b82f6", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 100, y: 68, fill: "#3b82f6", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Document" },
      { type: "text", x: 100, y: 82, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "{ JSON docs }" },
      { type: "text", x: 100, y: 95, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "MongoDB, Firestore" },
      { type: "rect", x: 175, y: 52, width: 120, height: 55, rx: 4, stroke: "#f59e0b", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 235, y: 68, fill: "#f59e0b", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Column-Family" },
      { type: "text", x: 235, y: 82, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Wide columns" },
      { type: "text", x: 235, y: 95, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Cassandra, HBase" },
      { type: "rect", x: 310, y: 52, width: 120, height: 55, rx: 4, stroke: "#ec4899", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 370, y: 68, fill: "#ec4899", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Key-Value" },
      { type: "text", x: 370, y: 82, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "key → blob" },
      { type: "text", x: 370, y: 95, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Redis, DynamoDB" },
      { type: "rect", x: 445, y: 52, width: 120, height: 55, rx: 4, stroke: "#a855f7", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 505, y: 68, fill: "#a855f7", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Graph" },
      { type: "text", x: 505, y: 82, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Nodes + Edges" },
      { type: "text", x: 505, y: 95, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Neo4j, Neptune" },
      { type: "text", x: 300, y: 130, fill: "#52525b", fontSize: 7, textAnchor: "middle", textContent: "Schema-flexible · Horizontally scalable · Eventual consistency" }
    ]
  },

  'de-storage-warehouse': {
    title: "Data Warehousing",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#f59e0b", fontSize: 12, fontWeight: "bold", textContent: "Data Warehouse Architecture" },
      { type: "rect", x: 40, y: 50, width: 80, height: 30, rx: 2, stroke: "#52525b", strokeWidth: 1, fill: "#18181b" },
      { type: "text", x: 80, y: 69, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Source 1" },
      { type: "rect", x: 40, y: 85, width: 80, height: 30, rx: 2, stroke: "#52525b", strokeWidth: 1, fill: "#18181b" },
      { type: "text", x: 80, y: 104, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Source 2" },
      { type: "line", x1: 120, y1: 65, x2: 170, y2: 85, stroke: "#a1a1aa", strokeWidth: 0.8 },
      { type: "line", x1: 120, y1: 100, x2: 170, y2: 90, stroke: "#a1a1aa", strokeWidth: 0.8 },
      { type: "rect", x: 170, y: 65, width: 90, height: 40, rx: 4, stroke: "#f59e0b", strokeWidth: 1.2, fill: "rgba(245,158,11,0.08)" },
      { type: "text", x: 215, y: 89, fill: "#f59e0b", fontSize: 8, textAnchor: "middle", textContent: "ETL / ELT" },
      { type: "line", x1: 260, y1: 85, x2: 300, y2: 85, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 300, y: 55, width: 130, height: 60, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "rgba(59,130,246,0.06)" },
      { type: "text", x: 365, y: 76, fill: "#3b82f6", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "DATA WAREHOUSE" },
      { type: "text", x: 365, y: 92, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Columnar, optimized" },
      { type: "rect", x: 300, y: 130, width: 55, height: 25, rx: 2, stroke: "#10b981", strokeWidth: 1, fill: "#18181b" },
      { type: "text", x: 327, y: 146, fill: "#10b981", fontSize: 7, textAnchor: "middle", textContent: "BigQuery" },
      { type: "rect", x: 360, y: 130, width: 70, height: 25, rx: 2, stroke: "#06b6d4", strokeWidth: 1, fill: "#18181b" },
      { type: "text", x: 395, y: 146, fill: "#06b6d4", fontSize: 7, textAnchor: "middle", textContent: "Snowflake" },
      { type: "rect", x: 435, y: 130, width: 65, height: 25, rx: 2, stroke: "#ef4444", strokeWidth: 1, fill: "#18181b" },
      { type: "text", x: 467, y: 146, fill: "#ef4444", fontSize: 7, textAnchor: "middle", textContent: "Redshift" }
    ]
  },

  'de-storage-datalake': {
    title: "Data Lake",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#06b6d4", fontSize: 12, fontWeight: "bold", textContent: "Data Lake Zone Architecture" },
      { type: "rect", x: 40, y: 55, width: 130, height: 45, rx: 4, stroke: "#ef4444", strokeWidth: 1.5, fill: "rgba(239,68,68,0.06)" },
      { type: "text", x: 105, y: 75, fill: "#ef4444", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Raw / Bronze" },
      { type: "text", x: 105, y: 89, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Unprocessed data" },
      { type: "line", x1: 170, y1: 77, x2: 200, y2: 77, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 200, y: 55, width: 130, height: 45, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "rgba(245,158,11,0.06)" },
      { type: "text", x: 265, y: 75, fill: "#f59e0b", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Cleaned / Silver" },
      { type: "text", x: 265, y: 89, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Validated, deduped" },
      { type: "line", x1: 330, y1: 77, x2: 360, y2: 77, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 360, y: 55, width: 130, height: 45, rx: 4, stroke: "#10b981", strokeWidth: 1.5, fill: "rgba(16,185,129,0.06)" },
      { type: "text", x: 425, y: 75, fill: "#10b981", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Curated / Gold" },
      { type: "text", x: 425, y: 89, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Business-ready" },
      { type: "rect", x: 120, y: 120, width: 300, height: 30, rx: 3, stroke: "#52525b", strokeWidth: 0.8, fill: "#18181b" },
      { type: "text", x: 270, y: 139, fill: "#52525b", fontSize: 8, textAnchor: "middle", textContent: "Lakehouse: Delta Lake · Apache Iceberg · Apache Hudi" }
    ]
  },

  // ===========================
  // DATA INGESTION (3 topics)
  // ===========================
  'de-ingest-types': {
    title: "Ingestion Types",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#3b82f6", fontSize: 12, fontWeight: "bold", textContent: "Batch vs Micro-Batch vs Streaming" },
      { type: "rect", x: 40, y: 55, width: 150, height: 50, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 115, y: 72, fill: "#3b82f6", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Batch" },
      { type: "text", x: 115, y: 88, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Hourly/daily · Spark, dbt" },
      { type: "rect", x: 210, y: 55, width: 150, height: 50, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 285, y: 72, fill: "#f59e0b", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Micro-Batch" },
      { type: "text", x: 285, y: 88, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Minutes · Spark Structured" },
      { type: "rect", x: 380, y: 55, width: 150, height: 50, rx: 4, stroke: "#ef4444", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 455, y: 72, fill: "#ef4444", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Streaming" },
      { type: "text", x: 455, y: 88, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Real-time · Flink, Kafka" },
      { type: "line", x1: 40, y1: 125, x2: 530, y2: 125, stroke: "#52525b", strokeWidth: 0.5 },
      { type: "text", x: 115, y: 140, fill: "#3b82f6", fontSize: 7, textAnchor: "middle", textContent: "High latency" },
      { type: "text", x: 455, y: 140, fill: "#ef4444", fontSize: 7, textAnchor: "middle", textContent: "Low latency" },
      { type: "line", x1: 180, y1: 135, x2: 400, y2: 135, stroke: "#52525b", strokeWidth: 1 },
      { type: "line", x1: 395, y1: 132, x2: 400, y2: 135, stroke: "#52525b", strokeWidth: 1 }
    ]
  },

  'de-ingest-etl': {
    title: "ETL Process",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#10b981", fontSize: 12, fontWeight: "bold", textContent: "Extract → Transform → Load" },
      { type: "rect", x: 50, y: 60, width: 120, height: 70, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 110, y: 78, fill: "#3b82f6", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "EXTRACT" },
      { type: "text", x: 110, y: 92, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Pull from sources" },
      { type: "text", x: 110, y: 104, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "CDC, API, File" },
      { type: "line", x1: 170, y1: 95, x2: 210, y2: 95, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "line", x1: 206, y1: 92, x2: 210, y2: 95, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 210, y: 60, width: 120, height: 70, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 270, y: 78, fill: "#f59e0b", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "TRANSFORM" },
      { type: "text", x: 270, y: 92, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Clean, validate" },
      { type: "text", x: 270, y: 104, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Aggregate, join" },
      { type: "line", x1: 330, y1: 95, x2: 370, y2: 95, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "line", x1: 366, y1: 92, x2: 370, y2: 95, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 370, y: 60, width: 120, height: 70, rx: 4, stroke: "#10b981", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 430, y: 78, fill: "#10b981", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "LOAD" },
      { type: "text", x: 430, y: 92, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Write to target" },
      { type: "text", x: 430, y: 104, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "DW, Lake, Mart" },
      { type: "text", x: 270, y: 155, fill: "#52525b", fontSize: 7, textAnchor: "middle", textContent: "ELT variant: load raw first, transform in-warehouse (dbt)" }
    ]
  },

  'de-ingest-tools': {
    title: "Data Pipeline Tools",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#a855f7", fontSize: 12, fontWeight: "bold", textContent: "Pipeline & Orchestration Ecosystem" },
      { type: "rect", x: 40, y: 55, width: 110, height: 40, rx: 4, stroke: "#3b82f6", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 95, y: 79, fill: "#3b82f6", fontSize: 9, textAnchor: "middle", textContent: "Apache Airflow" },
      { type: "rect", x: 165, y: 55, width: 90, height: 40, rx: 4, stroke: "#10b981", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 210, y: 79, fill: "#10b981", fontSize: 9, textAnchor: "middle", textContent: "dbt" },
      { type: "rect", x: 270, y: 55, width: 90, height: 40, rx: 4, stroke: "#f59e0b", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 315, y: 79, fill: "#f59e0b", fontSize: 9, textAnchor: "middle", textContent: "Prefect" },
      { type: "rect", x: 375, y: 55, width: 90, height: 40, rx: 4, stroke: "#ec4899", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 420, y: 79, fill: "#ec4899", fontSize: 9, textAnchor: "middle", textContent: "Dagster" },
      { type: "rect", x: 40, y: 110, width: 110, height: 40, rx: 4, stroke: "#06b6d4", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 95, y: 134, fill: "#06b6d4", fontSize: 9, textAnchor: "middle", textContent: "Fivetran" },
      { type: "rect", x: 165, y: 110, width: 90, height: 40, rx: 4, stroke: "#a855f7", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 210, y: 134, fill: "#a855f7", fontSize: 9, textAnchor: "middle", textContent: "Stitch" },
      { type: "rect", x: 270, y: 110, width: 90, height: 40, rx: 4, stroke: "#ef4444", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 315, y: 134, fill: "#ef4444", fontSize: 9, textAnchor: "middle", textContent: "Luigi" },
      { type: "rect", x: 375, y: 110, width: 90, height: 40, rx: 4, stroke: "#eab308", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 420, y: 134, fill: "#eab308", fontSize: 9, textAnchor: "middle", textContent: "Mage" }
    ]
  },

  // ===========================
  // CLOUD COMPUTING (2 topics)
  // ===========================
  'de-cloud-architectures': {
    title: "Cloud Architectures",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#06b6d4", fontSize: 12, fontWeight: "bold", textContent: "Cloud Architecture Layers" },
      { type: "rect", x: 80, y: 50, width: 380, height: 28, rx: 3, stroke: "#3b82f6", strokeWidth: 1.2, fill: "rgba(59,130,246,0.08)" },
      { type: "text", x: 270, y: 68, fill: "#3b82f6", fontSize: 9, textAnchor: "middle", textContent: "SaaS — Application Layer (Snowflake, Databricks)" },
      { type: "rect", x: 80, y: 82, width: 380, height: 28, rx: 3, stroke: "#10b981", strokeWidth: 1.2, fill: "rgba(16,185,129,0.08)" },
      { type: "text", x: 270, y: 100, fill: "#10b981", fontSize: 9, textAnchor: "middle", textContent: "PaaS — Platform Layer (GCP Dataflow, EMR)" },
      { type: "rect", x: 80, y: 114, width: 380, height: 28, rx: 3, stroke: "#f59e0b", strokeWidth: 1.2, fill: "rgba(245,158,11,0.08)" },
      { type: "text", x: 270, y: 132, fill: "#f59e0b", fontSize: 9, textAnchor: "middle", textContent: "IaaS — Infrastructure Layer (EC2, GCE, VMs)" },
      { type: "text", x: 270, y: 165, fill: "#52525b", fontSize: 7, textAnchor: "middle", textContent: "Serverless · Microservices · Event-Driven · Data Mesh" }
    ]
  },

  'de-cloud-providers': {
    title: "Cloud Providers",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#f59e0b", fontSize: 12, fontWeight: "bold", textContent: "Big Three Cloud Providers for DE" },
      { type: "rect", x: 40, y: 52, width: 150, height: 100, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 115, y: 68, fill: "#f59e0b", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "AWS" },
      { type: "text", x: 52, y: 84, fill: "#71717a", fontSize: 7, textContent: "S3, Redshift, Glue" },
      { type: "text", x: 52, y: 96, fill: "#71717a", fontSize: 7, textContent: "Kinesis, EMR" },
      { type: "text", x: 52, y: 108, fill: "#71717a", fontSize: 7, textContent: "Lambda, Athena" },
      { type: "text", x: 52, y: 135, fill: "#52525b", fontSize: 6, textContent: "Largest market share" },
      { type: "rect", x: 210, y: 52, width: 150, height: 100, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 285, y: 68, fill: "#3b82f6", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "GCP" },
      { type: "text", x: 222, y: 84, fill: "#71717a", fontSize: 7, textContent: "BigQuery, Dataflow" },
      { type: "text", x: 222, y: 96, fill: "#71717a", fontSize: 7, textContent: "Pub/Sub, Dataproc" },
      { type: "text", x: 222, y: 108, fill: "#71717a", fontSize: 7, textContent: "Cloud Storage" },
      { type: "text", x: 222, y: 135, fill: "#52525b", fontSize: 6, textContent: "Best-in-class analytics" },
      { type: "rect", x: 380, y: 52, width: 150, height: 100, rx: 4, stroke: "#06b6d4", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 455, y: 68, fill: "#06b6d4", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "Azure" },
      { type: "text", x: 392, y: 84, fill: "#71717a", fontSize: 7, textContent: "Synapse, Data Factory" },
      { type: "text", x: 392, y: 96, fill: "#71717a", fontSize: 7, textContent: "Event Hubs, HDInsight" },
      { type: "text", x: 392, y: 108, fill: "#71717a", fontSize: 7, textContent: "Blob Storage" },
      { type: "text", x: 392, y: 135, fill: "#52525b", fontSize: 6, textContent: "Enterprise integration" }
    ]
  },

  // ===========================
  // CLUSTER COMPUTING (4 topics)
  // ===========================
  'de-cluster-what-is': {
    title: "What is Cluster Computing",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#a855f7", fontSize: 12, fontWeight: "bold", textContent: "Cluster Computing Architecture" },
      { type: "rect", x: 180, y: 45, width: 120, height: 40, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "rgba(245,158,11,0.1)" },
      { type: "text", x: 240, y: 69, fill: "#f59e0b", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Master Node" },
      { type: "line", x1: 200, y1: 85, x2: 120, y2: 110, stroke: "#52525b", strokeWidth: 1 },
      { type: "line", x1: 240, y1: 85, x2: 240, y2: 110, stroke: "#52525b", strokeWidth: 1 },
      { type: "line", x1: 280, y1: 85, x2: 360, y2: 110, stroke: "#52525b", strokeWidth: 1 },
      { type: "rect", x: 70, y: 110, width: 100, height: 35, rx: 3, stroke: "#3b82f6", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 120, y: 131, fill: "#3b82f6", fontSize: 8, textAnchor: "middle", textContent: "Worker 1" },
      { type: "rect", x: 190, y: 110, width: 100, height: 35, rx: 3, stroke: "#3b82f6", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 240, y: 131, fill: "#3b82f6", fontSize: 8, textAnchor: "middle", textContent: "Worker 2" },
      { type: "rect", x: 310, y: 110, width: 100, height: 35, rx: 3, stroke: "#3b82f6", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 360, y: 131, fill: "#3b82f6", fontSize: 8, textAnchor: "middle", textContent: "Worker N" },
      { type: "text", x: 240, y: 170, fill: "#52525b", fontSize: 7, textAnchor: "middle", textContent: "Distribute compute across commodity hardware" }
    ]
  },

  'de-cluster-hdfs': {
    title: "HDFS - Distributed File System",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#f59e0b", fontSize: 12, fontWeight: "bold", textContent: "HDFS Block Replication" },
      { type: "rect", x: 50, y: 55, width: 100, height: 35, rx: 3, stroke: "#f59e0b", strokeWidth: 1.5, fill: "rgba(245,158,11,0.1)" },
      { type: "text", x: 100, y: 76, fill: "#f59e0b", fontSize: 8, fontWeight: "bold", textAnchor: "middle", textContent: "NameNode" },
      { type: "line", x1: 100, y1: 90, x2: 100, y2: 108, stroke: "#52525b", strokeWidth: 1 },
      { type: "line", x1: 100, y1: 90, x2: 260, y2: 108, stroke: "#52525b", strokeWidth: 1 },
      { type: "line", x1: 100, y1: 90, x2: 420, y2: 108, stroke: "#52525b", strokeWidth: 1 },
      { type: "rect", x: 40, y: 108, width: 120, height: 55, rx: 3, stroke: "#3b82f6", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 100, y: 125, fill: "#3b82f6", fontSize: 8, fontWeight: "bold", textAnchor: "middle", textContent: "DataNode 1" },
      { type: "rect", x: 54, y: 135, width: 30, height: 18, rx: 2, stroke: "#10b981", strokeWidth: 1, fill: "rgba(16,185,129,0.15)" },
      { type: "text", x: 69, y: 147, fill: "#10b981", fontSize: 6, textAnchor: "middle", textContent: "B1" },
      { type: "rect", x: 88, y: 135, width: 30, height: 18, rx: 2, stroke: "#ec4899", strokeWidth: 1, fill: "rgba(236,72,153,0.15)" },
      { type: "text", x: 103, y: 147, fill: "#ec4899", fontSize: 6, textAnchor: "middle", textContent: "B2" },
      { type: "rect", x: 200, y: 108, width: 120, height: 55, rx: 3, stroke: "#3b82f6", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 260, y: 125, fill: "#3b82f6", fontSize: 8, fontWeight: "bold", textAnchor: "middle", textContent: "DataNode 2" },
      { type: "rect", x: 214, y: 135, width: 30, height: 18, rx: 2, stroke: "#10b981", strokeWidth: 1, fill: "rgba(16,185,129,0.15)" },
      { type: "text", x: 229, y: 147, fill: "#10b981", fontSize: 6, textAnchor: "middle", textContent: "B1" },
      { type: "rect", x: 248, y: 135, width: 30, height: 18, rx: 2, stroke: "#f59e0b", strokeWidth: 1, fill: "rgba(245,158,11,0.15)" },
      { type: "text", x: 263, y: 147, fill: "#f59e0b", fontSize: 6, textAnchor: "middle", textContent: "B3" },
      { type: "rect", x: 360, y: 108, width: 120, height: 55, rx: 3, stroke: "#3b82f6", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 420, y: 125, fill: "#3b82f6", fontSize: 8, fontWeight: "bold", textAnchor: "middle", textContent: "DataNode 3" },
      { type: "rect", x: 374, y: 135, width: 30, height: 18, rx: 2, stroke: "#ec4899", strokeWidth: 1, fill: "rgba(236,72,153,0.15)" },
      { type: "text", x: 389, y: 147, fill: "#ec4899", fontSize: 6, textAnchor: "middle", textContent: "B2" },
      { type: "rect", x: 408, y: 135, width: 30, height: 18, rx: 2, stroke: "#f59e0b", strokeWidth: 1, fill: "rgba(245,158,11,0.15)" },
      { type: "text", x: 423, y: 147, fill: "#f59e0b", fontSize: 6, textAnchor: "middle", textContent: "B3" },
      { type: "text", x: 270, y: 185, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Replication factor = 2 for fault tolerance" }
    ]
  },

  'de-cluster-jobs': {
    title: "Job Scheduling",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#10b981", fontSize: 12, fontWeight: "bold", textContent: "Job Scheduling & DAG Execution" },
      { type: "circle", cx: 100, cy: 75, r: 18, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 100, y: 78, fill: "#3b82f6", fontSize: 7, textAnchor: "middle", textContent: "Task A" },
      { type: "line", x1: 118, y1: 70, x2: 175, y2: 60, stroke: "#52525b", strokeWidth: 1 },
      { type: "line", x1: 118, y1: 80, x2: 175, y2: 90, stroke: "#52525b", strokeWidth: 1 },
      { type: "circle", cx: 195, cy: 58, r: 18, stroke: "#10b981", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 195, y: 61, fill: "#10b981", fontSize: 7, textAnchor: "middle", textContent: "Task B" },
      { type: "circle", cx: 195, cy: 92, r: 18, stroke: "#f59e0b", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 195, y: 95, fill: "#f59e0b", fontSize: 7, textAnchor: "middle", textContent: "Task C" },
      { type: "line", x1: 213, y1: 62, x2: 270, y2: 75, stroke: "#52525b", strokeWidth: 1 },
      { type: "line", x1: 213, y1: 88, x2: 270, y2: 77, stroke: "#52525b", strokeWidth: 1 },
      { type: "circle", cx: 290, cy: 75, r: 18, stroke: "#ec4899", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 290, y: 78, fill: "#ec4899", fontSize: 7, textAnchor: "middle", textContent: "Task D" },
      { type: "rect", x: 370, y: 55, width: 160, height: 50, rx: 4, stroke: "#a855f7", strokeWidth: 1, fill: "#18181b" },
      { type: "text", x: 450, y: 72, fill: "#a855f7", fontSize: 8, fontWeight: "bold", textAnchor: "middle", textContent: "Scheduler Strategies" },
      { type: "text", x: 380, y: 88, fill: "#71717a", fontSize: 7, textContent: "FIFO · Fair · Capacity" }
    ]
  },

  'de-cluster-management': {
    title: "Cluster Management Tools",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#ec4899", fontSize: 12, fontWeight: "bold", textContent: "K8s & YARN for Data Workloads" },
      { type: "rect", x: 40, y: 52, width: 200, height: 100, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 140, y: 68, fill: "#3b82f6", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "Kubernetes" },
      { type: "line", x1: 50, y1: 74, x2: 230, y2: 74, stroke: "#27272a", strokeWidth: 1 },
      { type: "text", x: 52, y: 88, fill: "#ffffff", fontSize: 7, textContent: "▸ Container orchestration" },
      { type: "text", x: 52, y: 100, fill: "#ffffff", fontSize: 7, textContent: "▸ Spark on K8s, Flink on K8s" },
      { type: "text", x: 52, y: 112, fill: "#ffffff", fontSize: 7, textContent: "▸ Auto-scaling pods" },
      { type: "text", x: 52, y: 124, fill: "#ffffff", fontSize: 7, textContent: "▸ GKE, EKS, AKS" },
      { type: "rect", x: 280, y: 52, width: 200, height: 100, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 380, y: 68, fill: "#f59e0b", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "YARN" },
      { type: "line", x1: 290, y1: 74, x2: 470, y2: 74, stroke: "#27272a", strokeWidth: 1 },
      { type: "text", x: 292, y: 88, fill: "#ffffff", fontSize: 7, textContent: "▸ Hadoop resource manager" },
      { type: "text", x: 292, y: 100, fill: "#ffffff", fontSize: 7, textContent: "▸ MapReduce, Spark, Tez" },
      { type: "text", x: 292, y: 112, fill: "#ffffff", fontSize: 7, textContent: "▸ Resource queues" },
      { type: "text", x: 292, y: 124, fill: "#ffffff", fontSize: 7, textContent: "▸ Capacity scheduler" }
    ]
  },

  // ===========================
  // BIG DATA TOOLS (2 topics)
  // ===========================
  'de-bigdata-spark': {
    title: "Apache Spark",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#f59e0b", fontSize: 12, fontWeight: "bold", textContent: "Spark Execution Model" },
      { type: "rect", x: 40, y: 55, width: 100, height: 35, rx: 3, stroke: "#f59e0b", strokeWidth: 1.5, fill: "rgba(245,158,11,0.1)" },
      { type: "text", x: 90, y: 76, fill: "#f59e0b", fontSize: 8, fontWeight: "bold", textAnchor: "middle", textContent: "Driver" },
      { type: "line", x1: 140, y1: 65, x2: 195, y2: 60, stroke: "#52525b", strokeWidth: 1 },
      { type: "line", x1: 140, y1: 72, x2: 195, y2: 85, stroke: "#52525b", strokeWidth: 1 },
      { type: "line", x1: 140, y1: 80, x2: 195, y2: 110, stroke: "#52525b", strokeWidth: 1 },
      { type: "rect", x: 195, y: 45, width: 100, height: 30, rx: 3, stroke: "#3b82f6", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 245, y: 64, fill: "#3b82f6", fontSize: 7, textAnchor: "middle", textContent: "Executor 1" },
      { type: "rect", x: 195, y: 78, width: 100, height: 30, rx: 3, stroke: "#3b82f6", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 245, y: 97, fill: "#3b82f6", fontSize: 7, textAnchor: "middle", textContent: "Executor 2" },
      { type: "rect", x: 195, y: 111, width: 100, height: 30, rx: 3, stroke: "#3b82f6", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 245, y: 130, fill: "#3b82f6", fontSize: 7, textAnchor: "middle", textContent: "Executor N" },
      { type: "rect", x: 360, y: 50, width: 170, height: 100, rx: 4, stroke: "#52525b", strokeWidth: 0.8, fill: "#18181b" },
      { type: "text", x: 445, y: 66, fill: "#10b981", fontSize: 8, fontWeight: "bold", textAnchor: "middle", textContent: "APIs" },
      { type: "text", x: 372, y: 82, fill: "#71717a", fontSize: 7, textContent: "RDD, DataFrame, Dataset" },
      { type: "text", x: 372, y: 95, fill: "#71717a", fontSize: 7, textContent: "Spark SQL, MLlib" },
      { type: "text", x: 372, y: 108, fill: "#71717a", fontSize: 7, textContent: "Structured Streaming" },
      { type: "text", x: 372, y: 121, fill: "#71717a", fontSize: 7, textContent: "GraphX" }
    ]
  },

  'de-bigdata-hadoop': {
    title: "Hadoop Ecosystem",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#eab308", fontSize: 12, fontWeight: "bold", textContent: "Hadoop Ecosystem Stack" },
      { type: "rect", x: 60, y: 48, width: 400, height: 25, rx: 2, stroke: "#f59e0b", strokeWidth: 1.2, fill: "rgba(245,158,11,0.08)" },
      { type: "text", x: 260, y: 65, fill: "#f59e0b", fontSize: 8, textAnchor: "middle", textContent: "Hive · Pig · Spark SQL — Query Layer" },
      { type: "rect", x: 60, y: 76, width: 400, height: 25, rx: 2, stroke: "#10b981", strokeWidth: 1.2, fill: "rgba(16,185,129,0.08)" },
      { type: "text", x: 260, y: 93, fill: "#10b981", fontSize: 8, textAnchor: "middle", textContent: "MapReduce · Tez · Spark — Processing Layer" },
      { type: "rect", x: 60, y: 104, width: 400, height: 25, rx: 2, stroke: "#3b82f6", strokeWidth: 1.2, fill: "rgba(59,130,246,0.08)" },
      { type: "text", x: 260, y: 121, fill: "#3b82f6", fontSize: 8, textAnchor: "middle", textContent: "YARN — Resource Management" },
      { type: "rect", x: 60, y: 132, width: 400, height: 25, rx: 2, stroke: "#ec4899", strokeWidth: 1.2, fill: "rgba(236,72,153,0.08)" },
      { type: "text", x: 260, y: 149, fill: "#ec4899", fontSize: 8, textAnchor: "middle", textContent: "HDFS — Distributed Storage" },
      { type: "text", x: 260, y: 178, fill: "#52525b", fontSize: 7, textAnchor: "middle", textContent: "Ecosystem tools: Sqoop, Flume, Oozie, ZooKeeper, HBase" }
    ]
  },

  // ===========================
  // CONTAINERS (1 topic)
  // ===========================
  'de-containers': {
    title: "Docker & Kubernetes",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#06b6d4", fontSize: 12, fontWeight: "bold", textContent: "Containerized Data Pipelines" },
      { type: "rect", x: 50, y: 55, width: 180, height: 40, rx: 4, stroke: "#06b6d4", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 140, y: 72, fill: "#06b6d4", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Docker Container" },
      { type: "text", x: 140, y: 85, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "App + Dependencies" },
      { type: "line", x1: 230, y1: 75, x2: 270, y2: 75, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 270, y: 55, width: 200, height: 90, rx: 4, stroke: "#a855f7", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 370, y: 70, fill: "#a855f7", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Kubernetes Cluster" },
      { type: "line", x1: 280, y1: 76, x2: 460, y2: 76, stroke: "#27272a", strokeWidth: 0.5 },
      { type: "rect", x: 285, y: 82, width: 50, height: 22, rx: 2, stroke: "#10b981", strokeWidth: 1, fill: "rgba(16,185,129,0.1)" },
      { type: "text", x: 310, y: 97, fill: "#10b981", fontSize: 6, textAnchor: "middle", textContent: "Pod 1" },
      { type: "rect", x: 340, y: 82, width: 50, height: 22, rx: 2, stroke: "#10b981", strokeWidth: 1, fill: "rgba(16,185,129,0.1)" },
      { type: "text", x: 365, y: 97, fill: "#10b981", fontSize: 6, textAnchor: "middle", textContent: "Pod 2" },
      { type: "rect", x: 395, y: 82, width: 50, height: 22, rx: 2, stroke: "#10b981", strokeWidth: 1, fill: "rgba(16,185,129,0.1)" },
      { type: "text", x: 420, y: 97, fill: "#10b981", fontSize: 6, textAnchor: "middle", textContent: "Pod 3" },
      { type: "rect", x: 285, y: 112, width: 160, height: 22, rx: 2, stroke: "#52525b", strokeWidth: 0.8, fill: "#0a0a0a" },
      { type: "text", x: 365, y: 126, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Auto-scaling · Self-healing" }
    ]
  },

  // ===========================
  // CI/CD & MONITORING (2 topics)
  // ===========================
  'de-cicd': {
    title: "CI/CD for Data Pipelines",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#10b981", fontSize: 12, fontWeight: "bold", textContent: "CI/CD Pipeline for Data Code" },
      { type: "rect", x: 40, y: 60, width: 80, height: 35, rx: 16, stroke: "#3b82f6", strokeWidth: 1.5, fill: "rgba(59,130,246,0.1)" },
      { type: "text", x: 80, y: 81, fill: "#3b82f6", fontSize: 8, textAnchor: "middle", textContent: "Commit" },
      { type: "line", x1: 120, y1: 77, x2: 145, y2: 77, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 145, y: 60, width: 80, height: 35, rx: 16, stroke: "#f59e0b", strokeWidth: 1.5, fill: "rgba(245,158,11,0.1)" },
      { type: "text", x: 185, y: 81, fill: "#f59e0b", fontSize: 8, textAnchor: "middle", textContent: "Build" },
      { type: "line", x1: 225, y1: 77, x2: 250, y2: 77, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 250, y: 60, width: 80, height: 35, rx: 16, stroke: "#ec4899", strokeWidth: 1.5, fill: "rgba(236,72,153,0.1)" },
      { type: "text", x: 290, y: 81, fill: "#ec4899", fontSize: 8, textAnchor: "middle", textContent: "Test" },
      { type: "line", x1: 330, y1: 77, x2: 355, y2: 77, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 355, y: 60, width: 80, height: 35, rx: 16, stroke: "#10b981", strokeWidth: 1.5, fill: "rgba(16,185,129,0.1)" },
      { type: "text", x: 395, y: 81, fill: "#10b981", fontSize: 8, textAnchor: "middle", textContent: "Deploy" },
      { type: "line", x1: 435, y1: 77, x2: 460, y2: 77, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 460, y: 60, width: 80, height: 35, rx: 16, stroke: "#a855f7", strokeWidth: 1.5, fill: "rgba(168,85,247,0.1)" },
      { type: "text", x: 500, y: 81, fill: "#a855f7", fontSize: 8, textAnchor: "middle", textContent: "Monitor" },
      { type: "text", x: 290, y: 120, fill: "#52525b", fontSize: 7, textAnchor: "middle", textContent: "GitHub Actions · GitLab CI · CircleCI · ArgoCD" }
    ]
  },

  'de-monitoring': {
    title: "Monitoring & Observability",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#ef4444", fontSize: 12, fontWeight: "bold", textContent: "Observability Three Pillars" },
      { type: "rect", x: 50, y: 52, width: 130, height: 65, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 115, y: 68, fill: "#3b82f6", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Metrics" },
      { type: "text", x: 62, y: 83, fill: "#71717a", fontSize: 7, textContent: "Pipeline latency" },
      { type: "text", x: 62, y: 95, fill: "#71717a", fontSize: 7, textContent: "Throughput, errors" },
      { type: "text", x: 62, y: 107, fill: "#71717a", fontSize: 7, textContent: "Prometheus, Datadog" },
      { type: "rect", x: 200, y: 52, width: 130, height: 65, rx: 4, stroke: "#10b981", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 265, y: 68, fill: "#10b981", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Logs" },
      { type: "text", x: 212, y: 83, fill: "#71717a", fontSize: 7, textContent: "Structured logging" },
      { type: "text", x: 212, y: 95, fill: "#71717a", fontSize: 7, textContent: "Error stack traces" },
      { type: "text", x: 212, y: 107, fill: "#71717a", fontSize: 7, textContent: "ELK, CloudWatch" },
      { type: "rect", x: 350, y: 52, width: 130, height: 65, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 415, y: 68, fill: "#f59e0b", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Traces" },
      { type: "text", x: 362, y: 83, fill: "#71717a", fontSize: 7, textContent: "Request flow tracing" },
      { type: "text", x: 362, y: 95, fill: "#71717a", fontSize: 7, textContent: "Span analysis" },
      { type: "text", x: 362, y: 107, fill: "#71717a", fontSize: 7, textContent: "Jaeger, Sentry" }
    ]
  },

  // ===========================
  // MESSAGING SYSTEMS (5 topics)
  // ===========================
  'de-message-why': {
    title: "Why Messaging Systems?",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#3b82f6", fontSize: 12, fontWeight: "bold", textContent: "Producer → Broker → Consumer" },
      { type: "rect", x: 50, y: 60, width: 100, height: 45, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 100, y: 78, fill: "#3b82f6", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Producer" },
      { type: "text", x: 100, y: 93, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Sends events" },
      { type: "line", x1: 150, y1: 82, x2: 200, y2: 82, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "line", x1: 196, y1: 79, x2: 200, y2: 82, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 200, y: 55, width: 140, height: 55, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "rgba(245,158,11,0.08)" },
      { type: "text", x: 270, y: 75, fill: "#f59e0b", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Message Broker" },
      { type: "text", x: 270, y: 90, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Queue / Topic" },
      { type: "text", x: 270, y: 102, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Buffer + Routing" },
      { type: "line", x1: 340, y1: 82, x2: 390, y2: 82, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "line", x1: 386, y1: 79, x2: 390, y2: 82, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 390, y: 60, width: 100, height: 45, rx: 4, stroke: "#10b981", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 440, y: 78, fill: "#10b981", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Consumer" },
      { type: "text", x: 440, y: 93, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Processes events" },
      { type: "text", x: 270, y: 135, fill: "#52525b", fontSize: 7, textAnchor: "middle", textContent: "Decoupling · Buffering · Fault tolerance · Replay" }
    ]
  },

  'de-message-async': {
    title: "Async vs Sync Communication",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#f59e0b", fontSize: 12, fontWeight: "bold", textContent: "Synchronous vs Asynchronous" },
      { type: "rect", x: 40, y: 52, width: 220, height: 50, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 150, y: 68, fill: "#3b82f6", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "SYNC (Request-Response)" },
      { type: "text", x: 150, y: 84, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Caller waits · REST, gRPC · Tight coupling" },
      { type: "rect", x: 290, y: 52, width: 220, height: 50, rx: 4, stroke: "#10b981", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 400, y: 68, fill: "#10b981", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "ASYNC (Event-Driven)" },
      { type: "text", x: 400, y: 84, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Fire & forget · Kafka · Loose coupling" },
      { type: "rect", x: 130, y: 120, width: 280, height: 30, rx: 3, stroke: "#52525b", strokeWidth: 0.8, fill: "#18181b" },
      { type: "text", x: 270, y: 139, fill: "#52525b", fontSize: 8, textAnchor: "middle", textContent: "Data pipelines prefer async for resilience & scalability" }
    ]
  },

  'de-message-streams': {
    title: "Messages vs Streams",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#ec4899", fontSize: 12, fontWeight: "bold", textContent: "Message Queue vs Event Stream" },
      { type: "rect", x: 40, y: 52, width: 210, height: 80, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 145, y: 68, fill: "#3b82f6", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "MESSAGE QUEUE" },
      { type: "text", x: 52, y: 84, fill: "#71717a", fontSize: 7, textContent: "▸ Consumed once, deleted" },
      { type: "text", x: 52, y: 96, fill: "#71717a", fontSize: 7, textContent: "▸ Point-to-point delivery" },
      { type: "text", x: 52, y: 108, fill: "#71717a", fontSize: 7, textContent: "▸ RabbitMQ, SQS" },
      { type: "rect", x: 290, y: 52, width: 210, height: 80, rx: 4, stroke: "#10b981", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 395, y: 68, fill: "#10b981", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "EVENT STREAM" },
      { type: "text", x: 302, y: 84, fill: "#71717a", fontSize: 7, textContent: "▸ Retained, replayable" },
      { type: "text", x: 302, y: 96, fill: "#71717a", fontSize: 7, textContent: "▸ Pub/Sub, multi-consumer" },
      { type: "text", x: 302, y: 108, fill: "#71717a", fontSize: 7, textContent: "▸ Kafka, Kinesis, Pulsar" }
    ]
  },

  'de-message-practices': {
    title: "Messaging Best Practices",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#a855f7", fontSize: 12, fontWeight: "bold", textContent: "Messaging Best Practices" },
      { type: "text", x: 50, y: 60, fill: "#10b981", fontSize: 9, textContent: "✓ Idempotent consumers" },
      { type: "text", x: 50, y: 78, fill: "#10b981", fontSize: 9, textContent: "✓ Dead-letter queues for failures" },
      { type: "text", x: 50, y: 96, fill: "#10b981", fontSize: 9, textContent: "✓ Schema registry (Avro/Protobuf)" },
      { type: "text", x: 50, y: 114, fill: "#10b981", fontSize: 9, textContent: "✓ Consumer group rebalancing" },
      { type: "text", x: 50, y: 132, fill: "#10b981", fontSize: 9, textContent: "✓ Backpressure handling" },
      { type: "text", x: 50, y: 150, fill: "#10b981", fontSize: 9, textContent: "✓ Exactly-once vs at-least-once semantics" },
      { type: "text", x: 50, y: 168, fill: "#10b981", fontSize: 9, textContent: "✓ Partition key design for ordering" },
      { type: "rect", x: 350, y: 55, width: 170, height: 100, rx: 4, stroke: "#52525b", strokeWidth: 0.8, fill: "#18181b" },
      { type: "text", x: 435, y: 72, fill: "#f59e0b", fontSize: 8, fontWeight: "bold", textAnchor: "middle", textContent: "Delivery Guarantees" },
      { type: "text", x: 362, y: 90, fill: "#71717a", fontSize: 7, textContent: "At-most-once (fire&forget)" },
      { type: "text", x: 362, y: 105, fill: "#71717a", fontSize: 7, textContent: "At-least-once (ack+retry)" },
      { type: "text", x: 362, y: 120, fill: "#71717a", fontSize: 7, textContent: "Exactly-once (txn kafka)" }
    ]
  },

  'de-message-tools': {
    title: "Messaging Tools",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#ef4444", fontSize: 12, fontWeight: "bold", textContent: "Common Messaging Platforms" },
      { type: "rect", x: 40, y: 55, width: 130, height: 50, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 105, y: 72, fill: "#3b82f6", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Apache Kafka" },
      { type: "text", x: 105, y: 88, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Distributed log" },
      { type: "rect", x: 190, y: 55, width: 130, height: 50, rx: 4, stroke: "#10b981", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 255, y: 72, fill: "#10b981", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "RabbitMQ" },
      { type: "text", x: 255, y: 88, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "AMQP broker" },
      { type: "rect", x: 340, y: 55, width: 130, height: 50, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 405, y: 72, fill: "#f59e0b", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "AWS SQS/SNS" },
      { type: "text", x: 405, y: 88, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Managed queue" },
      { type: "rect", x: 40, y: 115, width: 130, height: 50, rx: 4, stroke: "#ec4899", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 105, y: 132, fill: "#ec4899", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Google Pub/Sub" },
      { type: "text", x: 105, y: 148, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Global messaging" },
      { type: "rect", x: 190, y: 115, width: 130, height: 50, rx: 4, stroke: "#a855f7", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 255, y: 132, fill: "#a855f7", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Apache Pulsar" },
      { type: "text", x: 255, y: 148, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Multi-tenant" },
      { type: "rect", x: 340, y: 115, width: 130, height: 50, rx: 4, stroke: "#06b6d4", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 405, y: 132, fill: "#06b6d4", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Azure Event Hubs" },
      { type: "text", x: 405, y: 148, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Streaming ingest" }
    ]
  },

  // ===========================
  // TESTING & IaC (3 topics)
  // ===========================
  'de-testing-types': {
    title: "Testing Types",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#10b981", fontSize: 12, fontWeight: "bold", textContent: "Testing Pyramid for Data" },
      { type: "rect", x: 170, y: 48, width: 200, height: 30, rx: 3, stroke: "#ef4444", strokeWidth: 1.2, fill: "rgba(239,68,68,0.08)" },
      { type: "text", x: 270, y: 67, fill: "#ef4444", fontSize: 8, textAnchor: "middle", textContent: "E2E Tests (Few, Expensive)" },
      { type: "rect", x: 140, y: 82, width: 260, height: 30, rx: 3, stroke: "#f59e0b", strokeWidth: 1.2, fill: "rgba(245,158,11,0.08)" },
      { type: "text", x: 270, y: 101, fill: "#f59e0b", fontSize: 8, textAnchor: "middle", textContent: "Integration Tests (Pipeline validation)" },
      { type: "rect", x: 110, y: 116, width: 320, height: 30, rx: 3, stroke: "#10b981", strokeWidth: 1.2, fill: "rgba(16,185,129,0.08)" },
      { type: "text", x: 270, y: 135, fill: "#10b981", fontSize: 8, textAnchor: "middle", textContent: "Unit Tests (Many, Fast — transform functions)" },
      { type: "rect", x: 80, y: 150, width: 380, height: 30, rx: 3, stroke: "#3b82f6", strokeWidth: 1.2, fill: "rgba(59,130,246,0.08)" },
      { type: "text", x: 270, y: 169, fill: "#3b82f6", fontSize: 8, textAnchor: "middle", textContent: "Data Quality Tests (Great Expectations, Soda, dbt tests)" }
    ]
  },

  'de-iac-concepts': {
    title: "Infrastructure as Code",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#a855f7", fontSize: 12, fontWeight: "bold", textContent: "Declarative vs Imperative IaC" },
      { type: "rect", x: 40, y: 55, width: 210, height: 80, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 145, y: 72, fill: "#3b82f6", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "DECLARATIVE" },
      { type: "text", x: 52, y: 88, fill: "#71717a", fontSize: 7, textContent: "▸ \"What\" you want" },
      { type: "text", x: 52, y: 100, fill: "#71717a", fontSize: 7, textContent: "▸ State convergence" },
      { type: "text", x: 52, y: 112, fill: "#71717a", fontSize: 7, textContent: "▸ Terraform, CloudFormation" },
      { type: "text", x: 52, y: 124, fill: "#10b981", fontSize: 7, textContent: "Idempotent ✓" },
      { type: "rect", x: 280, y: 55, width: 210, height: 80, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 385, y: 72, fill: "#f59e0b", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "IMPERATIVE" },
      { type: "text", x: 292, y: 88, fill: "#71717a", fontSize: 7, textContent: "▸ \"How\" to do it" },
      { type: "text", x: 292, y: 100, fill: "#71717a", fontSize: 7, textContent: "▸ Step-by-step scripts" },
      { type: "text", x: 292, y: 112, fill: "#71717a", fontSize: 7, textContent: "▸ AWS CDK, Pulumi" },
      { type: "text", x: 292, y: 124, fill: "#ef4444", fontSize: 7, textContent: "More flexible, less safe" }
    ]
  },

  'de-iac-tools': {
    title: "IaC Tools",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#a855f7", fontSize: 12, fontWeight: "bold", textContent: "Infrastructure as Code Tools" },
      { type: "rect", x: 40, y: 55, width: 140, height: 50, rx: 4, stroke: "#a855f7", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 110, y: 74, fill: "#a855f7", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Terraform" },
      { type: "text", x: 110, y: 90, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Multi-cloud, HCL" },
      { type: "rect", x: 200, y: 55, width: 140, height: 50, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 270, y: 74, fill: "#f59e0b", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "AWS CDK" },
      { type: "text", x: 270, y: 90, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "TypeScript/Python" },
      { type: "rect", x: 360, y: 55, width: 140, height: 50, rx: 4, stroke: "#ec4899", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 430, y: 74, fill: "#ec4899", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Pulumi" },
      { type: "text", x: 430, y: 90, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "General-purpose langs" },
      { type: "rect", x: 120, y: 120, width: 300, height: 30, rx: 3, stroke: "#52525b", strokeWidth: 0.8, fill: "#18181b" },
      { type: "text", x: 270, y: 139, fill: "#52525b", fontSize: 8, textAnchor: "middle", textContent: "Version-controlled · Reproducible · Auditable" }
    ]
  },

  // ===========================
  // SECURITY & GOVERNANCE (3 topics)
  // ===========================
  'de-security-concepts': {
    title: "Security Principles",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#ef4444", fontSize: 12, fontWeight: "bold", textContent: "Data Security Layers" },
      { type: "rect", x: 100, y: 48, width: 340, height: 28, rx: 3, stroke: "#ef4444", strokeWidth: 1.2, fill: "rgba(239,68,68,0.08)" },
      { type: "text", x: 270, y: 66, fill: "#ef4444", fontSize: 8, textAnchor: "middle", textContent: "Network Security — VPC, Firewalls, WAF" },
      { type: "rect", x: 120, y: 80, width: 300, height: 28, rx: 3, stroke: "#f59e0b", strokeWidth: 1.2, fill: "rgba(245,158,11,0.08)" },
      { type: "text", x: 270, y: 98, fill: "#f59e0b", fontSize: 8, textAnchor: "middle", textContent: "Authentication — OAuth, IAM, RBAC, SSO" },
      { type: "rect", x: 140, y: 112, width: 260, height: 28, rx: 3, stroke: "#10b981", strokeWidth: 1.2, fill: "rgba(16,185,129,0.08)" },
      { type: "text", x: 270, y: 130, fill: "#10b981", fontSize: 8, textAnchor: "middle", textContent: "Encryption — AES-256, TLS, at-rest/in-transit" },
      { type: "rect", x: 160, y: 144, width: 220, height: 28, rx: 3, stroke: "#3b82f6", strokeWidth: 1.2, fill: "rgba(59,130,246,0.08)" },
      { type: "text", x: 270, y: 162, fill: "#3b82f6", fontSize: 8, textAnchor: "middle", textContent: "Data Masking — PII, Tokenization" }
    ]
  },

  'de-gov-concepts': {
    title: "Data Governance",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#3b82f6", fontSize: 12, fontWeight: "bold", textContent: "Data Governance Framework" },
      { type: "rect", x: 150, y: 50, width: 240, height: 35, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "rgba(59,130,246,0.08)" },
      { type: "text", x: 270, y: 72, fill: "#3b82f6", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "DATA GOVERNANCE" },
      { type: "line", x1: 200, y1: 85, x2: 120, y2: 105, stroke: "#52525b", strokeWidth: 1 },
      { type: "line", x1: 270, y1: 85, x2: 270, y2: 105, stroke: "#52525b", strokeWidth: 1 },
      { type: "line", x1: 340, y1: 85, x2: 420, y2: 105, stroke: "#52525b", strokeWidth: 1 },
      { type: "rect", x: 50, y: 105, width: 130, height: 45, rx: 3, stroke: "#10b981", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 115, y: 122, fill: "#10b981", fontSize: 8, fontWeight: "bold", textAnchor: "middle", textContent: "Data Quality" },
      { type: "text", x: 115, y: 138, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Validation, profiling" },
      { type: "rect", x: 200, y: 105, width: 140, height: 45, rx: 3, stroke: "#f59e0b", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 270, y: 122, fill: "#f59e0b", fontSize: 8, fontWeight: "bold", textAnchor: "middle", textContent: "Data Lineage" },
      { type: "text", x: 270, y: 138, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Source-to-target tracking" },
      { type: "rect", x: 360, y: 105, width: 130, height: 45, rx: 3, stroke: "#ec4899", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 425, y: 122, fill: "#ec4899", fontSize: 8, fontWeight: "bold", textAnchor: "middle", textContent: "Metadata Mgmt" },
      { type: "text", x: 425, y: 138, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Catalog, discovery" }
    ]
  },

  'de-privacy-regulations': {
    title: "Privacy Regulations",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#ec4899", fontSize: 12, fontWeight: "bold", textContent: "Privacy & Compliance" },
      { type: "rect", x: 40, y: 55, width: 150, height: 60, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 115, y: 72, fill: "#3b82f6", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "GDPR" },
      { type: "text", x: 52, y: 88, fill: "#71717a", fontSize: 7, textContent: "EU data protection" },
      { type: "text", x: 52, y: 100, fill: "#71717a", fontSize: 7, textContent: "Right to erasure" },
      { type: "rect", x: 210, y: 55, width: 150, height: 60, rx: 4, stroke: "#10b981", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 285, y: 72, fill: "#10b981", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "CCPA" },
      { type: "text", x: 222, y: 88, fill: "#71717a", fontSize: 7, textContent: "California privacy" },
      { type: "text", x: 222, y: 100, fill: "#71717a", fontSize: 7, textContent: "Opt-out rights" },
      { type: "rect", x: 380, y: 55, width: 150, height: 60, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 455, y: 72, fill: "#f59e0b", fontSize: 10, fontWeight: "bold", textAnchor: "middle", textContent: "EU AI Act" },
      { type: "text", x: 392, y: 88, fill: "#71717a", fontSize: 7, textContent: "AI system classification" },
      { type: "text", x: 392, y: 100, fill: "#71717a", fontSize: 7, textContent: "Risk-based regulation" },
      { type: "text", x: 285, y: 140, fill: "#52525b", fontSize: 7, textAnchor: "middle", textContent: "Data engineers must build compliant pipelines from day one" }
    ]
  },

  // ===========================
  // DATA SERVING (5 topics)
  // ===========================
  'de-serving-analytics': {
    title: "Data Analytics",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#3b82f6", fontSize: 12, fontWeight: "bold", textContent: "Analytics Maturity Spectrum" },
      { type: "rect", x: 40, y: 55, width: 120, height: 45, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "rgba(59,130,246,0.08)" },
      { type: "text", x: 100, y: 72, fill: "#3b82f6", fontSize: 8, fontWeight: "bold", textAnchor: "middle", textContent: "Descriptive" },
      { type: "text", x: 100, y: 86, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "What happened?" },
      { type: "line", x1: 160, y1: 77, x2: 180, y2: 77, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 180, y: 55, width: 120, height: 45, rx: 4, stroke: "#10b981", strokeWidth: 1.5, fill: "rgba(16,185,129,0.08)" },
      { type: "text", x: 240, y: 72, fill: "#10b981", fontSize: 8, fontWeight: "bold", textAnchor: "middle", textContent: "Diagnostic" },
      { type: "text", x: 240, y: 86, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Why did it happen?" },
      { type: "line", x1: 300, y1: 77, x2: 320, y2: 77, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 320, y: 55, width: 120, height: 45, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "rgba(245,158,11,0.08)" },
      { type: "text", x: 380, y: 72, fill: "#f59e0b", fontSize: 8, fontWeight: "bold", textAnchor: "middle", textContent: "Predictive" },
      { type: "text", x: 380, y: 86, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "What will happen?" },
      { type: "line", x1: 440, y1: 77, x2: 460, y2: 77, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 460, y: 55, width: 100, height: 45, rx: 4, stroke: "#ec4899", strokeWidth: 1.5, fill: "rgba(236,72,153,0.08)" },
      { type: "text", x: 510, y: 72, fill: "#ec4899", fontSize: 8, fontWeight: "bold", textAnchor: "middle", textContent: "Prescriptive" },
      { type: "text", x: 510, y: 86, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "What to do?" }
    ]
  },

  'de-serving-bi': {
    title: "Business Intelligence",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#f59e0b", fontSize: 12, fontWeight: "bold", textContent: "BI Tools & Dashboarding" },
      { type: "rect", x: 40, y: 55, width: 120, height: 45, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 100, y: 75, fill: "#3b82f6", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Looker" },
      { type: "text", x: 100, y: 90, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "LookML semantic" },
      { type: "rect", x: 180, y: 55, width: 120, height: 45, rx: 4, stroke: "#f59e0b", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 240, y: 75, fill: "#f59e0b", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Tableau" },
      { type: "text", x: 240, y: 90, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Visual analytics" },
      { type: "rect", x: 320, y: 55, width: 120, height: 45, rx: 4, stroke: "#10b981", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 380, y: 75, fill: "#10b981", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Power BI" },
      { type: "text", x: 380, y: 90, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Microsoft stack" },
      { type: "rect", x: 460, y: 55, width: 100, height: 45, rx: 4, stroke: "#a855f7", strokeWidth: 1.5, fill: "#18181b" },
      { type: "text", x: 510, y: 75, fill: "#a855f7", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Metabase" },
      { type: "text", x: 510, y: 90, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Open source" },
      { type: "text", x: 300, y: 125, fill: "#52525b", fontSize: 7, textAnchor: "middle", textContent: "Connect to warehouse → Build semantic layer → Create dashboards" }
    ]
  },

  'de-serving-reverse-etl': {
    title: "Reverse ETL",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#ec4899", fontSize: 12, fontWeight: "bold", textContent: "Reverse ETL: Warehouse → SaaS" },
      { type: "rect", x: 50, y: 60, width: 120, height: 50, rx: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "rgba(59,130,246,0.08)" },
      { type: "text", x: 110, y: 82, fill: "#3b82f6", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Data Warehouse" },
      { type: "text", x: 110, y: 97, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Source of truth" },
      { type: "line", x1: 170, y1: 85, x2: 220, y2: 85, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "line", x1: 216, y1: 82, x2: 220, y2: 85, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 220, y: 60, width: 110, height: 50, rx: 4, stroke: "#ec4899", strokeWidth: 1.5, fill: "rgba(236,72,153,0.08)" },
      { type: "text", x: 275, y: 82, fill: "#ec4899", fontSize: 9, fontWeight: "bold", textAnchor: "middle", textContent: "Reverse ETL" },
      { type: "text", x: 275, y: 97, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "Census, Hightouch" },
      { type: "line", x1: 330, y1: 72, x2: 390, y2: 62, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "line", x1: 330, y1: 85, x2: 390, y2: 85, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "line", x1: 330, y1: 98, x2: 390, y2: 108, stroke: "#a1a1aa", strokeWidth: 1 },
      { type: "rect", x: 390, y: 47, width: 110, height: 28, rx: 3, stroke: "#10b981", strokeWidth: 1, fill: "#18181b" },
      { type: "text", x: 445, y: 65, fill: "#10b981", fontSize: 8, textAnchor: "middle", textContent: "Salesforce CRM" },
      { type: "rect", x: 390, y: 78, width: 110, height: 28, rx: 3, stroke: "#f59e0b", strokeWidth: 1, fill: "#18181b" },
      { type: "text", x: 445, y: 96, fill: "#f59e0b", fontSize: 8, textAnchor: "middle", textContent: "HubSpot" },
      { type: "rect", x: 390, y: 109, width: 110, height: 28, rx: 3, stroke: "#a855f7", strokeWidth: 1, fill: "#18181b" },
      { type: "text", x: 445, y: 127, fill: "#a855f7", fontSize: 8, textAnchor: "middle", textContent: "Google Ads" }
    ]
  },

  'de-ml': {
    title: "Machine Learning for DE",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#10b981", fontSize: 12, fontWeight: "bold", textContent: "ML Pipeline Architecture" },
      { type: "rect", x: 40, y: 60, width: 85, height: 35, rx: 3, stroke: "#3b82f6", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 82, y: 81, fill: "#3b82f6", fontSize: 7, textAnchor: "middle", textContent: "Data Prep" },
      { type: "line", x1: 125, y1: 77, x2: 145, y2: 77, stroke: "#a1a1aa", strokeWidth: 0.8 },
      { type: "rect", x: 145, y: 60, width: 85, height: 35, rx: 3, stroke: "#10b981", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 187, y: 81, fill: "#10b981", fontSize: 7, textAnchor: "middle", textContent: "Feature Eng" },
      { type: "line", x1: 230, y1: 77, x2: 250, y2: 77, stroke: "#a1a1aa", strokeWidth: 0.8 },
      { type: "rect", x: 250, y: 60, width: 85, height: 35, rx: 3, stroke: "#f59e0b", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 292, y: 81, fill: "#f59e0b", fontSize: 7, textAnchor: "middle", textContent: "Training" },
      { type: "line", x1: 335, y1: 77, x2: 355, y2: 77, stroke: "#a1a1aa", strokeWidth: 0.8 },
      { type: "rect", x: 355, y: 60, width: 85, height: 35, rx: 3, stroke: "#ec4899", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 397, y: 81, fill: "#ec4899", fontSize: 7, textAnchor: "middle", textContent: "Evaluation" },
      { type: "line", x1: 440, y1: 77, x2: 460, y2: 77, stroke: "#a1a1aa", strokeWidth: 0.8 },
      { type: "rect", x: 460, y: 60, width: 85, height: 35, rx: 3, stroke: "#a855f7", strokeWidth: 1.2, fill: "#18181b" },
      { type: "text", x: 502, y: 81, fill: "#a855f7", fontSize: 7, textAnchor: "middle", textContent: "Deployment" },
      { type: "rect", x: 120, y: 115, width: 300, height: 30, rx: 3, stroke: "#52525b", strokeWidth: 0.8, fill: "#18181b" },
      { type: "text", x: 270, y: 134, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "DE provides: Feature Store · Training Data · Model Registry" }
    ]
  },

  'de-mlops': {
    title: "MLOps",
    elements: [
      { type: "text", x: 30, y: 32, fill: "#a855f7", fontSize: 12, fontWeight: "bold", textContent: "MLOps Lifecycle" },
      { type: "rect", x: 120, y: 50, width: 90, height: 35, rx: 16, stroke: "#3b82f6", strokeWidth: 1.2, fill: "rgba(59,130,246,0.08)" },
      { type: "text", x: 165, y: 71, fill: "#3b82f6", fontSize: 8, textAnchor: "middle", textContent: "Data" },
      { type: "line", x1: 210, y1: 62, x2: 240, y2: 55, stroke: "#52525b", strokeWidth: 0.8 },
      { type: "rect", x: 240, y: 38, width: 90, height: 35, rx: 16, stroke: "#10b981", strokeWidth: 1.2, fill: "rgba(16,185,129,0.08)" },
      { type: "text", x: 285, y: 59, fill: "#10b981", fontSize: 8, textAnchor: "middle", textContent: "Train" },
      { type: "line", x1: 330, y1: 55, x2: 370, y2: 62, stroke: "#52525b", strokeWidth: 0.8 },
      { type: "rect", x: 370, y: 50, width: 90, height: 35, rx: 16, stroke: "#f59e0b", strokeWidth: 1.2, fill: "rgba(245,158,11,0.08)" },
      { type: "text", x: 415, y: 71, fill: "#f59e0b", fontSize: 8, textAnchor: "middle", textContent: "Deploy" },
      { type: "line", x1: 415, y1: 85, x2: 415, y2: 105, stroke: "#52525b", strokeWidth: 0.8 },
      { type: "rect", x: 370, y: 105, width: 90, height: 35, rx: 16, stroke: "#ec4899", strokeWidth: 1.2, fill: "rgba(236,72,153,0.08)" },
      { type: "text", x: 415, y: 126, fill: "#ec4899", fontSize: 8, textAnchor: "middle", textContent: "Monitor" },
      { type: "line", x1: 370, y1: 122, x2: 210, y2: 75, stroke: "#52525b", strokeWidth: 0.8, strokeDasharray: "3,2" },
      { type: "text", x: 280, y: 105, fill: "#ef4444", fontSize: 7, textAnchor: "middle", textContent: "Retrain loop" },
      { type: "rect", x: 130, y: 110, width: 200, height: 30, rx: 3, stroke: "#52525b", strokeWidth: 0.8, fill: "#18181b" },
      { type: "text", x: 230, y: 129, fill: "#71717a", fontSize: 7, textAnchor: "middle", textContent: "MLflow · Kubeflow · SageMaker" }
    ]
  }

};
