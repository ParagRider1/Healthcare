# AI-Powered Telemedicine & Diagnostics Platform - Implementation Plan

This document outlines the architecture and steps to transform MediConnect into a "legendary" enterprise application by adding Polyglot Microservices (Python + Java) for AI Diagnostics and automated Billing.

## User Review Required

> [!IMPORTANT]
> Please review this architecture carefully. This is a massive expansion that will introduce a new programming language (Python) to your DevOps cluster to demonstrate true microservice flexibility. 

## Open Questions

> [!NOTE]
> 1. **AI Model**: For the `AI-DiagnosticsService`, do you want me to mock the AI response (e.g., return a random realistic diagnosis for demo purposes) or integrate with a real, live public AI API (like a HuggingFace medical model)? Mocking is much faster and more reliable for course demonstrations.
> 2. **Video Consultations**: Real-time WebRTC video is complex. Would you prefer I integrate a pre-built secure medical video room (like a Jitsi Meet iFrame) into the UI, or build a custom signaling server from scratch?

## Proposed Changes

We will create two entirely new microservices and expand the frontend.

---

### 1. AI-DiagnosticsService (Python / FastAPI)
A dedicated Python microservice to handle machine learning and image processing tasks. Demonstrates polyglot architecture.

#### [NEW] `AiDiagnosticsService/main.py`
- A FastAPI web server.
- Uses `py_eureka_client` to register itself with your Java Eureka Server.
- Provides a `POST /api/diagnostics/analyze` endpoint that accepts an image upload and returns a diagnostic report.

#### [NEW] `AiDiagnosticsService/Dockerfile`
- Multi-stage Dockerfile using `python:3.10-slim`.
- Installs dependencies (`fastapi`, `uvicorn`, `py-eureka-client`).

---

### 2. BillingService (Java / Spring Boot)
Automates the financial side of the hospital.

#### [NEW] `BillingService/` (Spring Boot App)
- Creates a new `billingdb` in MySQL.
- **RabbitMQ Integration**: Listens to the same `appointment.notification.queue` as the NotificationService. When an appointment is booked, it automatically generates a $50 invoice for the patient.
- Provides `GET /api/billing/{patientId}` and `POST /api/billing/pay/{invoiceId}` endpoints.

#### [NEW] `BillingService/Dockerfile`
- Multi-stage Maven build (identical to NotificationService).

---

### 3. API Gateway & Infrastructure

#### [MODIFY] `ApiGateway/src/main/resources/application.properties`
- Ensure routes are configured to allow traffic to the Python service and Billing service.

#### [MODIFY] `docker-compose.yml`
- Add `ai-diagnostics-service` (Python).
- Add `billing-service` (Java).
- Update MySQL initialization script (`init-db/init.sql`) to create `billingdb`.

---

### 4. Frontend UI (Next.js)

#### [MODIFY] `frontend/next.config.mjs`
- Add proxy rewrites for `/AIDIAGNOSTICSSERVICE/` and `/BILLINGSERVICE/`.

#### [NEW] `frontend/src/app/diagnostics/page.js`
- A beautiful new UI page where doctors/patients can drag-and-drop X-Rays or MRIs.
- Shows a "Scanning..." animation, followed by the AI report returned from the Python service.

#### [NEW] `frontend/src/app/billing/page.js`
- A financial dashboard for patients to view unpaid invoices and click "Pay Now" (simulated Stripe integration).

## Verification Plan

### Automated/DevOps Verification
1. Run `docker compose up -d --build`.
2. Verify in the Eureka Dashboard (`http://localhost:8761`) that `AIDIAGNOSTICSSERVICE` (Python) and `BILLINGSERVICE` (Java) successfully register alongside the existing services.
3. Verify RabbitMQ successfully routes 1 appointment message to **both** the Notification Service (email) and the Billing Service (invoice generation) simultaneously (Pub/Sub pattern).

### Manual Verification
1. Open the UI, upload a dummy image to the Diagnostics page, and verify the Python service returns a report.
2. Book an appointment, then navigate to the Billing page to ensure an invoice was automatically generated via RabbitMQ.
