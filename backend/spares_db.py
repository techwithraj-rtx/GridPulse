"""
spares_db.py - SQLite Spares Database & Intelligent Dispatch Engine for GridPulse.
Maintains high-voltage utility transformer reserves and matches the optimal
spare asset based on technical specifications and logistics transit ETA.
"""

import sqlite3
import os
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "gridpulse_inventory.db")

SEED_SPARES = [
    (
        "TX-SPARE-01",
        "ABB / Hitachi Power",
        10.0,
        "33/11 kV",
        "Dyn11",
        7.15,
        "ONAN/ONAF",
        "Central Logistics Yard - Bay 04",
        "Zone 2 - Highway 4 Interstate",
        28.5,
        2.5,
        "AVAILABLE",
        "100% Matching impedance (7.15%) and vector group. Ready for instant transport on 50T Low-Bed Trailer."
    ),
    (
        "TX-SPARE-02",
        "Siemens Energy",
        10.0,
        "33/11 kV",
        "Dyn11",
        7.25,
        "ONAN",
        "North Grid Depot - Sector 7",
        "Zone 1 - Northern Corridor",
        48.0,
        4.2,
        "AVAILABLE",
        "Secondary backup. Verified dielectric breakdown voltage > 65 kV."
    ),
    (
        "TX-SPARE-03",
        "Schneider Electric",
        12.5,
        "33/11 kV",
        "Dyn11",
        7.80,
        "ONAF",
        "East Valley Regional Hub",
        "Zone 3 - Eastern Industrial Park",
        62.0,
        5.1,
        "AVAILABLE",
        "Higher rating (12.5 MVA) compatible with foundation pad modifications."
    ),
    (
        "TX-SPARE-04",
        "GE Vernova",
        10.0,
        "33/11 kV",
        "YNd11",
        7.40,
        "ONAN",
        "Western Substation Reserve",
        "Zone 4 - Western Hills",
        85.0,
        6.8,
        "AVAILABLE",
        "Requires phase rotation verification due to star-delta neutral arrangement."
    ),
    (
        "TX-SPARE-05",
        "TBEA Transformer",
        7.5,
        "33/11 kV",
        "Dyn11",
        6.85,
        "ONAN",
        "Metro Reserve Yard",
        "Zone 1 - Metro Depot",
        14.0,
        1.5,
        "RESERVED",
        "Undergoing periodic oil filtration - currently reserved for Bay-04 maintenance."
    )
]

def init_db(db_path: str = DB_PATH):
    """Initializes the SQLite database and seeds transformer inventory if empty."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transformer_inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_tag TEXT UNIQUE NOT NULL,
        manufacturer TEXT NOT NULL,
        rating_mva REAL NOT NULL,
        voltage_ratio TEXT NOT NULL,
        vector_group TEXT NOT NULL,
        impedance_pct REAL NOT NULL,
        cooling_type TEXT NOT NULL,
        warehouse_yard TEXT NOT NULL,
        transit_zone TEXT NOT NULL,
        transit_distance_km REAL NOT NULL,
        eta_hours REAL NOT NULL,
        status TEXT NOT NULL,
        notes TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS dispatch_tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id TEXT UNIQUE NOT NULL,
        created_at TEXT NOT NULL,
        status TEXT NOT NULL,
        urgency TEXT NOT NULL,
        failing_asset TEXT NOT NULL,
        spare_asset_tag TEXT NOT NULL,
        substation_bay TEXT NOT NULL,
        transit_distance_km REAL,
        eta_hours REAL,
        operator_notes TEXT
    );
    """)

    conn.commit()

    # Check if table has data
    cursor.execute("SELECT COUNT(*) FROM transformer_inventory")
    count = cursor.fetchone()[0]
    if count == 0:
        cursor.executemany("""
        INSERT INTO transformer_inventory (
            asset_tag, manufacturer, rating_mva, voltage_ratio, vector_group,
            impedance_pct, cooling_type, warehouse_yard, transit_zone,
            transit_distance_km, eta_hours, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, SEED_SPARES)
        conn.commit()
        print(f"[GridPulse Spares] Seeded {len(SEED_SPARES)} utility spare transformers into {db_path}")

    conn.close()

def get_all_spares(db_path: str = DB_PATH) -> List[Dict[str, Any]]:
    """Retrieves all spare transformer records from inventory."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM transformer_inventory ORDER BY transit_distance_km ASC")
    rows = cursor.fetchall()
    spares = [dict(row) for row in rows]
    conn.close()
    return spares

