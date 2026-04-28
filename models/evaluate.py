import numpy as np
import joblib
from sklearn.metrics import (
    accuracy_score,
    explained_variance_score,
    f1_score,
    mean_absolute_error,
    mean_absolute_percentage_error,
    mean_squared_error,
    median_absolute_error,
    precision_score,
    r2_score,
    recall_score,
)

from models.lstm import MODEL_PATH, SCALER_PATH
from models.pinn import physics_estimate
from utils.preprocess import load_data


def _regression_metrics(y_true, y_pred):
    mse = mean_squared_error(y_true, y_pred)
    return {
        "mse": float(mse),
        "rmse": float(np.sqrt(mse)),
        "mae": float(mean_absolute_error(y_true, y_pred)),
        "r2": float(r2_score(y_true, y_pred)),
        "explained_variance": float(explained_variance_score(y_true, y_pred)),
        "median_ae": float(median_absolute_error(y_true, y_pred)),
        "mape": float(mean_absolute_percentage_error(y_true, y_pred)),
    }


def _classification_proxy(y_true, y_pred, threshold):
    y_true_bin = (y_true >= threshold).astype(int)
    y_pred_bin = (y_pred >= threshold).astype(int)
    return {
        "threshold": float(threshold),
        "accuracy": float(accuracy_score(y_true_bin, y_pred_bin)),
        "precision": float(precision_score(y_true_bin, y_pred_bin, zero_division=0)),
        "recall": float(recall_score(y_true_bin, y_pred_bin, zero_division=0)),
        "f1": float(f1_score(y_true_bin, y_pred_bin, zero_division=0)),
    }


def evaluate_models():
    (_X_train, X_test, _y_train, y_test), _ = load_data()
    model = joblib.load(str(MODEL_PATH))
    scaler = joblib.load(str(SCALER_PATH))

    y_true = np.asarray(y_test, dtype=float)
    y_pred_mlp = np.asarray(model.predict(X_test), dtype=float)
    X_test_original = scaler.inverse_transform(X_test)
    y_pred_physics = np.array(
        [physics_estimate(v, t, f) for v, t, f in X_test_original], dtype=float
    )
    y_pred_hybrid = 0.7 * y_pred_mlp + 0.3 * y_pred_physics

    threshold = float(np.median(y_true))
    return {
        "models": {
            "mlp": {
                "regression": _regression_metrics(y_true, y_pred_mlp),
                "classification_proxy": _classification_proxy(
                    y_true, y_pred_mlp, threshold
                ),
            },
            "physics": {
                "regression": _regression_metrics(y_true, y_pred_physics),
                "classification_proxy": _classification_proxy(
                    y_true, y_pred_physics, threshold
                ),
            },
            "hybrid": {
                "regression": _regression_metrics(y_true, y_pred_hybrid),
                "classification_proxy": _classification_proxy(
                    y_true, y_pred_hybrid, threshold
                ),
            },
        }
    }
