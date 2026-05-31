# 🚀 End-to-End DevSecOps — Application Code & CI Pipeline

A full-stack **MERN** (MongoDB · Express · React · Node.js) task-management application wired into a complete **DevSecOps** pipeline using Jenkins, Docker, Trivy, SonarQube, ArgoCD, and monitored via **Prometheus + Grafana**.

---

## 📐 Architecture Overview

```
Developer Push
      │
      ▼
  GitHub (this repo)
      │
      ▼
  Jenkins CI Pipeline
  ┌───────────────────────────────────────────────┐
  │  1. Build Docker Images (Backend + Frontend)  │
  │  2. Trivy Filesystem Scan                     │
  │  3. SonarQube Static Analysis                 │
  │  4. Trivy Image Scan (Backend + Frontend)     │
  │  5. Docker Compose Validation                 │
  │  6. Push Images to DockerHub                  │
  │  7. Clone K8s Manifest Repo                   │
  │  8. Update Image Tags in Manifests            │
  │  9. Push Updated Manifests → GitOps Repo      │
  └───────────────────────────────────────────────┘
      │
      ▼
  ArgoCD (GitOps CD) ──► Kubernetes Cluster
      │
      ▼
  Prometheus + Grafana (Monitoring)
```

---

## 🗂️ Repository Structure

```
Application-Code/
├── backend/                  # Node.js + Express REST API
│   ├── index.js              # App entry point (health, readiness, startup probes)
│   ├── db.js                 # MongoDB connection helper
│   ├── routes/               # API route handlers
│   ├── models/               # Mongoose schemas
│   ├── Dockerfile            # Backend container image
│   └── package.json
│
├── frontend/                 # React SPA (Material-UI)
│   ├── src/                  # React source code
│   ├── public/
│   ├── Dockerfile            # Multi-stage build → Nginx
│   └── package.json
│
├── docker-compose.yml        # Local dev / CI validation stack
├── argocd-ingress.yaml       # Ingress for ArgoCD UI (argocd.local)
└── Jenkinsfile               # Declarative CI pipeline definition
```

---

## 🛠️ Tech Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | React 17, Material-UI, Axios             |
| Backend     | Node.js, Express 4, Mongoose             |
| Database    | MongoDB 5.0                              |
| CI Server   | Jenkins (Declarative Pipeline)           |
| Security    | Trivy (FS + Image scan), SonarQube       |
| Containers  | Docker, Docker Compose                   |
| Registry    | DockerHub (`omkar1907/mern-*`)           |
| CD / GitOps | ArgoCD                                   |
| Monitoring  | Prometheus + Grafana                     |

---

## ⚙️ Jenkins CI Pipeline

The [`Jenkinsfile`](./Jenkinsfile) defines a fully declarative pipeline with the following stages:

| # | Stage | Description |
|---|-------|-------------|
| 1 | **Build Backend Docker Image** | Builds `omkar1907/mern-backend:<tag>` |
| 2 | **Build Frontend Docker Image** | Builds `omkar1907/mern-frontend:<tag>` |
| 3 | **Trivy Filesystem Scan** | Scans source files for HIGH/CRITICAL CVEs |
| 4 | **SonarQube Analysis** | SAST scan via SonarQube (`mern-devsecops` project) |
| 5 | **Trivy Backend Image Scan** | Deep scan of the backend container image |
| 6 | **Trivy Frontend Image Scan** | Deep scan of the frontend container image |
| 7 | **Docker Login** | Authenticates with DockerHub |
| 8 | **Docker Compose Validation** | Spins up full stack locally, waits 20 s, tears down |
| 9 | **Push Backend Image** | Pushes versioned image to DockerHub |
| 10 | **Push Frontend Image** | Pushes versioned image to DockerHub |
| 11 | **Clone Manifest Repository** | Clones the K8s GitOps repo |
| 12 | **Update Kubernetes Manifests** | `sed` updates image tags in deployment YAMLs |
| 13 | **Push Updated Manifest Repo** | Commits & pushes updated manifests → triggers ArgoCD sync |

### Image Versioning

Images are tagged using the Jenkins build number:
```
omkar1907/mern-backend:v<BUILD_NUMBER>
omkar1907/mern-frontend:v<BUILD_NUMBER>
```

---

## 🔐 Jenkins Credentials Required

| Credential ID           | Type            | Used For                         |
|-------------------------|-----------------|----------------------------------|
| `dockerhub-creds`       | Username/Password | DockerHub login & push          |
| `github-access token`   | Secret Text     | Cloning & pushing GitOps repo    |

---

## 🧪 Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js 16+

