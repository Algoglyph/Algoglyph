export const ALGORITHM_SNIPPETS: Record<string, string> = {
  // ── Searching ────────────────────────────────────────────
  'linear-search': `int linearSearch(vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
  'binary-search': `int binarySearch(vector<int>& arr, int target) {
    int l = 0, r = arr.size() - 1;
    while (l <= r) {
        int mid = l + (r - l) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
}`,
  'ternary-search': `int ternarySearch(vector<int>& arr, int target) {
    int l = 0, r = arr.size() - 1;
    while (r >= l) {
        int mid1 = l + (r - l) / 3, mid2 = r - (r - l) / 3;
        if (arr[mid1] == target) return mid1;
        if (arr[mid2] == target) return mid2;
        if (target < arr[mid1]) r = mid1 - 1;
        else if (target > arr[mid2]) l = mid2 + 1;
        else { l = mid1 + 1; r = mid2 - 1; }
    }
    return -1;
}`,
  'lower-bound': `int lowerBound(vector<int>& arr, int target) {
    int l = 0, r = arr.size();
    while (l < r) {
        int mid = l + (r - l) / 2;
        if (arr[mid] >= target) r = mid;
        else l = mid + 1;
    }
    return l;
}`,
  'upper-bound': `int upperBound(vector<int>& arr, int target) {
    int l = 0, r = arr.size();
    while (l < r) {
        int mid = l + (r - l) / 2;
        if (arr[mid] > target) r = mid;
        else l = mid + 1;
    }
    return l;
}`,

  // ── Sorting ──────────────────────────────────────────────
  'bubble-sort': `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) swap(arr[j], arr[j + 1]);
        }
    }
}`,
  'selection-sort': `void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++)
            if (arr[j] < arr[minIdx]) minIdx = j;
        swap(arr[i], arr[minIdx]);
    }
}`,
  'insertion-sort': `void insertionSort(vector<int>& arr) {
    for (int i = 1; i < arr.size(); i++) {
        int key = arr[i], j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
  'merge-sort': `void merge(vector<int>& arr, int l, int m, int r) {
    vector<int> temp;
    int i = l, j = m + 1;
    while (i <= m && j <= r) temp.push_back(arr[i] <= arr[j] ? arr[i++] : arr[j++]);
    while (i <= m) temp.push_back(arr[i++]);
    while (j <= r) temp.push_back(arr[j++]);
    for (int k = 0; k < temp.size(); k++) arr[l + k] = temp[k];
}
void mergeSort(vector<int>& arr, int l, int r) {
    if (l >= r) return;
    int m = l + (r - l) / 2;
    mergeSort(arr, l, m);
    mergeSort(arr, m + 1, r);
    merge(arr, l, m, r);
}`,
  'quick-sort': `int partition(vector<int>& arr, int l, int r) {
    int pivot = arr[r], i = l - 1;
    for (int j = l; j < r; j++) {
        if (arr[j] < pivot) swap(arr[++i], arr[j]);
    }
    swap(arr[i + 1], arr[r]);
    return i + 1;
}
void quickSort(vector<int>& arr, int l, int r) {
    if (l < r) {
        int pi = partition(arr, l, r);
        quickSort(arr, l, pi - 1);
        quickSort(arr, pi + 1, r);
    }
}`,
  'heap-sort': `void heapify(vector<int>& arr, int n, int i) {
    int largest = i, l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}
void heapSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}`,
  'counting-sort': `void countingSort(vector<int>& arr) {
    if (arr.empty()) return;
    int maxVal = *max_element(arr.begin(), arr.end());
    vector<int> count(maxVal + 1, 0), output(arr.size());
    for (int x : arr) count[x]++;
    for (int i = 1; i <= maxVal; i++) count[i] += count[i - 1];
    for (int i = arr.size() - 1; i >= 0; i--) {
        output[count[arr[i]] - 1] = arr[i];
        count[arr[i]]--;
    }
    arr = output;
}`,
  'radix-sort': `void countingSortForRadix(vector<int>& arr, int exp) {
    vector<int> output(arr.size()), count(10, 0);
    for (int x : arr) count[(x / exp) % 10]++;
    for (int i = 1; i < 10; i++) count[i] += count[i - 1];
    for (int i = arr.size() - 1; i >= 0; i--) {
        output[count[(arr[i] / exp) % 10] - 1] = arr[i];
        count[(arr[i] / exp) % 10]--;
    }
    arr = output;
}
void radixSort(vector<int>& arr) {
    if (arr.empty()) return;
    int maxVal = *max_element(arr.begin(), arr.end());
    for (int exp = 1; maxVal / exp > 0; exp *= 10)
        countingSortForRadix(arr, exp);
}`,

  // ── Pointers & Sliding Window ───────────────────────────
  'two-pointers': `bool hasPairWithSum(vector<int>& arr, int target) {
    int l = 0, r = arr.size() - 1;
    while (l < r) {
        int sum = arr[l] + arr[r];
        if (sum == target) return true;
        if (sum < target) l++;
        else r--;
    }
    return false;
}`,
  'fast-slow-pointer': `bool hasCycle(ListNode *head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}`,
  'sliding-window': `int maxSumSubarray(vector<int>& arr, int k) {
    int max_sum = 0, window_sum = 0;
    for (int i = 0; i < arr.size(); i++) {
        window_sum += arr[i];
        if (i >= k - 1) {
            max_sum = max(max_sum, window_sum);
            window_sum -= arr[i - (k - 1)];
        }
    }
    return max_sum;
}`,

  // ── Recursion & Backtracking ────────────────────────────
  'recursion': `int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}`,
  'recursion-tree': `int fibonacci(int n) {
    if (n <= 1) return n;
    // Explores both paths forming a tree
    return fibonacci(n - 1) + fibonacci(n - 2);
}`,
  'backtracking': `void solve(int idx, vector<int>& curr, vector<vector<int>>& res) {
    if (idx == n) { res.push_back(curr); return; }
    for (int i = 0; i < options.size(); i++) {
        if (isValid(options[i])) {
            curr.push_back(options[i]);
            solve(idx + 1, curr, res);
            curr.pop_back(); // backtrack
        }
    }
}`,
  'subsets': `void generateSubsets(int idx, vector<int>& nums, vector<int>& subset, vector<vector<int>>& res) {
    res.push_back(subset);
    for (int i = idx; i < nums.size(); i++) {
        subset.push_back(nums[i]);
        generateSubsets(i + 1, nums, subset, res);
        subset.pop_back();
    }
}`,
  'permutations': `void permute(int idx, vector<int>& nums, vector<vector<int>>& res) {
    if (idx == nums.size()) { res.push_back(nums); return; }
    for (int i = idx; i < nums.size(); i++) {
        swap(nums[idx], nums[i]);
        permute(idx + 1, nums, res);
        swap(nums[idx], nums[i]);
    }
}`,
  'combination-sum': `void combSum(int idx, int target, vector<int>& cands, vector<int>& curr, vector<vector<int>>& res) {
    if (target == 0) { res.push_back(curr); return; }
    for (int i = idx; i < cands.size(); i++) {
        if (cands[i] > target) break;
        curr.push_back(cands[i]);
        combSum(i, target - cands[i], cands, curr, res);
        curr.pop_back();
    }
}`,
  'n-queens': `void solveNQueens(int col, vector<string>& board, vector<vector<string>>& res) {
    if (col == n) { res.push_back(board); return; }
    for (int row = 0; row < n; row++) {
        if (isSafe(row, col, board)) {
            board[row][col] = 'Q';
            solveNQueens(col + 1, board, res);
            board[row][col] = '.';
        }
    }
}`,

  // ── Tree Traversals ──────────────────────────────────────
  'dfs-tree': `void dfs(TreeNode* node) {
    if (!node) return;
    process(node);
    for (TreeNode* child : node->children) {
        dfs(child);
    }
}`,
  'bfs-tree': `void bfs(TreeNode* root) {
    if (!root) return;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* curr = q.front(); q.pop();
        process(curr);
        for (TreeNode* child : curr->children) q.push(child);
    }
}`,
  'preorder': `void preorder(TreeNode* root) {
    if (!root) return;
    cout << root->val << " ";
    preorder(root->left);
    preorder(root->right);
}`,
  'inorder': `void inorder(TreeNode* root) {
    if (!root) return;
    inorder(root->left);
    cout << root->val << " ";
    inorder(root->right);
}`,
  'postorder': `void postorder(TreeNode* root) {
    if (!root) return;
    postorder(root->left);
    postorder(root->right);
    cout << root->val << " ";
}`,
  'level-order': `void levelOrder(TreeNode* root) {
    if (!root) return;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int size = q.size();
        while (size--) {
            TreeNode* curr = q.front(); q.pop();
            cout << curr->val << " ";
            if (curr->left) q.push(curr->left);
            if (curr->right) q.push(curr->right);
        }
        cout << endl;
    }
}`,
  'morris-traversal': `void morrisInorder(TreeNode* root) {
    TreeNode* curr = root;
    while (curr) {
        if (!curr->left) {
            cout << curr->val << " ";
            curr = curr->right;
        } else {
            TreeNode* pre = curr->left;
            while (pre->right && pre->right != curr) pre = pre->right;
            if (!pre->right) {
                pre->right = curr;
                curr = curr->left;
            } else {
                pre->right = NULL;
                cout << curr->val << " ";
                curr = curr->right;
            }
        }
    }
}`,

  // ── Graph Algorithms ────────────────────────────────────
  'bfs-graph': `void bfs(int start, vector<vector<int>>& adj) {
    vector<bool> vis(adj.size(), false);
    queue<int> q;
    q.push(start); vis[start] = true;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (!vis[v]) {
                vis[v] = true;
                q.push(v);
            }
        }
    }
}`,
  'dfs-graph': `void dfs(int u, vector<vector<int>>& adj, vector<bool>& vis) {
    vis[u] = true;
    for (int v : adj[u]) {
        if (!vis[v]) dfs(v, adj, vis);
    }
}`,
  'topological-sort': `vector<int> topoSort(int V, vector<vector<int>>& adj) {
    vector<int> in_degree(V, 0), order;
    for (int u = 0; u < V; u++)
        for (int v : adj[u]) in_degree[v]++;
    queue<int> q;
    for (int i = 0; i < V; i++) if (in_degree[i] == 0) q.push(i);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : adj[u])
            if (--in_degree[v] == 0) q.push(v);
    }
    return order;
}`,
  'dijkstra': `vector<int> dijkstra(int start, int V, vector<vector<pair<int, int>>>& adj) {
    vector<int> dist(V, INT_MAX);
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
    dist[start] = 0;
    pq.push({0, start});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto& [v, weight] : adj[u]) {
            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`,
  'bellman-ford': `vector<int> bellmanFord(int start, int V, vector<vector<int>>& edges) {
    vector<int> dist(V, INT_MAX);
    dist[start] = 0;
    for (int i = 0; i < V - 1; i++) {
        for (auto& edge : edges) {
            int u = edge[0], v = edge[1], w = edge[2];
            if (dist[u] != INT_MAX && dist[u] + w < dist[v])
                dist[v] = dist[u] + w;
        }
    }
    // Checking for negative weight cycle
    for (auto& edge : edges) {
        if (dist[edge[0]] != INT_MAX && dist[edge[0]] + edge[2] < dist[edge[1]])
            return {}; // Negative cycle detected
    }
    return dist;
}`,
  'floyd-warshall': `void floydWarshall(vector<vector<int>>& dist, int V) {
    for (int k = 0; k < V; k++) {
        for (int i = 0; i < V; i++) {
            for (int j = 0; j < V; j++) {
                if (dist[i][k] != INT_MAX && dist[k][j] != INT_MAX)
                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
            }
        }
    }
}`,
  'kruskal': `int kruskalMST(int V, vector<vector<int>>& edges) {
    sort(edges.begin(), edges.end(), [](auto& a, auto& b) { return a[2] < b[2]; });
    DSU dsu(V);
    int mst_weight = 0;
    for (auto& edge : edges) {
        if (dsu.find(edge[0]) != dsu.find(edge[1])) {
            dsu.unite(edge[0], edge[1]);
            mst_weight += edge[2];
        }
    }
    return mst_weight;
}`,
  'prim': `int primMST(int V, vector<vector<pair<int, int>>>& adj) {
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
    vector<bool> inMST(V, false);
    int mst_weight = 0;
    pq.push({0, 0});
    while (!pq.empty()) {
        auto [weight, u] = pq.top(); pq.pop();
        if (inMST[u]) continue;
        inMST[u] = true;
        mst_weight += weight;
        for (auto& [v, w] : adj[u]) {
            if (!inMST[v]) pq.push({w, v});
        }
    }
    return mst_weight;
}`,
  'kosaraju': `void dfs1(int u, vector<vector<int>>& adj, vector<bool>& vis, stack<int>& st) {
    vis[u] = true;
    for (int v : adj[u]) if (!vis[v]) dfs1(v, adj, vis, st);
    st.push(u);
}
void dfs2(int u, vector<vector<int>>& rev_adj, vector<bool>& vis) {
    vis[u] = true;
    for (int v : rev_adj[u]) if (!vis[v]) dfs2(v, rev_adj, vis);
}
int kosaraju(int V, vector<vector<int>>& adj, vector<vector<int>>& rev_adj) {
    stack<int> st;
    vector<bool> vis(V, false);
    for (int i = 0; i < V; i++) if (!vis[i]) dfs1(i, adj, vis, st);
    fill(vis.begin(), vis.end(), false);
    int scc_count = 0;
    while (!st.empty()) {
        int u = st.top(); st.pop();
        if (!vis[u]) { dfs2(u, rev_adj, vis); scc_count++; }
    }
    return scc_count;
}`,
  'tarjan': `void tarjanDFS(int u, int& timer, vector<int>& disc, vector<int>& low, stack<int>& st, vector<bool>& in_st, vector<vector<int>>& adj) {
    disc[u] = low[u] = ++timer;
    st.push(u); in_st[u] = true;
    for (int v : adj[u]) {
        if (disc[v] == -1) {
            tarjanDFS(v, timer, disc, low, st, in_st, adj);
            low[u] = min(low[u], low[v]);
        } else if (in_st[v]) low[u] = min(low[u], disc[v]);
    }
    if (low[u] == disc[u]) {
        while (st.top() != u) { in_st[st.top()] = false; st.pop(); }
        in_st[st.top()] = false; st.pop();
    }
}`,
  'bridges': `void findBridges(int u, int p, int& timer, vector<int>& disc, vector<int>& low, vector<vector<int>>& adj, vector<pair<int,int>>& res) {
    disc[u] = low[u] = ++timer;
    for (int v : adj[u]) {
        if (v == p) continue;
        if (disc[v] != -1) low[u] = min(low[u], disc[v]);
        else {
            findBridges(v, u, timer, disc, low, adj, res);
            low[u] = min(low[u], low[v]);
            if (low[v] > disc[u]) res.push_back({u, v});
        }
    }
}`,
  'union-find': `class DSU {
    vector<int> parent, rank;
public:
    DSU(int n) {
        parent.resize(n); rank.assign(n, 0);
        iota(parent.begin(), parent.end(), 0);
    }
    int find(int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent[i]); // Path compression
    }
    void unite(int i, int j) {
        int root_i = find(i), root_j = find(j);
        if (root_i != root_j) {
            if (rank[root_i] < rank[root_j]) parent[root_i] = root_j;
            else if (rank[root_i] > rank[root_j]) parent[root_j] = root_i;
            else { parent[root_j] = root_i; rank[root_i]++; }
        }
    }
};`,

  // ── Dynamic Programming ──────────────────────────────────
  '1d-dp': `int climbStairs(int n) {
    if (n <= 2) return n;
    vector<int> dp(n + 1);
    dp[1] = 1; dp[2] = 2;
    for (int i = 3; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}`,
  '2d-dp': `int uniquePaths(int m, int n) {
    vector<vector<int>> dp(m, vector<int>(n, 1));
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
        }
    }
    return dp[m - 1][n - 1];
}`,
  'knapsack': `int knapSack(int W, vector<int>& wt, vector<int>& val, int n) {
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int w = 1; w <= W; w++) {
            if (wt[i - 1] <= w)
                dp[i][w] = max(val[i - 1] + dp[i - 1][w - wt[i - 1]], dp[i - 1][w]);
            else
                dp[i][w] = dp[i - 1][w];
        }
    }
    return dp[n][W];
}`,
  'lis': `int lengthOfLIS(vector<int>& nums) {
    vector<int> tails;
    for (int x : nums) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    return tails.size();
}`,
  'lcs': `int longestCommonSubsequence(string text1, string text2) {
    int m = text1.length(), n = text2.length();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1[i - 1] == text2[j - 1]) dp[i][j] = 1 + dp[i - 1][j - 1];
            else dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[m][n];
}`,
  'dp-on-trees': `void dfs(int u, int p, vector<vector<int>>& adj, vector<int>& dp) {
    dp[u] = 1; // Count itself
    for (int v : adj[u]) {
        if (v != p) {
            dfs(v, u, adj, dp);
            dp[u] += dp[v]; // Add child subtree size
        }
    }
}`,
  'digit-dp': `int digitDP(int idx, bool tight, int sum, string& s, vector<vector<vector<int>>>& memo) {
    if (idx == s.size()) return sum;
    if (memo[idx][tight][sum] != -1) return memo[idx][tight][sum];
    int limit = tight ? s[idx] - '0' : 9, res = 0;
    for (int d = 0; d <= limit; d++) {
        res += digitDP(idx + 1, tight && (d == limit), sum + d, s, memo);
    }
    return memo[idx][tight][sum] = res;
}`,
  'bitmask-dp': `int minCost(int mask, int person, vector<vector<int>>& cost, vector<vector<int>>& dp) {
    if (mask == ((1 << n) - 1)) return 0; // All jobs assigned
    if (dp[mask][person] != -1) return dp[mask][person];
    int res = INT_MAX;
    for (int j = 0; j < n; j++) {
        if (!(mask & (1 << j))) {
            res = min(res, cost[person][j] + minCost(mask | (1 << j), person + 1, cost, dp));
        }
    }
    return dp[mask][person] = res;
}`,

  // ── Greedy ───────────────────────────────────────────────
  'activity-selection': `int maxActivities(vector<pair<int, int>>& activities) {
    sort(activities.begin(), activities.end(), [](auto& a, auto& b) { return a.second < b.second; });
    int count = 1, last_end = activities[0].second;
    for (int i = 1; i < activities.size(); i++) {
        if (activities[i].first >= last_end) {
            count++;
            last_end = activities[i].second;
        }
    }
    return count;
}`,
  'interval-scheduling': `int minMeetingRooms(vector<vector<int>>& intervals) {
    vector<int> starts, ends;
    for (auto& i : intervals) { starts.push_back(i[0]); ends.push_back(i[1]); }
    sort(starts.begin(), starts.end()); sort(ends.begin(), ends.end());
    int rooms = 0, active = 0, i = 0, j = 0;
    while (i < starts.size()) {
        if (starts[i] < ends[j]) { active++; rooms = max(rooms, active); i++; }
        else { active--; j++; }
    }
    return rooms;
}`,
  'huffman-coding': `void buildHuffmanTree(string S, vector<int> freq) {
    priority_queue<Node*, vector<Node*>, Compare> pq;
    for (int i = 0; i < S.length(); i++) pq.push(new Node(S[i], freq[i]));
    while (pq.size() > 1) {
        Node *left = pq.top(); pq.pop();
        Node *right = pq.top(); pq.pop();
        Node *top = new Node('$', left->freq + right->freq);
        top->left = left; top->right = right;
        pq.push(top);
    }
}`,

  // ── String Algorithms ────────────────────────────────────
  'kmp': `vector<int> computeLPS(string pat) {
    int m = pat.length(), len = 0, i = 1;
    vector<int> lps(m, 0);
    while (i < m) {
        if (pat[i] == pat[len]) { lps[i++] = ++len; }
        else { if (len != 0) len = lps[len - 1]; else lps[i++] = 0; }
    }
    return lps;
}
void KMPSearch(string pat, string txt) {
    int m = pat.length(), n = txt.length(), i = 0, j = 0;
    vector<int> lps = computeLPS(pat);
    while (i < n) {
        if (pat[j] == txt[i]) { j++; i++; }
        if (j == m) { cout << "Found at " << i - j; j = lps[j - 1]; }
        else if (i < n && pat[j] != txt[i]) {
            if (j != 0) j = lps[j - 1]; else i++;
        }
    }
}`,
  'rabin-karp': `void RabinKarpSearch(string pat, string txt, int q) {
    int m = pat.length(), n = txt.length(), p = 0, t = 0, h = 1, d = 256;
    for (int i = 0; i < m - 1; i++) h = (h * d) % q;
    for (int i = 0; i < m; i++) { p = (d * p + pat[i]) % q; t = (d * t + txt[i]) % q; }
    for (int i = 0; i <= n - m; i++) {
        if (p == t) {
            bool match = true;
            for (int j = 0; j < m; j++) if (txt[i + j] != pat[j]) { match = false; break; }
            if (match) cout << "Pattern found at " << i << endl;
        }
        if (i < n - m) {
            t = (d * (t - txt[i] * h) + txt[i + m]) % q;
            if (t < 0) t += q;
        }
    }
}`,
  'z-algorithm': `vector<int> getZArray(string str) {
    int n = str.length(), l = 0, r = 0;
    vector<int> z(n, 0);
    for (int i = 1; i < n; i++) {
        if (i > r) { l = r = i; while (r < n && str[r - l] == str[r]) r++; z[i] = r - l; r--; }
        else {
            int k = i - l;
            if (z[k] < r - i + 1) z[i] = z[k];
            else { l = i; while (r < n && str[r - l] == str[r]) r++; z[i] = r - l; r--; }
        }
    }
    return z;
}`,
  'manacher': `string longestPalindrome(string s) {
    string T = "^#";
    for (char c : s) { T += c; T += "#"; }
    T += "$";
    int n = T.length(), C = 0, R = 0;
    vector<int> P(n, 0);
    for (int i = 1; i < n - 1; i++) {
        int i_mirror = 2 * C - i;
        if (R > i) P[i] = min(R - i, P[i_mirror]);
        while (T[i + 1 + P[i]] == T[i - 1 - P[i]]) P[i]++;
        if (i + P[i] > R) { C = i; R = i + P[i]; }
    }
    int maxLen = 0, centerIndex = 0;
    for (int i = 1; i < n - 1; i++) {
        if (P[i] > maxLen) { maxLen = P[i]; centerIndex = i; }
    }
    return s.substr((centerIndex - 1 - maxLen) / 2, maxLen);
}`,

  // ── Range Query & Trees ──────────────────────────────────
  'segment-tree-algo': `void build(int node, int start, int end, vector<int>& tree, vector<int>& arr) {
    if (start == end) { tree[node] = arr[start]; return; }
    int mid = (start + end) / 2;
    build(2 * node, start, mid, tree, arr);
    build(2 * node + 1, mid + 1, end, tree, arr);
    tree[node] = tree[2 * node] + tree[2 * node + 1];
}
int query(int node, int start, int end, int l, int r, vector<int>& tree) {
    if (r < start || end < l) return 0;
    if (l <= start && end <= r) return tree[node];
    int mid = (start + end) / 2;
    return query(2 * node, start, mid, l, r, tree) + query(2 * node + 1, mid + 1, end, l, r, tree);
}`,
  'lazy-propagation': `void updateRange(int node, int start, int end, int l, int r, int val, vector<int>& tree, vector<int>& lazy) {
    if (lazy[node] != 0) {
        tree[node] += (end - start + 1) * lazy[node];
        if (start != end) { lazy[2 * node] += lazy[node]; lazy[2 * node + 1] += lazy[node]; }
        lazy[node] = 0;
    }
    if (start > end || start > r || end < l) return;
    if (start >= l && end <= r) {
        tree[node] += (end - start + 1) * val;
        if (start != end) { lazy[2 * node] += val; lazy[2 * node + 1] += val; }
        return;
    }
    int mid = (start + end) / 2;
    updateRange(2 * node, start, mid, l, r, val, tree, lazy);
    updateRange(2 * node + 1, mid + 1, end, l, r, val, tree, lazy);
    tree[node] = tree[2 * node] + tree[2 * node + 1];
}`,
  'fenwick-tree-algo': `void update(int i, int delta, vector<int>& bit) {
    for (; i < bit.size(); i += i & -i) bit[i] += delta;
}
int query(int i, vector<int>& bit) {
    int sum = 0;
    for (; i > 0; i -= i & -i) sum += bit[i];
    return sum;
}`,
  'sparse-table-algo': `void buildSparseTable(vector<int>& arr) {
    int n = arr.size(), k = log2(n) + 1;
    vector<vector<int>> st(n, vector<int>(k));
    for (int i = 0; i < n; i++) st[i][0] = arr[i];
    for (int j = 1; j <= k; j++) {
        for (int i = 0; i + (1 << j) <= n; i++) {
            st[i][j] = min(st[i][j - 1], st[i + (1 << (j - 1))][j - 1]);
        }
    }
}
int querySparseTable(int L, int R, vector<vector<int>>& st) {
    int j = log2(R - L + 1);
    return min(st[L][j], st[R - (1 << j) + 1][j]);
}`,

  // ── Advanced CP ──────────────────────────────────────────
  'binary-lifting': `void dfsLifting(int u, int p, vector<vector<int>>& adj, vector<vector<int>>& up) {
    up[u][0] = p;
    for (int i = 1; i < 20; i++) {
        if (up[u][i - 1] != -1) up[u][i] = up[up[u][i - 1]][i - 1];
    }
    for (int v : adj[u]) if (v != p) dfsLifting(v, u, adj, up);
}
int getKthAncestor(int node, int k, vector<vector<int>>& up) {
    for (int i = 0; i < 20; i++) {
        if (k & (1 << i)) {
            node = up[node][i];
            if (node == -1) return -1;
        }
    }
    return node;
}`,
  'euler-tour': `void eulerTour(int u, int p, int& timer, vector<int>& in, vector<int>& out, vector<vector<int>>& adj) {
    in[u] = ++timer;
    for (int v : adj[u]) {
        if (v != p) eulerTour(v, u, timer, in, out, adj);
    }
    out[u] = timer;
}`,
  'mos-algorithm': `int block_size;
bool compareQueries(Query q1, Query q2) {
    if (q1.l / block_size != q2.l / block_size)
        return q1.l / block_size < q2.l / block_size;
    return q1.r < q2.r;
}
void mosAlgorithm(vector<int>& arr, vector<Query>& queries) {
    block_size = sqrt(arr.size());
    sort(queries.begin(), queries.end(), compareQueries);
    int curL = 0, curR = -1;
    for (Query q : queries) {
        while (curL > q.l) { curL--; add(arr[curL]); }
        while (curR < q.r) { curR++; add(arr[curR]); }
        while (curL < q.l) { remove(arr[curL]); curL++; }
        while (curR > q.r) { remove(arr[curR]); curR--; }
        ans[q.id] = current_answer;
    }
}`,
  'sweep-line': `int maxOverlappingPoints(vector<pair<int, int>>& intervals) {
    vector<pair<int, int>> events;
    for (auto& i : intervals) {
        events.push_back({i.first, 1});
        events.push_back({i.second, -1});
    }
    sort(events.begin(), events.end());
    int active = 0, max_active = 0;
    for (auto& e : events) {
        active += e.second;
        max_active = max(max_active, active);
    }
    return max_active;
}`,
  'coordinate-compression': `void compress(vector<int>& arr) {
    vector<int> sorted_arr = arr;
    sort(sorted_arr.begin(), sorted_arr.end());
    sorted_arr.erase(unique(sorted_arr.begin(), sorted_arr.end()), sorted_arr.end());
    for (int& x : arr) {
        x = lower_bound(sorted_arr.begin(), sorted_arr.end(), x) - sorted_arr.begin();
    }
}`
};
