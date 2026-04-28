import joblib
import pandas as pd

from data.generate_data import DATA_PATH, generate_dataset
from models.lstm import MODEL_PATH, SCALER_PATH, train_lstm_model
from models.pinn import physics_estimate

_lstm_model = None
_scaler = None


def _ensure_artifacts():
    if not DATA_PATH.exists():
        generate_dataset()
    if not MODEL_PATH.exists() or not SCALER_PATH.exists():
        train_lstm_model()


def _load_components():
    global _lstm_model, _scaler
    if _lstm_model is None or _scaler is None:
        _ensure_artifacts()
        _lstm_model = joblib.load(str(MODEL_PATH))
        _scaler = joblib.load(str(SCALER_PATH))


def predict(vds: float, temp: float, freq: float) -> float:
    _load_components()
    X = pd.DataFrame([[vds, temp, freq]], columns=["Vds", "Temp", "Freq"])
    X_scaled = _scaler.transform(X)
    lstm_pred = float(_lstm_model.predict(X_scaled)[0])
    pinn_pred = physics_estimate(vds, temp, freq)

    # Blend data-driven and physics-inspired estimates.
    final = 0.7 * lstm_pred + 0.3 * pinn_pred
    return float(max(final, 0.0))