const fs = require('fs');

const blogDataRaw = fs.readFileSync('./src/config/blogData.ts', 'utf8');
const deBlogDataRaw = fs.readFileSync('./src/config/deBlogData.ts', 'utf8');
const mlBlogDataRaw = fs.readFileSync('./src/config/mlBlogData.ts', 'utf8');

const checkSvgs = (name, text) => {
  const fencedSvg = (text.match(/```svg[\s\S]*?```/gi) || []).length;
  const fencedXmlSvg = (text.match(/```(xml|html)[\s\S]*?<svg[\s\S]*?```/gi) || []).length;
  const rawSvg = (text.match(/<svg[\s\S]*?<\/svg>/gi) || []).length;
  console.log(`[${name}] Fenced \`\`\`svg: ${fencedSvg}, Fenced xml/html with <svg>: ${fencedXmlSvg}, Total <svg> tags: ${rawSvg}`);
};

checkSvgs('blogData.ts', blogDataRaw);
checkSvgs('deBlogData.ts', deBlogDataRaw);
checkSvgs('mlBlogData.ts', mlBlogDataRaw);
