# ☁️ SGPFS Scheduling using CloudSim

## 📌 Project Overview

This project implements a custom cloud task scheduling algorithm called
**SGPFS (Shortest Gap Priority-Based Fair Scheduling)** using the CloudSim simulation framework.

The goal is to improve task execution efficiency by prioritizing jobs based on their execution characteristics.

---

## ⚙️ Technologies Used

* Java
* CloudSim 3.0
* VS Code

---

## 🚀 Features

* CloudSim-based cloud environment simulation
* Custom scheduling logic (SGPFS)
* Shortest-job-first execution behavior
* Controlled task execution using SpaceShared scheduling
* Clear execution order output

---

## 🧠 SGPFS Algorithm

SGPFS combines three key factors:

* **Shortest Gap** → Prioritizes tasks with smaller execution time
* **Priority** → Allows urgent tasks to be handled earlier
* **Fairness** → Ensures no task starvation

In this implementation, scheduling is applied by sorting cloudlets before execution.

---

## 📂 Project Structure

```
cloudsim/
 ├── src/
 │    └── org/cloudbus/cloudsim/
 │         └── SGPFSFinal.java
 ├── examples/
 └── README.md
```

---

## ▶️ How to Run

1. Open the project in VS Code
2. Navigate to:
   src/org/cloudbus/cloudsim/SGPFSFinal.java
3. Right-click → **Run Java**

---

## 📊 Sample Output

### 🔹 Scheduling Order

```
Cloudlet 4 (5000)
Cloudlet 1 (10000)
Cloudlet 3 (20000)
Cloudlet 2 (30000)
Cloudlet 0 (40000)
```

### 🔹 Execution Order

```
ID | Start | Finish | Length
4 | 0.1 | 5.1 | 5000
1 | 5.1 | 15.1 | 10000
3 | 15.1 | 35.1 | 20000
2 | 35.1 | 65.1 | 30000
0 | 65.1 | 105.1 | 40000
```

---

## 📈 Comparison with FCFS

* **FCFS Order:** 0 → 1 → 2 → 3 → 4
* **SGPFS Order:** 4 → 1 → 3 → 2 → 0

👉 SGPFS reduces waiting time by executing shorter tasks first.

---

## 🎯 Conclusion

The SGPFS scheduling approach improves efficiency over traditional FCFS by optimizing execution order and reducing delays.

---
