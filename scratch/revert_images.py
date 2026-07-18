# -*- coding: utf-8 -*-
with open("src/config/blogData.ts", "r", encoding="utf-8") as f:
    content = f.read()

images_to_remove = [
    "![Binary Heaps & Priority Queues](/images/dsa/heap-dark.png#dark)\n\n",
    "![Binary Heaps & Priority Queues](/images/dsa/heap-dark.png#dark)\\n\\n",
    "![Bellman-Ford & Floyd-Warshall](/images/dsa/bellman-ford-floyd-warshall-dark.png#dark)\n\n",
    "![Bellman-Ford & Floyd-Warshall](/images/dsa/bellman-ford-floyd-warshall-dark.png#dark)\\n\\n",
    "![Balanced Search Trees: AVL & Red-Black Trees](/images/dsa/avl-red-black-tree-dark.png#dark)\n\n",
    "![Balanced Search Trees: AVL & Red-Black Trees](/images/dsa/avl-red-black-tree-dark.png#dark)\\n\\n",
    "![Binary Search Trees](/images/dsa/binary-search-trees-dark.png#dark)\n\n",
    "![Binary Search Trees](/images/dsa/binary-search-trees-dark.png#dark)\\n\\n",
    "![AVL Tree](/images/dsa/avl-trees-dark.png#dark)\n\n",
    "![AVL Tree](/images/dsa/avl-trees-dark.png#dark)\\n\\n",
    "![B+ Tree Structure](/images/dsa/b-trees-dark.png#dark)\n\n",
    "![B+ Tree Structure](/images/dsa/b-trees-dark.png#dark)\\n\\n",
    "![BFS Traversal](/images/dsa/bfs-traversal-dark.png#dark)\n\n",
    "![BFS Traversal](/images/dsa/bfs-traversal-dark.png#dark)\\n\\n",
    "![Bellman-Ford Algorithm](/images/dsa/bellman-ford-dark.png#dark)\n\n",
    "![Bellman-Ford Algorithm](/images/dsa/bellman-ford-dark.png#dark)\\n\\n",
    "![A* Algorithm](/images/dsa/a-star-dark.png#dark)\n\n",
    "![A* Algorithm](/images/dsa/a-star-dark.png#dark)\\n\\n",
    "![Aho-Corasick Algorithm](/images/dsa/aho-corasick-dark.png#dark)\n\n",
    "![Aho-Corasick Algorithm](/images/dsa/aho-corasick-dark.png#dark)\\n\\n"
]

removed_count = 0
for img in images_to_remove:
    if img in content:
        content = content.replace(img, "")
        removed_count += 1
        print(f"Removed {img.strip()}")

# Also clean up double newlines if any
content = content.replace("\\n\\n\\n", "\\n\\n")

with open("src/config/blogData.ts", "w", encoding="utf-8") as f:
    f.write(content)

print(f"Reverted {removed_count} image references in blogData.ts")
