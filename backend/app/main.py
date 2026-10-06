from fastapi import FastAPI, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import io
import pandas as pd
from typing import Optional, List, Dict, Any
from .models import ActionRequest
from .graph import build_student_graph_from_records

app = FastAPI(
    title="Scholarship Sentinel API",
    description="Explainable anomaly cluster intelligence system for government scholarship verification.",
    version="1.0.0"
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")

def load_json_file(filename: str) -> Any:
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail=f"Data file {filename} not found")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json_file(filename: str, data: Any):
    path = os.path.join(DATA_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

@app.get("/api/summary")
def get_summary():
    return load_json_file("summary.json")

@app.get("/api/clusters")
def get_clusters(band: Optional[str] = None, status: Optional[str] = None):
    clusters = load_json_file("clusters.json")
    if band and band != "all":
        clusters = [c for c in clusters if c.get("band", "").lower() == band.lower()]
    if status and status != "all":
        clusters = [c for c in clusters if c.get("status", "").lower() == status.lower()]
    return clusters

@app.get("/api/clusters/{cluster_id}")
def get_cluster_detail(cluster_id: str):
    clusters = load_json_file("clusters.json")
    for c in clusters:
        if c["id"].lower() == cluster_id.lower():
            return c
    # Also check CSV clusters
    try:
        csv_clusters = load_json_file("csv_clusters.json")
        for c in csv_clusters:
            if c["id"].lower() == cluster_id.lower():
                return c
    except Exception:
        pass
    raise HTTPException(status_code=404, detail=f"Cluster {cluster_id} not found")

@app.get("/api/institutions")
def get_institutions():
    return load_json_file("institutions.json")

@app.get("/api/cases")
def get_cases():
    clusters = load_json_file("clusters.json")
    # Return cases grouped or formatted
    return clusters

@app.post("/api/clusters/{cluster_id}/action")
def take_cluster_action(cluster_id: str, payload: ActionRequest):
    clusters = load_json_file("clusters.json")
    target = None
    for c in clusters:
        if c["id"].lower() == cluster_id.lower():
            target = c
            break

    if not target:
        try:
            csv_clusters = load_json_file("csv_clusters.json")
            for c in csv_clusters:
                if c["id"].lower() == cluster_id.lower():
                    target = c
                    break
        except Exception:
            pass

    if not target:
        raise HTTPException(status_code=404, detail=f"Cluster {cluster_id} not found")

    action_map = {
        "verify": "verified",
        "assign": "assigned",
        "request_documents": "documents_requested",
        "escalate": "escalated",
        "close": "closed"
    }

    new_status = action_map.get(payload.action, payload.action)
    target["status"] = new_status

    timeline_entry = {
        "time": "Just now",
        "officer": payload.assignee if payload.assignee else "Officer on Duty",
        "action": payload.action.replace("_", " ").title(),
        "note": payload.note
    }
    target.setdefault("timeline", []).insert(0, timeline_entry)

    save_json_file("clusters.json", clusters)
    return {"status": "success", "cluster": target, "new_status": new_status}

@app.post("/api/analyze-csv")
async def analyze_csv_endpoint(file: Optional[UploadFile] = File(None)):
    if file:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
    else:
        # Fallback to local students.csv
        csv_path = os.path.join(DATA_DIR, "..", "students.csv")
        if not os.path.exists(csv_path):
            raise HTTPException(status_code=400, detail="No CSV provided or found")
        df = pd.read_csv(csv_path)

    records = df.to_dict("records")
    result = build_student_graph_from_records(records)
    return result

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Scholarship Sentinel API", "engine": "NetworkX v3"}
