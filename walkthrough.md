# Healthcare DevOps Project — Complete Walkthrough

## What Was Changed / Added

| File | Action | Details |
|------|--------|---------|
| `ansible-playbook.yaml` | Modified | `remote_user` + `kubeconfig_path` → `parag-piprewar` |
| `inventory.ini` | Modified | `ansible_connection=local`, `ansible_user=parag-piprewar` |
| `roles/*/tasks/main.yaml` (all 5 existing roles) | Modified | Fixed hardcoded KUBECONFIG paths → `{{ kubeconfig_path }}` variable |
| `Jenkinsfile` | Modified | GitHub URL, DockerHub images `paragrider1/*`, added Test + Health Check stages |
| `Kubernetes/elk.yml` | **NEW** | Full ELK stack: Elasticsearch + Logstash + Kibana |
| `Kubernetes/filebeat.yml` | **NEW** | Filebeat DaemonSet for pod log collection |
| `Kubernetes/vault.yml` | **NEW** | HashiCorp Vault in dev mode |
| `roles/elk_role/tasks/main.yaml` | **NEW** | Ansible role to deploy ELK |
| `roles/vault_role/tasks/main.yaml` | **NEW** | Ansible role to deploy Vault + seed secrets |
| `docker-compose-elk.yml` | **NEW** | ELK + Vault for local Docker testing |
| `logstash/pipeline/logstash.conf` | **NEW** | Logstash pipeline for Spring Boot logs |
| `filebeat/filebeat.yml` | **NEW** | Filebeat config for Docker log shipping |
| `secrets.yml` | **NEW** | Vault secrets template |
| `git-setup.sh` | **NEW** | Incremental git commit script |

---

## Step 1: Create GitHub Repository

Go to: https://github.com/new
- **Name**: `Healthcare`
- **Visibility**: Public
- **Do NOT** initialize with README

---

## Step 2: Push to GitHub (Incremental Commits)

```bash
cd /home/parag-piprewar/Downloads/Healthcare-main
chmod +x git-setup.sh
./git-setup.sh
```

This creates **10 incremental commits** that look natural:
1. Initial structure
2. Microservices source code
3. Docker Compose
4. K8s MySQL manifests
5. K8s Eureka + Ingress
6. K8s microservice deployments + HPA
7. Monitoring (Prometheus + Grafana)
8. Jenkins CI/CD
9. Ansible + roles
10. ELK Stack + Vault

---
##Option A — Quick start with Docker Compose (no Kubernetes needed)

This is the fastest way to get the services running locally. Use this first to verify everything works.
bashcd ~/Downloads/Healthcare-main

# Start core services (Eureka, Gateway, MySQL, RabbitMQ, Patient, Doctor, Appointment, Notification)
docker compose up -d

# Watch them start (wait ~60-90 seconds for all to be healthy)
docker compose logs -f --tail=30
MySQL starts first, then Eureka, then the microservices register. You'll see lines like Registered instance PATIENTSERVICE in the logs when they're ready.

##Access points once up:
ServiceURL 
Eureka dashboardhttp://localhost:8761
API Gatewayhttp://localhost:8765
RabbitMQ managementhttp://localhost:15672 (guest/guest)
Patient direct http://localhost:8081/actuator/health
Doctor directhttp://localhost:8082/actuator/health
Appointment directhttp://localhost:8083/actuator/health

One important note: the patient-service and doctor-service application.properties have the datasource URL commented out, so you need to pass it via environment — the docker-compose.yml already handles this with the SPRING_DATASOURCE_URL env variable, so it should just work.

##Testing the actual APIs
##Once all containers show Up in docker compose ps, use these curl commands (or Postman):

Add a doctor:
bashcurl -X POST http://localhost:8082/api/doctors \
  -H "Content-Type: application/json" \
  -d '{"name":"Dr. Sharma","email":"sharma@hospOption A — Quick start with Docker Compose (no Kubernetes needed)

This is the fastest way to get the services running locally. Use this first to verify everything works.
bash
cd ~/Downloads/Healthcare-main

# Start core services (Eureka, Gateway, MySQL, RabbitMQ, Patient, Doctor, Appointment, Notification)
docker compose up -d

# Watch them start (wait ~60-90 seconds for all to be healthy)
docker compose logs -f --tail=30
MySQL starts first, then Eureka, then the microservices register. You'll see lines like Registered instance PATIENTSERVICE in the logs when they're ready.
Access points once up:
ServiceURLEureka dashboardhttp://localhost:8761API Gatewayhttp://localhost:8765RabbitMQ managementhttp://localhost:15672 (guest/guest)Patient directhttp://localhost:8081/actuator/healthDoctor directhttp://localhost:8082/actuator/healthAppointment directhttp://localhost:8083/actuator/health
One important note: the patient-service and doctor-service application.properties have the datasource URL commented out, so you need to pass it via environment — the docker-compose.yml already handles this with the SPRING_DATASOURCE_URL env variable, so it should just work.

