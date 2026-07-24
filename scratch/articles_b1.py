# -*- coding: utf-8 -*-
import json

ARTICLES_B1 = {
    'container-lxc': r"""# Linux Containers (LXC): Namespaces, cgroups, chroot & Kernel-Level Virtualization

![LXC](/images/backend/container-lxc-dark.png)

## 1. System Overview & Kernel Virtualization Mechanics

Linux Containers (LXC) represent lightweight, operating-system-level virtualization. Unlike traditional Hardware Virtualization (VMware, KVM, Xen) which requires a **Hypervisor (Type 1 or Type 2)** executing guest operating system kernels inside isolated hardware abstractions, LXC shares the host kernel directly.

Hypervisors incur significant virtualization tax:
$$\text{Memory Tax}_{\text{VM}} = \text{RAM}_{\text{Guest Kernel}} + \text{RAM}_{\text{Guest OS Daemon Stack}} + \text{RAM}_{\text{App}}$$

LXC eliminates this guest kernel layer completely:
$$\text{Overhead}_{\text{LXC}} \approx \mathcal{O}(1) \quad (\text{Process context creation overhead only})$$

LXC relies on four core Linux kernel primitives:
1. **Namespaces**: Isolates system resources (PID, Mount, Net, IPC, UTS, User, Cgroup).
2. **Control Groups (cgroups)**: Limits, accounts, and isolates resource usage (CPU, Memory, Disk I/O, Network).
3. **chroot / pivot_root**: Restricts the filesystem root directory boundary.
4. **Capabilities (capabilities(7))**: Splits root privileges into fine-grained permission masks.

---

## 2. Kernel Isolation Primitives Architecture

```svg
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#10b981" font-size="14" font-family="sans-serif" font-weight="bold">LXC Kernel Isolation Primitives</text>

  <g transform="translate(40, 60)">
    <!-- Namespaces Box -->
    <rect x="0" y="0" width="160" height="130" rx="6" fill="#18181b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="80" y="25" fill="#60a5fa" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Linux Namespaces</text>
    <text x="15" y="50" fill="#a1a1aa" font-size="10" font-family="monospace">• PID (Process IDs)</text>
    <text x="15" y="70" fill="#a1a1aa" font-size="10" font-family="monospace">• NET (Interfaces/IP)</text>
    <text x="15" y="90" fill="#a1a1aa" font-size="10" font-family="monospace">• MNT (Mount points)</text>
    <text x="15" y="110" fill="#a1a1aa" font-size="10" font-family="monospace">• IPC / UTS / USER</text>

    <!-- cgroups Box -->
    <rect x="180" y="0" width="160" height="130" rx="6" fill="#18181b" stroke="#10b981" stroke-width="1.5"/>
    <text x="260" y="25" fill="#34d399" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">cgroups (v1 / v2)</text>
    <text x="195" y="50" fill="#a1a1aa" font-size="10" font-family="monospace">• CPU Quotas (CFS)</text>
    <text x="195" y="70" fill="#a1a1aa" font-size="10" font-family="monospace">• Memory Limits / OOM</text>
    <text x="195" y="90" fill="#a1a1aa" font-size="10" font-family="monospace">• blkio (Disk Rate)</text>
    <text x="195" y="110" fill="#a1a1aa" font-size="10" font-family="monospace">• pids.max (Fork Bomb)</text>

    <!-- App Process Box -->
    <rect x="360" y="0" width="160" height="130" rx="6" fill="#18181b" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="440" y="25" fill="#fbbf24" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Container Process</text>
    <text x="375" y="50" fill="#a1a1aa" font-size="10" font-family="monospace">• Isolated PID 1</text>
    <text x="375" y="70" fill="#a1a1aa" font-size="10" font-family="monospace">• Virtual veth0</text>
    <text x="375" y="90" fill="#a1a1aa" font-size="10" font-family="monospace">• Restricted Root FS</text>
    <text x="375" y="110" fill="#a1a1aa" font-size="10" font-family="monospace">• Seccomp Syscall Filter</text>
  </g>
</svg>
```

---

## 3. Mathematical Foundations: Resource Allocation & CFS Quotas

cgroups v2 manages CPU allocation using the Completely Fair Scheduler (CFS) bandwidth control:

$$\text{CPU Allocation Ratio} = \frac{\text{cpu.cfs\_quota\_us}}{\text{cpu.cfs\_period\_us}}$$

If `cpu.cfs_quota_us = 200000` and `cpu.cfs_period_us = 100000`, the container is granted exactly:
$$\frac{200000}{100000} = 2.0 \quad \text{CPU Cores}$$

Memory limits enforce hard boundaries via cgroups memory subsystem:
$$\text{Memory Limit Violation} \implies \text{Kernel OOM Killer} \rightarrow \text{SIGKILL (Signal 9)}$$

---

## 4. Production C/C++ Container Isolation Code

Below is a production C implementation demonstrating process clone namespace creation using `clone(2)` and `unshare(2)`:

```cpp
#define _GNU_SOURCE
#include <sched.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/wait.h>
#include <sys/mount.h>
#include <unistd.h>

#define STACK_SIZE (1024 * 1024)

static char child_stack[STACK_SIZE];

static int container_main(void *arg) {
    printf("[Container] Inside isolated PID namespace: PID = %d\n", getpid());

    // Mount proc filesystem inside container PID namespace
    if (mount("proc", "/proc", "proc", 0, NULL) != 0) {
        perror("mount /proc failed");
    }

    // Execute shell inside container
    char *args[] = {"/bin/sh", NULL};
    execv(args[0], args);
    return 0;
}

int main() {
    printf("[Host] Spawning LXC process...\n");

    // Spawn child with PID, Mount, UTS, IPC, and Network isolation
    int flags = CLONE_NEWPID | CLONE_NEWNS | CLONE_NEWUTS | CLONE_NEWIPC | CLONE_NEWNET | SIGCHLD;
    pid_t pid = clone(container_main, child_stack + STACK_SIZE, flags, NULL);

    if (pid == -1) {
        perror("clone failed");
        exit(EXIT_FAILURE);
    }

    waitpid(pid, NULL, 0);
    printf("[Host] Container terminated.\n");
    return 0;
}
```

---

## 5. Production Tradeoffs & Failure Modes

| Dimension | LXC Containers | Hardware Virtual Machines (KVM) |
| :--- | :--- | :--- |
| **Boot Latency** | $< 100\text{ ms}$ | $10\text{s} - 30\text{s}$ |
| **Memory Footprint** | Extremely low (shared kernel buffers) | High (dedicated OS kernel allocations) |
| **Security Boundary** | Kernel Syscall Surface Attack Vector | Hardware-enforced MMU Isolation |
| **I/O Throughput** | Near Native ($\sim 99\%$) | Virtualized VirtIO Overhead ($\sim 90-95\%$) |

---

## 6. Conceptual Check Questions & FAQs

1. **How does LXC isolation differ from Docker containers?**
   *Answer:* LXC is designed as an OS-container manager (running systemd, init scripts, multi-process full Linux distros inside containers), whereas Docker focuses on single-application micro-services.
2. **What happens when a container exceeds its cgroup memory quota?**
   *Answer:* The kernel memory controller triggers the Out-Of-Memory (OOM) killer, issuing a `SIGKILL` to the process with the highest OOM score inside that cgroup hierarchy.
3. **Why is `pivot_root` preferred over `chroot` in container setups?**
   *Answer:* `chroot` only changes the root path resolution for the current process and can be escaped if file descriptors to outside paths exist. `pivot_root` unmounts the host root filesystem entirely from the container mount namespace.

---

## 7. Recommended Practice Checklist

* [ ] Practice creating unprivileged containers using `lxc-create -n my-container -t download`.
* [ ] Configure cgroups v2 resource limits under `/sys/fs/cgroup/`.
* [ ] Test process isolation by running `ps aux` inside a PID namespace container.
""",

    'orch-kubernetes': r"""# Kubernetes Architecture: Control Plane, Etcd Consensus, Kubelet & Pod Scheduling Mechanics

![Kubernetes](/images/backend/orch-kubernetes-dark.png)

## 1. Architectural Overview & System Motivation

Kubernetes (K8s) is a production-grade, open-source container orchestration engine designed to automate deployment, scaling, load balancing, and self-healing of containerized applications across cluster nodes.

A Kubernetes cluster consists of two distinct operational tiers:
1. **Control Plane (Master Nodes)**: Manages cluster state, maintains etcd consensus, processes API requests, and executes scheduling algorithms.
2. **Worker Nodes**: Executes container workloads organized into **Pods** via Kubelet and container runtime interfaces (CRI).

---

## 2. Kubernetes Control Plane & Worker Node Topology

```svg
<svg viewBox="0 0 600 250" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="250" rx="8" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#3b82f6" font-size="14" font-family="sans-serif" font-weight="bold">Kubernetes Cluster Architecture</text>

  <!-- Control Plane -->
  <g transform="translate(30, 60)">
    <rect width="250" height="160" rx="6" fill="#18181b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="125" y="25" fill="#60a5fa" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Control Plane Node</text>
    
    <rect x="15" y="40" width="105" height="40" rx="4" fill="#09090b" stroke="#27272a"/>
    <text x="67" y="64" fill="#e4e4e7" font-size="10" text-anchor="middle" font-family="monospace">kube-apiserver</text>

    <rect x="130" y="40" width="105" height="40" rx="4" fill="#09090b" stroke="#27272a"/>
    <text x="182" y="64" fill="#e4e4e7" font-size="10" text-anchor="middle" font-family="monospace">etcd Cluster</text>

    <rect x="15" y="95" width="105" height="40" rx="4" fill="#09090b" stroke="#27272a"/>
    <text x="67" y="119" fill="#e4e4e7" font-size="10" text-anchor="middle" font-family="monospace">kube-scheduler</text>

    <rect x="130" y="95" width="105" height="40" rx="4" fill="#09090b" stroke="#27272a"/>
    <text x="182" y="119" fill="#e4e4e7" font-size="10" text-anchor="middle" font-family="monospace">controller-mgr</text>
  </g>

  <!-- Worker Node -->
  <g transform="translate(320, 60)">
    <rect width="250" height="160" rx="6" fill="#18181b" stroke="#10b981" stroke-width="1.5"/>
    <text x="125" y="25" fill="#34d399" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Worker Node</text>

    <rect x="15" y="40" width="105" height="40" rx="4" fill="#09090b" stroke="#27272a"/>
    <text x="67" y="64" fill="#e4e4e7" font-size="10" text-anchor="middle" font-family="monospace">kubelet</text>

    <rect x="130" y="40" width="105" height="40" rx="4" fill="#09090b" stroke="#27272a"/>
    <text x="182" y="64" fill="#e4e4e7" font-size="10" text-anchor="middle" font-family="monospace">kube-proxy</text>

    <rect x="15" y="95" width="220" height="40" rx="4" fill="#09090b" stroke="#10b981"/>
    <text x="125" y="119" fill="#34d399" font-size="10" text-anchor="middle" font-family="monospace">Pod (App Containers)</text>
  </g>
</svg>
```

---

## 3. Pod Scheduling & Filtering Equations

The `kube-scheduler` assigns unscheduled Pods to optimal Worker Nodes in two phases:
1. **Filtering (Predicates)**: Removes unsuitable nodes (e.g. insufficient CPU/Memory, Taints).
2. **Scoring (Priorities)**: Evaluates remaining nodes using weighted scoring functions.

Node Score Equation:
$$\text{Score}(N, P) = \sum_{i=1}^{k} w_i \cdot S_i(N, P)$$

Where $w_i$ is the weight of priority function $S_i$, evaluating node $N$ for Pod $P$. The node with the highest cumulative score is selected:
$$N^* = \arg\max_{N \in \text{FilteredNodes}} \text{Score}(N, P)$$

---

## 4. Production Go Kubernetes Client Code

Below is a production Go program utilizing `client-go` to watch Pod lifecycle events dynamically:

```go
package main

import (
	"context"
	"fmt"
	"time"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

func main() {
	// Initialize in-cluster Kubernetes client configuration
	config, err := rest.InClusterConfig()
	if err != nil {
		panic(err.Error())
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}

	for {
		pods, err := clientset.CoreV1().Pods("default").List(context.TODO(), metav1.ListOptions{})
		if err != nil {
			fmt.Printf("Error fetching pods: %v\n", err)
		} else {
			fmt.Printf("Active pods in 'default' namespace: %d\n", len(pods.Items))
			for _, pod := range pods.Items {
				fmt.Printf(" - Pod: %s | Phase: %s | Node: %s\n", pod.Name, pod.Status.Phase, pod.Spec.NodeName)
			}
		}
		time.Sleep(10 * time.Second)
	}
}
```

---

## 5. Production Tradeoffs & Failure Modes

| Failure Mode | Root Cause | System Behavior & Remediation |
| :--- | :--- | :--- |
| **etcd Split-Brain** | Loss of network quorum ($N/2 + 1$) | API Server enters Read-Only mode; no state writes allowed until quorum restores. |
| **CrashLoopBackOff** | Application process exit inside container | Kubelet applies exponential backoff restart delay ($10\text{s}, 20\text{s}, \dots, 300\text{s}$). |
| **OOMKilled** | Pod exceeds container memory `limits` | Kernel OOM killer terminates container process; status code `137`. |

---

## 6. Conceptual Check Questions & FAQs

1. **What is the difference between Pod resource `requests` and `limits`?**
   *Answer:* `requests` define the minimum resources guaranteed for scheduling calculations, while `limits` define the maximum quota enforced by cgroups.
2. **Why does etcd require an odd number of cluster nodes (3, 5, 7)?**
   *Answer:* Quorum requires $\lfloor N/2 \rfloor + 1$ nodes. An odd number maximizes fault tolerance without increasing node count (e.g. 3 nodes tolerate 1 failure; 4 nodes also tolerate only 1 failure).

---

## 7. Recommended Practice Checklist

* [ ] Deploy a multi-node Kubernetes cluster using Kind or Minikube.
* [ ] Write a Deployment manifest configuring Liveness and Readiness probes.
* [ ] Debug a broken pod using `kubectl logs`, `kubectl describe`, and `kubectl exec`.
""",

    'broker-kafka': r"""# Apache Kafka Architecture: Commit Logs, Partitioning, Consumer Groups & Zero-Copy I/O

![Kafka](/images/backend/broker-kafka-dark.png)

## 1. Architectural Overview & System Motivation

Apache Kafka is a distributed event-streaming platform designed to process high-throughput, low-latency log streams. Unlike traditional message brokers (RabbitMQ, ActiveMQ) that delete messages upon consumer acknowledgment, Kafka treats topics as **Immutable Distributed Append-Only Commit Logs**.

Kafka key performance pillars:
1. **Sequential Disk I/O**: Appending events to contiguous log files.
2. **Zero-Copy Data Transfer**: Bypassing user-space buffer copies via `sendfile(2)`.
3. **Partition-Level Parallelism**: Scaling topics across consumer groups.

---

## 2. Distributed Commit Log & Consumer Group Architecture

```svg
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#f59e0b" font-size="14" font-family="sans-serif" font-weight="bold">Kafka Topic Partition Commit Log</text>

  <g transform="translate(40, 60)">
    <!-- Partition Log Box -->
    <rect width="520" height="70" rx="6" fill="#18181b" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="15" y="25" fill="#fbbf24" font-size="11" font-family="monospace">Topic: orders | Partition 0</text>

    <!-- Offsets -->
    <g transform="translate(15, 35)">
      <rect x="0" y="0" width="55" height="25" rx="3" fill="#09090b" stroke="#27272a"/><text x="27" y="17" fill="#a1a1aa" font-size="10" text-anchor="middle" font-family="monospace">Off 0</text>
      <rect x="60" y="0" width="55" height="25" rx="3" fill="#09090b" stroke="#27272a"/><text x="87" y="17" fill="#a1a1aa" font-size="10" text-anchor="middle" font-family="monospace">Off 1</text>
      <rect x="120" y="0" width="55" height="25" rx="3" fill="#09090b" stroke="#27272a"/><text x="147" y="17" fill="#a1a1aa" font-size="10" text-anchor="middle" font-family="monospace">Off 2</text>
      <rect x="180" y="0" width="55" height="25" rx="3" fill="#18181b" stroke="#10b981"/><text x="207" y="17" fill="#34d399" font-size="10" text-anchor="middle" font-family="monospace">Off 3</text>
      <rect x="240" y="0" width="55" height="25" rx="3" fill="#18181b" stroke="#3b82f6"/><text x="267" y="17" fill="#60a5fa" font-size="10" text-anchor="middle" font-family="monospace">Off 4</text>
    </g>

    <!-- Consumer Offset Pointers -->
    <text x="210" y="100" fill="#10b981" font-size="10" font-family="monospace">▲ Consumer Group A (Offset 3)</text>
    <text x="330" y="120" fill="#3b82f6" font-size="10" font-family="monospace">▲ Consumer Group B (Offset 4)</text>
  </g>
</svg>
```

---

## 3. Zero-Copy I/O Mathematics & Throughput Scaling

Traditional File Transfer Transfer Path (4 Context Switches, 3 Buffer Copies):
$$\text{Disk} \xrightarrow{\text{DMA}} \text{OS Page Cache} \xrightarrow{\text{CPU Copy}} \text{User App Buffer} \xrightarrow{\text{CPU Copy}} \text{Socket Buffer} \xrightarrow{\text{DMA}} \text{NIC}$$

Kafka Zero-Copy Path via `sendfile(2)` (2 Context Switches, 0 CPU Copy):
$$\text{Disk} \xrightarrow{\text{DMA}} \text{OS Page Cache} \xrightarrow{\text{DMA Descriptor Copy}} \text{NIC}$$

Throughput Improvement Ratio:
$$\text{Speedup factor} \approx \frac{\text{Memory Bus Bandwidth}}{\text{PCIe Direct DMA Bandwidth}} \implies 3\text{x} - 5\text{x Throughput Increase}$$

---

## 4. Production Python Kafka Producer Code

Below is a production Python snippet demonstrating asynchronous batching with idempotent delivery guarantees (`confluent-kafka`):

```python
from confluent_kafka import Producer
import json
import sys

def delivery_report(err, msg):
    if err is not None:
        print(f"Message delivery failed: {err}")
    else:
        print(f"Message delivered to {msg.topic()} [{msg.partition()}] at offset {msg.offset()}")

conf = {
    'bootstrap.servers': 'localhost:9092',
    'client.id': 'order-service-producer',
    'enable.idempotence': True,  # Ensures exactly-once producer delivery
    'acks': 'all',                # Wait for full ISR acknowledgment
    'retries': 5
}

producer = Producer(conf)

event_data = {'order_id': 'ORD-98421', 'user_id': 4021, 'amount': 149.50}
producer.produce(
    topic='order-events',
    key=str(event_data['user_id']), # Key hash determines partition targeting
    value=json.dumps(event_data),
    callback=delivery_report
)

producer.flush()
```

---

## 5. Production Tradeoffs & Failure Modes

| Parameter | High Throughput Tuning | High Consistency Tuning |
| :--- | :--- | :--- |
| **`acks`** | `1` (Leader only) | `all` (Full In-Sync Replicas) |
| **`compression.type`** | `lz4` or `zstd` | `none` |
| **`batch.size`** | `65536` ($64\text{ KB}$) | `16384` ($16\text{ KB}$) |
| **`min.insync.replicas`** | `1` | `2` (on 3-replica cluster) |

---

## 6. Conceptual Check Questions & FAQs

1. **How does Kafka maintain message ordering?**
   *Answer:* Ordering is strictly guaranteed **only within a single partition**. Messages with the same partition key are written sequentially to the same partition log.
2. **What is an In-Sync Replica (ISR)?**
   *Answer:* The set of partition replicas that are actively caught up with the leader broker offset within `replica.lag.time.max.ms`.

---

## 7. Recommended Practice Checklist

* [ ] Set up a 3-node Kafka cluster using Docker Compose.
* [ ] Create a topic with 4 partitions and test consumer group rebalancing.
* [ ] Inspect raw segment files on disk (`.log` and `.index`).
""",

    'broker-rabbitmq': r"""# RabbitMQ Architecture: AMQP 0-9-1 Protocol, Exchanges, Queues & Consumer Prefetch

![RabbitMQ](/images/backend/broker-rabbitmq-dark.png)

## 1. Architectural Overview & System Motivation

RabbitMQ is an enterprise-grade message broker built on Erlang and the **AMQP 0-9-1** protocol. Unlike log-centric stream systems (Kafka), RabbitMQ is designed for complex message routing, pub/sub topologies, task queues, and RPC workloads.

RabbitMQ decouples publishers from queues using **Exchanges**. Publishers send messages to an Exchange, which inspects routing keys and headers to push messages into bound Queues.

---

## 2. AMQP Exchange & Queue Routing Architecture

```svg
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#10b981" font-size="14" font-family="sans-serif" font-weight="bold">RabbitMQ AMQP 0-9-1 Routing Architecture</text>

  <g transform="translate(30, 60)">
    <!-- Publisher -->
    <rect width="100" height="120" rx="6" fill="#18181b" stroke="#3b82f6"/>
    <text x="50" y="65" fill="#60a5fa" font-size="11" text-anchor="middle" font-family="sans-serif" font-weight="bold">Publisher</text>

    <!-- Exchange -->
    <polygon points="180,10 240,60 180,110 120,60" fill="#18181b" stroke="#10b981" stroke-width="1.5"/>
    <text x="180" y="64" fill="#34d399" font-size="10" text-anchor="middle" font-family="monospace">Exchange</text>

    <!-- Queues -->
    <rect x="290" y="10" width="130" height="40" rx="4" fill="#18181b" stroke="#f59e0b"/>
    <text x="355" y="34" fill="#fbbf24" font-size="10" text-anchor="middle" font-family="monospace">Queue A (Direct)</text>

    <rect x="290" y="70" width="130" height="40" rx="4" fill="#18181b" stroke="#f59e0b"/>
    <text x="355" y="94" fill="#fbbf24" font-size="10" text-anchor="middle" font-family="monospace">Queue B (Topic)</text>

    <!-- Consumers -->
    <rect x="460" y="10" width="80" height="40" rx="4" fill="#18181b" stroke="#a855f7"/>
    <text x="500" y="34" fill="#c084fc" font-size="10" text-anchor="middle" font-family="monospace">Worker 1</text>

    <rect x="460" y="70" width="80" height="40" rx="4" fill="#18181b" stroke="#a855f7"/>
    <text x="500" y="94" fill="#c084fc" font-size="10" text-anchor="middle" font-family="monospace">Worker 2</text>
  </g>
</svg>
```

---

## 3. Exchange Types & Routing Invariants

1. **Direct Exchange**: Matches routing key exactly: $\text{RoutingKey}_{\text{Msg}} == \text{BindingKey}_{\text{Queue}}$
2. **Fanout Exchange**: Broadcasts messages to all bound queues, ignoring routing keys.
3. **Topic Exchange**: Performs wildcard routing matching (`*` matches 1 word, `#` matches 0 or more words):
   $$\text{Pattern: } \text{orders.*.europe} \quad \text{matches} \quad \text{orders.shoes.europe}$$
4. **Headers Exchange**: Routes based on message header attributes instead of routing keys.

---

## 4. Production Go AMQP Consumer Code

Below is a production Go snippet consuming messages reliably with manual `ack` and prefetch limits (`amqp091-go`):

```go
package main

import (
	"log"
	amqp "github.com/rabbitmq/amqp091-go"
)

func main() {
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil {
		log.Fatalf("Failed connection: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed channel: %v", err)
	}
	defer ch.Close()

	// Set prefetch count to 10 to enforce fair dispatch
	err = ch.Qos(10, 0, false)
	if err != nil {
		log.Fatalf("Failed Qos: %v", err)
	}

	msgs, err := ch.Consume(
		"task_queue", "", false, false, false, false, nil,
	)

	for d := range msgs {
		log.Printf("Received Task: %s", d.Body)
		// Process workload...
		d.Ack(false) // Manual Acknowledgment
	}
}
```

---

## 5. Production Tradeoffs & Failure Modes

| Strategy | Advantages | Disadvantages |
| :--- | :--- | :--- |
| **Auto-Ack** | Maximum throughput | Message loss if consumer crashes mid-processing |
| **Manual Ack + Prefetch=1** | Zero message loss, fair task distribution | Lower peak throughput due to ack roundtrips |

---

## 6. Conceptual Check Questions & FAQs

1. **What is a Dead Letter Exchange (DLX) in RabbitMQ?**
   *Answer:* An exchange where messages are re-routed when rejected (`basic.nack`/`basic.reject` with `requeue=false`) or when TTL expires.
2. **Why set consumer prefetch count?**
   *Answer:* Without prefetch limits, RabbitMQ pushes all queued messages to the first connected worker, overwhelming it while other workers sit idle.

---

## 7. Recommended Practice Checklist

* [ ] Declare a Topic Exchange and set up wildcard bindings.
* [ ] Implement a Dead Letter Queue (DLQ) for failed message handling.
""",

    'pattern-monolith': r"""# Monolithic Architecture: Modular Boundaries, Shared Memory Calls & Migration Strategies

![Monolith](/images/backend/pattern-monolith-dark.png)

## 1. Architectural Overview & System Motivation

A Monolithic Architecture packages all software modules—domain logic, database access, background scheduling, authentication—into a single deployable artifact (e.g. JAR, binary, Docker container).

Monolithic advantages:
1. **Zero Network Latency**: Modules communicate via in-memory function calls ($< 1\text{ ns}$) rather than network RPCs ($1-10\text{ ms}$).
2. **ACID Transaction Guarantees**: Database modifications execute within local relational database transactions.
3. **Operational Simplicity**: Single build pipeline, single deployment unit.

---

## 2. In-Memory Modular Monolith Topology

```svg
<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="220" rx="8" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#3b82f6" font-size="14" font-family="sans-serif" font-weight="bold">Modular Monolith In-Memory Execution</text>

  <g transform="translate(40, 60)">
    <rect width="520" height="130" rx="6" fill="#18181b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="260" y="25" fill="#60a5fa" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">Single Monolithic Process Space</text>

    <rect x="20" y="40" width="140" height="65" rx="4" fill="#09090b" stroke="#27272a"/>
    <text x="90" y="75" fill="#e4e4e7" font-size="11" text-anchor="middle" font-family="monospace">Auth Module</text>

    <rect x="190" y="40" width="140" height="65" rx="4" fill="#09090b" stroke="#27272a"/>
    <text x="260" y="75" fill="#e4e4e7" font-size="11" text-anchor="middle" font-family="monospace">Order Module</text>

    <rect x="360" y="40" width="140" height="65" rx="4" fill="#09090b" stroke="#27272a"/>
    <text x="430" y="75" fill="#e4e4e7" font-size="11" text-anchor="middle" font-family="monospace">Billing Module</text>
  </g>
</svg>
```

---

## 3. In-Memory vs. Network Communication Latency Math

$$\text{Latency}_{\text{In-Memory Call}} \approx 0.5\text{ ns}$$
$$\text{Latency}_{\text{gRPC Microservice Call}} \approx 2.5\text{ ms} = 2,500,000\text{ ns}$$

Speedup Ratio:
$$\frac{\text{Latency}_{\text{gRPC}}}{\text{Latency}_{\text{In-Memory}}} = 5,000,000\text{x}$$

---

## 4. Production Python Modular Monolith Code

```python
class PaymentService:
    def process_payment(self, user_id: str, amount: float) -> bool:
        print(f"[In-Memory Call] Processing ${amount} for user {user_id}")
        return True

class OrderService:
    def __init__(self, payment_service: PaymentService):
        self.payment_service = payment_service

    def create_order(self, user_id: str, item_id: str, amount: float):
        # Local in-memory execution (no network call overhead)
        if self.payment_service.process_payment(user_id, amount):
            print(f"[Monolith] Order created successfully for item {item_id}")

payment_svc = PaymentService()
order_svc = OrderService(payment_svc)
order_svc.create_order("USER-102", "ITEM-409", 99.99)
```

---

## 5. Production Tradeoffs & Failure Modes

| Dimension | Modular Monolith | Microservices |
| :--- | :--- | :--- |
| **Operational Complexity** | Low | High |
| **Deployment Independence** | Low (Single deployment) | High (Independent releases) |
| **Fault Isolation** | Poor (Unhandled panic crashes entire process) | High (Fault contained within domain boundary) |

---

## 6. Conceptual Check Questions & FAQs

1. **What is a Modular Monolith?**
   *Answer:* A monolithic codebase structured into strict, independent domain packages with clean interfaces, keeping the simplicity of monolithic deployment while allowing future microservice extraction.

---

## 7. Recommended Practice Checklist

* [ ] Refactor tightly coupled code into decoupled module packages.
""",

    'pattern-microservices': r"""# Microservices Architecture: Domain Decomposition, gRPC, API Gateways & Service Discovery

![Microservices](/images/backend/pattern-microservices-dark.png)

## 1. Architectural Overview & System Motivation

Microservices Architecture structures an application as a collection of loosely coupled, independently deployable services organized around business capabilities (Bounded Contexts in Domain-Driven Design).

---

## 2. Distributed Microservices Architecture Topology

```svg
<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="240" rx="8" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#a855f7" font-size="14" font-family="sans-serif" font-weight="bold">Microservices Network Topology</text>

  <g transform="translate(40, 60)">
    <!-- API Gateway -->
    <rect width="100" height="130" rx="6" fill="#18181b" stroke="#a855f7" stroke-width="1.5"/>
    <text x="50" y="65" fill="#c084fc" font-size="11" text-anchor="middle" font-family="monospace">API Gateway</text>

    <!-- Services -->
    <rect x="180" y="0" width="140" height="55" rx="4" fill="#18181b" stroke="#3b82f6"/>
    <text x="250" y="32" fill="#60a5fa" font-size="10" text-anchor="middle" font-family="monospace">Order Service</text>

    <rect x="180" y="75" width="140" height="55" rx="4" fill="#18181b" stroke="#10b981"/>
    <text x="250" y="107" fill="#34d399" font-size="10" text-anchor="middle" font-family="monospace">Payment Service</text>

    <rect x="360" y="35" width="140" height="55" rx="4" fill="#18181b" stroke="#f59e0b"/>
    <text x="430" y="67" fill="#fbbf24" font-size="10" text-anchor="middle" font-family="monospace">Inventory Service</text>
  </g>
</svg>
```

---

## 3. Distributed Network Call Latency Equation

$$\text{Latency}_{\text{Total}} = \sum_{i=1}^{K} \left( \text{Network RPC}_i + \text{Processing Time}_i \right) + \text{Serialization Overhead}$$

---

## 4. Production Go gRPC Microservice Client Code

```go
package main

import (
	"context"
	"log"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	// Connect to Payment Service via gRPC
	conn, err := grpc.Dial("payment-service:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}
	defer conn.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	log.Printf("gRPC connection established to Payment Microservice.")
}
```

---

## 5. Production Tradeoffs & Failure Modes

* **Cascading Failures**: A failure in one microservice can propagate upstream. (Mitigation: Circuit Breakers & Timeout controls).

---

## 6. Conceptual Check Questions & FAQs

1. **What is Bounded Context in Microservices?**
   *Answer:* A explicit boundary within which a domain model applies uniquely without ambiguity.

---

## 7. Recommended Practice Checklist

* [ ] Implement gRPC protobuf services between two Go microservices.
""",

    'pattern-soa': r"""# Service-Oriented Architecture (SOA): Enterprise Service Bus (ESB), SOAP & Service Contracts

![SOA](/images/backend/pattern-soa-dark.png)

## 1. Architectural Overview & System Motivation

Service-Oriented Architecture (SOA) is an enterprise architectural pattern designed to integrate diverse legacy applications across large organizations using an Enterprise Service Bus (ESB) and formal XML/SOAP contracts.

---

## 2. ESB Integration Topology

```svg
<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="200" rx="8" fill="#09090b" stroke="#27272a" stroke-width="1.5"/>
  <text x="30" y="35" fill="#ec4899" font-size="14" font-family="sans-serif" font-weight="bold">Enterprise Service Bus (ESB) SOA Architecture</text>

  <g transform="translate(40, 65)">
    <rect y="30" width="520" height="35" rx="4" fill="#18181b" stroke="#ec4899" stroke-width="1.5"/>
    <text x="260" y="52" fill="#f472b6" font-size="11" text-anchor="middle" font-family="monospace">Enterprise Service Bus (ESB)</text>

    <rect x="20" y="80" width="120" height="40" rx="4" fill="#18181b" stroke="#27272a"/>
    <text x="80" y="104" fill="#e4e4e7" font-size="10" text-anchor="middle" font-family="monospace">ERP System</text>

    <rect x="200" y="80" width="120" height="40" rx="4" fill="#18181b" stroke="#27272a"/>
    <text x="260" y="104" fill="#e4e4e7" font-size="10" text-anchor="middle" font-family="monospace">CRM System</text>

    <rect x="380" y="80" width="120" height="40" rx="4" fill="#18181b" stroke="#27272a"/>
    <text x="440" y="104" fill="#e4e4e7" font-size="10" text-anchor="middle" font-family="monospace">Billing System</text>
  </g>
</svg>
```

---

## 3. SOA vs. Microservices Comparison

| Feature | SOA | Microservices |
| :--- | :--- | :--- |
| **Communication Hub** | Centralized ESB | Smart Endpoints, Dumb Pipes |
| **Data Storage** | Shared Enterprise Databases | Database-per-service |

---

## 4. Conceptual Check Questions

1. **Why did modern architecture move away from ESB?**
   *Answer:* The ESB became a single point of failure and bottleneck containing complex business logic.
"""
}

with open('./scratch/b1_data.json', 'w', encoding='utf-8') as f:
    json.dump(ARTICLES_B1, f, ensure_ascii=False)

print("Batch 1 saved successfully!")
