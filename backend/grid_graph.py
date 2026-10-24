"""
grid_graph.py - NetworkX Topology & Autonomous Grid Failover Logic for GridPulse.
Models 33/11 kV Substation busbars, transformers, circuit breakers, and feeders.
Computes headroom, automated load shedding, and interlocking switching sequences.
"""

import networkx as nx
from typing import Dict, List, Any

class SubstationGridGraph:
    """
    Substation topology graph with automated contingency analysis and failover execution.
    """

    def __init__(self):
        self.graph = nx.DiGraph()
        self.interlock_executed = False
        self._build_topology()

    def _build_topology(self):
        """Constructs the directed graph representing the 33/11 kV substation."""
        self.graph.clear()
        self.interlock_executed = False

        # --- NODES ---
        # Grid sources
        self.graph.add_node("GRID_33KV", type="SOURCE", voltage_kv=33.0, label="33kV Grid Incomer")

        # High Voltage Circuit Breakers (33 kV)
        self.graph.add_node("CB_HV_01", type="BREAKER", status="CLOSED", voltage_kv=33.0, label="HV Breaker 01")
        self.graph.add_node("CB_HV_02", type="BREAKER", status="CLOSED", voltage_kv=33.0, label="HV Breaker 02")

        # Transformers (33/11 kV, 10 MVA)
        self.graph.add_node(
            "TR_01",
            type="TRANSFORMER",
            rating_mva=10.0,
            load_mva=7.7,
            status="DEGRADING",
            health="MONITORED",
            voltage_ratio="33/11 kV",
            label="TR-01 (10 MVA)"
        )
        self.graph.add_node(
            "TR_02",
            type="TRANSFORMER",
            rating_mva=10.0,
            load_mva=4.5,
            status="HEALTHY",
            health="HEALTHY",
            voltage_ratio="33/11 kV",
            label="TR-02 (10 MVA Backup)"
        )

        # Low Voltage Incomer Circuit Breakers (11 kV)
        self.graph.add_node("CB_LV_01", type="BREAKER", status="CLOSED", voltage_kv=11.0, label="Incomer Breaker LV-01")
        self.graph.add_node("CB_LV_02", type="BREAKER", status="CLOSED", voltage_kv=11.0, label="Incomer Breaker LV-02")

        # 11 kV Busbars
        self.graph.add_node("BUS_A", type="BUSBAR", voltage_kv=11.0, label="11kV Busbar A", energized=True)
        self.graph.add_node("BUS_B", type="BUSBAR", voltage_kv=11.0, label="11kV Busbar B", energized=True)

        # Bus Tie-Breaker
        self.graph.add_node("TB_12", type="TIE_BREAKER", status="OPEN", voltage_kv=11.0, label="Bus Tie-Breaker TB-12")

        # Feeders & Breakers on BUS_A
        self.graph.add_node("CB_F1", type="BREAKER", status="CLOSED", label="Feeder 1 Breaker")
        self.graph.add_node(
            "FEEDER_1",
            type="FEEDER",
            load_mva=4.2,
            priority=1,
            criticality="HIGH (Hospital / Critical Industry)",
            label="Feeder 1 (4.2 MVA)",
            shed=False
        )

        self.graph.add_node("CB_F2", type="BREAKER", status="CLOSED", label="Feeder 2 Breaker")
        self.graph.add_node(
            "FEEDER_2",
            type="FEEDER",
            load_mva=3.5,
            priority=2,
            criticality="MEDIUM (Commercial / Residential)",
            label="Feeder 2 (3.5 MVA)",
            shed=False
        )

        # Feeders & Breakers on BUS_B
        self.graph.add_node("CB_F3", type="BREAKER", status="CLOSED", label="Feeder 3 Breaker")
        self.graph.add_node(
            "FEEDER_3",
            type="FEEDER",
            load_mva=2.1,
            priority=2,
            criticality="MEDIUM (Residential Suburb)",
            label="Feeder 3 (2.1 MVA)",
            shed=False
        )

        self.graph.add_node("CB_F4", type="BREAKER", status="CLOSED", label="Feeder 4 Breaker")
        self.graph.add_node(
            "FEEDER_4",
            type="FEEDER",
            load_mva=2.4,
            priority=2,
            criticality="MEDIUM (Commercial Tech Park)",
            label="Feeder 4 (2.4 MVA)",
            shed=False
        )

        # --- EDGES (Power flow) ---
        # 33kV Incomer to HV Breakers
        self.graph.add_edge("GRID_33KV", "CB_HV_01")
        self.graph.add_edge("GRID_33KV", "CB_HV_02")

        # HV Breakers to Transformers
        self.graph.add_edge("CB_HV_01", "TR_01")
        self.graph.add_edge("CB_HV_02", "TR_02")

        # Transformers to LV Breakers
        self.graph.add_edge("TR_01", "CB_LV_01")
        self.graph.add_edge("TR_02", "CB_LV_02")

        # LV Breakers to Busbars
        self.graph.add_edge("CB_LV_01", "BUS_A")
        self.graph.add_edge("CB_LV_02", "BUS_B")

        # Tie Breaker between Busbars (Bidirectional connection)
        self.graph.add_edge("BUS_B", "TB_12")
        self.graph.add_edge("TB_12", "BUS_A")

        # Busbar A to Feeders
        self.graph.add_edge("BUS_A", "CB_F1")
        self.graph.add_edge("CB_F1", "FEEDER_1")
        self.graph.add_edge("BUS_A", "CB_F2")
        self.graph.add_edge("CB_F2", "FEEDER_2")

        # Busbar B to Feeders
        self.graph.add_edge("BUS_B", "CB_F3")
        self.graph.add_edge("CB_F3", "FEEDER_3")
        self.graph.add_edge("BUS_B", "CB_F4")
        self.graph.add_edge("CB_F4", "FEEDER_4")

    def evaluate_failover(self, failing_asset: str = "TR_01") -> Dict[str, Any]:
        """
        Calculates contingency load transfer and creates step-by-step interlock sequence.
        """
        tr1 = self.graph.nodes["TR_01"]
        tr2 = self.graph.nodes["TR_02"]

        tr1_load = tr1["load_mva"]
        tr2_load = tr2["load_mva"]
        tr2_rating = tr2["rating_mva"]

        # Calculate available headroom on TR_02
        tr2_headroom = round(tr2_rating - tr2_load, 2)
        can_transfer_100pct = tr2_headroom >= tr1_load
        combined_load = round(tr2_load + tr1_load, 2)

        # Identify BUS_A feeders
        f1 = self.graph.nodes["FEEDER_1"]
        f2 = self.graph.nodes["FEEDER_2"]

        # Controlled load shedding logic:
        # Feeder 2 is Priority 2 (lowest priority on Bus A, 3.5 MVA)
        shed_required = not can_transfer_100pct
        shed_feeder_id = "FEEDER_2" if shed_required else None
        shed_feeder_mva = f2["load_mva"] if shed_required else 0.0

        transferred_load = round(tr1_load - shed_feeder_mva, 2)
        final_tr2_load = round(tr2_load + transferred_load, 2)
        final_tr2_loading_pct = round((final_tr2_load / tr2_rating) * 100.0, 1)

        # Switching sequence with industrial safety interlocks
        switching_sequence = []
        step_idx = 1

        if shed_required:
            switching_sequence.append({
                "step": step_idx,
                "action": "TRIP_FEEDER",
                "target": "CB_F2",
                "feeder": "FEEDER_2",
                "details": f"Trip Feeder 2 breaker to shed {shed_feeder_mva} MVA (Priority 2 non-critical load).",
                "interlock_check": "Overcurrent Prevention: Protect TR_02 rating threshold (<= 10.0 MVA).",
                "status": "EXECUTED" if self.interlock_executed else "PENDING"
            })
            step_idx += 1

        switching_sequence.append({
            "step": step_idx,
            "action": "TRIP_HV",
            "target": "CB_HV_01",
            "details": "Trip 33 kV primary circuit breaker CB_HV_01 to isolate TR_01 input.",
            "interlock_check": "Arc flash suppression & upstream isolate confirmation.",
            "status": "EXECUTED" if self.interlock_executed else "PENDING"
        })
        step_idx += 1

        switching_sequence.append({
            "step": step_idx,
            "action": "TRIP_LV",
            "target": "CB_LV_01",
            "details": "Trip 11 kV secondary circuit breaker CB_LV_01 to decouple TR_01 from BUS_A.",
            "interlock_check": "Zero reverse feed into degraded transformer windings.",
            "status": "EXECUTED" if self.interlock_executed else "PENDING"
        })
        step_idx += 1

        switching_sequence.append({
            "step": step_idx,
            "action": "SYNCHRO_CHECK",
            "target": "BUS_A_MONITOR",
            "details": "Verify BUS_A dead-bus condition (0.0 kV) and phase synchronization compatibility.",
            "interlock_check": "Interlock 25A: Voltage dead check (V < 5% Vnom) across tie-breaker terminals.",
            "status": "EXECUTED" if self.interlock_executed else "PENDING"
        })
        step_idx += 1

        switching_sequence.append({
            "step": step_idx,
            "action": "CLOSE_TIE",
            "target": "TB_12",
            "details": "Close Bus Tie-Breaker TB-12 to transfer BUS_A & critical FEEDER_1 to TR_02.",
            "interlock_check": "Permissive 86T lockout confirmed clear on TR_02.",
            "status": "EXECUTED" if self.interlock_executed else "PENDING"
        })

        return {
            "failing_asset": failing_asset,
            "backup_asset": "TR_02",
            "tr1_load_mva": tr1_load,
            "tr2_initial_load_mva": tr2_load,
            "tr2_continuous_rating_mva": tr2_rating,
            "tr2_headroom_mva": tr2_headroom,
            "combined_unmanaged_load_mva": combined_load,
            "can_transfer_100pct": can_transfer_100pct,
            "load_shedding_required": shed_required,
            "shed_feeder": shed_feeder_id,
            "shed_load_mva": shed_feeder_mva,
            "transferred_load_mva": transferred_load,
            "tr2_final_load_mva": final_tr2_load,
            "tr2_final_loading_pct": final_tr2_loading_pct,
            "switching_sequence": switching_sequence,
            "interlock_executed": self.interlock_executed
        }

    def execute_interlock(self) -> Dict[str, Any]:
        """
        Executes the switching sequence in the graph topology, updating breaker and feeder states.
        """
        self.interlock_executed = True

        # Trip TR_01 Breakers
        self.graph.nodes["CB_HV_01"]["status"] = "OPEN"
        self.graph.nodes["CB_LV_01"]["status"] = "OPEN"
        self.graph.nodes["TR_01"]["status"] = "ISOLATED"
        self.graph.nodes["TR_01"]["load_mva"] = 0.0

        # Trip Feeder 2 for controlled load shed
        self.graph.nodes["CB_F2"]["status"] = "OPEN"
        self.graph.nodes["FEEDER_2"]["shed"] = True

        # Close Tie Breaker TB_12
        self.graph.nodes["TB_12"]["status"] = "CLOSED"

        # Update TR_02 load: 4.5 + 4.2 = 8.7 MVA
        self.graph.nodes["TR_02"]["load_mva"] = 8.7
        self.graph.nodes["TR_02"]["status"] = "ACTIVE_FAILOVER"

        # BUS_A is now powered through TB_12
        self.graph.nodes["BUS_A"]["powered_by"] = "TR_02_VIA_TB12"

        return self.get_topology_state()

    def reset_grid(self):
        """Resets the substation back to initial nominal configuration."""
        self._build_topology()
        return self.get_topology_state()

    def get_topology_state(self) -> Dict[str, Any]:
        """Returns the full serialization of nodes and breaker states for the frontend."""
        nodes_data = {}
        for node_id, attrs in self.graph.nodes(data=True):
            nodes_data[node_id] = attrs

        failover_info = self.evaluate_failover()

        return {
            "nodes": nodes_data,
            "interlock_executed": self.interlock_executed,
            "failover_summary": failover_info
        }

# Global singleton grid graph instance
grid = SubstationGridGraph()