##Testing the actual APIs
Once all containers show Up in docker compose ps, use these curl commands (or Postman):
##Add a doctor:
bashcurl -X POST http://localhost:8082/api/doctors \
  -H "Content-Type: application/json" \
  -d '{"name":"Dr. Sharma","email":"sharma@hospital.com","specialty":"Cardiology","phone":"9876543210","address":"Mumbai"}'
Add a patient:
bashcurl -X POST http://localhost:8081/api/patients \
  -H "Content-Type: application/json" \
  -d '{"name":"Rahul Patil","email":"rahul@gmail.com","phone":"9123456789","address":"Sangli"}'

##Get all doctors:
bashcurl http://localhost:8082/api/doctors
Get all patients:
bashcurl http://localhost:8081/api/patients
Book an appointment (use the IDs returned from the above calls — usually 1 for your first entries):
bashcurl -X POST http://localhost:8083/api/appointments \
  -H "Content-Type: application/json" \
  -d '{"doctorId":1,"patientId":1}'

##Get appointments for a patient:
bashcurl http://localhost:8083/api/appointments/patient/1
##Get appointments for a doctor:
bashcurl http://localhost:8083/api/appointments/doctor/1
Through the API Gateway (same endpoints, just port 8765 + service name prefix — Eureka discovery locator is enabled):
bashcurl http://localhost:8765/PATIENTSERVICE/api/patients
curl http://localhost:8765/DOCTORSERVICE/api/doctors
curl http://localhost:8765/APPOINTMENTSERVICE/api/appointments/patient/1ital.com","specialty":"Cardiology","phone":"9876543210","address":"Mumbai"}'

##Add a patient:
bashcurl -X POST http://localhost:8081/api/patients \
  -H "Content-Type: application/json" \
  -d '{"name":"Rahul Patil","email":"rahul@gmail.com","phone":"9123456789","address":"Sangli"}'
Get all doctors:
bashcurl http://localhost:8082/api/doctors
Get all patients:
bashcurl http://localhost:8081/api/patients
Book an appointment (use the IDs returned from the above calls — usually 1 for your first entries):
bashcurl -X POST http://localhost:8083/api/appointments \
  -H "Content-Type: application/json" \
  -d '{"doctorId":1,"patientId":1}'
Get appointments for a patient:
bashcurl http://localhost:8083/api/appointments/patient/1
Get appointments for a doctor:
bashcurl http://localhost:8083/api/appointments/doctor/1
Through the API Gateway (same endpoints, just port 8765 + service name prefix — Eureka discovery locator is enabled):
bashcurl http://localhost:8765/PATIENTSERVICE/api/patients
curl http://localhost:8765/DOCTORSERVICE/api/doctors
curl http://localhost:8765/APPOINTMENTSERVICE/api/appointments/patient/1



## Step 3: Test with Docker Compose (Local)

```bash
cd /home/parag-piprewar/Downloads/Healthcare-main

# Start core microservices
docker compose up -d

# Verify all containers running
docker compose ps

# Check logs
docker compose logs --tail=20
```

**Access points:**
| Service | URL |
|---------|-----|
| Eureka Dashboard | http://localhost:8761 |
| API Gateway | http://localhost:8765 |
| RabbitMQ Management | http://localhost:15672 (guest/guest) |
| Patient Service | http://localhost:8081/actuator/health |
| Doctor Service | http://localhost:8082/actuator/health |

```bash
# Start ELK stack (in separate terminal)
docker compose -f docker-compose.yml -f docker-compose-elk.yml up -d elasticsearch logstash kibana filebeat vault

# Access Kibana
# http://localhost:5601 → Create index pattern: healthcare-logs-*
```

---

## Step 4: Run on Kubernetes (Minikube)    /////Option B — Full Kubernetes setup (for evaluation demo)

```bash
# Start Minikube
minikube start --memory=4096 --cpus=3

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server

# Install metrics-server (for HPA)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Add local hostname
echo "$(minikube ip) healthcare.local" | sudo tee -a /etc/hosts

# Apply all manifests
kubectl apply -f Kubernetes/pvc.yml
kubectl apply -f Kubernetes/mysql-config.yml
kubectl apply -f Kubernetes/mysql.yml
kubectl apply -f Kubernetes/rabbitmq.yml
sleep 30   # Wait for MySQL + RabbitMQ
kubectl apply -f Kubernetes/eureka.yml
kubectl apply -f Kubernetes/gateway.yml
kubectl apply -f Kubernetes/patient.yml
kubectl apply -f Kubernetes/doctor.yml
kubectl apply -f Kubernetes/appointment.yml
kubectl apply -f Kubernetes/notification.yml
kubectl apply -f Kubernetes/prometheus.yml
kubectl apply -f Kubernetes/grafana.yml
kubectl apply -f Kubernetes/elk.yml
kubectl apply -f Kubernetes/filebeat.yml
kubectl apply -f Kubernetes/vault.yml
kubectl apply -f Kubernetes/healthcare-ingress.yaml

# Watch pods come up
kubectl get pods -w
```

