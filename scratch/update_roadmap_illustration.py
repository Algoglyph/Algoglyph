import re

print("=== UPDATING RoadmapIllustration.tsx TO MAP AI & DATA SCIENTIST IMAGES ===")

with open('src/components/RoadmapIllustration.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

ai_slugs = [
    'introduction-to-statistics',
    'probability-and-statistics',
    'hypothesis-testing',
    'experiment-design',
    'minimum-detectable-effect',
    'improving-test-sensitivity',
    'improving-sensitivity-cuped',
    'cuped-at-booking',
    'doordash-cupac',
    'ratio-metrics',
    'microsoft-delta-method',
    'algebra-differential-calculus',
    'mathematics-for-machine-learning',
    'fundamentals-of-econometrics',
    'intro-to-econometrics',
    'econometrics-course',
    'time-series-basics',
    'arima-model-for-time-series',
    'time-series-models',
    'forecasting-task-with-solution',
    'linear-regression-econ',
    'learn-python-kaggle',
    'algorithmic-exercises',
    'study-plans-leetcode',
    'algorithms-specialization',
    'sql-tutorial-course',
    'exploratory-data-analysis-with-python-and-pandas',
    'exploratory-data-analysis-for-machine-learning',
    'exploratory-data-analysis-with-seaborn',
    'open-machine-learning-course',
    'machine-learning-specialization',
    'pattern-recognition-ml',
    'pattern-recognition-github',
    'deep-learning-specialization',
    'deep-learning-book',
    'attention-is-all-you-need',
    'illustrated-transformer',
    'mlops-specialization',
    'google-ai-courses',
    'hugging-face-nlp',
    'prompt-engineering-guide',
    'rag-for-knowledge-intensive-nlp-tasks',
    'vibe-coding-fundamentals',
    'claude-code-docs',
    'agentic-coding-handbook'
]

slugs_set_code = "  const aiDataScientistSlugs = new Set([\n" + ",\n".join(f"    '{s}'" for s in ai_slugs) + "\n  ]);\n\n  const aiDataScientistImageMap: Record<string, string> = {\n    'pattern-recognition-github': 'pattern-recognition-ml'\n  };\n"

# Target spot before `let imageElement: React.ReactNode = null;`
target = "  let imageElement: React.ReactNode = null;"
if target in code and "aiDataScientistSlugs" not in code:
    code = code.replace(target, slugs_set_code + target)

# Add conditional check inside `if (aiDataScientistSlugs.has(sLower))`
if_target = "  if (systemDesignSlugs.has(sLower)) {"
ai_if_code = """  if (aiDataScientistSlugs.has(sLower)) {
    const imgSlug = aiDataScientistImageMap[sLower] || sLower;
    imageElement = (
      <div className="w-full rounded-lg overflow-hidden flex items-center justify-center select-none my-4">
        <img 
          src={`/images/ai-data-scientist/${imgSlug}-dark.png`} 
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src.endsWith('-dark.png')) {
              target.src = `/images/ai-data-scientist/${imgSlug}.png`;
            } else {
              target.style.display = 'none';
            }
          }}
          alt={slug} 
          className="w-full object-contain rounded-lg border border-zinc-800" 
        />
      </div>
    );
  } else """

if if_target in code and "aiDataScientistSlugs.has(sLower)" not in code:
    code = code.replace(if_target, ai_if_code + "if (systemDesignSlugs.has(sLower)) {")

with open('src/components/RoadmapIllustration.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESSFULLY UPDATED RoadmapIllustration.tsx FOR AI & DATA SCIENTIST IMAGES!")
