# Context-Free Grammars: Productions, Parse Trees & the Chomsky Hierarchy

## 1. Historical Context & Motivation

In **1956**, MIT linguist **Noam Chomsky** published *"Three Models for the Description of Language,"* arguing that finite-state machines were too weak to capture natural language syntax. He proposed a hierarchy of increasingly powerful grammars — now called the **Chomsky Hierarchy** — with context-free grammars at level 2.

The breakthrough came when **John Backus** and **Peter Naur** adopted Chomsky's formalism to describe the **ALGOL 60** programming language using what became known as **Backus-Naur Form (BNF)**. This was the first time a programming language had a fully formal, machine-parseable syntax specification — and it eliminated the ambiguity that had plagued earlier languages.

Today, CFGs are the mathematical backbone of:
*   **Every compiler's parser** (yacc, bison, ANTLR, tree-sitter all consume CFGs)
*   **SQL, JSON, HTML, and XML** grammar specifications
*   **Syntax highlighters** in editors (tree-sitter parses using GLR, a CFG algorithm)
*   **Natural language processing** (early phrase-structure parsers)
*   **Data format validation** (RFC 5234 ABNF is a CFG variant)

A CFG answers: *what class of languages can a parser with a single stack (pushdown automaton) recognize?* The answer is strictly larger than regular languages — CFGs can express matching/balancing constraints like $a^n b^n$, which no DFA can.

---

## 2. Core Mathematical Invariants

### Formal Definition

A **Context-Free Grammar (CFG)** is a 4-tuple:

$$G = (V, \Sigma, R, S)$$

where:
*   $V$ is a finite set of **nonterminals** (variables)
*   $\Sigma$ is a finite set of **terminals** (disjoint from $V$)
*   $R$ is a finite set of **production rules** of the form $A \to \alpha$ where $A \in V$ and $\alpha \in (V \cup \Sigma)^*$
*   $S \in V$ is the **start symbol**

### Derivations

The **derivation relation** $\Rightarrow$ is defined: $\alpha A \beta \Rightarrow \alpha \gamma \beta$ if $A \to \gamma \in R$. We write $\Rightarrow^*$ for the reflexive-transitive closure (zero or more steps).

The **language** of $G$ is:

$$L(G) = \{ w \in \Sigma^* : S \Rightarrow^* w \}$$

### Parse Trees and Ambiguity

A **parse tree** for a derivation is a tree where:
*   Internal nodes are labeled with nonterminals
*   The root is $S$
*   Children of a node labeled $A$ spell out the right-hand side of some rule $A \to \alpha$
*   Leaves read left-to-right form the derived string

A grammar is **ambiguous** if some string in $L(G)$ has two distinct parse trees. Ambiguity is a property of the *grammar*, not the language — some languages are **inherently ambiguous** (no unambiguous CFG exists for them).

> **Theorem (CFG > Regular).** The language $L = \{ a^n b^n : n \ge 0 \}$ is context-free but not regular.
> **Proof.** The CFG $S \to aSb \mid \epsilon$ generates $L$. For non-regularity, apply the pumping lemma: pumping $a^n b^n$ at position $n$ breaks the balance. $\blacksquare$

