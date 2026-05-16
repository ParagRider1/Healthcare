# Doctor-Patient Appointment Management System

This project is a robust and scalable **doctor-patient appointment booking system** architected using **Spring Boot microservices** and deployed using a full **DevOps CI/CD pipeline**. It enables seamless patient-doctor interactions through an efficient appointment booking interface, real-time email notifications, and service observability. This system is designed to replicate real-world healthcare service needs in a modular, fault-tolerant, and scalable manner.

Each microservice is deployed independently using **Docker containers** and orchestrated through **Kubernetes**, while **RabbitMQ** handles asynchronous messaging and **MySQL** manages persistent data. Services communicate securely and efficiently through **REST APIs** and a centralized **Spring Cloud Gateway**. All microservices are registered with **Eureka Server** for service discovery and intercommunication.

The CI/CD pipeline is powered by **Jenkins**, which triggers on GitHub pushes to build Docker images and deploy them via **Ansible playbooks** into a Kubernetes cluster. **Prometheus** and **Grafana** are integrated for system health monitoring, while logs are centrally collected and visualized using the **ELK stack (Elasticsearch, Logstash, Kibana)**.

This system covers everything from patient and doctor registration to appointment scheduling and automated email notifications, demonstrating full-stack engineering using modern cloud-native and DevOps technologies.

---

## Microservices

- **Patient Service** – Handles CRUD operations for patient profiles.
- **Doctor Service** – Manages doctor data and availability.
- **Appointment Service** – Coordinates appointments between doctors and patients.
- **Notification Service** – Sends out confirmation emails using Gmail and OAuth2.
- **Frontend Dashboard** – Next.js React UI for managing the entire hospital system.

---

## Tech Stack

- **Frontend**: Next.js, React, Vanilla CSS (Glassmorphism UI)
- **Backend**: Java 17, Spring Boot, Spring Cloud
- **Containerization**: Docker, Docker Compose
- **Orchestration**: Kubernetes with Deployments, Services, Ingress, ConfigMaps
- **Monitoring**: Prometheus for scraping, Grafana for visualization
- **CI/CD**: Jenkins + GitHub Webhook + Ansible for K8s deployment
- **Database**: MySQL (each service has its own DB)
- **Broker**: RabbitMQ for asynchronous messaging

---

## CI/CD Workflow

1. **Code Commit** – Developer pushes code to GitHub.
2. **Jenkins Trigger** – Webhook initiates Jenkins build.
3. **Docker Build** – Jenkins builds Docker images and pushes to Docker Hub.
4. **Ansible Deploy** – Ansible playbook deploys YAML files to Kubernetes.
5. **Monitoring Active** – Metrics collected by Prometheus, visualized on Grafana.

---

## Asynchronous Flow

- **AppointmentService** publishes messages to RabbitMQ.
- **NotificationService** listens to `appointment.notification.queue`.
- Messages are routed via `appointment.exchange` with `appointment.email` routing key.
- Upon receiving, an email is sent with JavaMailSender configured via OAuth2.
- <img width="1786" height="1044" alt="Screenshot from 2026-05-14 19-14-12" src="https://github.com/user-attachments/assets/b6b88fe3-e58c-4c36-8ce7-cafc2363efe9" />



---

## Kubernetes Components

- `Deployment` for each microservice
- `ClusterIP`/`NodePort` services for internal/external access
- `Ingress` routes for URL-based routing
- `Secrets` and `ConfigMaps` for secure configuration
- `RabbitMQ`, `MySQL`, and monitoring tools run in dedicated pods
- <img width="1797" height="875" alt="kubernetes services image " src="https://github.com/user-attachments/assets/ffdfd918-13fc-4f5b-9eb3-1de94b22d2f0" />



---

## Monitoring & Logs

### 🔍 Prometheus + Grafana
- Scrapes actuator metrics from each service
- Tracks heap memory, thread count, HTTP response times, etc.
- <img width="1752" height="898" alt="grafa2" src="https://github.com/user-attachments/assets/b1cc3ef1-9e8e-4969-9011-017db851e77d" />


- <img width="1725" height="912" alt="grafa" src="https://github.com/user-attachments/assets/8ce9078a-94ed-4275-8cb6-dab07693080c" />

- <img width="1786" height="1044" alt="Screenshot from 2026-05-14 19-58-56" src="https://github.com/user-attachments/assets/6f173d36-d4ea-473f-a179-7247d0dc4fd4" />


##Eureka
<img width="1786" height="1044" alt="Screenshot from 2026-05-14 20-07-00" src="https://github.com/user-attachments/assets/166b0def-0cc8-4108-a89e-c7fb17716255" />




##Jenkins Pipeline
<img width="1786" height="1044" alt="Screenshot from 2026-05-14 20-08-57" src="https://github.com/user-attachments/assets/ae7257ab-722c-479f-9d94-01a633890623" />

---





## External Links

- **DockerHub (All Services)**  
  👉 [https://hub.docker.com/u/paragrider1](https://hub.docker.com/u/paragrider1)


