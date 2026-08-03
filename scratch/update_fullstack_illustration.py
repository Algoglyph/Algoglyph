import re

with open('src/components/RoadmapIllustration.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add fullstackSlugs check
fullstack_slugs = [
    'html-semantics', 'css-layouts', 'checkpoint-static', 'javascript-basics', 'npm-ecosystem',
    'checkpoint-interactivity', 'git-version-control', 'github-collaboration', 'checkpoint-collaborative',
    'checkpoint-external-packages', 'react-components', 'tailwind-css', 'checkpoint-frontend-apps',
    'node-js-runtime', 'checkpoint-cli-apps', 'postgresql-databases', 'checkpoint-crud-apps',
    'restful-api-design', 'jwt-authentication', 'redis-caching', 'checkpoint-complete-app',
    'linux-cli-basics', 'basic-aws-services', 'checkpoint-deployment', 'mesh-like-structures',
    'ansible-configuration', 'terraform-iac', 'checkpoint-automation', 'checkpoint-infrastructure',
    'github-actions-cicd', 'monit-monitoring', 'checkpoint-cicd', 'checkpoint-monitoring'
]

fullstack_set_code = "  const fullstackSlugs = new Set([\n" + ",\n".join(f"    '{s}'" for s in fullstack_slugs) + "\n  ]);\n\n"

target = "  let imageElement: React.ReactNode = null;"
if target in code and "fullstackSlugs" not in code:
    code = code.replace(target, fullstack_set_code + target)

if_target = "  if (aiDataScientistSlugs.has(sLower)) {"
fs_if_code = """  if (fullstackSlugs.has(sLower)) {
    imageElement = (
      <div className="w-full rounded-lg overflow-hidden flex items-center justify-center select-none my-4">
        <img 
          src={`/images/full-stack/${sLower}-dark.png`} 
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src.endsWith('-dark.png')) {
              target.src = `/images/full-stack/${sLower}.png`;
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

if if_target in code and "fullstackSlugs.has(sLower)" not in code:
    code = code.replace(if_target, fs_if_code + "if (aiDataScientistSlugs.has(sLower)) {")

with open('src/components/RoadmapIllustration.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESSFULLY UPDATED RoadmapIllustration.tsx FOR FULL STACK IMAGES!")