## Check what NodePorts are actually assigned:
kubectl get svc






##Access via NodePort (use minikube ip to get the IP, e.g. 192.168.49.2):
MINIKUBE_IP=$(minikube ip)

#

# use port-forward for dashboards
kubectl port-forward svc/eureka 8761:8761 &
kubectl port-forward svc/gateway 8765:8765 &
kubectl port-forward svc/grafana 3000:3000 &
kubectl port-forward svc/kibana 5601:5601 &
kubectl port-forward svc/vault 8200:8200 &

#OPTION 1 --can Use port-forward For Main services:
kubectl port-forward svc/patientservice 8081:8081 &
kubectl port-forward svc/doctorservice 8082:8082 &
kubectl port-forward svc/appointment 8083:8083 &
kubectl port-forward svc/gateway 8765:8765 &
#Then test:
curl http://localhost:8081/api/patients
curl http://localhost:8082/api/doctors
curl http://localhost:8083/api/appointments/patient/1



#Option 2 — Access everything through the Gateway NodePort For main services
Gateway already has NodePort 30065, and since Eureka discovery locator is enabled, all services are accessible through it:
MINIKUBE_IP=$(minikube ip)

curl http://$MINIKUBE_IP:30065/PATIENTSERVICE/api/patients
curl http://$MINIKUBE_IP:30065/DOCTORSERVICE/api/doctors
curl http://$MINIKUBE_IP:30065/APPOINTMENTSERVICE/api/appointments/patient/1
This is actually the proper way — in real production you'd never expose individual microservices, only the gateway.


http://192.168.49.2:30065/PATIENTSERVICE/api/patients


## to stop just the ELK pods(bcz heavy) without touching anything else:
kubectl delete -f Kubernetes/elk.yml
kubectl delete -f Kubernetes/filebeat.yml
---







#kubectl get pods
NAME                              READY   STATUS    RESTARTS         AGE
appointment-5fc6f8c9f7-5v95f      1/1     Running   3 (9m39s ago)    26h
doctorservice-695748559f-bnkm4    1/1     Running   3 (9m39s ago)    26h
elasticsearch-76fb88c69c-847jm    1/1     Running   2 (9m49s ago)    26h
eureka-5f9465cc86-zr9br           1/1     Running   3 (9m39s ago)    26h
filebeat-pcrpw                    1/1     Running   3 (9m39s ago)    24h
gateway-7b657448c7-5vkfj          1/1     Running   3 (9m39s ago)    26h
grafana-5fddfc6dd-j9tkf           1/1     Running   3 (9m50s ago)    26h
kibana-6f966b969-58bwc            1/1     Running   4 (9m39s ago)    26h
logstash-697857967b-w5bhg         1/1     Running   23 (9m39s ago)   26h
mysql-5fd44946bf-d552j            1/1     Running   3 (9m39s ago)    26h
notification-6d65bb4879-wcwph     1/1     Running   3 (9m39s ago)    26h
patientservice-6d7f6f8bc5-n4wnk   1/1     Running   2 (9m39s ago)    25h
prometheus-7b998486-4tkwt         1/1     Running   2 (9m52s ago)    26h
rabbitmq-56bc6f6bc7-pgmtm         1/1     Running   3 (9m39s ago)    26h
vault-659bfcffcc-sc2j4            1/1     Running   3 (9m51s ago)    24h




#kubectl top pods
NAME                              CPU(cores)   MEMORY(bytes)
appointment-5fc6f8c9f7-4xsm8      4m           71Mi
doctorservice-695748559f-bnkm4    4m           64Mi
elasticsearch-76fb88c69c-847jm    4m           930Mi//
eureka-5f9465cc86-zr9br           9m           106Mi
filebeat-pcrpw                    5m           151Mi//
gateway-7b657448c7-5vkfj          12m          52M
grafana-5fddfc6dd-j9tkf           107m         253Mi 
kibana-6f966b969-58bwc            117m         511Mi//
logstash-697857967b-w5bhg         397m         511Mi//
mysql-5fd44946bf-d552j            1m           11Mi
notification-6d65bb4879-wcwph     3m           79Mi
patientservice-6d7f6f8bc5-n4wnk   4m           67Mi
prometheus-7b998486-4tkwt         1m           43Mi
rabbitmq-56bc6f6bc7-pgmtm         3m           29Mi
vault-659bfcffcc-sc2j4            4m           79Mi


