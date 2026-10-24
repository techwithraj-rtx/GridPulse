"""
generate_scada.py - SCADA Historian Synthetic Telemetry Generator for GridPulse.
Generates 200 time-series rows (1-second intervals) modeling normal operation
followed by thermal runaway and harmonic breakdown on a 33/11 kV transformer (TR_01).
"""

import os
import numpy as np
import pandas as pd

DEFAULT_DATA_PATH = os.path.join(os.path.dirname(__file__), "telemetry_stream.csv")

def generate_telemetry(filepath=DEFAULT_DATA_PATH, random_seed=42):
    np.random.seed(random_seed)
    n_rows = 200
    
    # Pre-allocate arrays
    voltage_kv = np.zeros(n_rows)
    current_a = np.zeros(n_rows)
    thd_i = np.zeros(n_rows)
    temp_oti = np.zeros(n_rows)
    temp_wti = np.zeros(n_rows)
    p_mw = np.zeros(n_rows)
    q_mvar = np.zeros(n_rows)
    
    # -------------------------------------------------------------
    # Rows 0-99: Baseline Normal Operation
    # -------------------------------------------------------------
    voltage_kv[:100] = np.random.normal(loc=11.0, scale=0.05, size=100)
    current_a[:100] = np.random.normal(loc=250.0, scale=10.0, size=100)
    thd_i[:100] = np.random.uniform(low=2.0, high=3.2, size=100)
    temp_oti[:100] = np.random.normal(loc=52.0, scale=0.5, size=100)
    temp_wti[:100] = np.random.normal(loc=64.0, scale=0.7, size=100)
    p_mw[:100] = np.random.normal(loc=4.5, scale=0.1, size=100)
    q_mvar[:100] = np.random.normal(loc=1.2, scale=0.05, size=100)
    
    # -------------------------------------------------------------
    # Rows 100-199: Thermal Runaway & Harmonic Breakdown
    # Linearly degrade metrics across time step with slight realistic jitter
    # -------------------------------------------------------------
    t_steps = np.linspace(0, 1, 100)
    
    # Voltage sags down toward 10.4 kV
    v_start = 11.0
    v_end = 10.4
    voltage_kv[100:] = v_start + (v_end - v_start) * t_steps + np.random.normal(0, 0.02, 100)
    
    # Current escalates toward 430 A
    i_start = 250.0
    i_end = 430.0
    current_a[100:] = i_start + (i_end - i_start) * t_steps + np.random.normal(0, 3.0, 100)
    
    # THD_i surges from 3.2% to 15.5%
    thd_start = 3.2
    thd_end = 15.5
    thd_i[100:] = thd_start + (thd_end - thd_start) * t_steps + np.random.normal(0, 0.15, 100)
    
    # temp_oti rises from 52°C to 84°C
    oti_start = 52.0
    oti_end = 84.0
    temp_oti[100:] = oti_start + (oti_end - oti_start) * t_steps + np.random.normal(0, 0.3, 100)
    
    # temp_wti spikes from 64°C to 119°C (Delta theta climbs to 35°C: 119 - 84 = 35)
    wti_start = 64.0
    wti_end = 119.0
    temp_wti[100:] = wti_start + (wti_end - wti_start) * t_steps + np.random.normal(0, 0.4, 100)
    
    # p_mw remains around 4.5 MW with normal fluctuations
    p_mw[100:] = np.random.normal(loc=4.5, scale=0.08, size=100)
    
    # q_mvar surges from 1.2 to 3.7 MVAr (severe reactive displacement)
    q_start = 1.2
    q_end = 3.7
    q_mvar[100:] = q_start + (q_end - q_start) * t_steps + np.random.normal(0, 0.04, 100)
    
    df = pd.DataFrame({
        "step": np.arange(n_rows),
        "voltage_kv": np.round(voltage_kv, 3),
        "current_a": np.round(current_a, 2),
        "thd_i": np.round(np.clip(thd_i, 1.0, 25.0), 2),
        "temp_oti": np.round(temp_oti, 2),
        "temp_wti": np.round(temp_wti, 2),
        "p_mw": np.round(np.maximum(p_mw, 0.5), 3),
        "q_mvar": np.round(np.maximum(q_mvar, 0.1), 3),
    })
    
    # Calculate derived diagnostic columns
    df["delta_theta"] = np.round(df["temp_wti"] - df["temp_oti"], 2)
    df["q_p_ratio"] = np.round(df["q_mvar"] / df["p_mw"], 3)
    
    df.to_csv(filepath, index=False)
    print(f"[GridPulse SCADA] Generated {n_rows} rows of telemetry at {filepath}")
    return df

if __name__ == "__main__":
    generate_telemetry()
