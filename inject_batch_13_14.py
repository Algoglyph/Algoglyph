import json
import sys
import os

SCRATCH = "/Users/vansh_uni/.gemini/antigravity/brain/ae22bccb-017d-43bb-b2c8-57f825eba924/scratch"

def inject_article(slug, title, tagline, category, md_path):
    if not os.path.exists(md_path):
        print(f"SKIP (not found): {md_path}")
        return False
    try:
        with open(md_path, 'r') as f:
            md_content = f.read()
    except Exception as e:
        print(f"Failed to read {md_path}: {e}")
        return False

    escaped_md = md_content.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

    new_post = f"""  {{
    slug: "{slug}",
    title: "{title}",
    tagline: "{tagline}",
    category: "{category}",
    readTime: 7,
    lastUpdated: "2026-07-20",
    prerequisites: [],
    related: [],
    practiceProblems: [],
    markdown: `{escaped_md}`,
    content: {{
      introduction: "",
      whyImportant: "",
      realWorldApps: [],
      algorithmDescription: [],
      complexity: [],
      implementationCpp: "",
      implementationPython: "",
      commonMistakes: [],
      interviewQuestions: [],
      summary: ""
    }}
  }}"""

    ts_file = 'src/config/blogData.ts'
    with open(ts_file, 'r') as f:
        content = f.read()

    # Check slug not already present
    if f'slug: "{slug}"' in content:
        print(f"ALREADY EXISTS: {slug} — skipping.")
        return True

    if '\n];' in content:
        idx = content.rfind('\n];')
        if idx != -1:
            new_content = content[:idx] + ',\n' + new_post + content[idx:]
            with open(ts_file, 'w') as f:
                f.write(new_content)
            print(f"✅ Injected: {slug}")
            return True
            
    print(f"❌ Failed to inject {slug}")
    return False

if __name__ == '__main__':
    articles = [
        # Batch 12 - missing RNN article
        (
            "recurrent-neural-networks-lstm-gru",
            "Recurrent Neural Networks (RNNs), LSTMs & GRUs",
            "Master sequential modeling, vanishing gradients, LSTM cell states, and GRU gating mechanisms.",
            f"{SCRATCH}/recurrent-neural-networks-lstm-gru.md"
        ),
        # Batch 13 - MLOps Foundations
        (
            "mlops-introduction-notebooks-to-production",
            "Introduction to MLOps: From Notebooks to Production",
            "Bridge the gap between research notebooks and production-grade ML systems with MLOps principles.",
            f"{SCRATCH}/mlops-introduction-notebooks-to-production.md"
        ),
        (
            "ml-pipelines-sklearn-airflow",
            "Building ML Pipelines with Scikit-learn & Apache Airflow",
            "Automate your end-to-end ML workflow with sklearn Pipelines, DAGs, and Airflow orchestration.",
            f"{SCRATCH}/ml-pipelines-sklearn-airflow.md"
        ),
        (
            "experiment-tracking-mlflow-wandb",
            "Experiment Tracking with MLflow & Weights and Biases",
            "Log, compare, and reproduce ML experiments using MLflow and W&B dashboards.",
            f"{SCRATCH}/experiment-tracking-mlflow-wandb.md"
        ),
        (
            "model-serving-fastapi-docker-kubernetes",
            "Model Serving & Deployment (FastAPI, Docker, Kubernetes)",
            "Deploy ML models as production APIs using FastAPI, containerize with Docker, and scale on Kubernetes.",
            f"{SCRATCH}/model-serving-fastapi-docker-kubernetes.md"
        ),
        (
            "feature-stores-feast-tecton",
            "Feature Stores: Feast, Tecton & Vertex AI Feature Store",
            "Manage and serve ML features at scale with feature store architectures and platforms.",
            f"{SCRATCH}/feature-stores-feast-tecton.md"
        ),
        # Batch 14 - MLOps Advanced & NLP
        (
            "model-monitoring-data-drift-production",
            "Model Monitoring & Data Drift Detection in Production",
            "Detect concept drift, feature drift, and performance degradation in live ML systems.",
            f"{SCRATCH}/model-monitoring-data-drift-production.md"
        ),
        (
            "nlp-fundamentals-tokenization-tfidf",
            "NLP Fundamentals: Tokenization, Stop Words & TF-IDF",
            "Build a strong NLP foundation with text preprocessing, tokenization strategies, and TF-IDF weighting.",
            f"{SCRATCH}/nlp-fundamentals-tokenization-tfidf.md"
        ),
        (
            "word-embeddings-word2vec-glove-fasttext",
            "Word Embeddings: Word2Vec, GloVe & FastText",
            "Learn dense vector representations of words using Skip-Gram, CBOW, GloVe co-occurrence, and subword FastText.",
            f"{SCRATCH}/word-embeddings-word2vec-glove-fasttext.md"
        ),
        (
            "bert-gpt-llm-fine-tuning",
            "BERT, GPT & Large Language Model Fine-Tuning",
            "Fine-tune pre-trained transformers for NLP tasks using HuggingFace, LoRA, and PEFT strategies.",
            f"{SCRATCH}/bert-gpt-llm-fine-tuning.md"
        ),
    ]
    
    injected = 0
    skipped = 0
    for slug, title, tag, path in articles:
        result = inject_article(slug, title, tag, "Machine Learning", path)
        if result:
            injected += 1
        else:
            skipped += 1
    
    print(f"\n📊 Summary: {injected} injected, {skipped} skipped (not ready yet)")