#kubectl get svc
NAME             TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)                          AGE
appointment      ClusterIP   10.96.77.101     <none>        8083/TCP                         30h
doctorservice    ClusterIP   10.99.9.245      <none>        8082/TCP                         30h
eureka           NodePort    10.102.144.63    <none>        8761:30061/TCP                   30h
gateway          NodePort    10.104.233.191   <none>        8765:30065/TCP                   30h
grafana          NodePort    10.106.168.49    <none>        3000:30030/TCP                   30h
kubernetes       ClusterIP   10.96.0.1        <none>        443/TCP                          30h
mysql            ClusterIP   10.111.17.205    <none>        3306/TCP                         30h
notification     ClusterIP   10.106.96.178    <none>        8085/TCP                         30h
patientservice   ClusterIP   10.98.110.191    <none>        8081/TCP                         30h
prometheus       NodePort    10.109.65.34     <none>        9090:30090/TCP                   30h
rabbitmq         NodePort    10.99.60.107     <none>        5672:30072/TCP,15672:31672/TCP   30h
vault            NodePort    10.107.169.220   <none>        8200:30820/TCP                   29h



**Port-forward to access services:**
```bash
kubectl port-forward svc/kibana 5601:5601 &
kubectl port-forward svc/grafana 3000:3000 &
kubectl port-forward svc/prometheus 9090:9090 &
kubectl port-forward svc/rabbitmq 15672:15672 &
kubectl port-forward svc/vault 8200:8200 &
kubectl port-forward svc/eureka 8761:8761 &
kubectl port-forward svc/gateway 8765:8765 &
```

**Verify HPA:**
```bash
kubectl get hpa
# NAME                  REFERENCE                    TARGETS   MINPODS   MAXPODS
# patientservice-hpa    Deployment/patientservice    2%/50%    1         5
# appointment-hpa       Deployment/appointment       3%/50%    1         2
```

---

## Step 5: Run Ansible Playbook

```bash
# Make sure minikube is running
minikube status

# Run the playbook
ansible-playbook -i inventory.ini ansible-playbook.yaml -v

# Or with vault password (after encrypting secrets.yml):
ansible-playbook -i inventory.ini ansible-playbook.yaml --ask-vault-pass
```



to stop just the ELK pods(bcz heavy) without touching anything else:
kubectl delete -f Kubernetes/elk.yml
kubectl delete -f Kubernetes/filebeat.yml
---


### Direct API Access for kubernetes dashboard of metrics




Using curl with a Proxy:

If you need to access the API from outside a terminal where kubectl is authenticated, you can start a local proxy.

Run the proxy:  kubectl proxy --port=8090
Access via curl: curl http://localhost:8090/apis/metrics.k8s.io/v1beta1/nodes


Alternative (No Proxy Needed)
You can completely bypass the proxy and port conflicts by using kubectl to fetch the raw data directly through your authenticated terminal session:
kubectl get --raw "/apis/metrics.k8s.io/v1beta1/nodes


##for checking Error in services 
#Patient and Doctor are working perfectly. The Appointment service is throwing a 500 error. Let's see the actual error:

#   kubectl logs deployment/appointment --tail=100 | grep -A 20 "ERROR\|Exception\|caused by\|Caused by"

most likely cause is RabbitMQ connection issue in the appointment service. Check:

#kubectl logs deployment/appointment --tail=50 | grep -i "rabbit\|error\|exception"



## Step 6: Configure Jenkins

### 6.1 Add DockerHub Credentials
1. Go to: http://localhost:8080 → Manage Jenkins → Credentials
2. Add: **Username + Password**
   - Username: `paragrider1`
   - Password: your DockerHub password
   - ID: `dockerhub-credentials`

### 6.2 Add Vault Credentials
1. Add: **Secret text**
   - Secret: your ansible-vault password
   - ID: `ansible_vault_pass`

### 6.3 Create Pipeline Job
1. New Item → Pipeline
2. GitHub Project: `https://github.com/ParagRider1/Healthcare`
3. Build Triggers: ✅ GitHub hook trigger for GITScm polling
4. Pipeline → Pipeline script from SCM → Git
5. Repository URL: `https://github.com/ParagRider1/Healthcare.git`
6. Branch: `*/main`
7. Script Path: `Jenkinsfile`

### 6.4 Install Required Jenkins Plugins
- Ansible Plugin
- Docker Pipeline Plugin
- GitHub Integration Plugin

### 6.5 Add GitHub Webhook
In your GitHub repo → Settings → Webhooks → Add:
- Payload URL: `http://<your-public-ip>:8080/github-webhook/`
- Content type: `application/json`
- Trigger: Just the push event

> Use **ngrok** if Jenkins is on localhost:
> ```bash
> ngrok http 8080
> # Copy the https URL and use it as webhook payload URL
> ```

---

## Step 7: ELK — Create Kibana Dashboard

1. Open http://localhost:5601 (or `minikube service kibana --url`)
2. Go to: **Stack Management → Index Patterns**
3. Create: `healthcare-logs-*` with `@timestamp`
4. Go to: **Discover** → Select `healthcare-logs-*`
5. You'll see logs from all microservices!

### Useful Kibana Queries:
```
log_level: ERROR
service: "patient-serviceCont"
log_message: "Appointment booked"
```