<svg viewBox="0 0 620 340" xmlns="http://www.w3.org/2000/svg" style="background:#0d1117;border-radius:8px;width:100%;max-width:620px">
  <defs>
    <marker id="arrowCFG" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#7d8590"/>
    </marker>
  </defs>
  <circle cx="310" cy="40" r="22" fill="#1f6feb" stroke="#58a6ff" stroke-width="2"/>
  <text x="310" y="46" fill="#fff" font-family="monospace" font-size="14" text-anchor="middle">E</text>
  <line x1="310" y1="62" x2="180" y2="115" stroke="#7d8590" stroke-width="2"/>
  <line x1="310" y1="62" x2="310" y2="115" stroke="#7d8590" stroke-width="2"/>
  <line x1="310" y1="62" x2="440" y2="115" stroke="#7d8590" stroke-width="2"/>
  <circle cx="180" cy="135" r="20" fill="#1f6feb" stroke="#58a6ff" stroke-width="2"/>
  <text x="180" y="141" fill="#fff" font-family="monospace" font-size="13" text-anchor="middle">E</text>
  <rect x="293" y="118" width="34" height="34" rx="4" fill="#388bfd" stroke="#f0883e" stroke-width="2"/>
  <text x="310" y="140" fill="#fff" font-family="monospace" font-size="15" text-anchor="middle">+</text>
  <circle cx="440" cy="135" r="20" fill="#1f6feb" stroke="#58a6ff" stroke-width="2"/>
  <text x="440" y="141" fill="#fff" font-family="monospace" font-size="13" text-anchor="middle">E</text>
  <line x1="440" y1="155" x2="390" y2="205" stroke="#7d8590" stroke-width="2"/>
  <line x1="440" y1="155" x2="490" y2="205" stroke="#7d8590" stroke-width="2"/>
  <rect x="372" y="208" width="36" height="34" rx="4" fill="#388bfd" stroke="#f0883e" stroke-width="2"/>
  <text x="390" y="230" fill="#fff" font-family="monospace" font-size="15" text-anchor="middle">id</text>
  <rect x="472" y="208" width="36" height="34" rx="4" fill="#388bfd" stroke="#f0883e" stroke-width="2"/>
  <text x="490" y="230" fill="#fff" font-family="monospace" font-size="15" text-anchor="middle">id</text>
  <line x1="310" y1="262" x2="310" y2="262" stroke="none"/>
  <line x1="180" y1="155" x2="180" y2="205" stroke="#7d8590" stroke-width="2"/>
  <rect x="162" y="208" width="36" height="34" rx="4" fill="#388bfd" stroke="#f0883e" stroke-width="2"/>
  <text x="180" y="230" fill="#fff" font-family="monospace" font-size="15" text-anchor="middle">id</text>
  <text x="310" y="305" fill="#8b949e" font-family="monospace" font-size="13" text-anchor="middle">Parse tree for "id + id * id" (rule E → E + E | E * E | id)</text>
  <text x="310" y="325" fill="#8b949e" font-family="monospace" font-size="12" text-anchor="middle">Note: '+' is applied first (left spine), '*' binds the right subtree</text>
</svg>

---

## 3. Step-by-Step Execution Trace

Consider the grammar for arithmetic expressions:

$$E \to E + E \mid E * E \mid \text{id}$$

This grammar is **ambiguous**. One leftmost derivation of `id + id * id` is:

| Step | Sentential Form      | Rule Applied (leftmost nonterminal) |
|------|----------------------|-------------------------------------|
| 0    | `E`                  | —                                   |
| 1    | `E + E`              | $E \to E + E$                       |
| 2    | `id + E`             | leftmost $E \to \text{id}$          |
| 3    | `id + E * E`         | $E \to E * E$                       |
| 4    | `id + id * E`        | leftmost $E \to \text{id}$          |
| 5    | `id + id * id`       | $E \to \text{id}$                   |

The parse tree encodes precedence: the `+` sits at the top, and `*` is deeper — so `*` is evaluated first (binds tighter). This is the **semantically correct** tree.

**The ambiguity trap:** A second leftmost derivation exists:

| Step | Sentential Form      | Rule Applied                       |
|------|----------------------|------------------------------------|
| 0    | `E`                  | —                                  |
| 1    | `E * E`              | $E \to E * E$                      |
| 2    | `E + E * E`          | left $E \to E + E$                 |
| 3    | `id + E * E`         | $E \to \text{id}$                  |
| 4    | `id + id * E`        | $E \to \text{id}$                  |
| 5    | `id + id * id`       | $E \to \text{id}$                  |

