# Software Production Engineering
## Final Project Report

**Project Title:** Doctor-Patient Appointment Management System  
**Course:** Software Production Engineering (SPE)  
**Institute:** International Institute of Information Technology, Bangalore  

---

| Student Name | Roll Number |
|---|---|
| Parag Piprewar | MT2025083 |
| Raghav Goyal | MT2025098 |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Architecture](#2-system-architecture)
3. [Microservices Design](#3-microservices-design)
4. [Containerization with Docker](#4-containerization-with-docker)
5. [CI/CD Pipeline with Jenkins](#5-cicd-pipeline-with-jenkins)
6. [Kubernetes Orchestration](#6-kubernetes-orchestration)
7. [Ansible Automation](#7-ansible-automation)
8. [Monitoring with Prometheus & Grafana](#8-monitoring-with-prometheus--grafana)
9. [Centralized Logging with ELK Stack](#9-centralized-logging-with-elk-stack)
10. [Secrets Management with HashiCorp Vault](#10-secrets-management-with-hashicorp-vault)
11. [Asynchronous Communication with RabbitMQ](#11-asynchronous-communication-with-rabbitmq)
12. [Results and Screenshots](#12-results-and-screenshots)
13. [Conclusion](#13-conclusion)

---

## 1. Introduction

This project implements a **Doctor-Patient Appointment Management System** using a cloud-native microservices architecture. The system enables patients to register, doctors to manage their availability, and appointments to be booked and confirmed via automated email notifications. The entire system is designed to replicate real-world healthcare service workflows in a modular, fault-tolerant, and scalable manner.

The primary objective of this project is to demonstrate end-to-end DevOps practices — from source code management and containerization to continuous integration, automated deployment, monitoring, and secrets management — using industry-standard tools.

### 1.1 Objectives

- Design and implement a healthcare system using Spring Boot microservices.
- Containerize all services using Docker and Docker Compose for local testing.
- Set up a CI/CD pipeline using Jenkins triggered by GitHub webhooks.
- Deploy the system to a Kubernetes cluster (Minikube) using Ansible playbooks.
- Monitor system health using Prometheus and Grafana.
- Centralize logs using the ELK Stack (Elasticsearch, Logstash, Kibana) with Filebeat.
- Manage secrets securely using HashiCorp Vault.
- Demonstrate horizontal auto-scaling using Kubernetes HPA.

### 1.2 Technology Stack

| Layer | Technology |
|---|---|
| **Language & Framework** | Java 17, Spring Boot 3.x, Spring Cloud |
| **Service Registry** | Netflix Eureka (Spring Cloud Netflix) |
| **API Gateway** | Spring Cloud Gateway |
| **Containerization** | Docker, Docker Compose |
| **Orchestration** | Kubernetes (Minikube), Kubectl |
| **CI/CD** | Jenkins (Pipeline as Code via Jenkinsfile) |
| **Automation** | Ansible (Playbooks + Roles) |
| **Source Control** | Git, GitHub |
| **Database** | MySQL 5.7 (per-service database) |
| **Message Broker** | RabbitMQ |
| **Monitoring** | Prometheus, Grafana |
| **Logging** | Elasticsearch, Logstash, Kibana (ELK), Filebeat |
| **Secrets Management** | HashiCorp Vault |
| **Container Registry** | Docker Hub (`paragrider1`) |

---

## 2. System Architecture

The system is built on a **microservices architecture** where each service owns its domain and data. Services communicate with each other via REST APIs (synchronously) and via RabbitMQ (asynchronously). All services register themselves with the Eureka Service Registry, and all external traffic is routed through the Spring Cloud API Gateway.

```
                          ┌─────────────────┐
                          │   GitHub Repo   │
                          │ ParagRider1/    │
                          │   Healthcare    │
                          └────────┬────────┘
                                   │ Push / Webhook
                          ┌────────▼────────┐
                          │     Jenkins     │
                          │  CI/CD Pipeline │
                          └────────┬────────┘
                  ┌────────────────┼────────────────┐
                  │                │                │
         ┌────────▼──────┐ ┌───────▼──────┐ ┌─────▼──────────┐
         │  Maven Build  │ │Docker Build  │ │Ansible Deploy  │
         │  (JAR files)  │ │& Push to Hub │ │to Kubernetes   │
         └───────────────┘ └──────────────┘ └────────────────┘

                          ┌─────────────────┐
                          │   Kubernetes    │
                          │   (Minikube)    │
                          └────────┬────────┘
         ┌─────────────────────────┼───────────────────────────┐
         │                         │                           │
┌────────▼──────┐       ┌──────────▼──────────┐    ┌──────────▼─────┐
│ API Gateway   │       │  Microservices       │    │  Infrastructure │
│ :8765         │       │  Patient  :8081      │    │  MySQL   :3306  │
│               │──────►│  Doctor   :8082      │    │  RabbitMQ:5672  │
│               │       │  Appt.    :8083      │    │  Eureka  :8761  │
│               │       │  Notif.   :8085      │    └────────────────┘
└───────────────┘       └──────────────────────┘
                                   │
         ┌─────────────────────────┼───────────────────────────┐
         │                         │                           │
┌────────▼──────┐       ┌──────────▼──────────┐    ┌──────────▼─────┐
│  Prometheus   │       │     ELK Stack        │    │ HashiCorp Vault │
│  + Grafana    │       │  ES + Logstash       │    │  Secrets Mgmt  │
│  Monitoring   │       │  + Kibana + Filebeat │    │                │
└───────────────┘       └──────────────────────┘    └────────────────┘
```

---

## 3. Microservices Design

The system consists of four domain microservices, plus two infrastructure services (Service Registry and API Gateway).

### 3.1 Service Registry (Eureka Server) — Port 8761

The Eureka Server acts as the **service discovery hub**. All microservices register their IP addresses and ports with Eureka on startup. When one service needs to call another, it queries Eureka for the target service's location instead of using hardcoded IP addresses. This enables dynamic scaling and resilience.

### 3.2 API Gateway — Port 8765

The Spring Cloud API Gateway is the **single entry point** for all client requests. It routes requests to the appropriate downstream microservice based on the URL path. It integrates with Eureka for dynamic route resolution and supports load balancing across multiple replicas.

### 3.3 Patient Service — Port 8081

Manages all patient-related CRUD operations.

**Endpoints:**
- `POST /patient/api/patients` — Register a new patient
- `GET /patient/api/patients` — List all patients
- `GET /patient/api/patients/{id}` — Get patient by ID
- `PUT /patient/api/patients/{id}` — Update patient
- `DELETE /patient/api/patients/{id}` — Delete patient

**Database:** `patientdb` (MySQL)

### 3.4 Doctor Service — Port 8082

Handles doctor profile management and availability.

**Endpoints:**
- `POST /doctor/api/doctors` — Register a doctor
- `GET /doctor/api/doctors` — List all doctors
- `GET /doctor/api/doctors/{id}` — Get doctor by ID
- `PUT /doctor/api/doctors/{id}` — Update doctor profile

**Database:** `doctordb` (MySQL)

### 3.5 Appointment Service — Port 8083

Coordinates the booking of appointments between patients and doctors. Uses OpenFeign to call the Patient and Doctor services for validation. Publishes a message to RabbitMQ upon successful booking.

**Endpoints:**
- `POST /appointment/api/appointments` — Book an appointment
- `GET /appointment/api/appointments` — List all appointments
- `GET /appointment/api/appointments/{id}` — Get appointment by ID

**Database:** `appointmentdb` (MySQL)  
**Async:** Publishes to `appointment.exchange` with routing key `appointment.email`

### 3.6 Notification Service — Port 8085

Listens to RabbitMQ queue `appointment.notification.queue` and sends confirmation emails using JavaMailSender configured with Gmail OAuth2. It is a purely event-driven service with no direct REST endpoints for booking.

**Queue:** `appointment.notification.queue`  
**Exchange:** `appointment.exchange`  
**Routing Key:** `appointment.email`

---

## 4. Containerization with Docker

### 4.1 Docker Images

Each microservice has its own `Dockerfile` to build a self-contained, runnable image. All images are published to Docker Hub under the `paragrider1` namespace.

| Service | Docker Hub Image |
|---|---|
| Service Registry | `paragrider1/service-registry` |
| API Gateway | `paragrider1/api-gateway` |
| Patient Service | `paragrider1/patient-service` |
| Doctor Service | `paragrider1/doctor-service` |
| Appointment Service | `paragrider1/appointment-service` |
| Notification Service | `paragrider1/notification-service` |

### 4.2 Docker Compose (Local Testing)

Two Docker Compose files are provided for local testing:

**`docker-compose.yml`** — Runs core microservices:
```yaml
services:
  eureka-server:
    image: paragrider1/service-registry
    ports: ["8761:8761"]

  api-gateway:
    image: paragrider1/api-gateway
    ports: ["8765:8765"]
    depends_on: [eureka-server]

  mysql:
    image: mysql:5.7
    environment:
      MYSQL_ROOT_PASSWORD: admin
    volumes:
      - ./init-db:/docker-entrypoint-initdb.d

  rabbitmq:
    image: rabbitmq:management
    ports: ["15672:15672", "5672:5672"]

  patient-service:
    image: paragrider1/patient-service
    ports: ["8081:8081"]

  # ... doctor, appointment, notification services
```

**`docker-compose-elk.yml`** — Extends the main compose file to add the ELK Stack and Vault:
```yaml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false

  logstash:
    image: docker.elastic.co/logstash/logstash:8.12.0
    volumes: [./logstash/pipeline:/usr/share/logstash/pipeline]

  kibana:
    image: docker.elastic.co/kibana/kibana:8.12.0
    ports: ["5601:5601"]

  vault:
    image: hashicorp/vault:1.15
    command: vault server -dev
    environment:
      - VAULT_DEV_ROOT_TOKEN_ID=root
```

### 4.3 Running Locally

```bash
# Start core services
docker compose up -d

# Start ELK + Vault on top
docker compose -f docker-compose.yml -f docker-compose-elk.yml up -d elasticsearch logstash kibana filebeat vault

# Verify
docker compose ps
```

---

## 5. CI/CD Pipeline with Jenkins

### 5.1 Pipeline Overview

Jenkins is installed locally and configured to trigger automatically via a **GitHub Webhook** on every `git push` to the `main` branch. The pipeline is defined as code in a `Jenkinsfile` at the root of the repository.

**Pipeline Stages:**

| Stage | Description | Duration |
|---|---|---|
| Declarative: Checkout SCM | Jenkins clones the latest code from GitHub | ~2s |
| Checkout | Verifies Git branch and commit | ~1s |
| Build Maven JARs | Compiles Java source for all 6 services with `mvn clean package -DskipTests` | ~1m 9s |
| Run Tests | Executes unit tests for Patient and Doctor services | ~4s |
| Build Docker Images | Builds Docker images for all 6 services | ~20s |
| Push to DockerHub | Pushes all images to `paragrider1/*` on Docker Hub | ~6m 38s |
| Apply K8s Manifests with Ansible | Runs the Ansible playbook to deploy to Kubernetes | ~1m 36s |
| Health Check | Runs `kubectl get pods`, `kubectl get services`, `kubectl get hpa` | ~33s |

### 5.2 Jenkinsfile

```groovy
pipeline {
    agent any
    triggers { githubPush() }

    environment {
        GITHUB_REPO_URL = 'https://github.com/ParagRider1/Healthcare.git'
        EUREKA_DOCKER_IMAGE = 'paragrider1/service-registry'
        GATEWAY_DOCKER_IMAGE = 'paragrider1/api-gateway'
        DOCTOR_DOCKER_IMAGE = 'paragrider1/doctor-service'
        PATIENT_DOCKER_IMAGE = 'paragrider1/patient-service'
        APPOINTMENT_DOCKER_IMAGE = 'paragrider1/appointment-service'
        NOTIFICATION_DOCKER_IMAGE = 'paragrider1/notification-service'
    }

    stages {
        stage('Build Maven JARs') {
            steps {
                script {
                    dir('ServiceRegistry') { sh 'mvn clean package -DskipTests' }
                    dir('ApiGateway')      { sh 'mvn clean package -DskipTests' }
                    dir('DoctorService')   { sh 'mvn clean package -DskipTests' }
                    dir('PatientService')  { sh 'mvn clean package -DskipTests' }
                    // ...
                }
            }
        }
        stage('Build Docker Images') {
            steps {
                script {
                    docker.build("${EUREKA_DOCKER_IMAGE}", './ServiceRegistry/')
                    docker.build("${GATEWAY_DOCKER_IMAGE}", './ApiGateway/')
                    // ... build all 6 images
                }
            }
        }
        stage('Push to DockerHub') {
            steps {
                script {
                    docker.withRegistry('', 'dockerhub-credentials') {
                        docker.image("${EUREKA_DOCKER_IMAGE}").push()
                        // ... push all 6 images
                    }
                }
            }
        }
        stage('Apply Kubernetes Manifests with Ansible') {
            steps {
                ansiblePlaybook(
                    playbook: 'ansible-playbook.yaml',
                    inventory: 'inventory.ini',
                    vaultCredentialsId: 'ansible_vault_pass'
                )
            }
        }
        stage('Health Check') {
            steps {
                sh 'kubectl get pods -o wide'
                sh 'kubectl get hpa'
            }
        }
    }
}
```

### 5.3 Jenkins Configuration

The following credentials are configured in Jenkins (`Manage Jenkins → Credentials`):

- **`dockerhub-credentials`**: Username + Password for `paragrider1` Docker Hub account.
- **`ansible_vault_pass`**: Secret text containing the Ansible Vault password to decrypt `secrets.yml`.

A **GitHub Webhook** is configured in the GitHub repository settings with the Jenkins webhook URL (`http://<public-ip>:8080/github-webhook/`) to trigger builds on every push.

---

## 6. Kubernetes Orchestration

### 6.1 Kubernetes Manifests

The `Kubernetes/` directory contains 17 manifest files that define the complete production deployment:

| File | Resources Defined |
|---|---|
| `pvc.yml` | PersistentVolumeClaim for MySQL data |
| `mysql-config.yml` | ConfigMap with database init scripts |
| `mysql.yml` | MySQL Deployment, Service, PersistentVolume |
| `rabbitmq.yml` | RabbitMQ Deployment + Service (NodePort) |
| `eureka.yml` | Eureka Deployment + Service (NodePort :30061) |
| `gateway.yml` | API Gateway Deployment + Service (NodePort :30065) |
| `patient.yml` | PatientService Deployment + Service + HPA |
| `doctor.yml` | DoctorService Deployment + Service + HPA |
| `appointment.yml` | AppointmentService Deployment + Service + HPA |
| `notification.yml` | NotificationService Deployment + Service + HPA |
| `prometheus.yml` | Prometheus Deployment + ConfigMap + Service |
| `grafana.yml` | Grafana Deployment + Service (NodePort :30030) |
| `elk.yml` | Elasticsearch + Logstash + Kibana Deployments & Services |
| `filebeat.yml` | Filebeat DaemonSet + RBAC roles |
| `vault.yml` | HashiCorp Vault Deployment + Service (NodePort :30820) |
| `healthcare-ingress.yaml` | NGINX Ingress routing all services via `healthcare.local` |

### 6.2 Horizontal Pod Autoscaler (HPA)

All four microservices are configured with Kubernetes HPA using CPU utilization as the scaling metric:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: patientservice-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: patientservice
  minReplicas: 1
  maxReplicas: 2
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50
```

**HPA Configuration Summary:**

| Service | Min Replicas | Max Replicas | CPU Threshold |
|---|---|---|---|
| patientservice-hpa | 1 | 2 | 50% |
| doctorservice-hpa | 1 | 2 | 50% |
| appointment-hpa | 1 | 2 | 50% |
| notification-hpa | 1 | 2 | 50% |

### 6.3 Kubernetes Services

| Service | Type | Port | NodePort |
|---|---|---|---|
| eureka | NodePort | 8761 | 30061 |
| gateway | NodePort | 8765 | 30065 |
| grafana | NodePort | 3000 | 30030 |
| kibana | NodePort | 5601 | 30561 |
| prometheus | NodePort | 9090 | 30090 |
| rabbitmq | NodePort | 15672 | 31672 |
| vault | NodePort | 8200 | 30820 |
| patientservice | ClusterIP | 8081 | — |
| doctorservice | ClusterIP | 8082 | — |
| appointment | ClusterIP | 8083 | — |
| notification | ClusterIP | 8085 | — |

### 6.4 Ingress Configuration

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: healthcare-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  ingressClassName: nginx
  rules:
    - host: healthcare.local
      http:
        paths:
          - path: /patient(/|$)(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: patientservice
                port:
                  number: 8081
          - path: /doctor(/|$)(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: doctorservice
                port:
                  number: 8082
```

---

## 7. Ansible Automation

### 7.1 Ansible Playbook Structure

```yaml
---
- name: Apply Kubernetes manifests using Ansible roles
  hosts: localhost
  remote_user: parag-piprewar
  vars:
    kubeconfig_path: /home/parag-piprewar/.kube/config
  roles:
    - role: envSetup_role
    - role: patient_role
    - role: doctor_role
    - role: appointment_role
    - role: notification_role
    - role: monitoring_role
    - role: elk_role
    - role: vault_role
```

### 7.2 Ansible Roles

| Role | Responsibilities |
|---|---|
| `envSetup_role` | Applies PVC, MySQL ConfigMap, MySQL, Eureka, Gateway, Ingress |
| `patient_role` | Deploys Patient Service |
| `doctor_role` | Deploys Doctor Service |
| `appointment_role` | Deploys Appointment Service |
| `notification_role` | Deploys RabbitMQ + Notification Service |
| `monitoring_role` | Deploys Prometheus + Grafana |
| `elk_role` | Deploys ELK Stack + Filebeat, waits for readiness (300s timeout) |
| `vault_role` | Deploys HashiCorp Vault |

### 7.3 Ansible Vault Encryption

```bash
ansible-vault encrypt secrets.yml
ansible-playbook -i inventory.ini ansible-playbook.yaml --ask-vault-pass
```

In Jenkins, the vault password is stored as credential `ansible_vault_pass` and passed to the Ansible plugin automatically.

---

## 8. Monitoring with Prometheus & Grafana

### 8.1 Prometheus Scrape Configuration

```yaml
scrape_configs:
  - job_name: 'backend monitoring'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets:
          - 'patientservice:8081'
          - 'doctorservice:8082'
          - 'appointment:8083'
          - 'notification:8085'
```

Each service exposes metrics via Spring Boot Actuator:

```yaml
- name: MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE
  value: "prometheus,health,info"
- name: MANAGEMENT_METRICS_EXPORT_PROMETHEUS_ENABLED
  value: "true"
```

### 8.2 Grafana

Grafana is accessible at `http://localhost:3000` (admin/admin). Dashboards track JVM heap, HTTP request latency, thread counts, HikariCP connection pool usage, and RabbitMQ message rates.

---

## 9. Centralized Logging with ELK Stack

### 9.1 Architecture

```
[Microservice Pods] → [Filebeat DaemonSet] → [Logstash :5044] → [Elasticsearch :9200] → [Kibana :5601]
```

### 9.2 Logstash Pipeline

```
input { beats { port => 5044 } }

filter {
  grok {
    match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:log_level} %{DATA:logger} - %{GREEDYDATA:log_message}" }
  }
}

output {
  elasticsearch {
    hosts => ["http://elasticsearch:9200"]
    index => "healthcare-logs-%{+YYYY.MM.dd}"
  }
}
```

### 9.3 Elasticsearch Init Container

To prevent Elasticsearch from crashing due to the `vm.max_map_count` kernel limit:

```yaml
initContainers:
  - name: increase-vm-max-map
    image: busybox
    command: ["sysctl", "-w", "vm.max_map_count=262144"]
    securityContext:
      privileged: true
```

---

## 10. Secrets Management with HashiCorp Vault

### 10.1 Vault in Kubernetes

```yaml
containers:
  - name: vault
    image: hashicorp/vault:1.15
    command: ["vault", "server", "-dev", "-dev-root-token-id=root", "-dev-listen-address=0.0.0.0:8200"]
```

### 10.2 Seeding Secrets

```bash
kubectl port-forward svc/vault 8200:8200 &
export VAULT_ADDR=http://localhost:8200
export VAULT_TOKEN=root

vault kv put secret/healthcare/mysql username=root password=admin
vault kv put secret/healthcare/rabbitmq username=guest password=guest
vault kv get secret/healthcare/mysql
```

---

## 11. Asynchronous Communication with RabbitMQ

AppointmentService publishes to `appointment.exchange` (routing key: `appointment.email`). NotificationService consumes from `appointment.notification.queue` and sends a Gmail OAuth2 confirmation email.

| Configuration | Value |
|---|---|
| Exchange | `appointment.exchange` (Direct) |
| Queue | `appointment.notification.queue` |
| Routing Key | `appointment.email` |
| Management UI | `http://localhost:15672` (guest/guest) |

---

## 12. Results and Screenshots

### 12.1 Jenkins CI/CD Pipeline — Successful Build

Jenkins Build #10 completed successfully in ~10 minutes 32 seconds across all 9 stages.

![Jenkins Pipeline Success](/home/parag-piprewar/Downloads/Healthcare-main/imp_screenshots/Screenshot from 2026-05-14 17-51-01.png)

*Figure 1: Jenkins Pipeline Stage View — Build #10 successful*

![Jenkins Full Stage View](/home/parag-piprewar/Downloads/Healthcare-main/imp_screenshots/Screenshot from 2026-05-14 20-08-03.png)

*Figure 2: Jenkins full pipeline with stage timing details*

### 12.2 Kubernetes HPA

![HPA Output](/home/parag-piprewar/Downloads/Healthcare-main/imp_screenshots/Screenshot from 2026-05-14 17-54-12.png)

*Figure 3: `kubectl get hpa` — all 4 HPAs active at 2%/50% CPU with min=1, max=2*

### 12.3 Kubernetes Services

![K8s Services](/home/parag-piprewar/Downloads/Healthcare-main/imp_screenshots/Screenshot from 2026-05-14 18-20-18.png)

*Figure 4: `kubectl get svc` — all microservices and infrastructure services running*

### 12.4 RabbitMQ Management UI

![RabbitMQ](/home/parag-piprewar/Downloads/Healthcare-main/imp_screenshots/Screenshot from 2026-05-14 19-14-12.png)

*Figure 5: RabbitMQ Management UI — healthy cluster, 1 connection, 1 queue, 1 consumer*

### 12.5 Prometheus Targets

![Prometheus Targets](/home/parag-piprewar/Downloads/Healthcare-main/imp_screenshots/Screenshot from 2026-05-14 19-58-56.png)

*Figure 6: Prometheus — all 4 microservices UP with recent scrape timestamps*

### 12.6 Grafana Dashboard

![Grafana](/home/parag-piprewar/Downloads/Healthcare-main/imp_screenshots/Screenshot from 2026-05-14 19-57-52.png)

*Figure 7: Grafana Explore — real-time time-series metrics from healthcare services*

### 12.7 Eureka Service Registry

![Eureka](/home/parag-piprewar/Downloads/Healthcare-main/imp_screenshots/Screenshot from 2026-05-14 20-07-00.png)

*Figure 8: Spring Eureka Dashboard — APIGATEWAY, APPOINTMENTSERVICE, DOCTORSERVICE, NOTIFICATIONSERVICE, PATIENTSERVICE all UP*

---

## 13. Conclusion

This project successfully demonstrates a complete end-to-end DevOps pipeline for a production-grade healthcare microservices application.

| Criteria | Status | Details |
|---|---|---|
| Git + GitHub | ✅ | ParagRider1/Healthcare, incremental commits |
| Jenkins CI/CD + GitHub Webhook | ✅ | 9-stage pipeline, Build #10 success (~10m 32s) |
| Docker + Docker Compose | ✅ | 6 services containerized, published to paragrider1 |
| Ansible Playbooks + 8 Roles | ✅ | Modular roles, ansible-vault encryption |
| Kubernetes + Ingress | ✅ | 17 manifests, NGINX ingress, NodePort services |
| HPA Auto-scaling | ✅ | CPU-based scaling on all 4 microservices |
| Prometheus + Grafana | ✅ | All 4 targets UP, real-time dashboards |
| ELK Centralized Logging | ✅ | Filebeat → Logstash → Elasticsearch → Kibana |
| HashiCorp Vault | ✅ | Deployed in Kubernetes, secrets seeded |
| RabbitMQ Async Messaging | ✅ | Appointment → Notification email flow |

### Key Learnings

1. **Resource Planning**: A full DevOps stack (ELK + 6 Spring Boot apps + databases) in Minikube requires careful CPU and memory limit tuning per container.
2. **Ansible Roles**: Modular role structure makes automation easily maintainable and independently testable.
3. **GitOps Principle**: Storing infrastructure-as-code alongside application code enables reproducible, auditable deployments.
4. **Observability**: The combination of Prometheus + Grafana + ELK Stack provides complete 360-degree visibility — metrics, logs, and events.

---

**GitHub Repository:** https://github.com/ParagRider1/Healthcare
**Docker Hub:** https://hub.docker.com/u/paragrider1

*Report by: **MT2025083 Parag Piprewar** & **MT2025098 Raghav Goyal***
*International Institute of Information Technology, Bangalore — May 2026*