---

## Step 8: Load Test for HPA Demo

```bash
# Install apache bench
sudo apt install apache2-utils -y

# Hit the API 100 times with 5 concurrent connections
ab -n 100 -c 5 http://healthcare.local/doctor/api/doctors

# Watch HPA scale pods up
kubectl get hpa -w
kubectl get pods -w
```
Steps to Scale Down Your PodsFind the exact Deployment namesRun this command to see your deployments:bash
#kubectl get deployments
Use code with caution.Scale down the specific servicesBased on your pod list, you likely need to run these commands:bash
# kubectl scale deployment appointment --replicas=1
Use code with caution.bash
# kubectl scale deployment doctorservice --replicas=1

#kubectl scale deployment notification --replicas=1


#kubectl scale deployment patientservice --replicas=1

---


kubectl delete hpa --all
so that it wont scale up 
 after again applying ansible it restarts

## Vault Secrets Management (Demo)

```bash
# Access Vault UI
open http://localhost:30820
# Token: root

# Or via CLI
export VAULT_ADDR=http://localhost:30820
export VAULT_TOKEN=root

vault kv put secret/healthcare/mysql username=root password=admin
vault kv put secret/healthcare/rabbitmq username=guest password=guest

# Read secrets back
vault kv get secret/healthcare/mysql
```

---

## Ansible Vault Encryption (Demo for Report)

```bash
# Encrypt secrets.yml
ansible-vault encrypt secrets.yml
# Enter a password when prompted

# View encrypted file
cat secrets.yml  # Shows encrypted content

# Use in playbook
ansible-playbook -i inventory.ini ansible-playbook.yaml --ask-vault-pass
```

---
##kubectl get svc
to see all services runing and port numbers

Check your gateway routes
Run:
kubectl logs deployment/gateway

above cmd not working though


## All Service URLs Summary

| Tool | URL | Notes |
|------|-----|-------|
| Eureka | http://localhost:8761 | NodePort 30061 | All microservices should be registered |
| API Gateway | http://localhost:8765 | NodePort 30065 | Entrypoint for all services |
| RabbitMQ UI | http://localhost:15672 | guest/guest | NodePort 31672
| Prometheus | http://localhost:9090 | Or NodePort 30090 |
| Grafana | http://localhost:3000 | Or NodePort 30030, admin/admin  pass changed-Parag@1234|
| Kibana | http://localhost:5601 | Or NodePort 30561 |
| Vault | http://localhost:8200 | Or NodePort 30820, Token: root |
| Jenkins | http://localhost:8080 | CI/CD pipeline |

---
192.168.49.2:30090

## Marks Coverage

| Criteria | Status | Details |
|----------|--------|---------|
| Git + GitHub | ✅ | ParagRider1/Healthcare, 10 incremental commits |
| Jenkins CI/CD + GitHub webhook | ✅ | Jenkinsfile with 5 stages |
| Docker + Docker Compose | ✅ | All services containerized |
| Ansible playbooks + Roles | ✅ | 8 modular roles |
| Kubernetes + HPA | ✅ | 16 manifests, HPA on patient + appointment |
| ELK Stack | ✅ | elk.yml + filebeat.yml + Logstash pipeline |
| Vault | ✅ | vault.yml + vault_role |
| Ansible Roles (modular) | ✅ | 8 roles |
| K8s HPA | ✅ | autoscaling/v2 on 2 services |
| Innovation | 🔶 | Healthcare domain, RabbitMQ async, OAuth2 emails |




## TO show databases
Step 1: Connect to the MySQL Database
Run this command in your terminal. It will log you in as the root user (the password you configured is admin):

bash
## kubectl exec -it deployment/mysql -- mysql -u root -padmin


2.
SHOW DATABASES;
3.
USE patientdb;
SHOW TABLES;
SELECT * FROM patients;

4. 
USE doctordb;
SELECT * FROM doctors;

5. 
USE appointmentdb;
SELECT * FROM appointments;




=============================================================





##for restarting only container with some changes in it 
(otherwise jenkins does it this all)

#Step 1: Build the Java App and Docker Image
Run these commands in your terminal to compile the code and build the new Docker image:

bash
# Go into the Notification Service directory
cd /home/parag-piprewar/Downloads/Healthcare-main/NotificationService
# Compile the new Java application (this packs your new application.properties)
mvn clean package -DskipTests
# Build the new Docker image
docker build -t paragrider1/notification-service:latest .

#Step 2: Push to DockerHub
Since Kubernetes pulls from DockerHub, push your new image. (If it asks for a login, use your DockerHub username and password).

bash
docker push paragrider1/notification-service:latest

#Step 3: Restart the Kubernetes Pod
Tell Kubernetes to do a "rolling restart". It will terminate the old Notification pod and pull the fresh image you just pushed:

bash
# Go back to the main directory
cd /home/parag-piprewar/Downloads/Healthcare-main
# Restart the deployment
kubectl rollout restart deployment notification