def query_optimal_spare(
    rating_mva: float = 10.0,
    voltage_ratio: str = "33/11 kV",
    vector_group: str = "Dyn11",
    db_path: str = DB_PATH
) -> Optional[Dict[str, Any]]:
    """
    Finds the closest available matching spare transformer in utility inventory.
    Filters by technical specifications and orders by transit distance (ETA).
    """
    init_db(db_path)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # 1. First priority: Exact match on rating, voltage ratio, vector group, and status == 'AVAILABLE'
    query = """
    SELECT * FROM transformer_inventory
    WHERE status = 'AVAILABLE'
      AND rating_mva >= ?
      AND voltage_ratio = ?
      AND vector_group = ?
    ORDER BY transit_distance_km ASC
    LIMIT 1
    """
    cursor.execute(query, (rating_mva, voltage_ratio, vector_group))
    row = cursor.fetchone()

    # 2. Fallback: Any available spare with compatible voltage ratio
    if not row:
        cursor.execute("""
        SELECT * FROM transformer_inventory
        WHERE status = 'AVAILABLE'
          AND voltage_ratio = ?
        ORDER BY transit_distance_km ASC
        LIMIT 1
        """, (voltage_ratio,))
        row = cursor.fetchone()

    spare_dict = dict(row) if row else None
    conn.close()
    return spare_dict

def generate_dispatch_ticket(
    failing_asset: str = "TR_01",
    substation_bay: str = "Substation 33/11kV Bay-01",
    chi_score: float = 38.5,
    db_path: str = DB_PATH
) -> Dict[str, Any]:
    """
    Auto-generates an emergency spare transformer dispatch ticket for utility operator sign-off.
    """
    spare = query_optimal_spare(rating_mva=10.0, voltage_ratio="33/11 kV", vector_group="Dyn11", db_path=db_path)
    
    now_utc = datetime.now(timezone.utc)
    timestamp_str = now_utc.strftime("%Y-%m-%d %H:%M:%SZ")
    ticket_id = f"GP-DISPATCH-TR01-{int(now_utc.timestamp())}"

    urgency = "CRITICAL - EMERGENCY DISPATCH" if chi_score < 40 else "HIGH - PREVENTATIVE REPLACEMENT"

    ticket = {
        "ticket_id": ticket_id,
        "created_at": timestamp_str,
        "status": "READY_FOR_OPERATOR_SIGNOFF",
        "urgency": urgency,
        "substation_bay": substation_bay,
        "failing_asset": f"{failing_asset} (10 MVA, 33/11 kV, Dyn11)",
        "trigger_condition": f"Autonomous GridPulse AI Alarm (CHI = {chi_score:.1f} < 40.0, Thermal Runaway)",
        "spare_matched": spare,
        "recommended_actions": [
            f"Mobilize 50-Ton low-bed trailer rig to {spare['warehouse_yard'] if spare else 'Depot'}.",
            "Issue Route Clearance Permit R-104 (Transit distance: " + (f"{spare['transit_distance_km']} km" if spare else "N/A") + ").",
            "Begin TR-01 oil drainage and physical bushing disconnection in Bay-01.",
            "Verify foundation bolt alignment and neutral earthing resistor compatibility.",
            "Perform insulation resistance (Megger) & winding resistance pre-energization checklist."
        ],
        "estimated_arrival_hours": spare["eta_hours"] if spare else 3.0,
        "signoff_operator": "SCADA Chief Grid Controller (Pending Confirmation)",
        "interlock_coordination": "Tie-Breaker TB-12 failover active; Feeder 1 safeguarded."
    }

    return ticket

if __name__ == "__main__":
    init_db()
    optimal = query_optimal_spare()
    print("Optimal Spare Matched:", optimal)
    ticket = generate_dispatch_ticket()
    print("Sample Dispatch Ticket:", ticket)