Here `*` is at the root, so it would be evaluated *last* — semantically wrong. The existence of two trees means the grammar is **ambiguous**. Production parsers use unambiguous grammars (e.g., stratified into `Expr → Term + Expr | Term`) or disambiguation rules (yacc's precedence declarations).

---

## 4. Production-Ready Implementations

### C++ (Recursive Descent Parser)

```cpp
#include <bits/stdc++.h>
using namespace std;

// Grammar: E -> T (+ T)*      T -> F (* F)*      F -> number | ( E )
// Unambiguous, left-associative, * binds tighter than +
struct Parser {
    string s;
    size_t pos = 0;

    explicit Parser(string input) : s(move(input)) {}

    void skipWs() { while (pos < s.size() && isspace(s[pos])) pos++; }
    bool peek(char c) { skipWs(); return pos < s.size() && s[pos] == c; }
    bool consume(char c) { if (peek(c)) { pos++; return true; } return false; }

    long long parseE() {
        long long v = parseT();
        while (consume('+')) v += parseT();   // left-associative
        return v;
    }
    long long parseT() {
        long long v = parseF();
        while (consume('*')) v *= parseF();
        return v;
    }
    long long parseF() {
        skipWs();
        if (consume('(')) {
            long long v = parseE();
            consume(')');
            return v;
        }
        // parse number
        size_t start = pos;
        while (pos < s.size() && isdigit(s[pos])) pos++;
        if (start == pos) throw runtime_error("Expected number at " + to_string(pos));
        return stoll(s.substr(start, pos - start));
    }
};

int main() {
    Parser p("3 + 4 * 5");
    cout << p.parseE() << endl;  // 23 (not 35) — * binds tighter
}
```

### Python (Recursive Descent with AST)

```python
from dataclasses import dataclass
from typing import Union

@dataclass
class Num: value: int
@dataclass
class BinOp:
    op: str
    left: 'Node'
    right: 'Node'

Node = Union[Num, BinOp]

class Parser:
    """Recursive descent for E -> T (('+'|'-') T)*, T -> F (('*'|'/') F)*, F -> num | '(' E ')'"""
    def __init__(self, text: str):
        self.tokens = text.replace('(', ' ( ').replace(')', ' ) ').split()
        self.i = 0

    def peek(self) -> str:
        return self.tokens[self.i] if self.i < len(self.tokens) else ''

    def advance(self) -> str:
        t = self.peek(); self.i += 1; return t

    def parseE(self) -> Node:
        node = self.parseT()
        while self.peek() in ('+', '-'):
            op = self.advance()
            node = BinOp(op, node, self.parseT())  # left-assoc
        return node

    def parseT(self) -> Node:
        node = self.parseF()
        while self.peek() in ('*', '/'):
            op = self.advance()
            node = BinOp(op, node, self.parseF())
        return node

    def parseF(self) -> Node:
        if self.peek() == '(':
            self.advance()
            node = self.parseE()
            assert self.advance() == ')', "Expected )"
            return node
        return Num(int(self.advance()))

def evaluate(node: Node) -> int:
    if isinstance(node, Num): return node.value
    a, b = evaluate(node.left), evaluate(node.right)
    return {'+': a+b, '-': a-b, '*': a*b, '/': a//b}[node.op]

ast = Parser("3 + 4 * 5").parseE()
print(evaluate(ast))  # 23 — multiplication binds tighter
```

---

## 5. Asymptotic Time & Space Complexity

| Parsing Algorithm | Time                      | When to Use                                |
|-------------------|---------------------------|--------------------------------------------|
| **CYK**           | $O(n^3 \cdot \|G\|)$      | Any CFG in Chomsky Normal Form; membership |
| **Earley**        | $O(n^3)$ worst, $O(n^2)$ unambiguous, $O(n)$ for LR/LL | General CFGs; GLR |
| **LL(1)**         | $O(n)$                    | Top-down, predictive; recursive descent    |
| **LR(1) / LALR**  | $O(n)$                    | Bottom-up; yacc/bison default              |
| **GLR**           | $O(n^3)$ worst, $O(n)$ typical | Ambiguous CFGs; tree-sitter, Tomita     |

**Why CYK is $O(n^3)$:** It fills an $n \times n$ table of substrings; for each cell it tries every production, and each production's RHS is at most length 2 in Chomsky Normal Form. The cubic term comes from splitting points in the substring.

**Why LL/LR are $O(n)$:** They use a deterministic pushdown automaton (DPA) — at each input symbol, exactly one parse action is taken, no backtracking. The trade-off: they only handle a *subclass* of unambiguous CFGs (LL(1) ≈ 85% of practical grammars).

---

## 6. Systems Connections: How Bison Generates a Parser

The standard toolchain for building a compiler parser is:

1.  **Write the CFG** in BNF (or yacc's syntax):
    ```
    expr : expr '+' term  { $$ = $1 + $3; }
         | term           { $$ = $1; }
    term : term '*' factor { $$ = $1 * $3; }
         | factor          { $$ = $1; }
    factor : NUMBER        { $$ = $1; }
    ```
2.  **bison** converts the CFG to an **LALR(1)** automaton. It computes FIRST and FOLLOW sets, resolves conflicts with precedence rules, and emits C code with a state-transition table.
3.  The generated `yyparse()` runs in $O(n)$ — each token triggers one table lookup.

### Tree-sitter: GLR for Editors

VS Code, Neovim, and GitHub use **tree-sitter** for incremental parsing. Tree-sitter uses **Generalized LR (GLR)** parsing — it handles ambiguous grammars by maintaining multiple parse stacks in parallel, then selecting the best tree. This gives robust syntax highlighting even for incomplete/erroneous code.

### JSON and SQL Validation

The JSON grammar (RFC 8259) is a small CFG: `value → object | array | string | number | true | false | null`. Every JSON parser is implicitly a CFG parser. SQL grammars are larger but follow the same principle — ANSI SQL is specified in BNF.

---

## 7. Practice Checklist

### Beginner Problems
*   [Valid Parentheses (LeetCode 20)](https://leetcode.com/problems/valid-parentheses/): Match `()[]{}`.
    *   *Why this is useful:* Direct simulation of the CFG for the Dyck language.
*   [Valid Parenthesis String (LeetCode 678)](https://leetcode.com/problems/valid-parenthesis-string/): `*` as wildcard.
    *   *Why this is useful:* Greedy or DP; the CFG counterpart.
*   [Backspace String Compare (LeetCode 844)](https://leetcode.com/problems/backspace-string-compare/): Process `#` deletes.
    *   *Why this is useful:* Stack-based reasoning, CFG intuition.

### Intermediate Problems
*   [Basic Calculator II (LeetCode 227)](https://leetcode.com/problems/basic-calculator-ii/): Parse and evaluate `+ - * /`.
    *   *Why this is useful:* Build a real recursive-descent parser.
*   [Basic Calculator (LeetCode 224)](https://leetcode.com/problems/basic-calculator/): Add parentheses and unary minus.
    *   *Why this is useful:* Full CFG handling with grouping.
*   [Parse Boolean Expression (LeetCode 1106)](https://leetcode.com/problems/parse-boolean-expression/): `!(...)`, `&(...)`, `|(...)`.
    *   *Why this is useful:* Recursive-descent for nested expressions.

### Advanced Problems
*   [Number of Valid Words Substituted Into the Formula (LeetCode 2116)](https://leetcode.com/problems/check-if-a-parentheses-string-can-be-valid/): Parenthesis validation with locks.
    *   *Why this is useful:* CFG membership with constraints.
*   [Tag Validator (LeetCode 591)](https://leetcode.com/problems/tag-validator/): Validate nested XML-like tags.
    *   *Why this is useful:* CFG-based format validation.
*   [Reverse Substrings Between Each Pair of Parentheses (LeetCode 1190)](https://leetcode.com/problems/reverse-substrings-between-each-pair-of-parentheses/): Nested manipulation.
    *   *Why this is useful:* Stack discipline from CFG theory.

---

## 8. Frequently Asked Questions

**Q1: What makes a grammar ambiguous vs. unambiguous?**
A: A grammar is **ambiguous** if some string has two or more distinct parse trees (equivalently, two leftmost derivations that differ in which rule fires at some step). It's **unambiguous** if every string has exactly one parse tree. Ambiguity is a property of the *grammar*, not the language: a language is **inherently ambiguous** if *every* CFG for it is ambiguous (such languages exist, e.g., $L = \{a^n b^n c^m d^m\} \cup \{a^m b^n c^n d^m\}$).

**Q2: How are CFGs different from regular expressions?**
A: Regular expressions describe **regular languages** (Type 3 in Chomsky), which cannot count — no regex can match $a^n b^n$. CFGs (Type 2) are strictly more powerful: they have a stack, so they can express nesting and balance. A CFG can be converted to an NFA-with-stack (**pushdown automaton**); a regex cannot. Practically: regex matches tokens; CFGs parse token sequences into trees.

**Q3: What is Chomsky Normal Form and why convert to it?**
A: A CFG is in **Chomsky Normal Form (CNF)** if every production is of the form $A \to BC$ or $A \to a$ (plus optionally $S \to \epsilon$). Any CFG can be converted to CNF in $O(|G|^2)$ time. CNF matters because (1) the **CYK** membership algorithm requires CNF and runs in $O(n^3)$; (2) parse trees in CNF are binary, simplifying proofs (e.g., the pumping lemma for CFLs); (3) every derivation of a length-$n$ string takes exactly $2n-1$ steps.

**Q4: LL vs. LR parsing — which is better?**
A: **LL(k)** parsers are top-down (predict the rule before seeing the RHS), while **LR(k)** parsers are bottom-up (shift tokens onto a stack, then reduce by matching a rule's RHS). LR(1) handles a strictly larger class of grammars than LL(1) and is the default for `bison`/`yacc`. LL(1) is simpler to implement by hand (recursive descent) and is used by ANTLR. Neither can parse arbitrary CFGs — for that you need Earley or GLR.

**Q5: Can CFGs express all programming language syntax?**
A: Almost. CFGs handle the *syntax* (structure) of nearly every programming language — C, Java, Python, SQL, JSON all have CFGs. But CFGs **cannot** express *semantic* constraints like "every variable must be declared before use" or "types must match" — those require context-sensitive checks during or after parsing. This is why compilers separate the parser (CFG, syntactic) from the semantic analyzer (manual checks, context-sensitive).