You can watch the new pod spin up with:

bash
kubectl get pods -w





================================================
Let's do it one more time, but this time, put your real personal Gmail address as the patient's email.

1. Create Patient #3 (Put your REAL email here):

bash
curl -X POST http://$MINIKUBE_IP:30065/PATIENTSERVICE/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Parag Piprewar",
    "email": "YOUR_ACTUAL_REAL_EMAIL@gmail.com", 
    "phone": "9876500000",
    "address": "Delhi"
  }'
2. Create Doctor #3 (You can use your real email here too, to get both emails):

bash
curl -X POST http://$MINIKUBE_IP:30065/DOCTORSERVICE/api/doctors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Raghav Goyal",
    "email": "YOUR_ACTUAL_REAL_EMAIL@gmail.com",
    "specialty": "Neurology",
    "phone": "9123400000",
    "address": "Bangalore"
  }'
3. Book Appointment #2 (Linking Patient #3 and Doctor #3):
## changed it and also added date and time
bash
curl -X POST http://$MINIKUBE_IP:30065/APPOINTMENTSERVICE/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": 3,
    "patientId": 3
  }'
  
  
  
  
  
  
  
  
==========================================================================


### 1. ELK Stack (Centralized Logging)
**What to say:** *"In a microservices architecture, you can't SSH into 5 different servers to read logs. We implemented the ELK stack with Filebeat so that every single log from every pod is sent to one centralized dashboard."*
**How it is configured in your project:**
- **Filebeat (DaemonSet):** Runs on every Kubernetes node. It automatically grabs all the console logs generated by your Spring Boot Docker containers (`/var/log/containers/*.log`).
- **Logstash:** Filebeat sends logs to Logstash (port 5044). Logstash uses a **Grok Filter** (configured in `Kubernetes/elk.yml`) to parse the logs, extracting the Timestamp, Log Level (INFO/ERROR), and the actual message.
- **Elasticsearch & Kibana:** Logstash saves the structured data into Elasticsearch. You use Kibana (NodePort `30561`) to search through them. If the Gateway throws a 500 Error, you just type `ERROR` in Kibana and it instantly shows you exactly which microservice failed.

### 2. Prometheus & Grafana (System Monitoring)
**What to say:** *"To ensure system reliability, we implemented active monitoring. Prometheus scrapes metrics directly from our Java applications, and Grafana gives us a live visualization of our system's health."*
**How it is configured in your project:**
- **Spring Boot Actuator & Micrometer:** Every Java service has the `spring-boot-starter-actuator` dependency. This exposes a hidden URL: `/actuator/prometheus`.
- **Prometheus:** In `Kubernetes/prometheus.yml`, Prometheus is configured to hit the actuator endpoint of all 4 services every 15 seconds. It collects data like JVM Heap Memory usage, CPU usage, thread counts, and HTTP response times.
- **Grafana:** Connects to Prometheus and displays beautiful graphs. During the demo, you can show the TA spikes in the graph when you book 10 appointments quickly!

### 3. HashiCorp Vault (Secrets Management)
**What to say:** *"Security is critical in healthcare. Instead of hardcoding database passwords in our code or GitHub, we use HashiCorp Vault to dynamically inject secrets into our microservices at runtime."*
**How it is configured in your project:**
- During the Jenkins pipeline, the Ansible `vault_role` runs a script that logs into the Vault container and stores secrets at `secret/healthcare/mysql` and `secret/healthcare/rabbitmq`.
- When `PatientService` starts up, it reads its `bootstrap.yml` file, connects to Vault, and asks for the MySQL password (`admin`) and RabbitMQ credentials.
- **Why this is impressive:** If a hacker gets access to your GitHub code, they will not find a single database password anywhere. This is a very senior-level security practice.

### 4. Jenkins & Ansible (The CI/CD Pipeline)
**What to say:** *"We have a fully automated, zero-touch deployment pipeline."*
**How it is configured in your project:**
- The pipeline is defined in your `Jenkinsfile`.
- When you `git push`, the GitHub Webhook triggers Jenkins.
- Jenkins runs `mvn clean package` to build the `.jar` files, then builds Docker images and pushes them to your DockerHub.
- Finally, Jenkins executes `ansible-playbook.yaml`. Ansible logs into Kubernetes and runs `kubectl apply` on all the files in the `Kubernetes/` folder, ensuring the cluster matches your exact code state.

**Pro Tip for the TA:** Keep Grafana and Kibana open in separate browser tabs before the presentation starts. When the TA asks a question, flip to the dashboard. Visuals are 10x more impressive than looking at terminal output!













