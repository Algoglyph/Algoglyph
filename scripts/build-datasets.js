import fs from 'fs';
import path from 'path';

async function buildDatasets() {
  console.log("Starting dataset expansion...");

  // 1. EXPAND CODEFORCES (Target: 200-300 problems)
  try {
    console.log("Fetching Codeforces problems...");
    const cfRes = await fetch("https://codeforces.com/api/problemset.problems");
    const cfData = await cfRes.json();
    if (cfData.status === "OK") {
      const problems = cfData.result.problems;
      const stats = cfData.result.problemStatistics;
      
      // Map solvedCount to problems
      const statsMap = {};
      stats.forEach(s => {
        statsMap[`${s.contestId}-${s.index}`] = s.solvedCount;
      });

      // Filter: rating 800 to 1800
      const filtered = problems.filter(p => p.rating >= 800 && p.rating <= 1800);
      
      // Sort by solvedCount descending
      filtered.forEach(p => {
        p.solvedCount = statsMap[`${p.contestId}-${p.index}`] || 0;
      });
      filtered.sort((a, b) => b.solvedCount - a.solvedCount);

      // Select top 250
      const selected = filtered.slice(0, 250);
      const cfDataset = selected.map(p => ({
        contestId: p.contestId,
        index: p.index,
        title: p.name,
        rating: p.rating,
        tags: p.tags,
        boilerplate: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write solution here\n    return 0;\n}`,
        statement: `<h3>${p.name}</h3><p>Codeforces Contest ${p.contestId} Problem ${p.index}</p><p>Rating: ${p.rating}</p><p><a href="https://codeforces.com/problemset/problem/${p.contestId}/${p.index}" target="_blank">View full description on Codeforces</a></p>`,
        examples: []
      }));

      // Ensure directory exists
      fs.mkdirSync('src/data', { recursive: true });
      fs.writeFileSync('src/data/codeforces-top100.json', JSON.stringify(cfDataset, null, 2));
      console.log(`Codeforces dataset expanded: Saved ${cfDataset.length} problems.`);
    }
  } catch (err) {
    console.error("Failed to build Codeforces dataset:", err);
  }

  // 2. EXPAND LEETCODE (Target: 200-300 problems)
  try {
    console.log("Fetching NeetCode 150 problem list...");
    const ncRes = await fetch("https://raw.githubusercontent.com/krmanik/Anki-NeetCode/main/neetcode-150-list.json");
    const ncData = await ncRes.json();
    
    // Extract slugs
    const slugs = new Set();
    for (const cat in ncData) {
      for (const prob in ncData[cat]) {
        const url = ncData[cat][prob].url;
        const parts = url.split('problems/');
        if (parts.length > 1) {
          slugs.add(parts[1].split('/')[0]);
        }
      }
    }
    
    // Add additional Blind 75 / Top interview slugs
    const extraSlugs = [
      "two-sum", "reverse-linked-list", "3sum", "climbing-stairs", "container-with-most-water",
      "best-time-to-buy-and-sell-stock", "merge-intervals", "number-of-islands",
      "longest-substring-without-repeating-characters", "add-two-numbers", "median-of-two-sorted-arrays",
      "longest-palindromic-substring", "validate-binary-search-tree", "search-in-rotated-sorted-array",
      "valid-parentheses", "merge-two-sorted-lists", "generate-parentheses", "merge-k-sorted-lists",
      "trapping-rain-water", "group-anagrams", "maximum-subarray", "edit-distance", "subsets", "word-search",
      "binary-tree-maximum-path-sum", "lru-cache", "min-stack", "find-median-from-data-stream",
      "product-of-array-except-self", "kth-largest-element-in-an-array", "lowest-common-ancestor-of-a-binary-tree",
      "first-missing-positive", "jump-game", "unique-paths", "word-ladder", "koko-eating-bananas",
      "subarray-sum-equals-k", "daily-temperatures", "reverse-integer", "roman-to-integer",
      "longest-common-prefix", "remove-nth-node-from-end-of-list", "swap-nodes-in-pairs",
      "maximum-depth-of-binary-tree", "same-tree", "invert-binary-tree", "binary-tree-level-order-traversal",
      "symmetric-tree", "path-sum", "single-number", "intersection-of-two-linked-lists",
      "majority-element", "house-robber", "reverse-bits", "number-of-1-bits", "happy-number",
      "contains-duplicate-ii", "implement-queue-using-stacks", "missing-number", "move-zeroes",
      "find-the-duplicate-number", "longest-increasing-subsequence", "coin-change", "valid-perfect-square",
      "sum-of-two-integers", "fizz-buzz", "keyboard-row", "distribute-candies", "subarray-product-less-than-k",
      "sort-an-array", "capacity-to-ship-packages-within-d-days", "last-stone-weight", "defanging-an-ip-address",
      // Additional popular interview / DSA questions to reach target size:
      "longest-common-subsequence", "word-break", "longest-consecutive-sequence", "combination-sum",
      "search-a-2d-matrix", "spiral-matrix", "set-matrix-zeroes", "rotate-image", "min-cost-climbing-stairs",
      "house-robber-ii", "decode-ways", "unique-paths-ii", "longest-palindromic-subsequence", "edit-distance",
      "coin-change-ii", "partition-equal-subset-sum", "target-sum", "ones-and-zeroes", "last-stone-weight-ii",
      "interleaving-string", "longest-increasing-path-in-a-matrix", "distinct-subsequences",
      "regular-expression-matching", "wildcard-matching", "scramble-string", "palindromic-substrings",
      "count-vowels-permutation", "climbing-stairs-ii", "fibonacci-number", "n-th-tribonacci-number",
      "is-subsequence", "min-cost-to-connect-all-points", "network-delay-time", "swim-in-rising-water",
      "reconstruct-itinerary", "alien-dictionary", "cheapest-flights-within-k-stops", "redundant-connection",
      "course-schedule-iii", "graph-valid-tree", "number-of-connected-components-in-an-undirected-graph",
      "clone-graph", "course-schedule", "course-schedule-ii", "pacific-atlantic-water-flow",
      "surrounded-regions", "rotting-oranges", "walls-and-gates", "number-of-islands-ii",
      "maximum-area-of-a-piece-of-cake-after-horizontal-and-vertical-cuts", "k-closest-points-to-origin",
      "task-scheduler", "design-twitter", "find-median-from-data-stream-ii", "merge-triplets-to-form-target-triplet",
      "partition-labels", "valid-parenthesis-string", "non-overlapping-intervals", "meeting-rooms",
      "meeting-rooms-ii", "minimum-interval-to-include-each-query", "valid-anagram-ii",
      "add-two-numbers-ii", "integer-to-roman", "three-sum-closest", "remove-element",
      "search-in-rotated-sorted-array-ii", "remove-duplicates-from-sorted-list", "remove-duplicates-from-sorted-list-ii",
      "partition-list", "merge-sorted-array", "gray-code", "reverse-linked-list-ii", "restore-ip-addresses",
      "binary-tree-inorder-traversal", "unique-binary-search-trees", "unique-binary-search-trees-ii",
      "binary-tree-zigzag-level-order-traversal", "construct-binary-tree-from-inorder-and-postorder-traversal",
      "binary-tree-level-order-traversal-ii", "convert-sorted-array-to-binary-search-tree",
      "convert-sorted-list-to-binary-search-tree", "minimum-depth-of-binary-tree", "path-sum-ii",
      "flatten-binary-tree-to-linked-list", "populating-next-right-pointers-in-each-node",
      "populating-next-right-pointers-in-each-node-ii", "pascals-triangle", "pascals-triangle-ii",
      "triangle", "best-time-to-buy-and-sell-stock-ii", "best-time-to-buy-and-sell-stock-iii",
      "best-time-to-buy-and-sell-stock-iv", "sum-root-to-leaf-numbers", "palindrome-partitioning-ii",
      "gas-station", "single-number-ii", "word-break-ii", "linked-list-cycle-ii", "insertion-sort-list",
      "sort-list", "max-points-on-a-line", "reverse-words-in-a-string", "find-minimum-in-rotated-sorted-array-ii",
      "find-peak-element", "fraction-to-recurring-decimal", "two-sum-iii-data-structure-design",
      "dungeon-game", "rotate-array", "bitwise-and-of-numbers-range", "remove-linked-list-elements",
      "count-primes", "minimum-size-subarray-sum", "shortest-palindrome", "combination-sum-iii",
      "the-skyline-problem", "contains-duplicate-iii", "maximal-square", "count-complete-tree-nodes",
      "rectangle-area", "basic-calculator", "basic-calculator-ii", "majority-element-ii",
      "number-of-digit-one", "palindrome-linked-list", "delete-node-in-a-linked-list", "search-a-2d-matrix-ii",
      "different-ways-to-add-parentheses", "shortest-word-distance", "shortest-word-distance-ii",
      "shortest-word-distance-iii", "strobogrammatic-number", "strobogrammatic-number-ii",
      "factor-combinations", "verify-preorder-sequence-in-binary-search-tree", "paint-house",
      "paint-house-ii", "binary-tree-paths", "add-digits", "single-number-iii", "ugly-number",
      "ugly-number-ii", "paint-fence", "find-celebrity", "closest-binary-search-tree-value",
      "closest-binary-search-tree-value-ii", "h-index", "h-index-ii", "first-bad-version",
      "perfect-squares", "expression-add-operators", "peeking-iterator", "inorder-successor-in-bst",
      "game-of-life", "word-pattern", "word-pattern-ii", "nim-game", "best-meeting-point",
      "binary-tree-longest-consecutive-sequence", "bulls-and-cows", "remove-invalid-parentheses",
      "smallest-rectangle-enclosing-black-pixels", "range-sum-query-immutable", "range-sum-query-mutable",
      "range-sum-query-2d-immutable", "range-sum-query-2d-mutable", "minimum-height-trees",
      "sparse-matrix-multiplication", "super-ugly-number", "count-of-smaller-numbers-after-self",
      "remove-duplicate-letters", "shortest-distance-from-all-buildings", "maximum-product-of-word-lengths",
      "bulb-switcher", "wiggle-sort", "wiggle-sort-ii", "power-of-three", "count-of-range-sum",
      "odd-even-linked-list", "patching-array", "verify-preorder-serialization-of-a-binary-tree",
      "largest-bst-subtree", "increasing-triplet-subsequence", "self-crossing", "house-robber-iii",
      "palindrome-pairs", "nested-list-weight-sum", "longest-substring-with-at-most-k-distinct-characters",
      "flatten-nested-list-iterator", "integer-break", "reverse-string", "reverse-vowels-of-a-string",
      "design-tic-tac-toe", "intersection-of-two-arrays", "intersection-of-two-arrays-ii",
      "data-stream-as-disjoint-intervals", "russian-doll-envelopes", "count-numbers-with-unique-digits",
      "max-sum-of-rectangle-no-larger-than-k", "nested-list-weight-sum-ii", "water-and-jug-problem",
      "largest-divisible-subset", "find-leaves-of-binary-tree", "super-pow", "find-k-pairs-with-smallest-sums",
      "guess-number-higher-or-lower-ii", "wiggle-subsequence", "combination-sum-iv",
      "kth-smallest-element-in-a-sorted-matrix", "design-phone-directory", "insert-delete-getrandom-o1",
      "insert-delete-getrandom-o1-duplicates-allowed", "linked-list-random-node", "ransom-note",
      "shuffle-an-array", "mini-parser", "lexicographical-numbers", "first-unique-character-in-a-string",
      "longest-absolute-file-path", "find-the-difference", "elimination-game", "perfect-number",
      "fibonacci-number"
    ];
    extraSlugs.forEach(s => slugs.add(s));

    const allSlugs = Array.from(slugs);
    console.log(`Retrieved ${allSlugs.length} unique LeetCode slugs to populate.`);

    const leetcodeDataset = [];

    // Let's load the current leetcode-top100.json to preserve drivers/test cases we already have
    let existingProblems = [];
    if (fs.existsSync('src/data/leetcode-top100.json')) {
      try {
        existingProblems = JSON.parse(fs.readFileSync('src/data/leetcode-top100.json', 'utf8'));
      } catch (e) {
        console.warn("Failed to load existing LeetCode dataset:", e);
      }
    }

    const leetcodeQuery = `
      query getProblem($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          title
          titleSlug
          content
          difficulty
          topicTags {
            name
          }
          codeSnippets {
            langSlug
            code
          }
          sampleTestCase
        }
      }
    `;

    // Fetch details for each slug
    let successCount = 0;
    for (let i = 0; i < allSlugs.length; i++) {
      const slug = allSlugs[i];
      
      // If we already have it in our local dataset and it has a statement/driver, let's keep it!
      const existing = existingProblems.find(p => p.slug === slug);
      if (existing && existing.statement && existing.driver && existing.driver !== "int main() { return 0; }") {
        leetcodeDataset.push(existing);
        successCount++;
        continue;
      }

      // Fetch live data via LeetCode GraphQL
      try {
        const response = await fetch("https://leetcode.com/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: leetcodeQuery,
            variables: { titleSlug: slug }
          })
        });

        if (response.ok) {
          const resJson = await response.json();
          const q = resJson.data?.question;
          if (q) {
            const cppSnippet = q.codeSnippets?.find(s => s.langSlug === 'cpp')?.code || 
                               `class Solution {\npublic:\n    // Enter function signature\n};`;
            
            const sampleInput = q.sampleTestCase || "";
            const tags = q.topicTags?.map(t => t.name) || [];

            leetcodeDataset.push({
              id: successCount + 1,
              title: q.title,
              slug: q.titleSlug,
              difficulty: q.difficulty,
              tags: tags,
              boilerplate: cppSnippet,
              statement: q.content || `<h3>${q.title}</h3><p>Description unavailable.</p>`,
              constraints: [],
              examples: sampleInput ? [
                {
                  id: `tc-gen-${Date.now()}-${Math.random().toString(36).substring(2,5)}`,
                  input: sampleInput,
                  expectedOutput: ""
                }
              ] : [],
              driver: existing?.driver || "int main() {\n    // Standard driver fallback\n    return 0;\n}"
            });
            successCount++;
            console.log(`Fetched problem [${successCount}/${allSlugs.length}]: ${q.title}`);
          }
        }
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 150));
      } catch (err) {
        console.error(`Failed to fetch LeetCode slug ${slug}:`, err);
        if (existing) {
          leetcodeDataset.push(existing);
        } else {
          leetcodeDataset.push({
            id: successCount + 1,
            title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            slug: slug,
            difficulty: 'Medium',
            tags: [],
            boilerplate: `class Solution {\npublic:\n    \n};`,
            statement: `<h3>${slug}</h3><p>Offline fallback description.</p>`,
            constraints: [],
            examples: [],
            driver: "int main() { return 0; }"
          });
        }
        successCount++;
      }
    }

    fs.mkdirSync('src/data', { recursive: true });
    fs.writeFileSync('src/data/leetcode-top100.json', JSON.stringify(leetcodeDataset, null, 2));
    console.log(`LeetCode dataset expanded: Saved ${leetcodeDataset.length} problems.`);
  } catch (err) {
    console.error("Failed to build LeetCode dataset:", err);
  }

  console.log("Dataset expansion complete.");
}

buildDatasets();
