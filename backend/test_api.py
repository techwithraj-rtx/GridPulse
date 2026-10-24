import sys
import os

from main import (
    app,
    get_next_telemetry,
    get_current_telemetry,
    inject_fault,
    reset_simulation,
    execute_failover,
    get_grid_topology,
    get_spares
)

def run_tests():
    print("--- 1. Testing Reset Simulation (Row 0) ---")
    reset_res = reset_simulation()
    t0 = reset_res["telemetry"]
    print(f"Row 0 Status: {t0['status']}, CHI: {t0['chi']}, Is Anomaly: {t0['is_anomaly']}")
    assert t0['status'] == "NORMAL", f"Expected NORMAL, got {t0['status']}"
    assert t0['chi'] >= 80, f"Expected CHI >= 80, got {t0['chi']}"
    assert t0['failover_plan'] is None, "Failover plan should be None in NORMAL state"

    print("\n--- 2. Advancing Telemetry by 5 Rows ---")
    for _ in range(5):
        next_t = get_next_telemetry()
        print(f"Step {next_t['playback_index']}: CHI={next_t['chi']}, Voltage={next_t['voltage_kv']}kV, Current={next_t['current_a']}A")

    print("\n--- 3. Testing Fault Injection (Row 100) ---")
    fault_res = inject_fault()
    t100 = fault_res["telemetry"]
    print(f"Row 100 Status: {t100['status']}, CHI: {t100['chi']}")
    
    # Step forward toward end of fault to see degradation reach CRITICAL
    print("\n--- 4. Advancing along Thermal Runaway Trajectory ---")
    critical_reached = False
    for i in range(101, 180):
        t = get_next_telemetry()
        if t['status'] == 'CRITICAL':
            print(f"Critical reached at step {t['playback_index']}: CHI={t['chi']}, THD={t['thd_i']}%, DeltaTheta={t['delta_theta']}C")
            assert t['failover_plan'] is not None, "Failover plan must be attached when CRITICAL"
            assert t['spare_dispatch'] is not None, "Spare dispatch ticket must be attached when CRITICAL"
            critical_reached = True
            break
    assert critical_reached, "Expected CRITICAL state to be reached along fault trajectory"

    print("\n--- 5. Testing Failover Interlock Execution ---")
    exec_res = execute_failover()
    top = exec_res["topology"]
    assert top["interlock_executed"] is True
    assert top["nodes"]["CB_HV_01"]["status"] == "OPEN"
    assert top["nodes"]["CB_LV_01"]["status"] == "OPEN"
    assert top["nodes"]["CB_F2"]["status"] == "OPEN"
    assert top["nodes"]["TB_12"]["status"] == "CLOSED"
    assert top["nodes"]["TR_02"]["load_mva"] == 8.7
    print("Failover Interlock verified: CB_HV_01=OPEN, CB_LV_01=OPEN, CB_F2=OPEN, TB_12=CLOSED, TR_02 Load=8.7 MVA")

    print("\n--- 6. Testing Spares Database Query ---")
    spares = get_spares()
    optimal = spares["optimal_match"]
    assert optimal is not None
    assert optimal["asset_tag"] == "TX-SPARE-01"
    assert optimal["rating_mva"] == 10.0
    print(f"Optimal Spare Matched: {optimal['asset_tag']} at {optimal['warehouse_yard']} (ETA: {optimal['eta_hours']}h)")

    print("\n--- 7. Testing Reset Back to Baseline ---")
    reset_res = reset_simulation()
    t_after_reset = reset_res["telemetry"]
    assert t_after_reset["status"] == "NORMAL"
    assert t_after_reset["interlock_executed"] is False
    print("Simulation successfully reset to baseline.")

    print("\n>>> ALL BACKEND TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    run_tests()
