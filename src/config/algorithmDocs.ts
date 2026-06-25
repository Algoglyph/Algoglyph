// Long-form explanations shown in the Visualizer\'s doc panel (the book icon on
// each algorithm card). Only algorithms present here show the book icon, so the
// set can grow one entry at a time.

export interface ComplexityRow {
  label: string;
  value: string;
  note: string;
}

export interface AlgorithmDoc {
  id: string;
  /** One sentence that captures the whole idea. */
  tagline: string;
  /** A short paragraph on what it is and why you\'d reach for it. */
  idea: string;
  /** The algorithm as an ordered sequence of plain steps. */
  steps: string[];
  complexity: ComplexityRow[];
  useWhen: string[];
  watchOut: string[];
  /** A compact, readable reference implementation. */
  code: string;
}

export const ALGORITHM_DOCS: Record<string, AlgorithmDoc> = {
  'linear-search': {
    id: 'linear-search',
    tagline: 'Walk the list from the front, checking one element at a time, until the target turns up — or you run out.',
    idea:
      'Linear search assumes nothing about order. It starts at the first element and compares each value with the target in turn, stopping the instant it finds a match. Because it never skips ahead, it works on any collection — sorted or not, an array or a forward-only structure like a linked list. That generality is exactly when you reach for it.',
    steps: [
      'Start at index 0.',
      'Compare the current element with the target.',
      'On a match, return the index — you are done.',
      'Otherwise step one position to the right.',
      'Reach the end with no match? The target is not present.',
    ],
    complexity: [
      { label: 'Best', value: 'O(1)', note: 'target is the first element' },
      { label: 'Average', value: 'O(n)', note: 'target sits mid-list' },
      { label: 'Worst', value: 'O(n)', note: 'target is last or absent' },
      { label: 'Space', value: 'O(1)', note: 'no extra memory' },
    ],
    useWhen: [
      'Data is small, or unsorted and not worth sorting first.',
      'You can only move forward — linked lists, streams, iterators.',
      'You need every match, not just the first.',
    ],
    watchOut: [
      'On a large sorted array, binary search is far faster at O(log n).',
      'Cost scales linearly — doubling the data doubles the work.',
    ],
    code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;        // found it
    }
  }
  return -1;           // not present
}`,
  },

  // --- Batch 1 ---
  'binary-search': {
    id: 'binary-search',
    tagline: 'Halve the search space on every comparison to locate a target in a sorted array with logarithmic speed.',
    idea: 'Binary search maintains two pointers defining a range guaranteed to contain the target (if it exists). At each step it inspects the middle element: if it matches, we are done; otherwise we discard the half that cannot contain the target. This divide-and-conquer on the index space yields O(log n) lookups, making it indispensable for any problem on sorted data.',
    steps: [
      'Set lo = 0 and hi = n - 1, covering the entire sorted array.',
      'Compute mid = lo + (hi - lo) / 2 to avoid integer overflow.',
      'If arr[mid] equals the target, return mid.',
      'If arr[mid] < target, set lo = mid + 1 to search the right half.',
      'Otherwise set hi = mid - 1 to search the left half.',
      'If lo > hi the target is absent; return -1.',
    ],
    complexity: [
      { label: 'Best', value: 'O(1)', note: 'Target at midpoint' },
      { label: 'Average', value: 'O(log n)', note: 'Halving per step' },
      { label: 'Worst', value: 'O(log n)', note: 'Target at boundary' },
      { label: 'Space', value: 'O(1)', note: 'Iterative, in-place' },
    ],
    useWhen: [
      'You need to locate a value in a sorted array or answer existence queries in O(log n).',
      'You are binary-searching on the answer -- monotonic predicate over an integer or real-valued domain.',
      'You want to implement dictionary lookup without hash tables, such as in embedded or cache-friendly scenarios.',
    ],
    watchOut: [
      'The input must be sorted; calling binary search on unsorted data gives garbage results.',
      'Off-by-one errors in lo/hi updates are the #1 bug -- always dry-run the 2-element case.',
      'For floating-point binary search, use a fixed iteration count (~100) instead of lo < hi to avoid precision issues.',
    ],
    code: `int binarySearch(vector<int>& a, int t) {
    int lo = 0, hi = (int)a.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == t) return mid;
        if (a[mid] < t) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
  },

  'ternary-search': {
    id: 'ternary-search',
    tagline: 'Split the domain into three equal parts to pinpoint the extremum of a unimodal function in O(log3 n).',
    idea: 'Ternary search locates the maximum (or minimum) of a unimodal function by evaluating two probe points at the one-third and two-third marks. The third of the domain that provably cannot contain the extremum is discarded each iteration. While it uses more comparisons per step than binary search, it works on functions rather than sorted sequences, making it the go-to tool for optimizing single-peaked landscapes.',
    steps: [
      'Set lo and hi to the boundaries of the search domain.',
      'Compute m1 = lo + (hi - lo) / 3 and m2 = hi - (hi - lo) / 3.',
      'Evaluate f(m1) and f(m2).',
      'If f(m1) < f(m2) (for max-finding), the peak is not in [lo, m1), so set lo = m1.',
      'Otherwise the peak is not in (m2, hi], so set hi = m2.',
      'Repeat until hi - lo is smaller than the desired precision; return (lo + hi) / 2.',
    ],
    complexity: [
      { label: 'Best', value: 'O(1)', note: 'Extremum at probe point' },
      { label: 'Average', value: 'O(log n)', note: 'Thirds eliminated' },
      { label: 'Worst', value: 'O(log n)', note: 'Full convergence' },
      { label: 'Space', value: 'O(1)', note: 'Constant workspace' },
    ],
    useWhen: [
      'You need to find the peak or trough of a unimodal function where derivatives are unavailable.',
      'The search domain is continuous or discrete and the objective has a single extremum.',
      'Competitive programming problems ask you to maximize/minimize a convex or concave objective over a range.',
    ],
    watchOut: [
      'Only correct for strictly unimodal functions -- plateaus or multiple peaks break the invariant.',
      'Compared to binary search on the derivative, ternary search makes 2 function evaluations per step instead of 1.',
      'For floating-point domains, run a fixed number of iterations (e.g., 200) rather than checking convergence with an epsilon.',
    ],
    code: `double ternarySearch(function<double(double)> f, double lo, double hi) {
    for (int i = 0; i < 200; i++) {
        double m1 = lo + (hi - lo) / 3;
        double m2 = hi - (hi - lo) / 3;
        if (f(m1) < f(m2)) lo = m1;
        else hi = m2;
    }
    return (lo + hi) / 2;
}`,
  },

  'lower-bound': {
    id: 'lower-bound',
    tagline: 'Find the first position in a sorted array where the value is greater than or equal to a given target.',
    idea: 'Lower bound is a templated binary search that returns an iterator (or index) to the first element that is not less than the target. It partitions the sorted range into "less than target" on the left and ">= target" on the right, then returns the boundary. This is the workhorse behind ordered-set queries, range counting, and coordinate compression.',
    steps: [
      'Set lo = 0 and hi = n (one past the last valid index).',
      'Compute mid = lo + (hi - lo) / 2.',
      'If arr[mid] < target, the answer must be to the right, so set lo = mid + 1.',
      'Otherwise arr[mid] >= target, so mid is a candidate; set hi = mid.',
      'Repeat until lo == hi; the converged index is the lower bound.',
      'If lo == n, no element >= target exists in the array.',
    ],
    complexity: [
      { label: 'Best', value: 'O(1)', note: 'Boundary at midpoint' },
      { label: 'Average', value: 'O(log n)', note: 'Standard binary search' },
      { label: 'Worst', value: 'O(log n)', note: 'Full search depth' },
      { label: 'Space', value: 'O(1)', note: 'In-place iteration' },
    ],
    useWhen: [
      'You need the insertion point for a value in a sorted container to maintain order.',
      'Counting elements in a range [a, b] via lower_bound(b+1) - lower_bound(a).',
      'Coordinate compression or discretization requires mapping values to their rank.',
    ],
    watchOut: [
      'hi is initialized to n (past-the-end), not n - 1; using n - 1 misses the "all elements are smaller" case.',
      'Do not confuse with upper_bound -- lower_bound returns the first >=, upper_bound returns the first >.',
      'When used on a non-random-access container (e.g., std::set), complexity degrades to O(n) for advancing iterators.',
    ],
    code: `int lowerBound(vector<int>& a, int t) {
    int lo = 0, hi = (int)a.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < t) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}`,
  },

  'upper-bound': {
    id: 'upper-bound',
    tagline: 'Find the first position in a sorted array where the value is strictly greater than a given target.',
    idea: 'Upper bound is the sibling of lower bound: it returns the index of the first element strictly greater than the target. Together, upper_bound(x) - lower_bound(x) gives the count of elements equal to x. It is essential for half-open range queries and for placing elements after all duplicates in a sorted sequence.',
    steps: [
      'Set lo = 0 and hi = n (one past the last valid index).',
      'Compute mid = lo + (hi - lo) / 2.',
      'If arr[mid] <= target, the answer is to the right, so set lo = mid + 1.',
      'Otherwise arr[mid] > target, so mid is a candidate; set hi = mid.',
      'Repeat until lo == hi; the converged index is the upper bound.',
      'If lo == n, every element in the array is <= target.',
    ],
    complexity: [
      { label: 'Best', value: 'O(1)', note: 'Boundary at midpoint' },
      { label: 'Average', value: 'O(log n)', note: 'Standard binary search' },
      { label: 'Worst', value: 'O(log n)', note: 'Full search depth' },
      { label: 'Space', value: 'O(1)', note: 'In-place iteration' },
    ],
    useWhen: [
      'You need to find how many copies of a value exist in a sorted array (with lower_bound).',
      'Inserting into a sorted sequence and you want to place after all existing duplicates.',
      'Building half-open interval queries like "all elements in [lo, hi)" on sorted data.',
    ],
    watchOut: [
      'The only difference from lower_bound is using <= instead of < in the comparison -- a one-character bug source.',
      'hi must be initialized to n, not n - 1, to handle the case where all elements are <= target.',
      'Confusing upper_bound with lower_bound off-by-one is the most common mistake in contest problems involving sorted queries.',
    ],
    code: `int upperBound(vector<int>& a, int t) {
    int lo = 0, hi = (int)a.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] <= t) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}`,
  },

  'bubble-sort': {
    id: 'bubble-sort',
    tagline: 'Repeatedly walk through the array swapping adjacent out-of-order pairs until the largest element bubbles to its final position.',
    idea: 'Bubble sort makes multiple passes over the array, comparing each pair of adjacent elements and swapping them if they are in the wrong order. After each full pass the next-largest unsorted element settles into its correct position at the end. Though its O(n\u00B2) worst case makes it impractical for large inputs, its simplicity and ability to detect an already-sorted array in O(n) make it a useful teaching tool.',
    steps: [
      'Start an outer loop from i = 0 to n - 1 representing completed passes.',
      'In each pass, iterate j from 0 to n - i - 2, comparing arr[j] with arr[j+1].',
      'If arr[j] > arr[j+1], swap them.',
      'Track whether any swap occurred during this pass.',
      'If no swap occurred, the array is already sorted -- exit early.',
      'After all passes complete, the array is fully sorted.',
    ],
    complexity: [
      { label: 'Best', value: 'O(n)', note: 'Already sorted, early exit' },
      { label: 'Average', value: 'O(n\u00B2)', note: 'Quadratic comparisons' },
      { label: 'Worst', value: 'O(n\u00B2)', note: 'Reverse-sorted input' },
      { label: 'Space', value: 'O(1)', note: 'In-place swaps' },
    ],
    useWhen: [
      'Teaching sorting fundamentals or demonstrating algorithmic invariants.',
      'The array is tiny (n < 20) or nearly sorted, where the adaptive early-exit shines.',
      'You need a stable sort with zero extra memory and code simplicity is paramount.',
    ],
    watchOut: [
      'O(n\u00B2) makes it unacceptable for n > a few thousand in any performance-sensitive path.',
      'Despite being stable, it is almost always outperformed by insertion sort on nearly-sorted data.',
      'The "swapped" flag optimization is critical -- without it even sorted input takes O(n\u00B2).',
    ],
    code: `void bubbleSort(vector<int>& a) {
    int n = a.size();
    for (int i = 0; i < n; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++)
            if (a[j] > a[j + 1])
                swap(a[j], a[j + 1]), swapped = true;
        if (!swapped) break;
    }
}`,
  },

  'selection-sort': {
    id: 'selection-sort',
    tagline: 'Scan for the minimum of the unsorted region and swap it into the next sorted position, one element at a time.',
    idea: 'Selection sort divides the array into a sorted prefix and an unsorted suffix. On each iteration it finds the minimum element in the unsorted part and swaps it with the first unsorted element, growing the sorted prefix by one. It always performs exactly n(n-1)/2 comparisons regardless of input order, making its behavior perfectly predictable but uniformly slow for large inputs.',
    steps: [
      'For each index i from 0 to n - 2, assume i is the start of the unsorted region.',
      'Scan indices j from i + 1 to n - 1, tracking the index of the minimum element.',
      'After the scan, swap arr[i] with arr[minIdx].',
      'The sorted prefix now covers indices 0 through i.',
      'Repeat until the unsorted region has only one element left.',
    ],
    complexity: [
      { label: 'Best', value: 'O(n\u00B2)', note: 'Always scans fully' },
      { label: 'Average', value: 'O(n\u00B2)', note: 'n(n-1)/2 comparisons' },
      { label: 'Worst', value: 'O(n\u00B2)', note: 'Same as average' },
      { label: 'Space', value: 'O(1)', note: 'In-place, one swap/pass' },
    ],
    useWhen: [
      'You need to minimize the number of swaps (exactly n - 1), e.g. when writes are expensive.',
      'The array is very small and constant-factor simplicity matters more than asymptotics.',
      'Teaching sort invariants -- the "sorted prefix grows by one" property is easy to visualize.',
    ],
    watchOut: [
      'Not stable by default -- swapping can move equal elements past each other.',
      'Always O(n\u00B2) even on sorted input; no early termination unlike bubble sort.',
      'For nearly-sorted data, insertion sort is strictly superior in practice.',
    ],
    code: `void selectionSort(vector<int>& a) {
    int n = a.size();
    for (int i = 0; i < n - 1; i++) {
        int mn = i;
        for (int j = i + 1; j < n; j++)
            if (a[j] < a[mn]) mn = j;
        swap(a[i], a[mn]);
    }
}`,
  },

  'insertion-sort': {
    id: 'insertion-sort',
    tagline: 'Pick the next unsorted element and slide it leftward into its correct position within the already-sorted prefix.',
    idea: 'Insertion sort builds a sorted array one element at a time by taking each new element and inserting it into the correct position among the previously sorted elements. It shifts larger elements one position to the right to make room. On nearly-sorted data it runs in nearly O(n), and its simplicity plus low overhead make it the algorithm of choice for small subarrays inside hybrid sorts like Timsort and Introsort.',
    steps: [
      'Start from index i = 1; treat arr[0] as an already-sorted subarray of size 1.',
      'Save arr[i] as the key to be inserted.',
      'Compare the key with elements to its left, shifting each one right if it is larger.',
      'When you find an element <= key (or reach the start), place the key in the vacated slot.',
      'Increment i and repeat until all elements have been inserted.',
    ],
    complexity: [
      { label: 'Best', value: 'O(n)', note: 'Already sorted input' },
      { label: 'Average', value: 'O(n\u00B2)', note: 'Random permutation' },
      { label: 'Worst', value: 'O(n\u00B2)', note: 'Reverse-sorted input' },
      { label: 'Space', value: 'O(1)', note: 'In-place shifts' },
    ],
    useWhen: [
      'The input is small (n < 50) or nearly sorted -- insertion sort has tiny constant factors.',
      'As the base case of divide-and-conquer sorts (merge sort, quicksort) for small partitions.',
      'You need an online algorithm that can sort elements as they arrive one by one.',
    ],
    watchOut: [
      'O(n\u00B2) on reverse-sorted data -- each insertion requires shifting all previously sorted elements.',
      'Not cache-friendly for large n due to repeated shifting of contiguous memory.',
      'Binary insertion sort reduces comparisons to O(n log n) but shifts remain O(n\u00B2).',
    ],
    code: `void insertionSort(vector<int>& a) {
    int n = a.size();
    for (int i = 1; i < n; i++) {
        int key = a[i], j = i - 1;
        while (j >= 0 && a[j] > key)
            a[j + 1] = a[j], j--;
        a[j + 1] = key;
    }
}`,
  },

  'merge-sort': {
    id: 'merge-sort',
    tagline: 'Recursively split the array in half, sort each half, and merge the two sorted halves back together in linear time.',
    idea: 'Merge sort is the quintessential divide-and-conquer sorting algorithm. It splits the array into two halves, recursively sorts each, and then merges the two sorted subsequences into one using a two-pointer technique. The merge step is O(n) and the recursion has O(log n) levels, giving a guaranteed O(n log n) runtime regardless of input distribution -- a property neither quicksort nor heapsort shares without caveats.',
    steps: [
      'If the subarray has one or zero elements, it is already sorted -- return.',
      'Find the midpoint: mid = (lo + hi) / 2.',
      'Recursively sort the left half arr[lo..mid] and the right half arr[mid+1..hi].',
      'Create a temporary buffer and merge both sorted halves using two pointers.',
      'Copy the merged result back into the original array.',
    ],
    complexity: [
      { label: 'Best', value: 'O(n log n)', note: 'Always divides fully' },
      { label: 'Average', value: 'O(n log n)', note: 'Guaranteed bound' },
      { label: 'Worst', value: 'O(n log n)', note: 'No degenerate cases' },
      { label: 'Space', value: 'O(n)', note: 'Temporary merge buffer' },
    ],
    useWhen: [
      'You need a guaranteed O(n log n) sort with no quadratic worst case.',
      'Stability is required -- merge sort naturally preserves the order of equal elements.',
      'Sorting linked lists, where merge sort runs in O(n log n) with O(1) extra space.',
      'Counting inversions -- the merge step naturally counts cross-half inversions.',
    ],
    watchOut: [
      'Requires O(n) auxiliary space for the merge buffer, unlike in-place sorts.',
      'High constant factor and poor cache locality compared to quicksort on arrays.',
      'Bottom-up (iterative) merge sort avoids recursion overhead and is preferred for production use.',
    ],
    code: `void mergeSort(vector<int>& a, int lo, int hi) {
    if (lo >= hi) return;
    int mid = lo + (hi - lo) / 2;
    mergeSort(a, lo, mid);
    mergeSort(a, mid + 1, hi);
    vector<int> tmp;
    int i = lo, j = mid + 1;
    while (i <= mid && j <= hi)
        tmp.push_back(a[i] <= a[j] ? a[i++] : a[j++]);
    while (i <= mid) tmp.push_back(a[i++]);
    while (j <= hi) tmp.push_back(a[j++]);
    for (int k = lo; k <= hi; k++) a[k] = tmp[k - lo];
}`,
  },

  'quick-sort': {
    id: 'quick-sort',
    tagline: 'Choose a pivot, partition all elements around it, and recurse on each side for blazing average-case performance.',
    idea: 'Quicksort picks a pivot element and rearranges the array so that everything less than the pivot comes before it and everything greater comes after. It then recurses on both partitions. With a good pivot choice (e.g., random or median-of-three) it averages O(n log n) and is the fastest comparison sort in practice due to excellent cache behavior and low overhead. Its in-place nature uses only O(log n) stack space on average.',
    steps: [
      'If the subarray has fewer than 2 elements, return.',
      'Select a pivot -- commonly the last element, a random element, or median-of-three.',
      'Partition: maintain an index i such that all elements before i are <= pivot.',
      'Walk j through the subarray; whenever arr[j] <= pivot, swap arr[j] with arr[i] and increment i.',
      'Place the pivot at index i (its final sorted position).',
      'Recurse on arr[lo..i-1] and arr[i+1..hi].',
    ],
    complexity: [
      { label: 'Best', value: 'O(n log n)', note: 'Balanced partitions' },
      { label: 'Average', value: 'O(n log n)', note: 'Random pivot expected' },
      { label: 'Worst', value: 'O(n\u00B2)', note: 'Sorted + bad pivot' },
      { label: 'Space', value: 'O(log n)', note: 'Recursion stack depth' },
    ],
    useWhen: [
      'General-purpose sorting where average-case speed matters most -- quicksort is king in practice.',
      'Memory is constrained and you need an in-place O(n log n) average sort.',
      'Combined with insertion sort for small partitions (Introsort) for guaranteed performance.',
    ],
    watchOut: [
      'O(n\u00B2) worst case on sorted or nearly-sorted input with naive pivot selection -- always randomize.',
      'Not stable -- equal elements can be rearranged during partitioning.',
      'Tail-call optimization on the larger partition prevents O(n) stack depth in the worst case.',
    ],
    code: `void quickSort(vector<int>& a, int lo, int hi) {
    if (lo >= hi) return;
    int pivot = a[hi], i = lo;
    for (int j = lo; j < hi; j++)
        if (a[j] <= pivot) swap(a[i++], a[j]);
    swap(a[i], a[hi]);
    quickSort(a, lo, i - 1);
    quickSort(a, i + 1, hi);
}`,
  },

  'heap-sort': {
    id: 'heap-sort',
    tagline: 'Build a max-heap in-place, then repeatedly extract the root to produce a sorted array with guaranteed O(n log n) time.',
    idea: 'Heap sort leverages the max-heap data structure: first it rearranges the input array into a valid max-heap in O(n) via bottom-up heapification. Then it repeatedly swaps the root (the maximum) with the last unsorted element and sifts down to restore the heap property. This yields a fully in-place sort with a worst-case O(n log n) guarantee -- no auxiliary buffer like merge sort, no quadratic blowup like quicksort.',
    steps: [
      'Build a max-heap from the array by calling sift-down on every non-leaf node from the bottom up.',
      'The largest element is now at index 0 (the root).',
      'Swap arr[0] with arr[n-1], reducing the heap size by one.',
      'Sift down the new root to restore the max-heap property over the reduced heap.',
      'Repeat: swap root with last unsorted element, sift down, shrink heap.',
      'When the heap size is 1, the array is sorted in ascending order.',
    ],
    complexity: [
      { label: 'Best', value: 'O(n log n)', note: 'Always heapifies fully' },
      { label: 'Average', value: 'O(n log n)', note: 'Consistent performance' },
      { label: 'Worst', value: 'O(n log n)', note: 'Guaranteed bound' },
      { label: 'Space', value: 'O(1)', note: 'Fully in-place' },
    ],
    useWhen: [
      'You need an in-place sort with a hard O(n log n) worst-case guarantee.',
      'Memory is extremely tight -- heap sort uses zero auxiliary storage.',
      'Building a priority queue or implementing partial sort (find top-k elements).',
    ],
    watchOut: [
      'Poor cache locality due to parent-child index jumps (2i+1, 2i+2) -- slower than quicksort in practice.',
      'Not stable -- the initial heap build and extractions rearrange equal elements.',
      'The O(n) heap build phase is often forgotten; it is faster than n insertions due to bottom-up construction.',
    ],
    code: `void heapify(vector<int>& a, int n, int i) {
    int largest = i, l = 2*i+1, r = 2*i+2;
    if (l < n && a[l] > a[largest]) largest = l;
    if (r < n && a[r] > a[largest]) largest = r;
    if (largest != i) { swap(a[i], a[largest]); heapify(a, n, largest); }
}
void heapSort(vector<int>& a) {
    int n = a.size();
    for (int i = n/2 - 1; i >= 0; i--) heapify(a, n, i);
    for (int i = n - 1; i > 0; i--) {
        swap(a[0], a[i]);
        heapify(a, i, 0);
    }
}`,
  },

  'counting-sort': {
    id: 'counting-sort',
    tagline: 'Count occurrences of each key value, then reconstruct the sorted output in O(n + k) time without any comparisons.',
    idea: 'Counting sort works by tallying how many times each distinct key value appears, then using prefix sums of those counts to determine the final position of each element. It never compares two elements directly, bypassing the O(n log n) lower bound for comparison sorts. It runs in O(n + k) where k is the range of key values, making it blazingly fast when k is not much larger than n.',
    steps: [
      'Find the maximum value k in the array to size the count array.',
      'Create a count array of size k + 1, initialized to zero.',
      'Walk through the input, incrementing count[arr[i]] for each element.',
      'Compute prefix sums: count[i] += count[i-1] so each entry holds the number of elements <= i.',
      'Walk the input in reverse, placing each element at index count[arr[i]] - 1 in the output, then decrement its count.',
      'Copy the output back to the original array (or return it directly).',
    ],
    complexity: [
      { label: 'Best', value: 'O(n + k)', note: 'Always linear pass' },
      { label: 'Average', value: 'O(n + k)', note: 'Non-comparison sort' },
      { label: 'Worst', value: 'O(n + k)', note: 'Same regardless' },
      { label: 'Space', value: 'O(n + k)', note: 'Count + output arrays' },
    ],
    useWhen: [
      'Key values are integers in a small, known range (e.g., ASCII chars, grades 0-100, ages).',
      'You need a stable sort as a subroutine -- counting sort is the stable building block inside radix sort.',
      'Comparison sorts are too slow and the data has a bounded key domain.',
    ],
    watchOut: [
      'Space blows up if k (the key range) is huge -- sorting values in [0, 10^9] needs a 10^9 array.',
      'Requires non-negative integer keys; for signed or float data, map to a suitable range first.',
      'The reverse traversal in the placement step is essential for stability -- forward traversal reverses equal-element order.',
    ],
    code: `void countingSort(vector<int>& a) {
    if (a.empty()) return;
    int mx = *max_element(a.begin(), a.end());
    vector<int> cnt(mx + 1, 0), out(a.size());
    for (int x : a) cnt[x]++;
    for (int i = 1; i <= mx; i++) cnt[i] += cnt[i - 1];
    for (int i = (int)a.size() - 1; i >= 0; i--)
        out[--cnt[a[i]]] = a[i];
    a = out;
}`,
  },

  'radix-sort': {
    id: 'radix-sort',
    tagline: 'Sort integers digit by digit from least significant to most significant, using a stable subroutine at each level.',
    idea: 'Radix sort processes integers one digit (or group of bits) at a time, from the least significant to the most significant. At each digit position it applies a stable sort (typically counting sort) so that the relative order from previous passes is preserved. After processing all d digits, the array is fully sorted. It runs in O(d * (n + b)) where b is the base, achieving linear time when d is constant -- far outpacing comparison sorts for large n with bounded-width keys.',
    steps: [
      'Determine the maximum element to know the number of digits d to process.',
      'For each digit position (starting from the least significant).',
      'Extract the current digit of each element using modular arithmetic.',
      'Perform a stable counting sort on the extracted digits.',
      'After the stable sort, elements are ordered by all digits processed so far.',
      'Move to the next digit and repeat until all d digits have been processed.',
    ],
    complexity: [
      { label: 'Best', value: 'O(nk)', note: 'k = number of digits' },
      { label: 'Average', value: 'O(nk)', note: 'Linear per digit pass' },
      { label: 'Worst', value: 'O(nk)', note: 'Same regardless' },
      { label: 'Space', value: 'O(n + b)', note: 'b = base (e.g., 10)' },
    ],
    useWhen: [
      'Sorting large arrays of fixed-width integers (e.g., 32-bit ints, IP addresses, phone numbers).',
      'n is large and the key width k is small/constant -- radix sort beats O(n log n) comparison sorts.',
      'You need a stable sort of integer keys and have enough memory for the count/output buffers.',
    ],
    watchOut: [
      'Only works naturally on non-negative integers; handling negatives requires offset tricks or separate passes.',
      'Choosing the base (radix) is a trade-off: base-256 minimizes passes but needs a 256-element count array.',
      'For very short arrays, the overhead of multiple passes makes comparison sorts faster.',
    ],
    code: `void radixSort(vector<int>& a) {
    int mx = *max_element(a.begin(), a.end());
    vector<int> out(a.size());
    for (int exp = 1; mx / exp > 0; exp *= 10) {
        vector<int> cnt(10, 0);
        for (int x : a) cnt[(x / exp) % 10]++;
        for (int i = 1; i < 10; i++) cnt[i] += cnt[i - 1];
        for (int i = (int)a.size() - 1; i >= 0; i--)
            out[--cnt[(a[i] / exp) % 10]] = a[i];
        a = out;
    }
}`,
  },


  // --- Batch 2 ---
  'two-pointers': {
    id: 'two-pointers',
    tagline: 'Converge inward or move parallel to find pairs and subsets efficiently.',
    idea: 'Two pointers is a technique used to iterate over a linear data structure using two distinct indices. By adjusting the pointers based on constraints, it avoids nested loops, reducing quadratic time complexity to linear.',
    steps: [
      'Initialize two pointers, often at the start and end of a sorted array.',
      'Check the condition at the current pointers.',
      'If the condition matches, record the result.',
      'If the current sum or value is too small, advance the left pointer.',
      'If the value is too large, decrement the right pointer.',
      'Repeat until the pointers meet or cross.'
    ],
    complexity: [
      { label: 'Best', value: 'O(N)', note: 'Linear scan of array' },
      { label: 'Average', value: 'O(N)', note: 'Traverses each element once' },
      { label: 'Worst', value: 'O(N)', note: 'All elements visited' },
      { label: 'Space', value: 'O(1)', note: 'Only two variables needed' }
    ],
    useWhen: [
      'Searching for a pair with a target sum in a sorted array.',
      'Reversing an array or string in-place.',
      'Merging two sorted arrays or linked lists.'
    ],
    watchOut: [
      'The array must often be sorted first.',
      'Watch out for out-of-bounds errors.',
      'Be careful with duplicate elements.'
    ],
    code: `vector<int> twoSum(vector<int>& numbers, int target) {
    int left = 0, right = numbers.size() - 1;
    while (left < right) {
        int sum = numbers[left] + numbers[right];
        if (sum == target) return {left + 1, right + 1};
        else if (sum < target) left++;
        else right--;
    }
    return {-1, -1};
}`
  },

  'fast-slow-pointer': {
    id: 'fast-slow-pointer',
    tagline: 'Detect cycles and find midpoints using two pointers moving at different speeds.',
    idea: 'Also known as Floyd\'s Cycle Finding Algorithm, this pattern uses two pointers moving at different speeds (usually one and two steps). It\'s perfect for detecting cycles in linked lists or finding the middle element in a single pass.',
    steps: [
      'Initialize both a slow pointer and a fast pointer to the head of the sequence.',
      'Advance the slow pointer by one step.',
      'Advance the fast pointer by two steps.',
      'If the pointers ever meet, a cycle exists.',
      'If the fast pointer reaches the end, there is no cycle.',
      'To find the midpoint, stop when the fast pointer reaches the end; the slow pointer is at the middle.'
    ],
    complexity: [
      { label: 'Best', value: 'O(N)', note: 'Fast pointer reaches end' },
      { label: 'Average', value: 'O(N)', note: 'Detects cycle in one pass' },
      { label: 'Worst', value: 'O(N)', note: 'Full cycle traversal' },
      { label: 'Space', value: 'O(1)', note: 'Constant extra space' }
    ],
    useWhen: [
      'Detecting loops in linked lists or arrays.',
      'Finding the middle node of a linked list.',
      'Finding the starting node of a cycle.'
    ],
    watchOut: [
      'Ensure the fast pointer checks for null pointers to avoid crashes.',
      'Math for finding the cycle start requires resetting one pointer.'
    ],
    code: `bool hasCycle(ListNode *head) {
    if (!head || !head->next) return false;
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}`
  },

  'sliding-window': {
    id: 'sliding-window',
    tagline: 'Slide a window over a sequence to maintain subset invariants dynamically.',
    idea: 'The sliding window pattern creates a contiguous subset of elements (the window) that slides over a larger sequence. It optimizes O(N²) nested loops into a single O(N) pass by dynamically adding to the front and removing from the back of the window.',
    steps: [
      'Initialize two pointers to represent the window boundaries (left and right).',
      'Expand the window by advancing the right pointer and updating state.',
      'When the window violates the constraint, shrink it by advancing the left pointer.',
      'Continuously update the best or target result during expansion or shrinking.',
      'Repeat until the right pointer reaches the end of the sequence.'
    ],
    complexity: [
      { label: 'Best', value: 'O(N)', note: 'Single pass over array' },
      { label: 'Average', value: 'O(N)', note: 'Left/right pointer linear scan' },
      { label: 'Worst', value: 'O(N)', note: 'Each element visited twice' },
      { label: 'Space', value: 'O(1)', note: 'State tracking is constant' }
    ],
    useWhen: [
      'Finding the maximum or minimum sum subarray of a given size.',
      'Finding the longest substring with k distinct characters.',
      'Solving continuous string or array sequence problems.'
    ],
    watchOut: [
      'Only applicable for contiguous subarrays or substrings.',
      'Be careful with tracking window state (like frequency maps) accurately.',
      'Handle negative numbers carefully if the window shrinks based on sum constraints.'
    ],
    code: `int maxSubArrayLen(vector<int>& nums, int k) {
    int max_len = 0, current_sum = 0, left = 0;
    for (int right = 0; right < nums.size(); right++) {
        current_sum += nums[right];
        while (current_sum > k && left <= right) {
            current_sum -= nums[left++];
        }
        max_len = max(max_len, right - left + 1);
    }
    return max_len;
}`
  },

  'recursion': {
    id: 'recursion',
    tagline: 'Solve problems by breaking them into smaller instances of the same problem.',
    idea: 'Recursion is a method where the solution to a problem depends on solutions to smaller instances of the same problem. A recursive function calls itself with modified arguments until it reaches a base case, then unwinds to combine the results.',
    steps: [
      'Define the base case to stop the recursion.',
      'Write the logic to break the problem into a smaller subproblem.',
      'Call the function itself with the smaller subproblem.',
      'Combine or return the result of the recursive call.',
      'Ensure progress is made toward the base case.'
    ],
    complexity: [
      { label: 'Best', value: 'O(1)', note: 'Immediate base case return' },
      { label: 'Average', value: 'O(2^N)', note: 'Depends on branching factor' },
      { label: 'Worst', value: 'O(2^N)', note: 'Exponential without memoization' },
      { label: 'Space', value: 'O(N)', note: 'Call stack depth' }
    ],
    useWhen: [
      'Navigating tree or graph data structures.',
      'Solving divide and conquer problems.',
      'Implementing mathematical recurrences like Fibonacci.'
    ],
    watchOut: [
      'Missing base cases cause infinite loops and stack overflows.',
      'Overlapping subproblems lead to exponential time; use memoization.',
      'Deep recursion can exceed the maximum call stack size.'
    ],
    code: `int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`
  },

  'recursion-tree': {
    id: 'recursion-tree',
    tagline: 'Visualize call hierarchy and stack branching for recursive algorithms.',
    idea: 'A recursion tree is a visual representation of how a recursive algorithm executes. Each node represents a function call, and children represent subsequent recursive calls, making it easier to analyze time complexity and overlapping subproblems.',
    steps: [
      'Start with the initial function call as the root of the tree.',
      'Draw edges to child nodes for each recursive call made.',
      'Annotate each node with its specific input parameters or cost.',
      'Expand nodes until base cases (leaves) are reached.',
      'Sum the work at each level to determine overall time complexity.'
    ],
    complexity: [
      { label: 'Best', value: 'O(1)', note: 'Single branch execution' },
      { label: 'Average', value: 'O(b^d)', note: 'b = branches, d = depth' },
      { label: 'Worst', value: 'O(b^d)', note: 'Full tree exploration' },
      { label: 'Space', value: 'O(d)', note: 'Maximum depth of recursion' }
    ],
    useWhen: [
      'Analyzing the time and space complexity of recursive algorithms.',
      'Identifying redundant calculations for dynamic programming.',
      'Debugging complex recursive branching logic.'
    ],
    watchOut: [
      'Trees can grow exponentially large very quickly.',
      'Do not confuse total tree nodes with maximum call stack depth.'
    ],
    code: `// Recursion tree visualization conceptual example
void solve(int n) {
    if (n <= 0) return;
    // Node cost or processing
    cout << "Node: " << n << endl;
    // Branching
    solve(n - 1);
    solve(n - 2);
}`
  },

  'backtracking': {
    id: 'backtracking',
    tagline: 'Recursively search for solutions and abandon paths that violate constraints.',
    idea: 'Backtracking is an algorithmic technique for finding all (or some) solutions to computational problems incrementally. It abandons a candidate ("backtracks") as soon as it determines the candidate cannot possibly lead to a valid solution.',
    steps: [
      'Choose a starting point or initial state.',
      'Make a choice and recursively explore the resulting state.',
      'If the state is a valid solution, record it.',
      'If the state violates constraints, return immediately (prune the branch).',
      'Undo the choice (backtrack) and try the next possible option.',
      'Repeat until all possibilities are explored.'
    ],
    complexity: [
      { label: 'Best', value: 'O(N)', note: 'Solution found immediately' },
      { label: 'Average', value: 'O(b^d)', note: 'Explores valid paths only' },
      { label: 'Worst', value: 'O(N!)', note: 'Exhaustive search of space' },
      { label: 'Space', value: 'O(N)', note: 'Recursion stack depth' }
    ],
    useWhen: [
      'Solving constraint satisfaction problems like Sudoku.',
      'Generating permutations, combinations, or subsets.',
      'Finding paths in mazes or grids with specific constraints.'
    ],
    watchOut: [
      'Time complexity is often factorial or exponential.',
      'Always remember to undo state changes after the recursive call.',
      'Strong pruning conditions are crucial for performance.'
    ],
    code: `void backtrack(vector<int>& path, vector<int>& choices) {
    if (is_solution(path)) {
        process_solution(path);
        return;
    }
    for (int choice : choices) {
        if (is_valid(choice, path)) {
            path.push_back(choice); // Make choice
            backtrack(path, choices); // Explore
            path.pop_back(); // Undo choice
        }
    }
}`
  },

  'subsets': {
    id: 'subsets',
    tagline: 'Generate the power set or all possible combinations of a set.',
    idea: 'The subsets problem requires finding all possible subsets (the power set) of a given array. It is typically solved using backtracking by deciding whether to include or exclude each element sequentially.',
    steps: [
      'Start with an empty current subset and an initial index of 0.',
      'Add the current subset to the list of all subsets.',
      'Iterate through the remaining elements starting from the current index.',
      'Include the element in the current subset.',
      'Recursively call the function for the next index.',
      'Remove the element (backtrack) and move to the next iteration.'
    ],
    complexity: [
      { label: 'Best', value: 'O(2^N)', note: 'Must generate all sets' },
      { label: 'Average', value: 'O(N * 2^N)', note: 'Copying subsets takes O(N)' },
      { label: 'Worst', value: 'O(N * 2^N)', note: 'Generating full power set' },
      { label: 'Space', value: 'O(N)', note: 'Stack depth for recursion' }
    ],
    useWhen: [
      'Finding all possible configurations of a collection.',
      'Solving knapsack-like problems via brute force.',
      'Generating test cases for exhaustive verification.'
    ],
    watchOut: [
      'Output size grows exponentially; limit input size (N < 20).',
      'For arrays with duplicates, sorting and skipping duplicates is required.'
    ],
    code: `void generateSubsets(int idx, vector<int>& nums, vector<int>& current, vector<vector<int>>& result) {
    result.push_back(current);
    for (int i = idx; i < nums.size(); i++) {
        current.push_back(nums[i]);
        generateSubsets(i + 1, nums, current, result);
        current.pop_back();
    }
}
vector<vector<int>> subsets(vector<int>& nums) {
    vector<vector<int>> result;
    vector<int> current;
    generateSubsets(0, nums, current, result);
    return result;
}`
  },

  'permutations': {
    id: 'permutations',
    tagline: 'Generate all distinct orderings of a given sequence of elements.',
    idea: 'Permutations involve arranging elements in all possible orders. The standard backtracking approach swaps elements to create new orderings or uses a boolean array to track visited elements, exploring all N! possibilities.',
    steps: [
      'Maintain a boolean array to track which elements are currently used.',
      'If the current permutation length equals the input length, save it.',
      'Loop through all elements in the input array.',
      'If an element is already used, skip it.',
      'Mark the element as used and add it to the permutation.',
      'Recurse, then backtrack by removing the element and unmarking it.'
    ],
    complexity: [
      { label: 'Best', value: 'O(N!)', note: 'Must generate all orders' },
      { label: 'Average', value: 'O(N * N!)', note: 'Creating and copying arrays' },
      { label: 'Worst', value: 'O(N * N!)', note: 'Exhaustive permutation tree' },
      { label: 'Space', value: 'O(N)', note: 'Call stack and boolean array' }
    ],
    useWhen: [
      'Brute-forcing the Traveling Salesperson Problem.',
      'Finding specific anagrams or word arrangements.',
      'Exploring order-dependent configurations.'
    ],
    watchOut: [
      'N! grows extremely fast; input size should generally be N <= 10.',
      'Handling duplicate elements requires sorting and specific duplicate-skipping logic.'
    ],
    code: `void permuteHelper(vector<int>& nums, vector<int>& current, vector<bool>& used, vector<vector<int>>& res) {
    if (current.size() == nums.size()) {
        res.push_back(current);
        return;
    }
    for (int i = 0; i < nums.size(); i++) {
        if (used[i]) continue;
        used[i] = true;
        current.push_back(nums[i]);
        permuteHelper(nums, current, used, res);
        current.pop_back();
        used[i] = false;
    }
}`
  },

  'combination-sum': {
    id: 'combination-sum',
    tagline: 'Find all combinations of numbers that sum to a specific target value.',
    idea: 'Combination Sum is a classic backtracking problem where you explore adding candidate numbers to a current set until their sum matches a target. Candidates can often be reused unlimited times, forming a deep recursion tree.',
    steps: [
      'Sort candidates to easily skip values that exceed the target.',
      'Start exploring from index 0 with a current sum of 0.',
      'If the current sum equals the target, save the combination.',
      'Iterate through candidates from the current index.',
      'If adding the candidate exceeds the target, break the loop (prune).',
      'Add candidate, recurse (often allowing same index reuse), and backtrack.'
    ],
    complexity: [
      { label: 'Best', value: 'O(N)', note: 'Target easily reached/pruned' },
      { label: 'Average', value: 'O(2^T)', note: 'T is target value' },
      { label: 'Worst', value: 'O(N^(T/M))', note: 'M is minimum candidate' },
      { label: 'Space', value: 'O(T/M)', note: 'Maximum depth of recursion' }
    ],
    useWhen: [
      'Finding coin combinations for a specific monetary amount.',
      'Solving subset sum variants.',
      'Partitioning items into equal sum groups.'
    ],
    watchOut: [
      'Be careful whether candidates can be reused or are strictly single-use.',
      'Sorting first is critical for efficient pruning.'
    ],
    code: `void findCombinations(int idx, int target, vector<int>& arr, vector<int>& curr, vector<vector<int>>& res) {
    if (target == 0) { res.push_back(curr); return; }
    for (int i = idx; i < arr.size(); i++) {
        if (arr[i] > target) break; // Pruning
        curr.push_back(arr[i]);
        // i instead of i+1 to reuse same elements
        findCombinations(i, target - arr[i], arr, curr, res);
        curr.pop_back();
    }
}`
  },

  'n-queens': {
    id: 'n-queens',
    tagline: 'Place N non-attacking queens on an N×N chessboard using backtracking.',
    idea: 'The N-Queens puzzle requires placing queens such that no two share the same row, column, or diagonal. It demonstrates backtracking by attempting placements row by row and immediately pruning invalid board configurations.',
    steps: [
      'Attempt to place a queen row by row, starting from row 0.',
      'For the current row, iterate through all columns.',
      'Check if the current column and both diagonals are safe.',
      'If safe, place the queen and recursively try the next row.',
      'If the next row fails, backtrack by removing the queen.',
      'If row N is reached, a valid board arrangement has been found.'
    ],
    complexity: [
      { label: 'Best', value: 'O(N)', note: 'Solution found directly' },
      { label: 'Average', value: 'O(N!)', note: 'Pruning invalid states early' },
      { label: 'Worst', value: 'O(N!)', note: 'Exhaustive permutation check' },
      { label: 'Space', value: 'O(N)', note: 'Board arrays and call stack' }
    ],
    useWhen: [
      'Solving strict constraint satisfaction and grid placement problems.',
      'Demonstrating advanced backtracking with complex state validation.',
      'Designing scheduling or resource allocation algorithms.'
    ],
    watchOut: [
      'Validating diagonals can be tricky; use arrays for fast O(1) checks.',
      'Execution time limits N to around 12-15 in most environments.'
    ],
    code: `void solveNQueens(int row, int n, vector<string>& board, vector<vector<string>>& res, vector<int>& cols, vector<int>& diag1, vector<int>& diag2) {
    if (row == n) { res.push_back(board); return; }
    for (int col = 0; col < n; col++) {
        if (cols[col] || diag1[row + col] || diag2[row - col + n]) continue;
        board[row][col] = 'Q';
        cols[col] = diag1[row + col] = diag2[row - col + n] = 1;
        solveNQueens(row + 1, n, board, res, cols, diag1, diag2);
        board[row][col] = '.';
        cols[col] = diag1[row + col] = diag2[row - col + n] = 0;
    }
}`
  },

  'dfs-tree': {
    id: 'dfs-tree',
    tagline: 'Plunge deep into tree branches before backtracking to the root.',
    idea: 'Depth-First Search (DFS) on a tree explores as far down a single branch as possible before stepping back (backtracking) to explore other branches. It naturally aligns with recursive function calls.',
    steps: [
      'Start at the root node of the tree.',
      'Process the current node (pre-order), or wait to process it later.',
      'Recursively call DFS for each of the node\'s children.',
      'Once a leaf node is reached, the recursion naturally unwinds.',
      'Process node data upon returning (post-order) if needed.'
    ],
    complexity: [
      { label: 'Best', value: 'O(V)', note: 'Visit all nodes once' },
      { label: 'Average', value: 'O(V)', note: 'Linear traversal' },
      { label: 'Worst', value: 'O(V)', note: 'Every node visited' },
      { label: 'Space', value: 'O(H)', note: 'H is tree height (stack size)' }
    ],
    useWhen: [
      'Finding paths between nodes.',
      'Counting tree depth or solving structural properties.',
      'Topological sorting or exhaustive state space searches.'
    ],
    watchOut: [
      'Deep, unbalanced trees can cause stack overflow exceptions.',
      'Unlike graphs, trees do not need a visited set if traversed strictly downwards.'
    ],
    code: `void dfs(TreeNode* node) {
    if (!node) return;
    // Process node here
    cout << node->val << " ";
    
    // Visit left and right children
    dfs(node->left);
    dfs(node->right);
}`
  },

  'bfs-tree': {
    id: 'bfs-tree',
    tagline: 'Explore a tree radially, visiting all neighbors before going deeper.',
    idea: 'Breadth-First Search (BFS) explores the tree level by level. It uses a queue to keep track of nodes to visit next, ensuring that all nodes at depth D are visited before any node at depth D+1.',
    steps: [
      'Initialize a queue and push the root node into it.',
      'While the queue is not empty, pop the front node.',
      'Process the popped node.',
      'Push all non-null children of the popped node into the queue.',
      'Repeat until the queue is exhausted.'
    ],
    complexity: [
      { label: 'Best', value: 'O(V)', note: 'Process all nodes' },
      { label: 'Average', value: 'O(V)', note: 'Linear traversal time' },
      { label: 'Worst', value: 'O(V)', note: 'Every node visited once' },
      { label: 'Space', value: 'O(W)', note: 'W is max width of tree' }
    ],
    useWhen: [
      'Finding the shortest path in an unweighted tree/graph.',
      'Serializing or printing trees level-by-level.',
      'Searching for a target closest to the root.'
    ],
    watchOut: [
      'Memory consumption can be high for very wide trees (O(W) space).',
      'Requires an explicit queue data structure, unlike recursive DFS.'
    ],
    code: `void bfs(TreeNode* root) {
    if (!root) return;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* current = q.front();
        q.pop();
        cout << current->val << " ";
        if (current->left) q.push(current->left);
        if (current->right) q.push(current->right);
    }
}`
  },

  'preorder': {
    id: 'preorder',
    tagline: 'Process the current node before diving into its children (Root, Left, Right).',
    idea: 'Preorder traversal evaluates the root node first, then explores the left subtree, followed by the right subtree. It creates a top-down processing flow, useful for cloning or serializing trees.',
    steps: [
      'Check if the current node is null; if so, return.',
      'Process the current node (e.g., print or store its value).',
      'Recursively traverse the left subtree.',
      'Recursively traverse the right subtree.'
    ],
    complexity: [
      { label: 'Best', value: 'O(V)', note: 'Visit all nodes' },
      { label: 'Average', value: 'O(V)', note: 'Linear traversal' },
      { label: 'Worst', value: 'O(V)', note: 'Every node visited' },
      { label: 'Space', value: 'O(H)', note: 'Stack depth equals tree height' }
    ],
    useWhen: [
      'Creating a copy (clone) of a tree structure.',
      'Serializing a tree into a string or array.',
      'Evaluating prefix expressions.'
    ],
    watchOut: [
      'Reconstructing a tree requires more than just a preorder sequence unless it contains null markers.'
    ],
    code: `void preorderTraversal(TreeNode* root) {
    if (!root) return;
    cout << root->val << " "; // Root
    preorderTraversal(root->left); // Left
    preorderTraversal(root->right); // Right
}`
  },

  'inorder': {
    id: 'inorder',
    tagline: 'Traverse the left subtree, then the root, then the right (Left, Root, Right).',
    idea: 'Inorder traversal explores the left-most branch first, processes the node, and then explores the right branch. For Binary Search Trees (BSTs), this traversal perfectly retrieves elements in sorted ascending order.',
    steps: [
      'Check if the current node is null; if so, return.',
      'Recursively traverse the entire left subtree.',
      'Process the current node (e.g., print or store its value).',
      'Recursively traverse the entire right subtree.'
    ],
    complexity: [
      { label: 'Best', value: 'O(V)', note: 'Visit all nodes' },
      { label: 'Average', value: 'O(V)', note: 'Linear time' },
      { label: 'Worst', value: 'O(V)', note: 'Every node visited' },
      { label: 'Space', value: 'O(H)', note: 'Stack depth equals tree height' }
    ],
    useWhen: [
      'Retrieving values from a Binary Search Tree in sorted order.',
      'Flattening a BST into a sorted linked list.',
      'Validating if a binary tree is a valid BST.'
    ],
    watchOut: [
      'Stack overflow is possible on completely skewed trees (linked list shapes) if height approaches N.'
    ],
    code: `void inorderTraversal(TreeNode* root) {
    if (!root) return;
    inorderTraversal(root->left); // Left
    cout << root->val << " ";     // Root
    inorderTraversal(root->right); // Right
}`
  },

  'postorder': {
    id: 'postorder',
    tagline: 'Process children fully before handling their parent (Left, Right, Root).',
    idea: 'Postorder traversal explores the left and right subtrees completely before processing the current root node. This bottom-up approach is ideal for tasks that require children to be evaluated before their parents.',
    steps: [
      'Check if the current node is null; if so, return.',
      'Recursively traverse the left subtree.',
      'Recursively traverse the right subtree.',
      'Process the current node (e.g., delete it or compute its subtree sum).'
    ],
    complexity: [
      { label: 'Best', value: 'O(V)', note: 'Visit all nodes' },
      { label: 'Average', value: 'O(V)', note: 'Linear traversal' },
      { label: 'Worst', value: 'O(V)', note: 'Every node visited' },
      { label: 'Space', value: 'O(H)', note: 'Stack depth equals tree height' }
    ],
    useWhen: [
      'Deleting an entire tree from memory.',
      'Calculating file directory sizes (bottom-up sum).',
      'Evaluating postfix mathematical expressions.'
    ],
    watchOut: [
      'Can be complex to implement iteratively compared to preorder or inorder.'
    ],
    code: `void postorderTraversal(TreeNode* root) {
    if (!root) return;
    postorderTraversal(root->left);  // Left
    postorderTraversal(root->right); // Right
    cout << root->val << " ";        // Root
}`
  },

  'level-order': {
    id: 'level-order',
    tagline: 'Group nodes strictly by their depth level in the tree.',
    idea: 'Level-order traversal is a variation of BFS that processes the tree layer by layer. By keeping track of the queue size at the start of each level, you can group nodes sharing the same depth.',
    steps: [
      'Push the root into a queue.',
      'While the queue is not empty, record its current size (nodes in the level).',
      'Loop exactly that many times to process all nodes of the current level.',
      'Push children of popped nodes into the queue for the next level.',
      'Append the collected level group to the final result.'
    ],
    complexity: [
      { label: 'Best', value: 'O(V)', note: 'Process all nodes' },
      { label: 'Average', value: 'O(V)', note: 'Linear time' },
      { label: 'Worst', value: 'O(V)', note: 'Every node visited' },
      { label: 'Space', value: 'O(W)', note: 'W is maximum width' }
    ],
    useWhen: [
      'Finding the right-side view of a binary tree.',
      'Connecting sibling pointers in perfect binary trees.',
      'Finding the minimum depth of a tree.'
    ],
    watchOut: [
      'Space complexity is dominated by the widest level, which can be N/2 nodes in the worst case.'
    ],
    code: `vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> res;
    if (!root) return res;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int levelSize = q.size();
        vector<int> currentLevel;
        for (int i = 0; i < levelSize; i++) {
            TreeNode* node = q.front(); q.pop();
            currentLevel.push_back(node->val);
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        res.push_back(currentLevel);
    }
    return res;
}`
  },

  'morris-traversal': {
    id: 'morris-traversal',
    tagline: 'Achieve O(1) space tree traversal using temporary threaded links.',
    idea: 'Morris Traversal threads the binary tree by making the rightmost node of a left subtree point back to the current root. This allows for inorder traversal without using recursion or an explicit stack, keeping space complexity strictly constant.',
    steps: [
      'Start at the root node.',
      'If the current node has no left child, process it and move to the right child.',
      'If it has a left child, find the rightmost node (predecessor) in the left subtree.',
      'If predecessor\'s right child is null, set it to current, and move current to left.',
      'If predecessor\'s right child is current, we visited the left; revert the link, process current, move right.',
      'Repeat until the current node becomes null.'
    ],
    complexity: [
      { label: 'Best', value: 'O(V)', note: 'Constant extra space' },
      { label: 'Average', value: 'O(V)', note: 'Edges visited <= 3 times' },
      { label: 'Worst', value: 'O(V)', note: 'Strictly linear time' },
      { label: 'Space', value: 'O(1)', note: 'No stack or recursion used' }
    ],
    useWhen: [
      'Operating in strictly memory-constrained environments.',
      'Traversing giant trees where stack overflow is a certainty.',
      'Flattening trees with absolutely zero auxiliary allocation.'
    ],
    watchOut: [
      'Modifies the tree structure during traversal (though restores it by the end).',
      'Not thread-safe; concurrent traversals will corrupt the tree.'
    ],
    code: `void morrisInorder(TreeNode* root) {
    TreeNode* current = root;
    while (current) {
        if (!current->left) {
            cout << current->val << " ";
            current = current->right;
        } else {
            TreeNode* pre = current->left;
            while (pre->right && pre->right != current)
                pre = pre->right;
            if (!pre->right) {
                pre->right = current; // Thread
                current = current->left;
            } else {
                pre->right = nullptr; // Unthread
                cout << current->val << " ";
                current = current->right;
            }
        }
    }
}`
  },


  // --- Batch 3 ---
  'bfs-graph': {
    id: 'bfs-graph',
    tagline: 'Explores a graph level by level like ripples spreading from a stone dropped in water.',
    idea: 'Breadth-First Search visits all neighbours of the current node before moving deeper, using a FIFO queue to manage the frontier. This guarantees that the first time a node is reached, it was via the fewest edges possible. BFS is the go-to tool for shortest-path queries in unweighted graphs and for any problem that requires layer-by-layer exploration.',
    steps: [
      'Enqueue the source node and mark it visited.',
      'Dequeue the front node and process it.',
      'For each unvisited neighbour, mark it visited and enqueue it.',
      'Repeat until the queue is empty.',
      'All reachable nodes are now visited in non-decreasing distance order.',
    ],
    complexity: [
      { label: 'Best', value: 'O(1)', note: 'Target is the source' },
      { label: 'Average', value: 'O(V + E)', note: 'Visits every edge once' },
      { label: 'Worst', value: 'O(V + E)', note: 'Must traverse full graph' },
      { label: 'Space', value: 'O(V)', note: 'Queue + visited array' },
    ],
    useWhen: [
      'You need the shortest path in an unweighted or unit-weight graph.',
      'You want to explore nodes in order of their distance from a source.',
      'The problem involves level-order processing (e.g., multi-source BFS for nearest facility).',
    ],
    watchOut: [
      'BFS does NOT handle weighted edges — use Dijkstra for that.',
      'Memory can spike on dense graphs because the queue may hold O(V) nodes simultaneously.',
      'Forgetting to mark nodes visited before enqueuing causes duplicates and TLE.',
    ],
    code: `void bfs(int src, vector<vector<int>>& adj, int n) {
    vector<int> dist(n, -1);
    queue<int> q;
    dist[src] = 0;
    q.push(src);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
}`,
  },

  'dfs-graph': {
    id: 'dfs-graph',
    tagline: 'Plunges as deep as possible along each branch before backtracking, like navigating a maze by hugging one wall.',
    idea: 'Depth-First Search explores a graph by going as far as possible down one path before retreating. It uses an implicit or explicit stack, and its backtracking nature makes it ideal for detecting cycles, computing connected components, and exploring all possible paths. DFS is the backbone of most advanced graph algorithms.',
    steps: [
      'Start at a source node; mark it visited and push it on the stack.',
      'Pop the top node and explore an unvisited neighbour — push that neighbour.',
      'If no unvisited neighbours remain, backtrack by popping the stack.',
      'Repeat until the stack is empty.',
      'Optionally record discovery and finish times for advanced analysis.',
    ],
    complexity: [
      { label: 'Best', value: 'O(1)', note: 'Target found immediately' },
      { label: 'Average', value: 'O(V + E)', note: 'Visits every edge once' },
      { label: 'Worst', value: 'O(V + E)', note: 'Full graph traversal' },
      { label: 'Space', value: 'O(V)', note: 'Recursion stack depth' },
    ],
    useWhen: [
      'You need to detect cycles in directed or undirected graphs.',
      'The problem requires topological ordering, SCC detection, or bridge finding.',
      'You want to enumerate all paths or solve backtracking-style graph puzzles.',
    ],
    watchOut: [
      'Recursive DFS can overflow the call stack on graphs with 10\u2075+ nodes — use iterative version.',
      'On undirected graphs, skip the parent edge to avoid false cycle detection.',
      'DFS does NOT give shortest paths in unweighted graphs — use BFS for that.',
    ],
    code: `void dfs(int u, vector<vector<int>>& adj, vector<bool>& vis) {
    vis[u] = true;
    for (int v : adj[u]) {
        if (!vis[v]) dfs(v, adj, vis);
    }
}
// Driver: count connected components
int countCC(vector<vector<int>>& adj, int n) {
    vector<bool> vis(n, false);
    int cc = 0;
    for (int i = 0; i < n; i++)
        if (!vis[i]) { dfs(i, adj, vis); cc++; }
    return cc;
}`,
  },

  'topological-sort': {
    id: 'topological-sort',
    tagline: 'Lines up tasks so every prerequisite is completed before the task that depends on it.',
    idea: 'Topological sort produces a linear ordering of vertices in a Directed Acyclic Graph (DAG) such that for every edge u\u2192v, u appears before v. Kahn\u2019s algorithm achieves this by repeatedly removing nodes with zero in-degree. It also doubles as a cycle detector: if the sorted output has fewer than V nodes, the graph contains a cycle.',
    steps: [
      'Compute the in-degree of every vertex.',
      'Enqueue all vertices with in-degree 0.',
      'Dequeue a vertex, append it to the result, and decrement in-degrees of its neighbours.',
      'If a neighbour\u2019s in-degree drops to 0, enqueue it.',
      'Repeat until the queue is empty; if result size < V, a cycle exists.',
    ],
    complexity: [
      { label: 'Best', value: 'O(V + E)', note: 'Always linear scan' },
      { label: 'Average', value: 'O(V + E)', note: 'Process each edge once' },
      { label: 'Worst', value: 'O(V + E)', note: 'Same linear bound' },
      { label: 'Space', value: 'O(V)', note: 'In-degree array + queue' },
    ],
    useWhen: [
      'You need to schedule tasks with dependency constraints (build systems, course prerequisites).',
      'You want to detect whether a directed graph contains a cycle.',
      'The problem requires processing nodes in dependency order (e.g., DP on DAGs).',
    ],
    watchOut: [
      'Only defined for DAGs — applying it to a cyclic graph will silently drop nodes.',
      'The ordering is not unique; ties can be broken with a priority queue for lexicographic order.',
      'DFS-based topo sort (reverse post-order) is an alternative but doesn\u2019t detect cycles as naturally.',
    ],
    code: `vector<int> topoSort(vector<vector<int>>& adj, int n) {
    vector<int> indeg(n, 0), order;
    for (int u = 0; u < n; u++)
        for (int v : adj[u]) indeg[v]++;
    queue<int> q;
    for (int i = 0; i < n; i++)
        if (indeg[i] == 0) q.push(i);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : adj[u])
            if (--indeg[v] == 0) q.push(v);
    }
    return order; // size < n means cycle
}`,
  },

  'dijkstra': {
    id: 'dijkstra',
    tagline: 'Greedily locks in the closest unvisited node, radiating outward like a growing crystal.',
    idea: 'Dijkstra\u2019s algorithm finds the shortest path from a single source to all other vertices in a graph with non-negative edge weights. It maintains a priority queue (min-heap) of tentative distances, always extracting the node with the smallest known distance and relaxing its neighbours. The greedy choice is provably optimal when all weights are \u2265 0.',
    steps: [
      'Set distance to source as 0 and all others to infinity; push source into the min-heap.',
      'Extract the node u with the smallest distance from the heap.',
      'For each neighbour v of u, compute candidate = dist[u] + weight(u, v).',
      'If candidate < dist[v], update dist[v] and push v into the heap.',
      'Repeat until the heap is empty; dist[] now holds shortest distances.',
    ],
    complexity: [
      { label: 'Best', value: 'O(V)', note: 'Source is isolated' },
      { label: 'Average', value: 'O(E log V)', note: 'Binary heap variant' },
      { label: 'Worst', value: 'O(E log V)', note: 'Dense graph with heap' },
      { label: 'Space', value: 'O(V + E)', note: 'Adj list + dist array' },
    ],
    useWhen: [
      'You need shortest paths and all edge weights are non-negative.',
      'The graph is sparse and a heap-based approach outperforms Floyd-Warshall.',
      'You want single-source shortest paths to all or a specific target node.',
    ],
    watchOut: [
      'Negative edge weights break Dijkstra — use Bellman-Ford instead.',
      'Lazy deletion (not decreasing keys) is simpler but may push O(E) entries into the heap.',
      'For very dense graphs (E \u2248 V\u00b2), an O(V\u00b2) array-based version can be faster.',
    ],
    code: `vector<long long> dijkstra(int src, vector<vector<pair<int,int>>>& adj, int n) {
    vector<long long> dist(n, LLONG_MAX);
    priority_queue<pair<long long,int>, vector<pair<long long,int>>,
                   greater<>> pq;
    dist[src] = 0;
    pq.push({0, src});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`,
  },

  'bellman-ford': {
    id: 'bellman-ford',
    tagline: 'Relaxes every edge V\u22121 times, patiently discovering shortest paths even through negative terrain.',
    idea: 'Bellman-Ford computes single-source shortest paths and, unlike Dijkstra, correctly handles negative edge weights. It works by relaxing all edges V\u22121 times; after that, any further relaxation indicates a negative-weight cycle. This makes it essential for problems involving arbitrage detection or graphs where negative costs are natural.',
    steps: [
      'Initialise dist[source] = 0 and all other distances to infinity.',
      'Repeat V\u22121 times: for every edge (u, v, w), if dist[u] + w < dist[v], update dist[v].',
      'After V\u22121 passes, perform one more pass over all edges.',
      'If any distance still decreases, a negative-weight cycle is reachable from the source.',
      'Return the distance array (or report the cycle).',
    ],
    complexity: [
      { label: 'Best', value: 'O(E)', note: 'No relaxation after pass 1' },
      { label: 'Average', value: 'O(VE)', note: 'Multiple relaxation rounds' },
      { label: 'Worst', value: 'O(VE)', note: 'Relax all edges each pass' },
      { label: 'Space', value: 'O(V)', note: 'Distance array only' },
    ],
    useWhen: [
      'The graph contains negative edge weights (Dijkstra cannot be used).',
      'You need to detect negative-weight cycles (e.g., currency arbitrage).',
      'The graph is given as an edge list and you want a simple implementation.',
    ],
    watchOut: [
      'O(VE) is much slower than Dijkstra\u2019s O(E log V) — only use when negative weights exist.',
      'SPFA (queue-based optimisation) is faster in practice but has the same worst case.',
      'Distances to nodes reachable from a negative cycle are undefined (\u2212\u221e).',
    ],
    code: `struct Edge { int u, v, w; };
pair<vector<long long>, bool> bellmanFord(int src, int n, vector<Edge>& edges) {
    vector<long long> dist(n, LLONG_MAX);
    dist[src] = 0;
    for (int i = 0; i < n - 1; i++)
        for (auto& [u, v, w] : edges)
            if (dist[u] != LLONG_MAX && dist[u] + w < dist[v])
                dist[v] = dist[u] + w;
    bool negCycle = false;
    for (auto& [u, v, w] : edges)
        if (dist[u] != LLONG_MAX && dist[u] + w < dist[v])
            negCycle = true;
    return {dist, negCycle};
}`,
  },

  'floyd-warshall': {
    id: 'floyd-warshall',
    tagline: 'Checks every possible intermediate stop to find shortest paths between all pairs of nodes simultaneously.',
    idea: 'Floyd-Warshall is a dynamic programming algorithm that computes shortest distances between every pair of vertices in O(V\u00b3). It iterates over all possible intermediate nodes k and relaxes the path i\u2192k\u2192j. Despite its cubic cost, its simplicity and ability to handle negative weights (without negative cycles) make it ideal for small-to-medium dense graphs.',
    steps: [
      'Initialise a V\u00d7V distance matrix: 0 on the diagonal, edge weights where edges exist, infinity elsewhere.',
      'For each intermediate node k from 0 to V\u22121:',
      '  For each pair (i, j), set dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]).',
      'After all k iterations, dist[i][j] holds the shortest path from i to j.',
      'Negative cycles exist if any dist[i][i] < 0.',
    ],
    complexity: [
      { label: 'Best', value: 'O(V\u00b3)', note: 'Always triple loop' },
      { label: 'Average', value: 'O(V\u00b3)', note: 'Fixed iteration count' },
      { label: 'Worst', value: 'O(V\u00b3)', note: 'Cannot short-circuit' },
      { label: 'Space', value: 'O(V\u00b2)', note: 'Distance matrix' },
    ],
    useWhen: [
      'You need all-pairs shortest paths and V is small (typically V \u2264 400\u2013500).',
      'The graph is dense, making V\u00b2 Dijkstra runs roughly the same cost.',
      'You need to detect negative cycles across the entire graph.',
    ],
    watchOut: [
      'O(V\u00b3) is prohibitive for large graphs — use Dijkstra from each source if the graph is sparse.',
      'The order of loops matters: k must be the outermost loop for correctness.',
      'Use long long to avoid overflow when summing distances near INT_MAX.',
    ],
    code: `void floydWarshall(vector<vector<long long>>& dist, int n) {
    // dist[i][j] pre-filled: 0 diagonal, w for edges, LLONG_MAX/2 otherwise
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
    // Negative cycle check: dist[i][i] < 0 for some i
}`,
  },

  'kruskal': {
    id: 'kruskal',
    tagline: 'Sorts all edges by weight and greedily stitches the cheapest ones together without forming cycles.',
    idea: 'Kruskal\u2019s algorithm builds a Minimum Spanning Tree by processing edges in ascending weight order. It uses a Disjoint Set Union (DSU / Union-Find) to efficiently check whether adding an edge would create a cycle. If the two endpoints are in different components, the edge is added to the MST. This edge-centric approach is especially elegant for sparse graphs.',
    steps: [
      'Collect all edges and sort them by weight in ascending order.',
      'Initialise a DSU with each vertex in its own set.',
      'Iterate through sorted edges: for edge (u, v, w), find the roots of u and v.',
      'If the roots differ, union the sets and add the edge to the MST.',
      'Stop when V\u22121 edges have been added (MST is complete).',
    ],
    complexity: [
      { label: 'Best', value: 'O(E log E)', note: 'Sorting dominates' },
      { label: 'Average', value: 'O(E log E)', note: 'Sort + near-O(E) DSU' },
      { label: 'Worst', value: 'O(E log E)', note: 'Same bound' },
      { label: 'Space', value: 'O(V + E)', note: 'DSU + edge list' },
    ],
    useWhen: [
      'You need a Minimum Spanning Tree and the graph is given as an edge list.',
      'The graph is sparse (E \u226a V\u00b2), making the sort cheap.',
      'You want to process edges in weight order for problems like MST with constraints.',
    ],
    watchOut: [
      'Sorting E edges costs O(E log E); for very dense graphs, Prim\u2019s with a heap may be faster.',
      'Kruskal\u2019s needs an efficient DSU — without path compression and union by rank it degrades.',
      'The MST is not unique if multiple edges share the same weight.',
    ],
    code: `struct Edge { int u, v, w; };
int par[200001], rnk[200001];
int find(int x) { return par[x] == x ? x : par[x] = find(par[x]); }
bool unite(int a, int b) {
    a = find(a); b = find(b);
    if (a == b) return false;
    if (rnk[a] < rnk[b]) swap(a, b);
    par[b] = a; if (rnk[a] == rnk[b]) rnk[a]++;
    return true;
}
long long kruskal(int n, vector<Edge>& edges) {
    sort(edges.begin(), edges.end(), [](auto& a, auto& b){ return a.w < b.w; });
    iota(par, par + n, 0); fill(rnk, rnk + n, 0);
    long long cost = 0;
    for (auto& [u, v, w] : edges)
        if (unite(u, v)) cost += w;
    return cost;
}`,
  },

  'prim': {
    id: 'prim',
    tagline: 'Grows the MST one vertex at a time, always reaching for the cheapest edge connecting new territory.',
    idea: 'Prim\u2019s algorithm builds a Minimum Spanning Tree by maintaining a growing connected component. At each step it selects the lightest edge that connects a visited node to an unvisited one, using a min-heap for efficiency. This vertex-centric approach mirrors Dijkstra\u2019s structure and works particularly well on dense graphs represented with adjacency lists.',
    steps: [
      'Start from any vertex; mark it visited and push all its edges into a min-heap.',
      'Extract the minimum-weight edge (u, v, w) from the heap.',
      'If v is already visited, discard and continue.',
      'Otherwise mark v visited, add w to the MST cost, and push all edges from v.',
      'Repeat until V\u22121 edges are added or the heap is empty.',
    ],
    complexity: [
      { label: 'Best', value: 'O(E log V)', note: 'Sparse graph, fast heap' },
      { label: 'Average', value: 'O(E log V)', note: 'Binary heap variant' },
      { label: 'Worst', value: 'O(E log V)', note: 'Every edge enters heap' },
      { label: 'Space', value: 'O(V + E)', note: 'Adj list + heap' },
    ],
    useWhen: [
      'The graph is dense and already in adjacency-list form.',
      'You want to build the MST incrementally from a specific starting vertex.',
      'The problem requires the MST of a connected component without an explicit edge list.',
    ],
    watchOut: [
      'Only works on connected graphs — run it per component for disconnected ones.',
      'Lazy deletion (skipping visited nodes popped from the heap) is simple but increases heap size.',
      'For sparse graphs with an edge list, Kruskal\u2019s is often simpler to implement.',
    ],
    code: `long long prim(int n, vector<vector<pair<int,int>>>& adj) {
    vector<bool> vis(n, false);
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    pq.push({0, 0}); // {weight, node}
    long long cost = 0;
    int cnt = 0;
    while (!pq.empty() && cnt < n) {
        auto [w, u] = pq.top(); pq.pop();
        if (vis[u]) continue;
        vis[u] = true; cost += w; cnt++;
        for (auto [v, wt] : adj[u])
            if (!vis[v]) pq.push({wt, v});
    }
    return cost;
}`,
  },

  'kosaraju': {
    id: 'kosaraju',
    tagline: 'Runs DFS twice — once to rank finish order, once on the reversed graph to peel off strongly connected components.',
    idea: 'Kosaraju\u2019s algorithm identifies all Strongly Connected Components (SCCs) in a directed graph using two passes of DFS. The first pass on the original graph records nodes by finish time. The second pass runs DFS on the transposed (reversed) graph in reverse finish-time order, and each DFS tree in this pass is one SCC. It is conceptually clean and easy to implement.',
    steps: [
      'Run DFS on the original graph; push each node onto a stack when it finishes.',
      'Build the transpose graph (reverse every edge direction).',
      'Pop nodes from the stack and run DFS on the transpose graph for unvisited nodes.',
      'Each DFS tree found in step 3 is one Strongly Connected Component.',
      'Assign a component ID to every node for further processing.',
    ],
    complexity: [
      { label: 'Best', value: 'O(V + E)', note: 'Two linear DFS passes' },
      { label: 'Average', value: 'O(V + E)', note: 'Always two full passes' },
      { label: 'Worst', value: 'O(V + E)', note: 'Same linear bound' },
      { label: 'Space', value: 'O(V + E)', note: 'Transpose graph + stack' },
    ],
    useWhen: [
      'You need to find all SCCs in a directed graph (e.g., 2-SAT, condensation graph).',
      'The problem requires condensing a directed graph into a DAG of components.',
      'You prefer a conceptually simple two-pass approach over Tarjan\u2019s single-pass.',
    ],
    watchOut: [
      'Requires building an explicit transpose graph, doubling adjacency list memory.',
      'Only works on directed graphs — undirected connected components are simpler.',
      'Recursive DFS may stack-overflow on very large graphs; use iterative DFS if needed.',
    ],
    code: `void dfs1(int u, vector<vector<int>>& adj, vector<bool>& vis, vector<int>& order) {
    vis[u] = true;
    for (int v : adj[u]) if (!vis[v]) dfs1(v, adj, vis, order);
    order.push_back(u);
}
void dfs2(int u, vector<vector<int>>& radj, vector<bool>& vis, int id, vector<int>& comp) {
    vis[u] = true; comp[u] = id;
    for (int v : radj[u]) if (!vis[v]) dfs2(v, radj, vis, id, comp);
}
vector<int> kosaraju(int n, vector<vector<int>>& adj, vector<vector<int>>& radj) {
    vector<bool> vis(n, false); vector<int> order, comp(n);
    for (int i = 0; i < n; i++) if (!vis[i]) dfs1(i, adj, vis, order);
    fill(vis.begin(), vis.end(), false);
    int id = 0;
    for (int i = n - 1; i >= 0; i--)
        if (!vis[order[i]]) dfs2(order[i], radj, vis, id++, comp);
    return comp;
}`,
  },

  'tarjan': {
    id: 'tarjan',
    tagline: 'Discovers strongly connected components in a single DFS pass using clever low-link bookkeeping.',
    idea: 'Tarjan\u2019s algorithm finds all SCCs in one DFS traversal by tracking two values per node: a discovery index and a low-link value (the smallest index reachable via the DFS subtree). Nodes are kept on a stack; when a node\u2019s low-link equals its own index, everything on the stack down to that node forms an SCC. It is more cache-friendly and avoids building a transpose graph.',
    steps: [
      'Start DFS; assign each node an incrementing discovery index and set low-link equal to it.',
      'Push the node onto an SCC stack and mark it as on-stack.',
      'For each neighbour: if unvisited, recurse and update low-link; if on-stack, update low-link.',
      'After processing all neighbours, if low-link == discovery index, pop the stack down to this node — that\u2019s one SCC.',
      'Repeat for any unvisited nodes to handle disconnected components.',
    ],
    complexity: [
      { label: 'Best', value: 'O(V + E)', note: 'Single DFS pass' },
      { label: 'Average', value: 'O(V + E)', note: 'Each edge visited once' },
      { label: 'Worst', value: 'O(V + E)', note: 'Linear in graph size' },
      { label: 'Space', value: 'O(V)', note: 'Stack + index arrays' },
    ],
    useWhen: [
      'You need SCCs and want to avoid building a transpose graph (saves memory).',
      'Performance matters and a single-pass algorithm is preferred over Kosaraju\u2019s two passes.',
      'You also need articulation points or bridges, which use similar low-link logic.',
    ],
    watchOut: [
      'The on-stack check is critical — back edges to nodes not on the stack must be ignored.',
      'Implementation is trickier than Kosaraju\u2019s; off-by-one errors in low-link updates are common.',
      'Recursive DFS can stack-overflow on large inputs; convert to iterative if needed.',
    ],
    code: `int idx, sccCnt, disc[200001], low[200001], comp[200001];
bool onStk[200001]; stack<int> stk;
void tarjan(int u, vector<vector<int>>& adj) {
    disc[u] = low[u] = idx++;
    stk.push(u); onStk[u] = true;
    for (int v : adj[u]) {
        if (disc[v] == -1) { tarjan(v, adj); low[u] = min(low[u], low[v]); }
        else if (onStk[v]) low[u] = min(low[u], disc[v]);
    }
    if (low[u] == disc[u]) {
        while (true) {
            int v = stk.top(); stk.pop();
            onStk[v] = false; comp[v] = sccCnt;
            if (v == u) break;
        }
        sccCnt++;
    }
}`,
  },

  'bridges': {
    id: 'bridges',
    tagline: 'Finds the fragile edges and joints whose removal would shatter the graph into pieces.',
    idea: 'Bridge-finding uses a modified DFS with discovery times and low-link values to identify critical edges (bridges) and vertices (articulation points) in an undirected graph. An edge u\u2013v is a bridge if the subtree rooted at v cannot reach u or any of u\u2019s ancestors via a back edge. These structures are vital for network reliability analysis and biconnected component decomposition.',
    steps: [
      'Run DFS and assign each node a discovery time and initialise its low-link to the same value.',
      'For each neighbour v of u: if unvisited, recurse, then set low[u] = min(low[u], low[v]).',
      'If low[v] > disc[u], the edge u\u2013v is a bridge.',
      'For articulation points: root is an AP if it has 2+ DFS children; non-root u is an AP if low[v] >= disc[u] for some child v.',
      'Skip the parent edge to avoid treating the tree edge as a back edge.',
    ],
    complexity: [
      { label: 'Best', value: 'O(V + E)', note: 'Single DFS traversal' },
      { label: 'Average', value: 'O(V + E)', note: 'Linear in graph size' },
      { label: 'Worst', value: 'O(V + E)', note: 'Same linear bound' },
      { label: 'Space', value: 'O(V + E)', note: 'Adj list + arrays' },
    ],
    useWhen: [
      'You need to find edges whose removal disconnects the graph (network single points of failure).',
      'The problem asks for articulation points (cut vertices) in an undirected graph.',
      'You are decomposing a graph into biconnected components or 2-edge-connected components.',
    ],
    watchOut: [
      'Parent tracking is essential — for multigraphs, track parent edge index, not just parent node.',
      'Bridges and articulation points use slightly different conditions (> vs >=); don\u2019t mix them up.',
      'Only applies to undirected graphs; directed graphs use dominator trees for similar analysis.',
    ],
    code: `int timer_val;
void dfsBridges(int u, int parent, vector<vector<int>>& adj,
                vector<int>& disc, vector<int>& low,
                vector<pair<int,int>>& bridges) {
    disc[u] = low[u] = timer_val++;
    for (int v : adj[u]) {
        if (v == parent) { parent = -1; continue; } // skip one parent edge
        if (disc[v] == -1) {
            dfsBridges(v, u, adj, disc, low, bridges);
            low[u] = min(low[u], low[v]);
            if (low[v] > disc[u]) bridges.push_back({u, v});
        } else {
            low[u] = min(low[u], disc[v]);
        }
    }
}`,
  },

  'union-find': {
    id: 'union-find',
    tagline: 'Merges groups and answers "are these connected?" in nearly constant time using tree compression tricks.',
    idea: 'Union-Find (Disjoint Set Union) maintains a collection of non-overlapping sets, supporting two operations: find (which set does an element belong to?) and union (merge two sets). With path compression and union by rank, both operations run in amortised O(\u03b1(n)) time, where \u03b1 is the inverse Ackermann function — effectively constant. It is the workhorse behind Kruskal\u2019s MST and dynamic connectivity problems.',
    steps: [
      'Initialise each element as its own parent (self-loop) with rank 0.',
      'Find: follow parent pointers to the root; flatten the path so every node points directly to the root (path compression).',
      'Union: find the roots of both elements; attach the shorter tree under the taller one (union by rank).',
      'If the roots are already the same, the elements are already connected — no merge needed.',
      'Optionally track component sizes or count for additional queries.',
    ],
    complexity: [
      { label: 'Best', value: 'O(1)', note: 'Root is immediate parent' },
      { label: 'Average', value: 'O(\u03b1(n))', note: 'Inverse Ackermann, \u22644' },
      { label: 'Worst', value: 'O(\u03b1(n))', note: 'Amortised near-constant' },
      { label: 'Space', value: 'O(n)', note: 'Parent + rank arrays' },
    ],
    useWhen: [
      'You need to dynamically merge groups and query connectivity (e.g., Kruskal\u2019s MST).',
      'The problem involves equivalence classes, connected components, or cycle detection in undirected graphs.',
      'You need an online algorithm that processes edges one at a time and answers queries between additions.',
    ],
    watchOut: [
      'Union-Find does not support efficient split/delete operations — it\u2019s merge-only.',
      'Without both path compression AND union by rank, worst case degrades to O(n) per operation.',
      'For problems needing rollback (offline divide-and-conquer), use union by rank without path compression.',
    ],
    code: `struct DSU {
    vector<int> par, rnk;
    int comps;
    DSU(int n) : par(n), rnk(n, 0), comps(n) { iota(par.begin(), par.end(), 0); }
    int find(int x) { return par[x] == x ? x : par[x] = find(par[x]); }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (rnk[a] < rnk[b]) swap(a, b);
        par[b] = a;
        if (rnk[a] == rnk[b]) rnk[a]++;
        comps--;
        return true;
    }
    bool connected(int a, int b) { return find(a) == find(b); }
};`,
  },


  // --- Batch 4 ---
