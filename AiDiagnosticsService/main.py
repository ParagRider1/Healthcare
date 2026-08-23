import os
import time
import random
import asyncio
from fastapi import FastAPI, UploadFile, File
import py_eureka_client.eureka_client as eureka_client
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Diagnostics Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EUREKA_SERVER = os.getenv("EUREKA_SERVER", "http://eureka-server:8761/eureka")
SERVICE_NAME = "AIDIAGNOSTICSSERVICE"
SERVICE_PORT = 8086

@app.on_event("startup")
async def startup_event():
    # Register with Eureka
    await eureka_client.init_async(
        eureka_server=EUREKA_SERVER,
        app_name=SERVICE_NAME,
        instance_port=SERVICE_PORT,
        instance_host=os.getenv("HOSTNAME", "ai-diagnostics-service")
    )

@app.post("/api/diagnostics/analyze")
async def analyze_image(file: UploadFile = File(...)):
    # Simulate a heavy Machine Learning Inference task
    await asyncio.sleep(2.5)
    
    # Mock AI Model output
    results = [
        {"condition": "Normal / Healthy", "confidence": 98.2, "severity": "Low"},
        {"condition": "Mild Pneumonia", "confidence": 84.5, "severity": "Medium"},
        {"condition": "Fracture Detected", "confidence": 91.1, "severity": "High"},
        {"condition": "Tumor Marker (Benign)", "confidence": 76.8, "severity": "Medium"}
    ]
    
    selected_result = random.choice(results)
    
    return {
        "filename": file.filename,
        "status": "success",
        "analysis": selected_result,
        "recommendation": "Please consult a specialist if severity is High."
    }

@app.get("/actuator/health")
def health_check():
    return {"status": "UP"}
