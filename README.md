<div align="center">

# 🚀 End-to-End Kubernetes Three-Tier DevSecOps  
## MERN Stack Project on AWS EKS

[![Jenkins](https://img.shields.io/badge/CI-Jenkins-D24939?logo=jenkins&logoColor=white)](https://www.jenkins.io/)
[![ArgoCD](https://img.shields.io/badge/GitOps-ArgoCD-EF7B4D?logo=argo&logoColor=white)](https://argoproj.github.io/cd/)
[![Terraform](https://img.shields.io/badge/IaC-Terraform-7B42BC?logo=terraform&logoColor=white)](https://www.terraform.io/)
[![Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![AWS EKS](https://img.shields.io/badge/Cloud-AWS%20EKS-FF9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/eks/)
[![SonarQube](https://img.shields.io/badge/SAST-SonarQube-4E9BCD?logo=sonarqube&logoColor=white)](https://www.sonarqube.org/)
[![OWASP](https://img.shields.io/badge/SCA-OWASP%20Dependency--Check-blue)](https://owasp.org/www-project-dependency-check/)
[![Trivy](https://img.shields.io/badge/Security-Trivy-1904DA?logo=aqua&logoColor=white)](https://aquasecurity.github.io/trivy/)
[![Prometheus](https://img.shields.io/badge/Monitoring-Prometheus-E6522C?logo=prometheus&logoColor=white)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Dashboards-Grafana-F46800?logo=grafana&logoColor=white)](https://grafana.com/)

A **production-grade**, fully automated DevSecOps solution deploying a Three-Tier MERN web application on **AWS EKS**, integrating security scanning, GitOps, Infrastructure as Code, and real-time monitoring.

</div>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Prerequisites](#-prerequisites)
- [Phase 1 — AWS Infrastructure with Terraform](#-phase-1--aws-infrastructure-with-terraform)
- [Phase 2 — Jenkins CI/CD Setup](#-phase-2--jenkins-cicd-setup)
- [Phase 3 — CI Pipeline Stages](#-phase-3--ci-pipeline-stages)
- [Phase 4 — ArgoCD GitOps Deployment](#-phase-4--argocd-gitops-deployment)
- [Phase 5 — Monitoring with Prometheus & Grafana](#-phase-5--monitoring-with-prometheus--grafana)
- [Security — DevSecOps Practices](#-security--devsecops-practices)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [Troubleshooting](#-troubleshooting)
- [Author](#-author)

---

## 🎯 Problem Statement

Organizations require a **highly scalable, fault-tolerant, and automated deployment solution** for their web applications to ensure high availability, security, and efficient monitoring. Traditional deployment methods often lead to:

- Operational inefficiencies and delayed releases
- Difficulty maintaining infrastructure as code
- Lack of automated security enforcement in pipelines
- Poor observability and reactive (rather than proactive) monitoring

This project solves all of the above by delivering a **comprehensive, production-grade DevSecOps solution** for deploying modern web applications efficiently while maintaining **security, observability, and end-to-end automation**.

---

## 💡 Solution Overview

| Challenge | Solution Implemented |
|-----------|----------------------|
| Manual AWS provisioning | **Terraform** IaC modules (VPC, EKS, IAM, ECR) |
| No automated CI/CD | **Jenkins** Declarative Pipeline (13 stages) |
| Manual K8s deployments | **Helm** + **ArgoCD** GitOps |
| Security gaps in pipeline | **Trivy** (FS + Image scans) + **SonarQube** SAST |
| No observability | **Prometheus** + **Grafana** dashboards & alerts |
| Brittle secrets management | Kubernetes Secrets + AWS IAM IRSA |
| Single-point-of-failure | EKS Node Groups with auto-scaling across AZs |

---

## 🏗️ Architecture

### High-Level Flow

```
Developer
    │  git push
    ▼
GitHub (Application Repo)
    │  webhook trigger
    ▼
┌─────────────────────────────────────────────────────────┐
│                  JENKINS CI SERVER (EC2)                 │
│                                                         │
│  Stage 1  ──► Build Backend Docker Image                │
│  Stage 2  ──► Build Frontend Docker Image               │
│  Stage 3  ──► Trivy Filesystem Scan (HIGH/CRITICAL)     │
│  Stage 4  ──► SonarQube Static Analysis (SAST)          │
│  Stage 5  ──► Trivy Backend Image Scan                  │
│  Stage 6  ──► Trivy Frontend Image Scan                 │
│  Stage 7  ──► Docker Login                              │
│  Stage 8  ──► Docker Compose Validation                 │
│  Stage 9  ──► Push Backend Image → DockerHub            │
│  Stage 10 ──► Push Frontend Image → DockerHub           │
│  Stage 11 ──► Clone K8s Manifests Repo                  │
│  Stage 12 ──► Update Image Tags (sed)                   │
│  Stage 13 ──► Push Updated Manifests → GitHub           │
└─────────────────────────────────────────────────────────┘
    │  image tag updated in GitOps repo
    ▼
GitHub (K8s Manifests Repo)
    │  ArgoCD watches & detects drift
    ▼
┌─────────────────────────────────────────────────────────┐
│                    AWS EKS CLUSTER                       │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Kubernetes Namespace: default        │   │
│  │                                                  │   │
│  │  ┌──────────┐   ┌──────────┐   ┌─────────────┐  │   │
│  │  │ Frontend │   │ Backend  │   │   MongoDB   │  │   │
│  │  │ (React)  │   │(Express) │   │  StatefulSet│  │   │
│  │  │ 2 pods   │   │ 2 pods   │   │   1 pod     │  │   │
│  │  └────┬─────┘   └────┬─────┘   └──────┬──────┘  │   │
│  │       │              │                 │         │   │
│  │  ┌────▼──────────────▼─────────────────▼──────┐  │   │
│  │  │            NGINX Ingress Controller        │  │   │
│  │  │    /      → frontend-service:80            │  │   │
│  │  │    /api   → backend-service:3500           │  │   │
│  │  └────────────────────┬───────────────────────┘  │   │
│  └───────────────────────┼──────────────────────────┘   │
│                           │                             │
│  ┌────────────────────────▼──────────────────────────┐  │
│  │           AWS Application Load Balancer            │  │
│  └────────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │          Monitoring Namespace                    │   │
│  │   Prometheus ──────────► Grafana Dashboards      │   │
│  │   kube-state-metrics     Alertmanager            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### AWS Infrastructure (Terraform Provisioned)

```
AWS Account
└── VPC (10.0.0.0/16)  — mern-vpc
    ├── Public Subnets  (2 AZs: ap-south-1a/b) ── NAT Gateway, ALB
    ├── Private Subnets (2 AZs: ap-south-1a/b) ── EKS Worker Nodes
    └── EKS Cluster  (Kubernetes 1.31)
        ├── Control Plane (managed by AWS)
        ├── Node Group  (t3.medium, 1–3 nodes)
        └── Add-ons: CoreDNS, kube-proxy, VPC CNI
```

---

## 🛠️ Tech Stack

| Category | Tool / Service | Purpose |
|----------|---------------|---------|
| **Frontend** | React 17 + Material-UI | Single-page Task Management App |
| **Backend** | Node.js + Express 4 | REST API server |
| **Database** | MongoDB 5.0 | Document store for tasks |
| **Cloud** | AWS (EKS, EC2, VPC, IAM) | Production cloud infrastructure |
| **IaC** | Terraform + community modules (vpc v5.1.2, eks v20.8.5) | AWS resource provisioning |
| **Containers** | Docker + Docker Compose | Build & local validation |
| **Orchestration** | Kubernetes 1.31 (AWS EKS) | Container orchestration |
| **Package Mgmt** | Helm | Kubernetes application packaging |
| **CI/CD** | Jenkins (Declarative Pipeline) | Automated build, scan & deploy |
| **GitOps CD** | ArgoCD | Kubernetes state reconciliation |
| **SAST** | SonarQube | Static code security analysis |
| **Image Scan** | Trivy (Aqua Security) | CVE scanning for FS & images |
| **Monitoring** | Prometheus + Grafana + prom-client | Metrics collection & dashboards |
| **Ingress** | NGINX Ingress Controller | L7 routing, TLS termination |
| **Registry** | DockerHub | Container image storage |

---

## 📁 Repository Structure

```
Jenkins-pipeline/  (this repo)
│
├── Application-Code/
│   ├── backend/                    # Node.js + Express REST API
│   │   ├── index.js                # Entry point — API + health probes + /metrics
│   │   ├── db.js                   # MongoDB connection module
│   │   ├── routes/tasks.js         # CRUD routes for /api/tasks
│   │   ├── models/                 # Mongoose schemas
│   │   ├── Dockerfile              # Backend container image
│   │   └── package.json            # deps: express, mongoose, cors, prom-client
│   │
│   ├── frontend/                   # React SPA (Material-UI)
│   │   ├── src/                    # React components & logic
│   │   ├── public/
│   │   ├── Dockerfile              # Multi-stage: node:18-alpine (build) → nginx:alpine (serve)
│   │   └── package.json
│   │
│   ├── terraform/                  # IaC — provisions AWS EKS cluster
│   │   ├── main.tf                 # Terraform config block + required providers
│   │   ├── provider.tf             # AWS provider + region
│   │   ├── variables.tf            # aws_region, cluster_name
│   │   ├── vpc.tf                  # VPC module (terraform-aws-modules/vpc v5.1.2)
│   │   ├── eks.tf                  # EKS module (terraform-aws-modules/eks v20.8.5)
│   │   └── outputs.tf              # cluster_name, cluster_endpoint
│   │
│   ├── docker-compose.yml          # Full local stack (MongoDB+Backend+Frontend)
│   ├── argocd-ingress.yaml         # Ingress to expose ArgoCD UI
│   └── Jenkinsfile                 # 13-stage Declarative CI Pipeline
│
└── README.md                       # ← You are here
```

> **K8s Manifests** live in a separate GitOps repo:  
> [`End-to-End-k8s-manifests`](https://github.com/Om65234/End-to-End-k8s-manifests) — watched by ArgoCD

---

## ✅ Prerequisites

### Local Tools
| Tool | Min Version | Install |
|------|-------------|---------|
| AWS CLI | v2 | [docs.aws.amazon.com](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) |
| Terraform | v1.5+ | [terraform.io](https://www.terraform.io/downloads) |
| kubectl | v1.27+ | [kubernetes.io](https://kubernetes.io/docs/tasks/tools/) |
| Helm | v3.12+ | [helm.sh](https://helm.sh/docs/intro/install/) |
| Docker | v24+ | [docker.com](https://docs.docker.com/get-docker/) |
| ArgoCD CLI | latest | [argo-cd.readthedocs.io](https://argo-cd.readthedocs.io/en/stable/cli_installation/) |
| Trivy | latest | [aquasecurity.github.io](https://aquasecurity.github.io/trivy/latest/getting-started/installation/) |

### AWS Requirements
- AWS account with **AdministratorAccess** (or scoped IAM policy)
- AWS CLI configured: `aws configure`
- An S3 bucket for Terraform remote state (recommended)

---

## 🏗️ Phase 1 — AWS Infrastructure with Terraform

> Terraform lives in `Application-Code/terraform/` and uses the official **community modules** for clean, minimal config.

> Terraform provisions the complete AWS environment before any application workload runs.

### 1.1 Configure Terraform Backend (Recommended)

```hcl
# terraform/backend.tf
terraform {
  backend "s3" {
    bucket = "your-tf-state-bucket"
    key    = "eks-devsecops/terraform.tfstate"
    region = "ap-south-1"
  }
}
```

### 1.2 Provision Infrastructure

```bash
cd terraform/

# Initialise providers & backend
terraform init

# Preview the execution plan
terraform plan -out=tfplan

# Apply — creates VPC, EKS, IAM, Node Groups (~15 min)
terraform apply tfplan
```

### 1.3 Resources Created by Terraform

| Resource | Details |
|----------|---------|
| **VPC** | `/16` CIDR, 3 public + 3 private subnets across AZs |
| **Internet Gateway** | For public subnet outbound traffic |
| **NAT Gateway** | Allows private nodes to reach internet |
| **EKS Cluster** | K8s v1.27, private API endpoint option |
| **Node Group** | `t3.medium`, auto-scaling (min 2, max 5) |
| **IAM OIDC** | Enables IRSA (IAM Roles for Service Accounts) |
| **EBS CSI Driver** | Persistent volumes for MongoDB |
| **ECR Repositories** | Optional — alternative to DockerHub |

### 1.4 Connect kubectl to EKS

```bash
aws eks update-kubeconfig \
  --region ap-south-1 \
  --name <your-cluster-name>

# Verify
kubectl get nodes
kubectl get namespaces
```

---

## ⚙️ Phase 2 — Jenkins CI/CD Setup

### 2.1 Launch Jenkins Server

Jenkins runs on an **EC2 instance** (recommended: `t3.medium`, Ubuntu 22.04).

```bash
# Install Java
sudo apt update && sudo apt install -y openjdk-17-jdk

# Install Jenkins
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo gpg --dearmor -o /usr/share/keyrings/jenkins-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.gpg] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update && sudo apt install -y jenkins
sudo systemctl enable --now jenkins

# Install Docker (for builds)
sudo apt install -y docker.io
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Install Trivy
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sudo sh -s -- -b /usr/local/bin
```

### 2.2 Jenkins Plugins Required

Install via **Manage Jenkins → Plugins**:

| Plugin | Purpose |
|--------|---------|
| `Pipeline` | Declarative pipeline support |
| `Docker Pipeline` | Docker build/push in pipelines |
| `SonarQube Scanner` | SonarQube integration |
| `Credentials Binding` | Secure credential injection |
| `Git` | Source code checkout |
| `GitHub Integration` | Webhook support |
| `Blue Ocean` | Modern pipeline UI (optional) |

### 2.3 Required Jenkins Credentials

Navigate to **Manage Jenkins → Credentials → Global**:

| Credential ID | Type | Value |
|---------------|------|-------|
| `dockerhub-creds` | Username with Password | DockerHub username & password/token |
| `github-access token` | Secret Text | GitHub Personal Access Token (repo scope) |
| `sonarqube-token` | Secret Text | SonarQube project token |

### 2.4 Configure SonarQube

```bash
# Run SonarQube via Docker (on Jenkins server or separate EC2)
docker run -d \
  --name sonarqube \
  -p 9000:9000 \
  sonarqube:lts-community
```

In Jenkins: **Manage Jenkins → System** → add SonarQube server:
- Name: `sonarqube`
- URL: `http://<sonarqube-ip>:9000`

In Jenkins: **Manage Jenkins → Tools** → add SonarQube Scanner:
- Name: `sonar-scanner`

### 2.5 Create the Pipeline

1. **New Item** → **Pipeline** → name it `mern-devsecops`
2. Under **Pipeline**:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/Om65234/Jenkins-pipeline.git`
   - Branch: `*/main`
   - Script Path: `Application-Code/Jenkinsfile`
3. Enable **GitHub hook trigger for GITScm polling**
4. Save and click **Build Now**

---

## 🔄 Phase 3 — CI Pipeline Stages

The [`Jenkinsfile`](./Jenkinsfile) defines **14 fully automated stages**:

```
┌──────────────────────────────────────────────────────────────────┐
│                     JENKINS PIPELINE FLOW                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [1]  Build Backend Image  ─► docker build mern-backend:v{N}     │
│  [2]  Build Frontend Image ─► docker build mern-frontend:v{N}    │
│         │                                                        │
│         ▼                                                        │
│  [3]  Trivy FS Scan ───────► severity: HIGH, CRITICAL            │
│  [4]  OWASP Dependency-Check► SCA scan: backend + frontend       │
│  [5]  SonarQube SAST ──────► project: mern-devsecops             │
│         │                                                        │
│         ▼                                                        │
│  [6]  Trivy Backend Image Scan                                   │
│  [7]  Trivy Frontend Image Scan                                  │
│         │                                                        │
│         ▼                                                        │
│  [8]  Docker Login ────────► DockerHub authentication            │
│  [9]  Docker Compose Test ─► up → sleep 20s → ps → down          │
│         │                                                        │
│         ▼                                                        │
│  [10] Push Backend Image ──► omkar1907/mern-backend:v{N}         │
│  [11] Push Frontend Image ─► omkar1907/mern-frontend:v{N}        │
│         │                                                        │
│         ▼                                                        │
│  [12] Clone Manifests Repo                                       │
│  [13] Update Image Tags (sed)                                    │
│  [14] Push Updated Manifests ─► triggers ArgoCD sync            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Image Versioning

Every build produces a uniquely tagged image:
```
omkar1907/mern-backend:v<BUILD_NUMBER>
omkar1907/mern-frontend:v<BUILD_NUMBER>
```

---

## 🔁 Phase 4 — ArgoCD GitOps Deployment

### 4.1 Install ArgoCD on EKS

```bash
kubectl create namespace argocd

helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

helm install argocd argo/argo-cd \
  --namespace argocd \
  --set server.service.type=ClusterIP
```

### 4.2 Expose ArgoCD UI via Ingress

Apply the ArgoCD ingress from this repo:

```bash
kubectl apply -f argocd-ingress.yaml
```

Add `argocd.local` → ingress IP in `/etc/hosts`, then open `http://argocd.local`.

```bash
# Get initial admin password
kubectl get secret argocd-initial-admin-secret \
  -n argocd \
  -o jsonpath="{.data.password}" | base64 -d
```

### 4.3 Create the ArgoCD Application

```yaml
# argocd-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: mern-three-tier-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/Om65234/End-to-End-k8s-manifests.git
    targetRevision: main
    path: .
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

```bash
kubectl apply -f argocd-app.yaml

# Monitor sync status
argocd app get mern-three-tier-app
argocd app sync mern-three-tier-app
```

### 4.4 GitOps Update Cycle

```
1. Developer pushes code
         │
2. Jenkins pipeline triggers
         │
3. New images built, scanned, pushed to DockerHub
         │
4. Jenkins clones K8s manifests repo
         │
5. sed updates image tag:
   image: omkar1907/mern-backend:v31
   →
   image: omkar1907/mern-backend:v32
         │
6. Jenkins pushes updated manifests to GitHub
         │
7. ArgoCD detects diff (≤3 min polling or webhook)
         │
8. ArgoCD syncs → Rolling update on EKS
         │
9. Zero-downtime deployment ✅
```

---

## 📊 Phase 5 — Monitoring with Prometheus & Grafana

### 5.1 Backend Prometheus Metrics (prom-client)

The backend exposes native Prometheus metrics at `GET /metrics` using [`prom-client`](https://github.com/siimon/prom-client):

```js
// Collects: event loop lag, heap usage, GC, active handles, etc.
collectDefaultMetrics();

// Endpoint consumed by Prometheus scraper
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});
```

Add this scrape config to your Prometheus config to pull backend metrics:
```yaml
scrape_configs:
  - job_name: 'mern-backend'
    static_configs:
      - targets: ['backend:3500']
```

---

### 5.2 Install kube-prometheus-stack via Helm

```bash
kubectl create namespace monitoring

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install kube-prometheus-stack \
  prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set grafana.adminPassword=Admin@123 \
  --set prometheus.prometheusSpec.retention=15d
```

### 5.3 Access Dashboards

```bash
# Grafana (default: admin / Admin@123)
kubectl port-forward svc/kube-prometheus-stack-grafana \
  3000:80 -n monitoring

# Prometheus
kubectl port-forward svc/kube-prometheus-stack-prometheus \
  9090:9090 -n monitoring

# Alertmanager
kubectl port-forward svc/kube-prometheus-stack-alertmanager \
  9093:9093 -n monitoring
```

### 5.4 What Prometheus Scrapes

| Target | Metrics |
|--------|---------|
| Kubernetes API Server | API request rate, errors |
| Nodes (node-exporter) | CPU, Memory, Disk, Network |
| kube-state-metrics | Pod status, replicas, restarts |
| NGINX Ingress | Request rate, error rate, latency (P95/P99) |
| cAdvisor | Per-container resource usage |
| Alertmanager | Active alert counts |

### 5.5 Key Grafana Dashboards

| Dashboard ID | Name |
|-------------|------|
| `15760` | Kubernetes / Views / Global |
| `6417` | Kubernetes Cluster (Prometheus) |
| `1860` | Node Exporter Full |
| `9614` | NGINX Ingress Controller |
| `7362` | Kubernetes Pod Resources |

Import via **Grafana → Dashboards → Import → enter ID**.

### 5.6 Useful PromQL Queries

```promql
# Pod restart count (default namespace)
kube_pod_container_status_restarts_total{namespace="default"}

# CPU usage rate per pod
rate(container_cpu_usage_seconds_total{namespace="default", container!=""}[5m])

# Memory usage bytes per pod
container_memory_usage_bytes{namespace="default", container!=""}

# NGINX request rate (2m window)
rate(nginx_ingress_controller_requests{namespace="default"}[2m])

# HTTP error rate (5xx)
rate(nginx_ingress_controller_requests{status=~"5.."}[5m])

# EKS Node CPU utilisation %
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Backend Node.js heap used (from prom-client)
nodejs_heap_size_used_bytes{job="mern-backend"}

# Backend event loop lag
nodejs_eventloop_lag_seconds{job="mern-backend"}
```

---

## 🔒 Security — DevSecOps Practices

### Shift-Left Security Model

```
Code → SAST (SonarQube) → Build → FS Scan (Trivy) → Image Scan (Trivy) → Deploy
  ↑                                                                           ↑
Early feedback                                                   Runtime security
```

### Trivy — Vulnerability Scanning

```bash
# Filesystem scan (source code + dependencies)
trivy fs --severity HIGH,CRITICAL .

# Container image scan
trivy image --severity HIGH,CRITICAL omkar1907/mern-backend:v31

# Output formats
trivy image --format json --output results.json omkar1907/mern-backend:v31
trivy image --format table omkar1907/mern-backend:v31
```

### SonarQube — Static Analysis

- Project Key: `mern-devsecops`
- Scans for: SQL injection, XSS, hardcoded secrets, code smells, coverage
- Quality Gate blocks the pipeline if critical issues are found

### Kubernetes Security Hardening

```yaml
# Security Context (applied in deployments)
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
```

- MongoDB credentials stored in **Kubernetes Secrets** (base64-encoded)
- Sensitive env vars injected via `secretKeyRef` — not hardcoded
- AWS IAM IRSA used for pod-level AWS API access (no static credentials)
- Network Policies restrict pod-to-pod communication

---

## 🌐 API Reference

**Base URL:** `http://<ingress-ip>/api`

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `GET` | `/api/tasks` | List all tasks | — |
| `POST` | `/api/tasks` | Create a task | `{ "title": "...", "description": "..." }` |
| `PUT` | `/api/tasks/:id` | Update a task | `{ "title": "...", "completed": true }` |
| `DELETE` | `/api/tasks/:id` | Delete a task | — |
| `GET` | `/healthz` | Liveness probe | — |
| `GET` | `/ready` | Readiness probe (checks DB) | — |
| `GET` | `/started` | Startup probe | — |
| `GET` | `/metrics` | **Prometheus metrics** (prom-client) | — |

---

## 🔧 Local Development

### Run with Docker Compose

```bash
git clone https://github.com/Om65234/Jenkins-pipeline.git
cd Jenkins-pipeline/Application-Code

# Start full stack
docker-compose up -d

# View running services
docker-compose ps

# Tail logs
docker-compose logs -f backend
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3500 |
| MongoDB | mongodb://localhost:27017 |

### Run Backend Without Docker

```bash
cd Application-Code/backend
npm install
PORT=3500 \
MONGO_CONN_STR=mongodb://root:rootpassword@localhost:27017/tasks?authSource=admin \
USE_DB_AUTH=true \
node index.js
```

### Run Frontend Without Docker

```bash
cd Application-Code/frontend
npm install
REACT_APP_API_URL=http://localhost:3500 npm start
```

---

## 📦 Environment Variables

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3500` | Express server port |
| `MONGO_CONN_STR` | `mongodb://root:rootpassword@mongodb:27017/tasks?authSource=admin` | MongoDB connection string |
| `USE_DB_AUTH` | `true` | Enable MongoDB authentication |

### Backend Dependencies (`package.json`)

| Package | Version | Purpose |
|---------|---------|--------|
| `express` | ^4.17.1 | HTTP server framework |
| `mongoose` | ^5.12.14 | MongoDB ODM |
| `cors` | ^2.8.5 | Cross-origin resource sharing |
| `prom-client` | ^15.1.3 | Prometheus metrics exposition |

### Frontend

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `http://localhost:3500` | Backend API base URL |

---

## 🔍 Troubleshooting

```bash
# Check all pod status
kubectl get pods -A

# Describe a failing pod
kubectl describe pod <pod-name>

# Check pod logs
kubectl logs deployment/backend --tail=100
kubectl logs deployment/frontend --tail=100
kubectl logs deployment/mongodb --tail=100

# Check ingress
kubectl describe ingress mern-ingress

# Exec into a running container
kubectl exec -it deployment/backend -- sh

# Check EKS node status
kubectl get nodes -o wide

# Jenkins build logs
# Visit http://<jenkins-ip>:8080/job/mern-devsecops/lastBuild/console

# ArgoCD sync status
argocd app get mern-three-tier-app
argocd app history mern-three-tier-app

# Check Prometheus targets
kubectl port-forward svc/kube-prometheus-stack-prometheus 9090:9090 -n monitoring
# Open http://localhost:9090/targets
```

---

## 🔗 Related Repositories

| Repo | Purpose |
|------|---------|
| [`Jenkins-pipeline`](https://github.com/Om65234/Jenkins-pipeline) *(this repo)* | Application code, Dockerfiles, Jenkinsfile |
| [`End-to-End-k8s-manifests`](https://github.com/Om65234/End-to-End-k8s-manifests) | Kubernetes manifests — GitOps source of truth |

---

## 👤 Author

**Omkar** · [GitHub @Om65234](https://github.com/Om65234)