'1d-dp': {
  id: '1d-dp',
  tagline: 'Solve complex problems by breaking them into sequential, overlapping subproblems.',
  idea: '1D Dynamic Programming optimizes recursion by storing previously computed results in a 1D array. It is ideal for sequence problems where the current state depends only on a few previous states, avoiding redundant calculations and reducing exponential time to linear.',
  steps: [
    'Define the state, usually dp[i] representing the answer for a prefix of length i.',
    'Identify the base cases and initialize them in the array.',
    'Formulate the recurrence relation connecting dp[i] to previous states.',
    'Iterate through the array, computing each state using the recurrence.',
    'Return the final state, typically the last element in the array.'
  ],
  complexity: [
    { label: 'Best', value: 'O(n)', note: '' },
    { label: 'Average', value: 'O(n)', note: '' },
    { label: 'Worst', value: 'O(n)', note: '' },
    { label: 'Space', value: 'O(n)', note: '' }
  ],
  useWhen: [
    'Fibonacci-like sequences or climbing stairs problems',
    'Finding maximum sum of non-adjacent elements (House Robber)',
    '1D sequence optimization problems'
  ],
  watchOut: [
    'Space can often be optimized to O(1) by only keeping the last few states.',
    'Ensure correct handling of boundary conditions.'
  ],
  code: `int solve1D(vector<int>& arr) {
    int n = arr.size();
    if (n == 0) return 0;
    vector<int> dp(n, 0);
    dp[0] = max(0, arr[0]);
    if (n > 1) dp[1] = max(dp[0], arr[1]);
    for (int i = 2; i < n; i++) {
        dp[i] = max(dp[i-1], dp[i-2] + arr[i]);
    }
    return dp[n-1];
}`
},
'2d-dp': {
  id: '2d-dp',
  tagline: 'Extend state memory into a grid to solve matrix or two-sequence problems.',
  idea: '2D Dynamic Programming uses a 2D table to cache overlapping subproblem results involving two variables or sequences. It is the go-to technique for grid traversals, sequence comparisons, and matrix chain multiplications.',
  steps: [
    'Define the state dp[i][j] representing a solution for prefixes i and j.',
    'Initialize the base cases, often the first row and first column.',
    'Formulate the state transition using previous grid cells (e.g., left, top, diagonal).',
    'Iterate through the matrix with nested loops to fill the table.',
    'Extract the final answer from dp[n][m].'
  ],
  complexity: [
    { label: 'Best', value: 'O(n*m)', note: '' },
    { label: 'Average', value: 'O(n*m)', note: '' },
    { label: 'Worst', value: 'O(n*m)', note: '' },
    { label: 'Space', value: 'O(n*m)', note: '' }
  ],
  useWhen: [
    'Grid pathfinding with obstacles or costs',
    'String editing and alignment problems',
    'Matrix chain multiplications'
  ],
  watchOut: [
    'Memory limit exceeded (MLE) on huge grids; consider 1D space optimization.',
    'Loop order matters if states depend on cells computed later.'
  ],
  code: `int minPathSum(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size();
    vector<vector<int>> dp(m, vector<int>(n, 0));
    dp[0][0] = grid[0][0];
    for (int i = 1; i < m; i++) dp[i][0] = dp[i-1][0] + grid[i][0];
    for (int j = 1; j < n; j++) dp[0][j] = dp[0][j-1] + grid[0][j];
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + grid[i][j];
        }
    }
    return dp[m-1][n-1];
}`
},
'knapsack': {
  id: 'knapsack',
  tagline: 'Maximize total value within a strict capacity limit.',
  idea: 'The 0/1 Knapsack problem evaluates whether to include or exclude items with specific weights and values to maximize total value without exceeding a weight limit. It is solved efficiently using 2D or space-optimized 1D dynamic programming.',
  steps: [
    'Define dp[w] as the maximum value achievable with weight limit w.',
    'Initialize a DP array of size W+1 with zeros.',
    'Iterate through each item, getting its weight and value.',
    'For each item, iterate backwards through the DP array from W down to the item weight.',
    'Update dp[w] with the maximum of its current value or value if the item is included.'
  ],
  complexity: [
    { label: 'Best', value: 'O(n*W)', note: '' },
    { label: 'Average', value: 'O(n*W)', note: '' },
    { label: 'Worst', value: 'O(n*W)', note: '' },
    { label: 'Space', value: 'O(W)', note: '' }
  ],
  useWhen: [
    'Resource allocation under a strict budget constraint',
    'Subset sum or partition problems',
    'Cargo loading or inventory selection'
  ],
  watchOut: [
    'Iterating forwards instead of backwards in 1D DP causes items to be used multiple times (unbounded knapsack).',
    'W must be reasonably small for the DP to fit in memory.'
  ],
  code: `int knapsack(int W, vector<int>& wt, vector<int>& val) {
    int n = wt.size();
    vector<int> dp(W + 1, 0);
    for (int i = 0; i < n; i++) {
        for (int w = W; w >= wt[i]; w--) {
            dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);
        }
    }
    return dp[W];
}`
},
'lis': {
  id: 'lis',
  tagline: 'Find the longest strictly increasing sequence hidden in an array.',
  idea: 'Longest Increasing Subsequence (LIS) discovers the longest sequence of elements in ascending order. While a standard DP approach takes O(n^2), combining DP with binary search reduces it to O(n log n).',
  steps: [
    'Create an empty array tails where tails[i] stores the smallest tail of all increasing subsequences of length i+1.',
    'Iterate through each element x in the input array.',
    'Use binary search to find the first element in tails that is greater than or equal to x.',
    'If x is larger than all elements in tails, append it to the end.',
    'Otherwise, replace the found element with x to keep potential endings as small as possible.'
  ],
  complexity: [
    { label: 'Best', value: 'O(n log n)', note: '' },
    { label: 'Average', value: 'O(n log n)', note: '' },
    { label: 'Worst', value: 'O(n log n)', note: '' },
    { label: 'Space', value: 'O(n)', note: '' }
  ],
  useWhen: [
    'Finding maximum nested envelopes or Russian dolls',
    'Longest bitonic subsequence problems',
    'Patience sorting card games'
  ],
  watchOut: [
    'The tails array does NOT represent the actual LIS, only the optimal endpoints.',
    'Differentiating between strictly increasing and non-decreasing requires tweaking the binary search.'
  ],
  code: `int lengthOfLIS(vector<int>& nums) {
    vector<int> tails;
    for (int x : nums) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) {
            tails.push_back(x);
        } else {
            *it = x;
        }
    }
    return tails.size();
}`
},
'lcs': {
  id: 'lcs',
  tagline: 'Identify the longest common sequence woven through two strings.',
  idea: 'Longest Common Subsequence (LCS) finds the longest sequence present in both strings in the same order, without requiring contiguous characters. It heavily utilizes 2D DP to compare prefixes.',
  steps: [
    'Create a 2D DP table of size (n+1) x (m+1) initialized to 0.',
    'Iterate through characters of the first string (i) and the second string (j).',
    'If characters match, set dp[i][j] = dp[i-1][j-1] + 1.',
    'If characters differ, set dp[i][j] = max(dp[i-1][j], dp[i][j-1]).',
    'The value at dp[n][m] contains the length of the LCS.'
  ],
  complexity: [
    { label: 'Best', value: 'O(n*m)', note: '' },
    { label: 'Average', value: 'O(n*m)', note: '' },
    { label: 'Worst', value: 'O(n*m)', note: '' },
    { label: 'Space', value: 'O(n*m)', note: '' }
  ],
  useWhen: [
    'Diff tools comparing text files',
    'Bioinformatics DNA sequence alignment',
    'Edit distance derivations'
  ],
  watchOut: [
    '2D space can be optimized to O(min(n, m)) if only the length is needed.',
    'Reconstructing the actual string requires backtracking through the DP table.'
  ],
  code: `int longestCommonSubsequence(string text1, string text2) {
    int m = text1.length(), n = text2.length();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1[i-1] == text2[j-1]) {
                dp[i][j] = dp[i-1][j-1] + 1;
            } else {
                dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
            }
        }
    }
    return dp[m][n];
}`
},
'dp-on-trees': {
  id: 'dp-on-trees',
  tagline: 'Solve optimization problems on tree topologies via recursive state passing.',
  idea: 'DP on Trees processes structural hierarchies where a node’s state depends on its children or parent. Often implemented via post-order DFS, it combines subtree results to find global optimums like maximum independent sets or tree diameters.',
  steps: [
    'Represent the tree using an adjacency list.',
    'Define DP states for each node, often distinguishing between include node and exclude node.',
    'Traverse the tree using DFS to compute child states first (bottom-up).',
    'Merge the results of all children into the current node’s state.',
    'Optionally perform a second top-down DFS (rerooting) if answers for all roots are needed.'
  ],
  complexity: [
    { label: 'Best', value: 'O(V + E)', note: '' },
    { label: 'Average', value: 'O(V + E)', note: '' },
    { label: 'Worst', value: 'O(V + E)', note: '' },
    { label: 'Space', value: 'O(V)', note: '' }
  ],
  useWhen: [
    'Finding maximum independent set in a tree (House Robber III)',
    'Tree diameter or longest path computations',
    'Distance sum calculations across all node pairs'
  ],
  watchOut: [
    'Avoid visiting the parent node during the DFS traversal by passing parent as an argument.',
    'Deep recursion can cause stack overflow; iteratively simulating DFS might be needed for huge trees.'
  ],
  code: `void dfs(int u, int p, vector<vector<int>>& adj, vector<int>& dp1, vector<int>& dp2) {
    dp1[u] = 1; // e.g., include u
    dp2[u] = 0; // e.g., exclude u
    for (int v : adj[u]) {
        if (v == p) continue;
        dfs(v, u, adj, dp1, dp2);
        dp1[u] += dp2[v];
        dp2[u] += max(dp1[v], dp2[v]);
    }
}
int maxIndependentSet(int n, vector<vector<int>>& adj) {
    vector<int> dp1(n), dp2(n);
    dfs(0, -1, adj, dp1, dp2);
    return max(dp1[0], dp2[0]);
}`
},
'digit-dp': {
  id: 'digit-dp',
  tagline: 'Count combinations of numbers matching criteria without iterating them all.',
  idea: 'Digit DP computes the number of integers in a range [L, R] that satisfy specific digit-level properties. By processing numbers digit by digit and keeping track of constraints (like whether we are tightly bounded by the limit), it achieves logarithmic time.',
  steps: [
    'Convert the upper bound number to a string of digits.',
    'Define state: index, tightness (boolean), and custom properties (like sum or remainder).',
    'Iterate through possible digits (0-9) for the current index.',
    'Restrict the max digit to limit[index] if the state is currently tight.',
    'Recursively evaluate next states and memoize results to avoid recomputation.'
  ],
  complexity: [
    { label: 'Best', value: 'O(D * S)', note: '' }, 
    { label: 'Average', value: 'O(D * S)', note: '' },
    { label: 'Worst', value: 'O(D * S)', note: '' },
    { label: 'Space', value: 'O(D * S)', note: '' }
  ],
  useWhen: [
    'Counting numbers with a specific digit sum up to N',
    'Finding numbers without adjacent duplicate digits in a huge range',
    'Problems asking How many numbers between L and R have property X?'
  ],
  watchOut: [
    'Solve for [L, R] by calculating solve(R) - solve(L-1).',
    'Handle leading zeros carefully if the property depends on the number\'s length.'
  ],
  code: `long long memo[20][2][180];
string numStr;
long long solve(int idx, bool tight, int sum) {
    if (idx == numStr.size()) return sum;
    if (memo[idx][tight][sum] != -1) return memo[idx][tight][sum];
    int limit = tight ? numStr[idx] - '0' : 9;
    long long ans = 0;
    for (int d = 0; d <= limit; d++) {
        ans += solve(idx + 1, tight && (d == limit), sum + d);
    }
    return memo[idx][tight][sum] = ans;
}
long long countDigitSum(long long R) {
    numStr = to_string(R);
    memset(memo, -1, sizeof(memo));
    return solve(0, true, 0);
}`
},
'bitmask-dp': {
  id: 'bitmask-dp',
  tagline: 'Use integer bits to represent small subset states in DP.',
  idea: 'Bitmask DP leverages integer binary representations to track visited nodes or chosen items, usually when N is very small (N ≤ 20). It replaces sets with bitwise operations, enabling O(1) state transitions.',
  steps: [
    'Use an integer mask from 0 to (2^N - 1) to represent all subset combinations.',
    'Define DP state usually as dp[mask][last_element].',
    'Iterate over all masks, or use recursion with memoization.',
    'Transition by toggling bits using bitwise OR (mask | (1 << i)).',
    'Check if an item is already used using bitwise AND (mask & (1 << i)).'
  ],
  complexity: [
    { label: 'Best', value: 'O(n² 2^n)', note: '' },
    { label: 'Average', value: 'O(n² 2^n)', note: '' },
    { label: 'Worst', value: 'O(n² 2^n)', note: '' },
    { label: 'Space', value: 'O(n 2^n)', note: '' }
  ],
  useWhen: [
    'Traveling Salesperson Problem (TSP)',
    'Assignment problems matching N workers to N tasks',
    'Hamiltonian path or subset sums with strict combinations'
  ],
  watchOut: [
    'Strictly limited by N around 20 due to exponential time and space limits.',
    'Ensure correct operator precedence with bitwise operations by using parentheses.'
  ],
  code: `int tsp(int mask, int pos, int n, vector<vector<int>>& dist, vector<vector<int>>& dp) {
    if (mask == (1 << n) - 1) return dist[pos][0];
    if (dp[mask][pos] != -1) return dp[mask][pos];
    int ans = 1e9;
    for (int city = 0; city < n; city++) {
        if ((mask & (1 << city)) == 0) {
            int newAns = dist[pos][city] + tsp(mask | (1 << city), city, n, dist, dp);
            ans = min(ans, newAns);
        }
    }
    return dp[mask][pos] = ans;
}`
},
'activity-selection': {
  id: 'activity-selection',
  tagline: 'Maximize events scheduled by always picking what finishes first.',
  idea: 'The Activity Selection algorithm is a greedy approach to find the maximum number of non-overlapping intervals. By sorting activities by their end times, we safely pick the earliest finishing activity to leave the most room for remaining ones.',
  steps: [
    'Store activities as pairs of (start_time, end_time).',
    'Sort all activities based on their end times in ascending order.',
    'Select the first activity and record its end time as last_end.',
    'Iterate through the remaining activities.',
    'If an activity’s start time is greater than or equal to last_end, select it and update last_end.'
  ],
  complexity: [
    { label: 'Best', value: 'O(n log n)', note: '' },
    { label: 'Average', value: 'O(n log n)', note: '' },
    { label: 'Worst', value: 'O(n log n)', note: '' },
    { label: 'Space', value: 'O(n)', note: '' }
  ],
  useWhen: [
    'Scheduling maximum classes in a single classroom',
    'Non-overlapping interval selections',
    'Event management with time constraints'
  ],
  watchOut: [
    'Sorting by start time instead of end time can lead to suboptimal greedy choices.',
    'If intervals are given already sorted, time complexity drops to O(n).'
  ],
  code: `int maxActivities(vector<pair<int, int>>& intervals) {
    if (intervals.empty()) return 0;
    sort(intervals.begin(), intervals.end(), [](const pair<int, int>& a, const pair<int, int>& b) {
        return a.second < b.second;
    });
    int count = 1;
    int lastEnd = intervals[0].second;
    for (int i = 1; i < intervals.size(); i++) {
        if (intervals[i].first >= lastEnd) {
            count++;
            lastEnd = intervals[i].second;
        }
    }
    return count;
}`
},
'interval-scheduling': {
  id: 'interval-scheduling',
  tagline: 'Determine the minimum resources required to handle overlapping timelines.',
  idea: 'Interval Scheduling (or Meeting Rooms II) determines the peak number of overlapping intervals. It often employs a sweep-line or min-heap approach to track active events, calculating the minimum number of parallel resources needed.',
  steps: [
    'Separate all start times and end times into two arrays.',
    'Sort both arrays independently in ascending order.',
    'Use two pointers (one for starts, one for ends) to iterate through the timelines.',
    'If the current start time is less than the current end time, increment active count and move start pointer.',
    'Otherwise, decrement active count and move end pointer, keeping track of the maximum active count.'
  ],
  complexity: [
    { label: 'Best', value: 'O(n log n)', note: '' },
    { label: 'Average', value: 'O(n log n)', note: '' },
    { label: 'Worst', value: 'O(n log n)', note: '' },
    { label: 'Space', value: 'O(n)', note: '' }
  ],
  useWhen: [
    'Calculating minimum meeting rooms required',
    'Finding maximum simultaneous connections to a server',
    'Train platform scheduling'
  ],
  watchOut: [
    'Ensure boundary conditions where start time equals end time are handled based on overlapping rules.',
    'A min-heap storing end times can alternatively manage active intervals.'
  ],
  code: `int minMeetingRooms(vector<vector<int>>& intervals) {
    vector<int> starts, ends;
    for (auto& i : intervals) {
        starts.push_back(i[0]);
        ends.push_back(i[1]);
    }
    sort(starts.begin(), starts.end());
    sort(ends.begin(), ends.end());
    
    int rooms = 0, maxRooms = 0, endPtr = 0;
    for (int startPtr = 0; startPtr < starts.size(); startPtr++) {
        if (starts[startPtr] < ends[endPtr]) {
            rooms++;
            maxRooms = max(maxRooms, rooms);
        } else {
            rooms--;
            endPtr++;
            startPtr--; // Re-evaluate this start with the next end
        }
    }
    return maxRooms;
}`
},
'huffman-coding': {
  id: 'huffman-coding',
  tagline: 'Compress data by assigning shorter bit codes to frequent characters.',
  idea: 'Huffman Coding is a lossless data compression algorithm that builds a prefix tree. Characters with higher frequencies get shorter path lengths in the tree, ensuring optimal variable-length encoding without ambiguity.',
  steps: [
    'Count the frequency of each character in the input data.',
    'Create leaf nodes for each character and push them into a min-heap based on frequency.',
    'Extract the two nodes with the lowest frequencies.',
    'Create an internal node linking the two, with frequency equal to their sum, and push back to heap.',
    'Repeat until one node remains (the root), then traverse to assign 0/1 to edges for encoding.'
  ],
  complexity: [
    { label: 'Best', value: 'O(n log n)', note: '' },
    { label: 'Average', value: 'O(n log n)', note: '' },
    { label: 'Worst', value: 'O(n log n)', note: '' },
    { label: 'Space', value: 'O(n)', note: '' }
  ],
  useWhen: [
    'File compression like ZIP or GZIP',
    'Image and video encoding formats (JPEG, MP3)',
    'Transmitting data over limited bandwidth networks'
  ],
  watchOut: [
    'Decoding requires the same prefix tree, adding overhead to the compressed file.',
    'Prefix codes guarantee no code is a prefix of another, avoiding ambiguous decoding.'
  ],
  code: `struct Node {
    char ch; int freq; Node *left, *right;
    Node(char c, int f, Node* l=NULL, Node* r=NULL) : ch(c), freq(f), left(l), right(r) {}
};
struct comp {
    bool operator()(Node* l, Node* r) { return l->freq > r->freq; }
};
Node* buildHuffmanTree(string text) {
    unordered_map<char, int> freq;
    for (char c : text) freq[c]++;
    priority_queue<Node*, vector<Node*>, comp> pq;
    for (auto pair : freq) pq.push(new Node(pair.first, pair.second));
    while (pq.size() > 1) {
        Node *left = pq.top(); pq.pop();
        Node *right = pq.top(); pq.pop();
        int sum = left->freq + right->freq;
        pq.push(new Node('\\0', sum, left, right));
    }
    return pq.top();
}`
},
'kmp': {
  id: 'kmp',
  tagline: 'Search for patterns without ever backtracking the text pointer.',
  idea: 'Knuth-Morris-Pratt (KMP) accelerates string matching by precomputing an LPS (Longest Prefix Suffix) array. Upon a mismatch, it bypasses redundant checks by safely shifting the pattern based on prefix rules instead of resetting to the start.',
  steps: [
    'Compute the LPS array for the pattern, where lps[i] tracks the longest proper prefix matching a suffix up to index i.',
    'Initialize pointers i for text and j for pattern.',
    'Iterate through the text; if characters match, increment both pointers.',
    'If they mismatch and j > 0, set j = lps[j-1] without changing i.',
    'If j reaches the pattern length, a match is found; reset j = lps[j-1] to find overlaps.'
  ],
  complexity: [
    { label: 'Best', value: 'O(n + m)', note: '' },
    { label: 'Average', value: 'O(n + m)', note: '' },
    { label: 'Worst', value: 'O(n + m)', note: '' },
    { label: 'Space', value: 'O(m)', note: '' }
  ],
  useWhen: [
    'Finding substring occurrences in massive text documents',
    'Pattern matching with significant repeating sub-patterns',
    'Real-time text streams where backtracking is expensive'
  ],
  watchOut: [
    'LPS array computation requires careful state tracking and can be tricky to implement correctly.',
    'Standard library string search is often highly optimized and may outpace naive KMP in common scenarios.'
  ],
  code: `vector<int> computeLPS(string& pat) {
    int m = pat.length(), len = 0;
    vector<int> lps(m, 0);
    for (int i = 1; i < m; ) {
        if (pat[i] == pat[len]) {
            lps[i++] = ++len;
        } else if (len != 0) {
            len = lps[len - 1];
        } else {
            lps[i++] = 0;
        }
    }
    return lps;
}
int KMPSearch(string& pat, string& txt) {
    vector<int> lps = computeLPS(pat);
    int i = 0, j = 0, count = 0;
    while (i < txt.length()) {
        if (pat[j] == txt[i]) { i++; j++; }
        if (j == pat.length()) {
            count++; j = lps[j - 1];
        } else if (i < txt.length() && pat[j] != txt[i]) {
            if (j != 0) j = lps[j - 1]; else i++;
        }
    }
    return count;
}`
},
'rabin-karp': {
  id: 'rabin-karp',
  tagline: 'Match strings by sliding a rolling hash window.',
  idea: 'Rabin-Karp uses a rolling hash function to convert string segments into integers. Instead of comparing characters individually, it compares hash values in O(1) time, sliding the window by adding the new character and removing the old one.',
  steps: [
    'Select a prime base and a large modulo to prevent integer overflow.',
    'Compute the initial hash of the pattern and the first text window of the same length.',
    'Compare hashes. If they match, verify character-by-character to avoid hash collisions.',
    'Slide the window: subtract the outgoing character\'s hash contribution, multiply by base, and add the new character.',
    'Repeat until the window reaches the end of the text.'
  ],
  complexity: [
    { label: 'Best', value: 'O(n + m)', note: '' },
    { label: 'Average', value: 'O(n + m)', note: '' },
    { label: 'Worst', value: 'O(n * m)', note: '' },
    { label: 'Space', value: 'O(1)', note: '' }
  ],
  useWhen: [
    'Searching for multiple different patterns simultaneously',
    'Detecting plagiarism across documents',
    '2D pattern matching in grids'
  ],
  watchOut: [
    'Hash collisions can degrade performance to O(n*m). Use double hashing or massive modulos to mitigate.',
    'Properly handle modular arithmetic, especially negative results during subtraction.'
  ],
  code: `int rabinKarp(string pat, string txt) {
    int d = 256, q = 101, m = pat.length(), n = txt.length();
    int p = 0, t = 0, h = 1, count = 0;
    for (int i = 0; i < m - 1; i++) h = (h * d) % q;
    for (int i = 0; i < m; i++) {
        p = (d * p + pat[i]) % q;
        t = (d * t + txt[i]) % q;
    }
    for (int i = 0; i <= n - m; i++) {
        if (p == t) {
            bool match = true;
            for (int j = 0; j < m; j++) {
                if (txt[i+j] != pat[j]) { match = false; break; }
            }
            if (match) count++;
        }
        if (i < n - m) {
            t = (d * (t - txt[i] * h) + txt[i+m]) % q;
            if (t < 0) t = (t + q);
        }
    }
    return count;
}`
},
'z-algorithm': {
  id: 'z-algorithm',
  tagline: 'Compute identical prefix lengths to find substring matches.',
  idea: 'The Z-Algorithm constructs a Z-array where Z[i] stores the length of the longest substring starting at i that matches the string prefix. By concatenating pattern + "$" + text, it identifies pattern matches linearly without extra space.',
  steps: [
    'Create a new string formatted as pattern + "$" + text.',
    'Maintain an active matching window [L, R] initialized to [0, 0].',
    'Iterate i from 1 to the end of the string.',
    'If i is within the window, copy previously computed Z values to avoid redundant comparisons.',
    'Expand the window outwards if characters match the prefix, updating Z[i], L, and R.'
  ],
  complexity: [
    { label: 'Best', value: 'O(n + m)', note: '' },
    { label: 'Average', value: 'O(n + m)', note: '' },
    { label: 'Worst', value: 'O(n + m)', note: '' },
    { label: 'Space', value: 'O(n + m)', note: '' }
  ],
  useWhen: [
    'Exact pattern matching',
    'Finding periods or repetitive structures within strings',
    'Checking prefix-suffix palindromes'
  ],
  watchOut: [
    'Ensure the delimiter ($) does not appear in either the pattern or the text.',
    'Space complexity is O(N+M) because of the concatenated string and Z-array.'
  ],
  code: `vector<int> calculateZ(string s) {
    int n = s.length();
    vector<int> z(n, 0);
    for (int i = 1, l = 0, r = 0; i < n; i++) {
        if (i <= r) z[i] = min(r - i + 1, z[i - l]);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) {
            z[i]++;
        }
        if (i + z[i] - 1 > r) {
            l = i; r = i + z[i] - 1;
        }
    }
    return z;
}
vector<int> searchZAlgo(string pat, string txt) {
    string concat = pat + "$" + txt;
    vector<int> z = calculateZ(concat);
    vector<int> res;
    for (int i = 0; i < z.size(); i++) {
        if (z[i] == pat.length()) res.push_back(i - pat.length() - 1);
    }
    return res;
}`
},
'manacher': {
  id: 'manacher',
  tagline: 'Discover the longest palindromic substring in strictly linear time.',
  idea: 'Manacher\'s algorithm finds all palindromic sub-strings efficiently. By inserting dummy characters (like #) to handle even-length palindromes, it tracks mirrored centers to bypass redundant character comparisons.',
  steps: [
    'Transform the string by interleaving a special character (e.g., #) between every letter.',
    'Maintain an array P to store palindrome radii, alongside a center C and right-boundary R.',
    'Iterate over characters; if within R, mirror the P value from the opposite side of C.',
    'Attempt to expand the palindrome around the current character past R.',
    'Update C and R if the expanded palindrome extends beyond the current right-boundary.'
  ],
  complexity: [
    { label: 'Best', value: 'O(n)', note: '' },
    { label: 'Average', value: 'O(n)', note: '' },
    { label: 'Worst', value: 'O(n)', note: '' },
    { label: 'Space', value: 'O(n)', note: '' }
  ],
  useWhen: [
    'Finding longest palindromic substring',
    'Counting total number of palindromic substrings',
    'Bioinformatics motif searching'
  ],
  watchOut: [
    'The string transformation is necessary to uniformly treat odd and even length palindromes.',
    'Boundary characters (like ^ and $) help avoid out-of-bounds checks.'
  ],
  code: `string longestPalindrome(string s) {
    string t = "^";
    for (char c : s) t += "#" + string(1, c);
    t += "#$";
    int n = t.length();
    vector<int> p(n, 0);
    int C = 0, R = 0, maxLen = 0, centerIndex = 0;
    for (int i = 1; i < n - 1; i++) {
        int i_mirror = 2 * C - i;
        if (R > i) p[i] = min(R - i, p[i_mirror]);
        while (t[i + 1 + p[i]] == t[i - 1 - p[i]]) p[i]++;
        if (i + p[i] > R) {
            C = i; R = i + p[i];
        }
        if (p[i] > maxLen) {
            maxLen = p[i];
            centerIndex = i;
        }
    }
    return s.substr((centerIndex - 1 - maxLen) / 2, maxLen);
}`
},
'segment-tree-algo': {
  id: 'segment-tree-algo',
  tagline: 'Divide and conquer ranges to answer dynamic queries at lightning speed.',
  idea: 'A Segment Tree partitions an array into a binary tree where nodes represent intervals. It supports both range queries (sum, min, max) and point updates in logarithmic time, solving the bottlenecks of massive array processing.',
  steps: [
    'Build the tree recursively from the bottom up, assigning individual array elements to leaf nodes.',
    'Compute parent nodes by merging child node intervals (e.g., sum of left and right children).',
    'To query, traverse the tree; if a node’s interval is fully within the query range, return its value.',
    'If partially within, split the query and traverse both children, merging their results.',
    'To update, traverse down to the leaf, modify it, and recalculate parent values on the way back up.'
  ],
  complexity: [
    { label: 'Best', value: 'O(log n)', note: '' },
    { label: 'Average', value: 'O(log n)', note: '' },
    { label: 'Worst', value: 'O(log n)', note: '' },
    { label: 'Space', value: 'O(n)', note: '' }
  ],
  useWhen: [
    'Range Minimum Queries (RMQ) with frequent point updates',
    'Finding sum, GCD, or bitwise operations over an interval',
    'Computational geometry sweep-lines'
  ],
  watchOut: [
    'Array representation requires size 4*N to safely avoid out-of-bounds.',
    'Not ideal if queries and updates are entirely static (Sparse Table is better).'
  ],
  code: `struct SegTree {
    int n; vector<int> tree;
    SegTree(int n) : n(n), tree(4 * n, 0) {}
    void build(vector<int>& a, int v, int tl, int tr) {
        if (tl == tr) tree[v] = a[tl];
        else {
            int tm = (tl + tr) / 2;
            build(a, v*2, tl, tm);
            build(a, v*2+1, tm+1, tr);
            tree[v] = tree[v*2] + tree[v*2+1];
        }
    }
    int query(int v, int tl, int tr, int l, int r) {
        if (l > r) return 0;
        if (l == tl && r == tr) return tree[v];
        int tm = (tl + tr) / 2;
        return query(v*2, tl, tm, l, min(r, tm)) + query(v*2+1, tm+1, tr, max(l, tm+1), r);
    }
    void update(int v, int tl, int tr, int pos, int new_val) {
        if (tl == tr) tree[v] = new_val;
        else {
            int tm = (tl + tr) / 2;
            if (pos <= tm) update(v*2, tl, tm, pos, new_val);
            else update(v*2+1, tm+1, tr, pos, new_val);
            tree[v] = tree[v*2] + tree[v*2+1];
        }
    }
};`
},
'lazy-propagation': {
  id: 'lazy-propagation',
  tagline: 'Procrastinate node updates until they are absolutely necessary.',
  idea: 'Lazy Propagation is an enhancement to Segment Trees for range updates (e.g., adding X to all elements in [L, R]). Instead of updating all leaves individually, it tags parent nodes and delays pushing changes downward until queried.',
  steps: [
    'Introduce a lazy array of the same size as the segment tree to store pending updates.',
    'When performing a range update, if a node lies fully within the range, update its tree value and mark it lazy.',
    'When visiting any node (for query or update), check if it has a pending lazy value.',
    'If so, apply the lazy value, pass it down to its children, and clear the current node\'s lazy tag.',
    'Proceed with standard Segment Tree splitting and merging logic.'
  ],
  complexity: [
    { label: 'Best', value: 'O(log n)', note: '' },
    { label: 'Average', value: 'O(log n)', note: '' },
    { label: 'Worst', value: 'O(log n)', note: '' },
    { label: 'Space', value: 'O(n)', note: '' }
  ],
  useWhen: [
    'Range addition or assignment queries (e.g., add 5 to array[10...50])',
    'Flipping bits over intervals',
    'Dynamic interval scheduling problems'
  ],
  watchOut: [
    'Forgetting to push down the lazy tags before returning node values causes silent data corruption.',
    'Merging logic varies heavily depending on whether it is an assignment or an addition update.'
  ],
  code: `struct LazySegTree {
    int n; vector<int> tree, lazy;
    LazySegTree(int n) : n(n), tree(4 * n, 0), lazy(4 * n, 0) {}
    void push(int v) {
        tree[v*2] += lazy[v];
        lazy[v*2] += lazy[v];
        tree[v*2+1] += lazy[v];
        lazy[v*2+1] += lazy[v];
        lazy[v] = 0;
    }
    void update(int v, int tl, int tr, int l, int r, int addend) {
        if (l > r) return;
        if (l == tl && tr == r) {
            tree[v] += addend; lazy[v] += addend;
        } else {
            push(v);
            int tm = (tl + tr) / 2;
            update(v*2, tl, tm, l, min(r, tm), addend);
            update(v*2+1, tm+1, tr, max(l, tm+1), r, addend);
            tree[v] = max(tree[v*2], tree[v*2+1]);
        }
    }
    int query(int v, int tl, int tr, int l, int r) {
        if (l > r) return -1e9;
        if (l == tl && tr == r) return tree[v];
        push(v);
        int tm = (tl + tr) / 2;
        return max(query(v*2, tl, tm, l, min(r, tm)), 
                   query(v*2+1, tm+1, tr, max(l, tm+1), r));
    }
};`
},
'fenwick-tree-algo': {
  id: 'fenwick-tree-algo',
  tagline: 'Compute prefix sums with bitwise elegance and minimal memory overhead.',
  idea: 'The Fenwick Tree, or Binary Indexed Tree (BIT), calculates prefix sums and supports point updates. By exploiting the binary representation of indices, it computes cascades of sums using less code and memory than a Segment Tree.',
  steps: [
    'Initialize a 1-indexed array of size N+1 with zeros.',
    'To update an index, add the value, then cascade upwards by adding the lowest set bit (idx += idx & -idx).',
    'To query a prefix sum up to an index, accumulate the value, then cascade downwards (idx -= idx & -idx).',
    'Range queries [L, R] are derived by subtracting prefix(L-1) from prefix(R).',
    'Constructing the tree initially can be done linearly by pushing values to immediate parents.'
  ],
  complexity: [
    { label: 'Best', value: 'O(log n)', note: '' },
    { label: 'Average', value: 'O(log n)', note: '' },
    { label: 'Worst', value: 'O(log n)', note: '' },
    { label: 'Space', value: 'O(n)', note: '' }
  ],
  useWhen: [
    'Frequent prefix sum queries combined with point updates',
    'Counting array inversions',
    '2D range queries requiring low constant factors'
  ],
  watchOut: [
    'The array must be 1-indexed; using 0 will result in an infinite loop due to bitwise logic.',
    'Standard BIT cannot easily support Range Maximum/Minimum Queries, unlike Segment Trees.'
  ],
  code: `struct FenwickTree {
    vector<int> bit; int n;
    FenwickTree(int n) {
        this->n = n;
        bit.assign(n + 1, 0);
    }
    void add(int idx, int delta) {
        for (; idx <= n; idx += idx & -idx)
            bit[idx] += delta;
    }
    int query(int idx) {
        int sum = 0;
        for (; idx > 0; idx -= idx & -idx)
            sum += bit[idx];
        return sum;
    }
    int queryRange(int l, int r) {
        return query(r) - query(l - 1);
    }
};`
},
'sparse-table-algo': {
  id: 'sparse-table-algo',
  tagline: 'Precompute logarithmic leaps to answer static range queries instantly.',
  idea: 'A Sparse Table precalculates answers for all interval lengths that are powers of two. For idempotent queries like min, max, or GCD, it overlaps two power-of-two intervals to fetch results in constant O(1) time.',
  steps: [
    'Create a 2D table where st[i][j] stores the result for interval starting at i of length 2^j.',
    'Initialize st[i][0] with the base array elements.',
    'Iteratively compute st[i][j] by combining st[i][j-1] and st[i + 2^(j-1)][j-1].',
    'Precompute a log2 lookup array for O(1) query bound calculation.',
    'For a query [L, R], find the largest power of two k that fits in the range, and overlap st[L][k] with st[R - 2^k + 1][k].'
  ],
  complexity: [
    { label: 'Best', value: 'O(1) query', note: '' },
    { label: 'Average', value: 'O(1) query', note: '' },
    { label: 'Worst', value: 'O(1) query', note: '' },
    { label: 'Space', value: 'O(n log n)', note: '' }
  ],
  useWhen: [
    'Range Minimum Query (RMQ) on static, immutable arrays',
    'Lowest Common Ancestor (LCA) queries in trees',
    'Fast queries in high-performance tight loops'
  ],
  watchOut: [
    'Does NOT support updates; the array must remain static after precomputation.',
    'Not suitable for non-idempotent operations like SUM, as overlapping intervals would double-count elements.'
  ],
  code: `struct SparseTable {
    vector<vector<int>> st; vector<int> log; int n;
    SparseTable(const vector<int>& a) {
        n = a.size();
        int maxLog = log2(n) + 1;
        st.assign(n, vector<int>(maxLog));
        log.assign(n + 1, 0);
        for(int i = 2; i <= n; i++) log[i] = log[i/2] + 1;
        for (int i = 0; i < n; i++) st[i][0] = a[i];
        for (int j = 1; j < maxLog; j++) {
            for (int i = 0; i + (1 << j) <= n; i++) {
                st[i][j] = min(st[i][j - 1], st[i + (1 << (j - 1))][j - 1]);
            }
        }
    }
    int queryMin(int L, int R) {
        int j = log[R - L + 1];
        return min(st[L][j], st[R - (1 << j) + 1][j]);
    }
};`
},
'binary-lifting': {
  id: 'binary-lifting',
  tagline: 'Leap rapidly up a tree to find common ancestors in logarithmic time.',
  idea: 'Binary Lifting accelerates tree traversals by precomputing pointers to the 1st, 2nd, 4th, 8th... ancestors for every node. It computes Lowest Common Ancestors (LCA) by jumping up the tree in powers of two instead of stepping node-by-node.',
  steps: [
    'Run DFS to establish the depth of each node and its immediate parent up[u][0].',
    'Precompute the DP table where up[u][j] = up[ up[u][j-1] ][j-1].',
    'To find the LCA of u and v, first equalize their depths by jumping the deeper node upwards.',
    'If they meet, return the node. Otherwise, jump both nodes up simultaneously using the largest possible jumps that do not overshoot the LCA.',
    'The immediate parent of their stopping point is the true LCA.'
  ],
  complexity: [
    { label: 'Best', value: 'O(log n)', note: '' },
    { label: 'Average', value: 'O(log n)', note: '' },
    { label: 'Worst', value: 'O(log n)', note: '' },
    { label: 'Space', value: 'O(n log n)', note: '' }
  ],
  useWhen: [
    'Finding the Lowest Common Ancestor (LCA)',
    'Computing distance between two nodes in a tree',
    'Path aggregate queries (e.g., max edge weight on a path)'
  ],
  watchOut: [
    'Requires an immutable tree structure; edge additions necessitate complete recomputation.',
    'Memory limits can be tight on large trees due to the n log n state array.'
  ],
  code: `const int MAX_LOG = 20;
vector<vector<int>> up; vector<int> depth;
void dfs(int v, int p, int d, vector<vector<int>>& adj) {
    depth[v] = d; up[v][0] = p;
    for (int i = 1; i < MAX_LOG; i++) {
        if (up[v][i - 1] != -1)
            up[v][i] = up[up[v][i - 1]][i - 1];
        else up[v][i] = -1;
    }
    for (int u : adj[v]) {
        if (u != p) dfs(u, v, d + 1, adj);
    }
}
int getLCA(int u, int v) {
    if (depth[u] < depth[v]) swap(u, v);
    for (int i = MAX_LOG - 1; i >= 0; i--) {
        if (up[u][i] != -1 && depth[up[u][i]] >= depth[v])
            u = up[u][i];
    }
    if (u == v) return u;
    for (int i = MAX_LOG - 1; i >= 0; i--) {
        if (up[u][i] != up[v][i]) {
            u = up[u][i]; v = up[v][i];
        }
    }
    return up[u][0];
}`
},
'euler-tour': {
  id: 'euler-tour',
  tagline: 'Flatten a complex tree into a 1D array to enable sub-array magic.',
  idea: 'The Euler Tour technique linearizes a tree by recording the exact entry and exit times of a DFS traversal. This maps every subtree into a contiguous 1D array segment, allowing standard range structures like Segment Trees to query and update subtrees effortlessly.',
  steps: [
    'Initialize a global timer to 0.',
    'Traverse the tree using DFS.',
    'When entering a node, record entry_time[u] = timer++.',
    'Visit all children.',
    'When exiting the node, record exit_time[u] = timer - 1.',
    'A subtree rooted at u now perfectly maps to the array indices [entry_time[u], exit_time[u]].'
  ],
  complexity: [
    { label: 'Best', value: 'O(V)', note: '' },
    { label: 'Average', value: 'O(V)', note: '' },
    { label: 'Worst', value: 'O(V)', note: '' },
    { label: 'Space', value: 'O(V)', note: '' }
  ],
  useWhen: [
    'Subtree sum or min/max queries',
    'Applying mass updates to all descendants of a node',
    'Checking if node U is an ancestor of node V in O(1)'
  ],
  watchOut: [
    'It doubles the required storage logic for node states compared to raw traversal.',
    'Cannot handle dynamic structural changes like rotating subtrees.'
  ],
  code: `int timer = 0;
vector<int> tin, tout;
void dfs_tour(int v, int p, vector<vector<int>>& adj) {
    tin[v] = timer++;
    for (int u : adj[v]) {
        if (u != p) dfs_tour(u, v, adj);
    }
    tout[v] = timer - 1;
}
bool isAncestor(int u, int v) {
    return tin[u] <= tin[v] && tout[u] >= tout[v];
}
void buildTour(int n, int root, vector<vector<int>>& adj) {
    tin.assign(n, 0); tout.assign(n, 0);
    timer = 0;
    dfs_tour(root, -1, adj);
}`
},
'mos-algorithm': {
  id: 'mos-algorithm',
  tagline: 'Sort queries intelligently in blocks to minimize pointer movement.',
  idea: 'Mo’s Algorithm processes offline queries by dividing the array into square-root blocks. By sorting the queries by block and then by right boundary, it minimizes the movement of the left and right sliding window pointers, slashing complexity.',
  steps: [
    'Read all queries in advance (offline) and store them with their original indices.',
    'Calculate block size B = sqrt(N).',
    'Sort queries: primarily by L / B (block of left boundary), and secondarily by R.',
    'Maintain a sliding window [currL, currR] with tracking variables.',
    'Expand or shrink the window step-by-step to match each sorted query, recording answers.'
  ],
  complexity: [
    { label: 'Best', value: 'O((n+q)√n)', note: '' },
    { label: 'Average', value: 'O((n+q)√n)', note: '' },
    { label: 'Worst', value: 'O((n+q)√n)', note: '' },
    { label: 'Space', value: 'O(q)', note: '' }
  ],
  useWhen: [
    'Finding count of distinct elements in ranges',
    'Frequent elements or mode queries over intervals',
    'When no updates are present (offline only)'
  ],
  watchOut: [
    'Requires all queries to be known beforehand; impossible for real-time dynamic queries.',
    'Performance relies heavily on fast O(1) state addition/removal logic.'
  ],
  code: `struct Query { int L, R, id; };
int block;
bool compare(Query x, Query y) {
    if (x.L / block != y.L / block) return x.L / block < y.L / block;
    return (x.L / block & 1) ? (x.R < y.R) : (x.R > y.R);
}
vector<int> mosAlgorithm(vector<int>& arr, vector<Query>& queries) {
    int n = arr.size(), q = queries.size();
    block = sqrt(n);
    sort(queries.begin(), queries.end(), compare);
    vector<int> ans(q);
    int currL = 0, currR = -1, currAns = 0;
    for (int i = 0; i < q; i++) {
        int L = queries[i].L, R = queries[i].R;
        while (currL > L) { currL--; /* add(arr[currL]) */ }
        while (currR < R) { currR++; /* add(arr[currR]) */ }
        while (currL < L) { /* remove(arr[currL]) */; currL++; }
        while (currR > R) { /* remove(arr[currR]) */; currR--; }
        ans[queries[i].id] = currAns;
    }
    return ans;
}`
},
'sweep-line': {
  id: 'sweep-line',
  tagline: 'Drag a virtual line across the plane to handle spatial events efficiently.',
  idea: 'Sweep-Line algorithm translates 2D geometric problems into 1D data structures by dragging a virtual line across the plane (usually left to right). Events trigger as the line hits start or end points, simplifying intersection detection.',
  steps: [
    'Convert geometry (like rectangles or segments) into localized events (e.g., left edge, right edge).',
    'Sort all events by their X coordinate.',
    'Initialize an active state structure (like a Balanced BST or Segment Tree).',
    'Iterate through the sorted events.',
    'Process the event: add to active state if it’s a start, remove if it’s an end, and calculate intersections.'
  ],
  complexity: [
    { label: 'Best', value: 'O(n log n)', note: '' },
    { label: 'Average', value: 'O(n log n)', note: '' },
    { label: 'Worst', value: 'O(n log n)', note: '' },
    { label: 'Space', value: 'O(n)', note: '' }
  ],
  useWhen: [
    'Finding intersecting line segments',
    'Calculating total area of overlapping rectangles',
    'Finding closest pair of points'
  ],
  watchOut: [
    'Handling overlapping coordinates strictly requires careful tie-breaking in the sorting logic.',
    'Floating-point precision errors can corrupt BST orderings in geometric intersections.'
  ],
  code: `struct Event {
    int x, y1, y2, type; 
    bool operator<(const Event& e) const { return x < e.x; }
};
int sweepLineArea(vector<vector<int>>& rectangles) {
    vector<Event> events;
    for (auto& r : rectangles) {
        events.push_back({r[0], r[1], r[3], 1});
        events.push_back({r[2], r[1], r[3], -1});
    }
    sort(events.begin(), events.end());
    int active_height = 0, last_x = 0;
    long long area = 0;
    
    for (auto& ev : events) {
        area += 1LL * active_height * (ev.x - last_x);
        
        last_x = ev.x;
    }
    return area % 1000000007;
}`
},
'coordinate-compression': {
  id: 'coordinate-compression',
  tagline: 'Squeeze sparse massive numbers into dense arrays without losing their order.',
  idea: 'Coordinate Compression maps widely dispersed values (e.g., up to 10^9) into a dense, 0-indexed contiguous range. It bridges the gap between massive coordinates and standard arrays, allowing Fenwick or Segment Trees to operate within memory limits.',
  steps: [
    'Extract all unique values from the input into a secondary array.',
    'Sort the secondary array in ascending order.',
    'Remove duplicates using the unique algorithm.',
    'Iterate through the original data.',
    'Replace each original value with its compressed index found via binary search (lower_bound) on the secondary array.'
  ],
  complexity: [
    { label: 'Best', value: 'O(n log n)', note: '' },
    { label: 'Average', value: 'O(n log n)', note: '' },
    { label: 'Worst', value: 'O(n log n)', note: '' },
    { label: 'Space', value: 'O(n)', note: '' }
  ],
  useWhen: [
    'Preparing large coordinates for Segment Trees or BITs',
    'Grid reductions where relative order is important but absolute scale is not',
    'Computational geometry and sweep-line event mappings'
  ],
  watchOut: [
    'If differences between values matter (e.g., calculating areas), you must retain access to the inverse mapping array.',
    'Forgetting to remove duplicates leads to incorrect lower_bound index mapping.'
  ],
  code: `void compressCoords(vector<int>& arr) {
    vector<int> coords = arr;
    sort(coords.begin(), coords.end());
    coords.erase(unique(coords.begin(), coords.end()), coords.end());
    
    for (int i = 0; i < arr.size(); i++) {
        arr[i] = lower_bound(coords.begin(), coords.end(), arr[i]) - coords.begin();
    }
}
int getOriginalValue(int compressedIndex, const vector<int>& coords) {
    return coords[compressedIndex];
}`
}

};

export const getAlgorithmDoc = (id: string): AlgorithmDoc | undefined => ALGORITHM_DOCS[id];
export const hasAlgorithmDoc = (id: string): boolean => id in ALGORITHM_DOCS;
