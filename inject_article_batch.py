import json
import sys

def inject_article(slug, title, tagline, category, md_path):
    try:
        with open(md_path, 'r') as f:
            md_content = f.read()
    except Exception as e:
        print(f"Failed to read {md_path}: {e}")
        return

    escaped_md = md_content.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

    new_post = f"""  {{
    slug: "{slug}",
    title: "{title}",
    tagline: "{tagline}",
    category: "{category}",
    readTime: 6,
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

    if '\n];' in content:
        idx = content.rfind('\n];')
        if idx != -1:
            new_content = content[:idx] + ',\n' + new_post + content[idx:]
            with open(ts_file, 'w') as f:
                f.write(new_content)
            print(f"Successfully injected {slug}")
            return
            
    print(f"Failed to inject {slug}")

if __name__ == '__main__':
    articles = [
        ("recurrent-neural-networks-lstm-gru", "Recurrent Neural Networks (RNNs), LSTMs & GRUs", "Learn temporal unrolling, cell states, forget/update gates, and BPTT.", "/Users/vansh_uni/.gemini/antigravity/brain/ae22bccb-017d-43bb-b2c8-57f825eba924/scratch/recurrent-neural-networks-lstm-gru.md"),
        ("transformers-attention-mechanism", "Transformers & Self-Attention Mechanism", "Master Query/Key/Value projections, scaled dot-product, and Multi-Head Attention.", "/Users/vansh_uni/.gemini/antigravity/brain/e5c1a31b-36ce-4d74-b4b5-f9423e912382/scratch/transformers-attention-mechanism.md"),
        ("generative-adversarial-networks-gan", "Generative Adversarial Networks (GANs)", "Master minimax zero-sum games, JSD divergence, WGAN-GP, and mode collapse.", "/Users/vansh_uni/.gemini/antigravity/brain/ae22bccb-017d-43bb-b2c8-57f825eba924/scratch/generative-adversarial-networks-gan.md"),
        ("autoencoders-dimensionality-reduction", "Autoencoders & Variational Autoencoders (VAEs)", "Explore non-linear latent bottleneck representations and the reparameterization trick.", "/Users/vansh_uni/.gemini/antigravity/brain/ae22bccb-017d-43bb-b2c8-57f825eba924/scratch/autoencoders-dimensionality-reduction.md"),
        ("transfer-learning-fine-tuning", "Transfer Learning & Fine-Tuning Strategies", "Master layer freezing, discriminative learning rates, and LoRA/PEFT adaptation.", "/Users/vansh_uni/.gemini/antigravity/brain/4d35cd0e-35d0-406c-bac0-ed2ddf8c3f52/scratch/transfer-learning-fine-tuning.md")
    ]
    
    for slug, title, tag, path in articles:
        inject_article(slug, title, tag, "Machine Learning", path)
