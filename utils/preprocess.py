from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "gan_data.csv"


def load_data(data_path: Path = DATA_PATH):
    df = pd.read_csv(data_path)
    X = df[["Vds", "Temp", "Freq"]]
    y = df["Ids"]

    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    return train_test_split(X_scaled, y, test_size=0.2, random_state=42), scaler