### Run with Docker Compose
```bash
# Clone this repo
git clone https://github.com/Om65234/Jenkins-pipeline.git
cd Jenkins-pipeline

# Start the full stack (MongoDB + Backend + Frontend)
docker-compose up -d

# Check running services
docker-compose ps

# View logs
docker-compose logs -f backend
```

| Service  | URL                         |
|----------|-----------------------------|
| Frontend | http://localhost:3000        |
| Backend  | http://localhost:3500        |
| MongoDB  | mongodb://localhost:27017    |

### Run Backend Locally (without Docker)
```bash
cd backend
npm install
PORT=3500 MONGO_CONN_STR=mongodb://root:rootpassword@localhost:27017/tasks?authSource=admin node index.js
```

### Run Frontend Locally
```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:3500 npm start
```

---

## 🌐 API Endpoints

| Method | Endpoint          | Description          |
|--------|-------------------|----------------------|
| GET    | `/api/tasks`      | List all tasks       |
| POST   | `/api/tasks`      | Create a new task    |
| PUT    | `/api/tasks/:id`  | Update a task        |
| DELETE | `/api/tasks/:id`  | Delete a task        |
| GET    | `/healthz`        | Liveness probe       |
| GET    | `/ready`          | Readiness probe      |
| GET    | `/started`        | Startup probe        |

---

## 📊 Monitoring — Prometheus & Grafana

The cluster is monitored using the **kube-prometheus-stack** (or standalone Prometheus + Grafana):

- **Prometheus** scrapes metrics from:
  - Kubernetes nodes & pods
  - NGINX Ingress Controller
  - MongoDB exporter (if configured)
  - Backend `/metrics` endpoint (if `prom-client` is added)

- **Grafana** dashboards provide:
  - Cluster resource utilisation (CPU, Memory, Network)
  - Pod health & restart counts
  - Request rates and error rates via Ingress metrics

### Accessing Grafana
```bash
# Port-forward Grafana service
kubectl port-forward svc/grafana 3000:80 -n monitoring

# Default credentials
Username: admin
Password: prom-operator  # or check your values.yaml
```

### Accessing Prometheus
```bash
kubectl port-forward svc/prometheus-operated 9090:9090 -n monitoring
# Open http://localhost:9090
```

---

## 🔄 GitOps Flow (ArgoCD)

ArgoCD watches the [K8s Manifests repo](https://github.com/Om65234/End-to-End-k8s-manifests) and auto-syncs whenever Jenkins pushes updated image tags.

The `argocd-ingress.yaml` in this repo exposes the ArgoCD UI at `argocd.local` via NGINX Ingress.

```bash
# Apply ArgoCD ingress
kubectl apply -f argocd-ingress.yaml
```

Add `argocd.local` to your `/etc/hosts` pointing to the cluster's ingress IP, then visit `http://argocd.local`.

---

## 🔒 Security Scanning

### Trivy
Trivy is run at two levels in the pipeline:
1. **Filesystem scan** — catches secrets, misconfigs, and dependency vulnerabilities in source code
2. **Image scan** — scans the final Docker images for OS and library CVEs

Only `HIGH` and `CRITICAL` severity issues are reported. To run manually:
```bash
# Filesystem scan
trivy fs --severity HIGH,CRITICAL .

# Image scan
trivy image --severity HIGH,CRITICAL omkar1907/mern-backend:v31
```

### SonarQube
Static application security testing (SAST) is performed with SonarQube:
- Project: `mern-devsecops`
- Configured via the `sonarqube` server and `sonar-scanner` tool in Jenkins

---

## 📦 Docker Images

| Image | DockerHub |
|-------|-----------|
| Backend  | `omkar1907/mern-backend:<tag>`  |
| Frontend | `omkar1907/mern-frontend:<tag>` |

---

## 📝 Environment Variables

### Backend
| Variable        | Default                                            | Description              |
|-----------------|----------------------------------------------------|--------------------------|
| `PORT`          | `3500`                                             | Express server port      |
| `MONGO_CONN_STR`| `mongodb://root:rootpassword@mongodb:27017/tasks?authSource=admin` | MongoDB URI |
| `USE_DB_AUTH`   | `true`                                             | Enable MongoDB auth      |

### Frontend
| Variable            | Default                  | Description           |
|---------------------|--------------------------|-----------------------|
| `REACT_APP_API_URL` | `http://localhost:3500`  | Backend API base URL  |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request — Jenkins will automatically run the pipeline on the PR

---

## 👤 Author

**Omkar** · [GitHub @Om65234](https://github.com/Om65234)
