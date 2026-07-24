const fs = require('fs');

function searchFile(path, term) {
  if (fs.existsSync(path)) {
    const text = fs.readFileSync(path, 'utf8');
    if (text.includes(term)) {
      console.log(`Found '${term}' in: ${path}`);
    }
  }
}

['./src/config/blogData.ts', './src/config/deBlogData.ts', './scratch/generate_backend_batch1.py', './scratch/generate_backend_batch2.py', './scratch/generate_backend_batch3.py', './scratch/generate_backend_batch4.py'].forEach(p => searchFile(p, 'nosql-dynamodb'));