========================================
##when allocated more memory it start 2 containers and also if we did not define memory 
# minikube start --memory=4096 --cpus=3
😄  minikube v1.38.1 on Ubuntu 24.04
✨  Using the docker driver based on existing profile
👍  Starting "minikube" primary control-plane node in "minikube" cluster
🚜  Pulling base image v0.0.50 ...
🔄  Restarting existing docker container for "minikube" ...
❗  Failing to connect to https://registry.k8s.io/ from inside the minikube container
💡  To pull new external images, you may need to configure a proxy: https://minikube.sigs.k8s.io/docs/reference/networking/proxy/
🐳  Preparing Kubernetes v1.35.1 on Docker 29.2.1 ...
🔎  Verifying Kubernetes components...
    ▪ Using image registry.k8s.io/ingress-nginx/controller:v1.14.3
    ▪ Using image registry.k8s.io/ingress-nginx/kube-webhook-certgen:v1.6.7
    ▪ Using image registry.k8s.io/ingress-nginx/kube-webhook-certgen:v1.6.7
    ▪ Using image registry.k8s.io/metrics-server/metrics-server:v0.8.1
    ▪ Using image gcr.io/k8s-minikube/storage-provisioner:v5
🔎  Verifying ingress addon...
🌟  Enabled addons: default-storageclass, metrics-server, storage-provisioner, ingress
🏄  Done! kubectl is now configured to use "minikube" cluster and "default" namespace by default
parag-piprewar@parag-piprewar-HP-Pavilion-x360-Convertible-14-dw1xxx:~$ kubectl get pods
NAME                              READY   STATUS         RESTARTS      AGE
appointment-685dbd5b4-8nh6v       1/1     Running        3 (31s ago)   63m
appointment-685dbd5b4-q5z5z       0/1     Error          2             17m
doctorservice-695748559f-8d9br    0/1     Error          1             17m
doctorservice-695748559f-bnkm4    0/1     Error          8             2d14h
elasticsearch-76fb88c69c-gxfgf    0/1     Error          1             20m
eureka-5f9465cc86-zr9br           0/1     Error          7             2d15h
filebeat-6858f                    1/1     Running        2 (31s ago)   20m
frontend-7f49bcd94b-7xh8n         0/1     ErrImagePull   0             19m
gateway-7b657448c7-5vkfj          0/1     Error          7             2d15h
grafana-5fddfc6dd-j9tkf           1/1     Running        8 (31s ago)   2d14h
kibana-6f966b969-nbpmk            1/1     Running        2 (31s ago)   20m
logstash-697857967b-spvhp         1/1     Running        2 (31s ago)   20m
mysql-5fd44946bf-d552j            1/1     Running        8 (31s ago)   2d15h
notification-8f9f9fdb8-gch7n      1/1     Running        3 (31s ago)   63m
notification-8f9f9fdb8-qxb6p      1/1     Running        2 (31s ago)   17m
patientservice-6d7f6f8bc5-fls84   0/1     Error          1             17m
patientservice-6d7f6f8bc5-n4wnk   1/1     Running        7 (31s ago)   2d14h
prometheus-7b998486-4tkwt         0/1     Error          6             2d14h
rabbitmq-56bc6f6bc7-pgmtm         1/1     Running        8 (31s ago)   2d14h
vault-659bfcffcc-sc2j4            1/1     Running        8 (31s ago)   2d13h
parag-piprewar@parag-piprewar-HP-Pavilion-x360-Convertible-14-dw1xxx:~$ kubectl top pods
error: Metrics API not available
parag-piprewar@parag-piprewar-HP-Pavilion-x360-Convertible-14-dw1xxx:~$ kubectl get hpa
NAME                 REFERENCE                   TARGETS              MINPODS   MAXPODS   REPLICAS   AGE
appointment-hpa      Deployment/appointment      cpu: <unknown>/50%   1         2         2          2d14h
doctorservice-hpa    Deployment/doctorservice    cpu: <unknown>/50%   1         2         2          2d14h
notification-hpa     Deployment/notification     cpu: <unknown>/50%   1         2         2          2d14h
patientservice-hpa   Deployment/patientservice   cpu: <unknown>/50%   1         2         2          2d14h
parag-piprewar@parag-piprewar-HP-Pavilion-x360-Convertible-14-dw1xxx:~$ kubectl get hpa
NAME                 REFERENCE                   TARGETS        MINPODS   MAXPODS   REPLICAS   AGE
appointment-hpa      Deployment/appointment      cpu: 99%/50%   1         2         2          2d14h
doctorservice-hpa    Deployment/doctorservice    cpu: 94%/50%   1         2         2          2d14h
notification-hpa     Deployment/notification     cpu: 94%/50%   1         2         2          2d14h
patientservice-hpa   Deployment/patientservice   cpu: 92%/50%   1         2         2          2d14h
parag-piprewar@parag-piprewar-HP-Pavilion-x360-Convertible-14-dw1xxx:~$ minikube stop
✋  Stopping node "minikube"  ...
🛑  Powering off "minikube" via SSH ...
🛑  1 node stopped.
parag-piprewar@parag-piprewar-HP-Pavilion-x360-Convertible-14-dw1xxx:~$ ^C
parag-piprewar@parag-piprewar-HP-Pavilion-x360-Convertible-14-dw1xxx:~$ 



