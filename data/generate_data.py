from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "gan_data.csv"


def generate_dataset(n: int = 10_000, output_path: Path = DATA_PATH) -> Path:
    rng = np.random.default_rng(42)
    data = pd.DataFrame(
        {
            "Vds": rng.uniform(0, 600, n),
            "Temp": rng.uniform(25, 150, n),
            "Freq": rng.uniform(1e4, 1e6, n),
        }
    )

    # Simplified synthetic relation for current behavior.
    data["Rds_on"] = 0.01 + 0.0001 * data["Temp"] + 1e-7 * data["Freq"]
    data["Ids"] = data["Vds"] / data["Rds_on"]

    output_path.parent.mkdir(parents=True, exist_ok=True)
    data.to_csv(output_path, index=False)
    return output_path


if __name__ == "__main__":
    path = generate_dataset()
    print(f"Dataset generated at {path}")