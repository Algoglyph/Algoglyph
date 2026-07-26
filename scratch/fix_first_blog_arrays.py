import re

print("=== FIXING ARRAYS BLOG IN src/config/blogData.ts ===")

with open('src/config/blogData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Locate the corrupted arrays blog entry
p_arrays = content.find('"slug": "arrays"')
if p_arrays == -1:
    p_arrays = content.find("slug: 'arrays'")

p_next_entry = content.find('"slug": "linked-list"', p_arrays)
if p_next_entry == -1:
    p_next_entry = content.find("slug: 'linked-list'", p_arrays)

print(f"Arrays entry bounds: {p_arrays} to {p_next_entry}")

corrupted_block = content[p_arrays:p_next_entry]

# Clean up corrupted string literals `n\n##` and double-quoted markdown string
# Fix markdown property to use template literal backticks `...`
clean_block = """  "slug": "arrays",
  "markdown": `""" + '''# Contiguous Memory Arrays & Grid Matrices

In low-level software engineering, variables are not abstract concepts floating in space. They are concrete hardware states. To manage multiple variables, we must store them in memory. The simplest way to organize data is the **Contiguous Memory Array**.

This chapter explores how placing values side-by-side in computer memory enables instant math-based access speeds, how modern CPUs optimize array traversal using caches, and how dynamic arrays resize themeselves under the hood.

---

## 1. The Core Invariant: Constant-Time Address Arithmetic

An array is a collection of elements of the same type stored in a single, unbroken block of memory.

Because the elements are packed contiguously, the physical address of any element can be computed mathematically without reading any other values. The CPU uses the **base address** (the start of the array) and the size of each element to calculate the target address:

$$\\text{Address}(A[i]) = \\text{BaseAddress} + (i \\times \\text{SizeOfElement})$$

For instance, if an array of 32-bit (4-byte) integers starts at memory address `0x2000`, the address of index $3$ is:

$$\\text{Address}(A[3]) = 0x2000 + (3 \\times 4) = 0x200C$$

This math is computed by the CPU's Arithmetic Logic Unit (ALU) in a single instruction cycle, providing $O(1)$ random access.

---

## 2. Dynamic Capacity Scaling: Amortized Growth Analysis

A raw compiler array has a fixed size. If you allocate an array of 5 elements, it cannot grow. To bypass this, high-level languages implement **Dynamic Arrays** (e.g., `std::vector` in C++, `ArrayList` in Java, `list` in Python).

---

## 3. The Hardware Level: CPU Cache Line Prefetching

At the hardware level, memory performance is determined by the **CPU Cache**.

---

## 4. How Real-World Systems Leverage Arrays

Senior engineers select contiguous layouts to optimize performance in core system architectures.

---

## 5. Frequently Asked Questions (FAQs)

### Q1: Why does inserting an element at index 0 of an array cost O(N) operations?
To maintain contiguous order in memory, all existing elements must be shifted down by one slot to make space for the new item.

### Q2: How does dynamic capacity scaling work?
Dynamic arrays allocate larger contiguous heap memory blocks (geometric scaling factor of 1.5x to 2.0x) when capacity is reached.

### Q3: What is spatial cache locality?
Fetching an array index loads adjacent sequential memory slots into L1 CPU cache lines, accelerating iteration.

### Q4: What is Row-Major vs Column-Major order?
Row-Major stores grid rows sequentially in memory (C/C++). Column-Major stores columns sequentially (MATLAB/Fortran).

### Q5: What is a Buffer Overflow?
A buffer overflow occurs when data is written past contiguous array bounds, potentially overwriting stack frame return addresses.
`'''.strip() + ",\n  "

content = content[:p_arrays] + clean_block + content[p_next_entry:]

with open('src/config/blogData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("ARRAYS ENTRY FIXED SUCCESSFULLY!")
