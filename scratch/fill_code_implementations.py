# -*- coding: utf-8 -*-
import json
with open("scratch/system_design_batch9_data.py", "r", encoding="utf-8") as f:
    content = f.read()

# Let's replace the empty implementationCpp and implementationPython values with actual code snippets.

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

for slug, impl in IMPLS.items():
    target_idx = content.find(f'"slug": "{slug}",')
    if target_idx != -1:
        # Replace implementationCpp
        cpp_start = content.find('"implementationCpp": ""', target_idx)
        if cpp_start != -1:
            cpp_replacement = f'"implementationCpp": {json.dumps(impl["cpp"])}'
            content = content[:cpp_start] + cpp_replacement + content[cpp_start + len('"implementationCpp": ""'):]
            
        # Replace implementationPython
        py_start = content.find('"implementationPython": ""', target_idx)
        if py_start != -1:
            py_replacement = f'"implementationPython": {json.dumps(impl["python"])}'
            content = content[:py_start] + py_replacement + content[py_start + len('"implementationPython": ""'):]

with open("scratch/system_design_batch9_data.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Batch 9 code implementations filled successfully.")
