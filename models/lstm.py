from pathlib import Path

import joblib
from sklearn.neural_network import MLPRegressor

from utils.preprocess import load_data

ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "models" / "ml_model.joblib"
SCALER_PATH = ROOT / "models" / "scaler.save"


def train_lstm_model(epochs: int = 8, batch_size: int = 32):
    (X_train, _X_test, y_train, _y_test), scaler = load_data()
    model = MLPRegressor(
        hidden_layer_sizes=(64, 32),
        activation="relu",
        solver="adam",
        max_iter=max(epochs * 150, 800),
        early_stopping=True,
        random_state=42,
    )
    model.fit(X_train, y_train)

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    return MODEL_PATH, SCALER_PATH


if __name__ == "__main__":
    model_path, scaler_path = train_lstm_model()
    print(f"LSTM trained and saved: {model_path}, {scaler_path}")