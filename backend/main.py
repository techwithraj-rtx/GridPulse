"""
main.py - FastAPI Server & SCADA Telemetry Streaming for GridPulse.
Coordinates physics health analytics, ML anomaly detection, NetworkX grid failover,
and spare asset inventory dispatch.
"""

import os
import asyncio
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import pandas as pd

from generate_scada import generate_telemetry
from engine import engine
from grid_graph import grid
from spares_db import init_db, get_all_spares, query_optimal_spare, generate_dispatch_ticket

app = FastAPI(
    title="GridPulse SCADA Intelligence API",
    description="Autonomous SCADA Telemetry Intelligence & Grid Failover for Substation Transformers",
    version="1.0.0"
)

# CORS configuration to allow local and remote development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "telemetry_stream.csv")

class PlaybackState:
    def __init__(self):
        self.cursor = 0
        self.max_rows = 200
        self.df: Optional[pd.DataFrame] = None
        self.load_data()

    def load_data(self):
        if not os.path.exists(DATA_PATH):
            print("[GridPulse API] Telemetry dataset missing. Generating new dataset...")
            generate_telemetry(DATA_PATH)
        self.df = pd.read_csv(DATA_PATH)
        self.max_rows = len(self.df)
        print(f"[GridPulse API] Loaded telemetry stream with {self.max_rows} rows.")

    def get_row(self, index: int) -> dict:
        idx = max(0, min(self.max_rows - 1, index))
        row = self.df.iloc[idx].to_dict()
        row["step"] = idx
        return row

    def advance(self) -> dict:
        row = self.get_row(self.cursor)
        self.cursor = (self.cursor + 1) % self.max_rows
        return row

    def set_cursor(self, index: int) -> dict:
        self.cursor = max(0, min(self.max_rows - 1, index))
        return self.get_row(self.cursor)

    def reset(self) -> dict:
        self.cursor = 0
        return self.get_row(0)

playback = PlaybackState()

@app.on_event("startup")
async def startup_event():
    init_db()
    if playback.df is None or len(playback.df) == 0:
        playback.load_data()
    print("[GridPulse API] Substation Telemetry Engine initialized and operational.")

def enrich_telemetry_payload(raw_row: dict) -> dict:
    """Enriches raw SCADA row with CHI health scoring, ML anomaly, and conditional failover."""
    telemetry = engine.process_telemetry_row(raw_row)
    
    # Check if status warrants failover and emergency spare dispatch
    status = telemetry["status"]
    if status in ["WARNING", "CRITICAL"]:
        failover_plan = grid.evaluate_failover("TR_01")
        spare_ticket = generate_dispatch_ticket(
            failing_asset="TR_01",
            chi_score=telemetry["chi"]
        )
        telemetry["failover_plan"] = failover_plan
        telemetry["spare_dispatch"] = spare_ticket
    else:
        telemetry["failover_plan"] = None
        telemetry["spare_dispatch"] = None

    telemetry["playback_index"] = raw_row.get("step", 0)
    telemetry["total_steps"] = playback.max_rows
    telemetry["interlock_executed"] = grid.interlock_executed
    return telemetry

@app.get("/")
def read_root():
    return {
        "system": "GridPulse: Autonomous SCADA Telemetry Intelligence & Grid Failover",
        "status": "ONLINE",
        "version": "1.0.0",
        "endpoints": [
            "/api/telemetry/next",
            "/api/telemetry/current",
            "/api/telemetry/history",
            "/api/simulation/fault-inject",
            "/api/simulation/reset",
            "/api/failover/execute",
            "/api/grid/topology",
            "/api/spares"
        ]
    }

@app.get("/api/telemetry/next")
def get_next_telemetry():
    """Advances playback cursor by 1 row and returns full telemetry and diagnostics."""
    raw_row = playback.advance()
    return enrich_telemetry_payload(raw_row)

@app.get("/api/telemetry/current")
def get_current_telemetry():
    """Returns current telemetry without advancing playback cursor."""
    raw_row = playback.get_row(playback.cursor)
    return enrich_telemetry_payload(raw_row)

@app.get("/api/telemetry/history")
def get_telemetry_history(limit: int = 30):
    """
    Returns up to the last `limit` processed rows up to current cursor,
    convenient for initial chart hydration.
    """
    cur = playback.cursor
    start = max(0, cur - limit + 1)
    history = []
    for i in range(start, cur + 1):
        raw = playback.get_row(i)
        history.append(enrich_telemetry_payload(raw))
    return history

@app.post("/api/simulation/fault-inject")
def inject_fault():
    """
    Instantly advances simulation cursor to step 100 where thermal runaway
    and harmonic degradation begin.
    """
    raw_row = playback.set_cursor(100)
    enriched = enrich_telemetry_payload(raw_row)
    return {
        "message": "Thermal Runaway & Harmonic Fault Injected at step 100",
        "cursor": 100,
        "telemetry": enriched
    }

@app.post("/api/simulation/reset")
def reset_simulation():
    """Resets playback cursor back to baseline step 0 and resets grid switching state."""
    raw_row = playback.reset()
    grid.reset_grid()
    enriched = enrich_telemetry_payload(raw_row)
    return {
        "message": "SCADA simulation reset to Baseline Normal Operation",
        "cursor": 0,
        "telemetry": enriched
    }

@app.get("/api/grid/topology")
def get_grid_topology():
    """Returns the live NetworkX substation topology, breaker states, and loads."""
    return grid.get_topology_state()

@app.post("/api/failover/execute")
def execute_failover():
    """Executes the automated interlock sequence transferring load from TR_01 to TR_02."""
    updated_topology = grid.execute_interlock()
    return {
        "message": "Automated Failover Switching Interlock Successfully Executed",
        "topology": updated_topology
    }

@app.get("/api/spares")
def get_spares():
    """Returns list of utility spare transformers in inventory."""
    return {
        "spares": get_all_spares(),
        "optimal_match": query_optimal_spare()
    }

class SignoffRequest(BaseModel):
    ticket_id: str
    operator_name: str
    notes: Optional[str] = "Approved for emergency mobilization"

@app.post("/api/spares/signoff")
def signoff_dispatch(request: SignoffRequest):
    """Records operator signoff for emergency spare transformer mobilization."""
    return {
        "status": "DISPATCH_AUTHORIZED",
        "ticket_id": request.ticket_id,
        "operator": request.operator_name,
        "notes": request.notes,
        "authorization_time": pd.Timestamp.now().isoformat(),
        "eta": "2.5 hours via Highway 4 Heavy Route"
    }

@app.get("/api/telemetry/stream")
async def stream_telemetry():
    """Server-Sent Events (SSE) streaming endpoint."""
    async def event_generator():
        while True:
            raw_row = playback.advance()
            payload = enrich_telemetry_payload(raw_row)
            import json
            yield f"data: {json.dumps(payload)}\n\n"
            await asyncio.sleep(1.0)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
