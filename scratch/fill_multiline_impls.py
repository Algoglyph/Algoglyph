# -*- coding: utf-8 -*-
with open("scratch/system_design_batch9_data.py", "r", encoding="utf-8") as f:
    content = f.read()

# Let's restore the original template by replacing the single-line string versions first.
# Wait, instead of complicated replaces, let's just write a python script that replaces the current single-line values in content with triple-quoted strings.
# Since we know the exact values from fill_code_implementations.py:

# We can replace '"implementationCpp": "#include <iostream>\\n...' with '"implementationCpp": """#include <iostream>\\n..."""'
# But a clean way is to just do a regex replace or split, or simply run a script that knows the exact replacements:

IMPLS = {
    "valet-key": {
        "cpp": """#include <iostream>
#include <string>
#include <openssl/hmac.h>
#include <openssl/evp.h>

std::string generate_signature(const std::string& key, const std::string& msg) {
    unsigned char hash[EVP_MAX_MD_SIZE];
    unsigned int len = 0;
    HMAC(EVP_sha256(), key.c_str(), key.length(), 
         (unsigned char*)msg.c_str(), msg.length(), hash, &len);
    return std::string((char*)hash, len);
}""",
        "python": """import hmac
import hashlib

def generate_signature(key: str, message: str) -> str:
    return hmac.new(
        key.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()"""
    },
    "static-content-hosting-data": {
        "cpp": """#include <iostream>
#include <string>

struct Asset {
    std::string filename;
    std::string get_cdn_url(const std::string& cdn_domain) {
        return "https://" + cdn_domain + "/assets/" + filename;
    }
};""",
        "python": """class StaticAsset:
    def __init__(self, filename: str):
        self.filename = filename
        
    def get_cdn_url(self, cdn_domain: str) -> str:
        return f"https://{cdn_domain}/assets/{self.filename}" """
    },
    "sharding-data": {
        "cpp": """#include <iostream>
#include <string>
#include <functional>

int get_shard_index(const std::string& key, int total_shards) {
    std::hash<std::string> hasher;
    return hasher(key) % total_shards;
}""",
        "python": """import hashlib

def get_shard_index(key: str, total_shards: int) -> int:
    hash_val = int(hashlib.md5(key.encode()).hexdigest(), 16)
    return hash_val % total_shards"""
    },
    "materialized-view": {
        "cpp": """#include <iostream>
#include <string>
#include <map>
#include <vector>

struct SalesRecord {
    std::string user_id;
    double amount;
};

std::map<std::string, double> precompute_sales(const std::vector<SalesRecord>& records) {
    std::map<std::string, double> view;
    for (const auto& r : records) {
        view[r.user_id] += r.amount;
    }
    return view;
}""",
        "python": """from collections import defaultdict
from typing import List, Dict

def precompute_sales(records: List[Dict]) -> Dict[str, float]:
    view = defaultdict(float)
    for r in records:
        view[r['user_id']] += r['amount']
    return dict(view)"""
    },
    "index-table": {
        "cpp": """#include <iostream>
#include <string>
#include <map>

class IndexTable {
    std::map<std::string, std::string> email_to_id;
public:
    void insert(const std::string& email, const std::string& id) {
        email_to_id[email] = id;
    }
    std::string lookup(const std::string& email) {
        return email_to_id[email];
    }
};""",
        "python": """class IndexTable:
    def __init__(self):
        self.email_to_id = {}
        
    def insert(self, email: str, user_id: str):
        self.email_to_id[email] = user_id
        
    def lookup(self, email: str) -> str:
        return self.email_to_id.get(email, "")"""
    },
    "event-sourcing": {
        "cpp": """#include <iostream>
#include <string>
#include <vector>

struct Event {
    std::string type;
    double amount;
};

double replay_events(const std::vector<Event>& events) {
    double balance = 0.0;
    for (const auto& e : events) {
        if (e.type == "Deposit") balance += e.amount;
        else if (e.type == "Withdraw") balance -= e.amount;
    }
    return balance;
}""",
        "python": """from typing import List, Dict

def replay_events(events: List[Dict]) -> float:
    balance = 0.0
    for e in events:
        if e['type'] == 'Deposit':
            balance += e['amount']
        elif e['type'] == 'Withdraw':
            balance -= e['amount']
    return balance"""
    },
    "cqrs-data": {
        "cpp": """#include <iostream>
#include <string>

struct WriteModel {
    std::string id;
    std::string name;
    std::string email;
};

struct ReadModel {
    std::string id;
    std::string display_name;
};""",
        "python": """class WriteModel:
    def __init__(self, user_id: str, name: str, email: str):
        self.id = user_id
        self.name = name
        self.email = email

class ReadModel:
    def __init__(self, user_id: str, display_name: str):
        self.id = user_id
        self.display_name = display_name"""
    },
    "cache-aside-data": {
        "cpp": """#include <iostream>
#include <string>

class CacheService {
public:
    std::string get(const std::string& key) { return ""; }
    void set(const std::string& key, const std::string& val, int ttl) {}
};""",
        "python": """class CacheService:
    def get(self, key: str) -> str:
        return ""
        
    def set(self, key: str, val: str, ttl: int):
        pass"""
    }
}

# Since we want to overwrite the values with triple quotes, let's write a python parser using regex to find and replace.
import re

for slug, impl in IMPLS.items():
    # We want to find the article block by slug, then replace "implementationCpp": "..." and "implementationPython": "..."
    # Let's search for "slug": "slug" and locate the bounds.
    idx = content.find(f'"slug": "{slug}",')
    if idx != -1:
        # Find next occurrences of implementationCpp and implementationPython
        cpp_match = re.search(r'"implementationCpp":\s*"[^"]*"', content[idx:])
        if cpp_match:
            cpp_span = cpp_match.span()
            start_cpp = idx + cpp_span[0]
            end_cpp = idx + cpp_span[1]
            cpp_replacement = f'"implementationCpp": """{impl["cpp"]}"""'
            content = content[:start_cpp] + cpp_replacement + content[end_cpp:]
            # Recalculate index offset because length changed
            idx += len(cpp_replacement) - (end_cpp - start_cpp)
            
        py_match = re.search(r'"implementationPython":\s*"[^"]*"', content[idx:])
        if py_match:
            py_span = py_match.span()
            start_py = idx + py_span[0]
            end_py = idx + py_span[1]
            py_replacement = f'"implementationPython": """{impl["python"]}"""'
            content = content[:start_py] + py_replacement + content[end_py:]

with open("scratch/system_design_batch9_data.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Multiline replacement completed.")