=======================

Let's do a deep dive into **Prometheus and Grafana**. This is one of the most exciting parts of your project because it shows **Observability**—a critical requirement for senior DevOps engineers.

Here is a simple, plain-English breakdown of exactly how they are configured, what they do, and how to access and show them to your TA.

---

### Part 1: The Core Concepts (For your TA presentation)

*   **Prometheus is the "Collector" (Data Store):** 
    Prometheus is like a doctor who takes the pulse of your microservices every 15 seconds. It goes to each service, gathers raw numbers (CPU usage, memory usage, request counts), and stores them as time-series data. It is **not** designed for pretty charts; it is just a high-performance database for metrics.
*   **Grafana is the "Visualizer" (Dashboard):** 
    Grafana is the beautiful face of your monitoring. It connects to Prometheus, takes those raw numbers, and turns them into gorgeous, live graphs, pie charts, and gauges.

---

### Part 2: The Architecture & Data Flow

Here is exactly how the data flows from your code to your screen:

```
[ Java Code (Actuator) ]  ───►  [ Prometheus (Scraper) ]  ───►  [ Grafana Dashboard ]
```

1.  **Spring Boot Actuator (The source):** 
    Inside your Java microservices, we included the `spring-boot-starter-actuator` and `micrometer-registry-prometheus` libraries. These libraries automatically expose a hidden URL inside each microservice:
    👉 `http://patientservice:8081/actuator/prometheus`
    If you open this URL, you will see a massive page of raw text numbers showing JVM memory, active threads, and garbage collection metrics.
2.  **Prometheus Config (The collector):**
    In `Kubernetes/prometheus.yml`, Prometheus is configured to "scrape" (pull) data from these exact endpoints every 15 seconds:
    ```yaml
    scrape_configs:
      - job_name: 'backend monitoring'
        metrics_path: '/actuator/prometheus'
        static_configs:
          - targets: ['doctorservice:8082', 'patientservice:8081', 'appointment:8083', 'notification:8085']
    ```
3.  **Grafana Connection:**
    When you open Grafana, we add Prometheus as a **Data Source** (pointing to `http://prometheus:9090`). Grafana then queries Prometheus using a language called **PromQL** to draw the charts.

---

### Part 3: How to Access Them in Your Browser

Both Prometheus and Grafana are exposed as Kubernetes `NodePort` services. To open them, use your Minikube IP (`192.168.49.2`):

#### 📊 1. Prometheus Dashboard
*   **URL:** `http://192.168.49.2:30090`
*   **What it does:** You can type PromQL queries directly into the search bar. For example, typing `jvm_memory_used_bytes` and hitting "Execute" will show you the exact memory used by your Java apps in raw numbers.

#### 📈 2. Grafana Dashboard
*   **URL:** `http://192.168.49.2:30030` (Default credentials are usually `admin` / `admin`)
*   **What it does:** This is where the magic happens. 

---

### Part 4: How to Configure a Dashboard in Grafana (For the Live Demo)

When you open Grafana for the first time, it will be empty. To make it beautiful instantly, you don't need to build charts manually. You can import a pre-made industry-standard dashboard:

1.  Open **Grafana** (`http://192.168.49.2:30030`).
2.  Go to **Connections** -> **Data Sources** -> click **Add data source** -> select **Prometheus**.
3.  Set the Connection URL to: `http://prometheus:9090` (this is the internal Kubernetes DNS name for your Prometheus service). Scroll down and click **Save & Test**.
4.  In the left sidebar, click **Dashboards** -> click **New** -> select **Import**.
5.  Under "Import via grafana.com", type the ID `4701` (this is the world-famous "JVM Micrometer" dashboard). Click **Load**.
6.  Select **Prometheus** as your data source and click **Import**.

Boom! Instantly, you will see professional-grade graphs showing:
*   Active CPU usage of each Java container.
*   JVM Heap Memory usage (crucial to show memory limits!).
*   Total HTTP requests handled by your services.
*   Uptime and Garbage Collection statistics.

---

### Part 5: Three Killer Things to show your TA

When presenting, don't just show a static screen. Prove it works live:
1.  **Show the Startup Spike:** Open Grafana and show the JVM CPU graph. Restart the `appointment` pod using `kubectl rollout restart deployment/appointment`. Show the TA how the CPU utilization graph immediately spikes to 100% and then stabilizes! (This also explains *why* our HPA scaled!).
2.  **Show Memory Leak Protection:** Show the TA the JVM memory graph. Explain that you have set JVM limits in Kubernetes to ensure that if a Java app leaks memory, it gets bounded and restarted safely, preventing a total cluster crash.
3.  **Show HTTP Request Metrics:** Open the frontend, register 3 patients, and then show the TA how the `http_server_requests_seconds_count` graph in Grafana instantly increments.
