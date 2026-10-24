"""
engine.py - Physics-Informed Health Scoring (CHI) & Isolation Forest Anomaly Detection.
Monitors 33/11 kV transformer health combining domain physics calculations
and unsupervised machine learning.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

def clamp(val, min_val=0.0, max_val=100.0):
    """Clamps a floating point number within [min_val, max_val]."""
    return max(min_val, min(max_val, float(val)))

class HealthEngine:
    """
    Evaluates Composite Health Index (CHI) and machine learning anomaly detection
    for high-voltage SCADA transformers.
    """
    
    FEATURE_COLS = [
        "voltage_kv", "current_a", "thd_i", 
        "temp_oti", "temp_wti", "delta_theta", 
        "p_mw", "q_mvar", "q_p_ratio"
    ]

    def __init__(self, random_state=42):
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.05,
            random_state=random_state,
            n_jobs=1
        )
        self.is_fitted = False
        self._fit_baseline_model()

    def _generate_synthetic_baseline(self, n_samples=500):
        """Generates clean normal operating distribution for baseline training."""
        np.random.seed(42)
        voltage = np.random.normal(11.0, 0.05, n_samples)
        current = np.random.normal(250.0, 10.0, n_samples)
        thd = np.random.uniform(2.0, 3.2, n_samples)
        temp_oti = np.random.normal(52.0, 0.5, n_samples)
        temp_wti = np.random.normal(64.0, 0.7, n_samples)
        delta_theta = temp_wti - temp_oti
        p_mw = np.random.normal(4.5, 0.1, n_samples)
        q_mvar = np.random.normal(1.2, 0.05, n_samples)
        q_p = q_mvar / np.maximum(p_mw, 0.1)

        data = {
            "voltage_kv": voltage,
            "current_a": current,
            "thd_i": thd,
            "temp_oti": temp_oti,
            "temp_wti": temp_wti,
            "delta_theta": delta_theta,
            "p_mw": p_mw,
            "q_mvar": q_mvar,
            "q_p_ratio": q_p
        }
        return pd.DataFrame(data)

    def _fit_baseline_model(self):
        """Pre-trains Isolation Forest on clean normal baseline distributions."""
        baseline_df = self._generate_synthetic_baseline(n_samples=1000)
        X = baseline_df[self.FEATURE_COLS].values
        self.model.fit(X)
        self.is_fitted = True
        print("[GridPulse Engine] IsolationForest pre-trained on baseline distribution.")

    def compute_chi(self, thd_i: float, delta_theta: float, q_p_ratio: float):
        """
        Physics-informed Composite Health Index:
          sigma_THD   = clamp(0, 100, (THD_i - 3.0) / (15.0 - 3.0) * 100)
          sigma_Delta = clamp(0, 100, (Delta_theta - 12.0) / (35.0 - 12.0) * 100)
          sigma_QP    = clamp(0, 100, (Q/P - 0.25) / (0.80 - 0.25) * 100)
          CHI         = clamp(0, 100, 100.0 - (0.45 * sigma_THD + 0.35 * sigma_Delta + 0.20 * sigma_QP))
        """
        # THD penalty
        sigma_thd = clamp(((thd_i - 3.0) / (15.0 - 3.0)) * 100.0)
        
        # Thermal gradient penalty (Delta theta)
        sigma_delta_theta = clamp(((delta_theta - 12.0) / (35.0 - 12.0)) * 100.0)
        
        # Reactive power displacement penalty
        sigma_qp = clamp(((q_p_ratio - 0.25) / (0.80 - 0.25)) * 100.0)
        
        # Weighted Composite Health Index
        weighted_penalty = (0.45 * sigma_thd) + (0.35 * sigma_delta_theta) + (0.20 * sigma_qp)
        chi = clamp(100.0 - weighted_penalty)

        # State determination
        if chi >= 80.0:
            status = "NORMAL"
            status_color = "#22c55e" # Green
        elif chi >= 60.0:
            status = "STRESS"
            status_color = "#eab308" # Yellow / Amber
        elif chi >= 40.0:
            status = "WARNING"
            status_color = "#f97316" # Orange
        else:
            status = "CRITICAL"
            status_color = "#ef4444" # Red

        return {
            "chi": round(chi, 2),
            "status": status,
            "status_color": status_color,
            "sigma_thd": round(sigma_thd, 2),
            "sigma_delta_theta": round(sigma_delta_theta, 2),
            "sigma_qp": round(sigma_qp, 2),
            "weighted_penalty": round(weighted_penalty, 2)
        }

    def process_telemetry_row(self, row: dict) -> dict:
        """
        Processes a single SCADA telemetry row, computing physics CHI and ML anomaly metrics.
        """
        voltage_kv = float(row.get("voltage_kv", 11.0))
        current_a = float(row.get("current_a", 250.0))
        thd_i = float(row.get("thd_i", 2.5))
        temp_oti = float(row.get("temp_oti", 52.0))
        temp_wti = float(row.get("temp_wti", 64.0))
        p_mw = max(0.01, float(row.get("p_mw", 4.5)))
        q_mvar = float(row.get("q_mvar", 1.2))

        delta_theta = temp_wti - temp_oti
        q_p_ratio = q_mvar / p_mw

        # Physics health scoring
        chi_res = self.compute_chi(thd_i, delta_theta, q_p_ratio)

        # Machine Learning Isolation Forest
        feature_vector = np.array([[
            voltage_kv, current_a, thd_i,
            temp_oti, temp_wti, delta_theta,
            p_mw, q_mvar, q_p_ratio
        ]])
        
        pred = self.model.predict(feature_vector)[0]
        # decision_function: < 0 is anomaly, > 0 is inlier
        dec_func = self.model.decision_function(feature_vector)[0]
        
        is_anomaly = bool(pred == -1)
        anomaly_score = round(float(dec_func), 4)

        # Normalized anomaly severity index (0% = perfectly normal, 100% = severe anomaly)
        # dec_func typically ranges from ~0.2 (very normal) to ~-0.35 (severe anomaly)
        norm_anomaly_idx = clamp(((0.15 - dec_func) / 0.45) * 100.0)

        return {
            "step": int(row.get("step", 0)),
            "voltage_kv": voltage_kv,
            "current_a": current_a,
            "thd_i": thd_i,
            "temp_oti": temp_oti,
            "temp_wti": temp_wti,
            "delta_theta": round(delta_theta, 2),
            "p_mw": p_mw,
            "q_mvar": q_mvar,
            "q_p_ratio": round(q_p_ratio, 3),
            "chi": chi_res["chi"],
            "status": chi_res["status"],
            "status_color": chi_res["status_color"],
            "sigma_thd": chi_res["sigma_thd"],
            "sigma_delta_theta": chi_res["sigma_delta_theta"],
            "sigma_qp": chi_res["sigma_qp"],
            "weighted_penalty": chi_res["weighted_penalty"],
            "is_anomaly": is_anomaly,
            "anomaly_score": anomaly_score,
            "anomaly_severity_pct": round(norm_anomaly_idx, 1)
        }

# Global singleton engine instance
engine = HealthEngine()
