from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from models.evaluate import evaluate_models
from models.hybrid_model import predict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROOT = Path(__file__).resolve().parents[1]
STATIC_DIR = ROOT / "web"
STATIC_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/")
def home():
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return {"message": "GaN Digital Twin API Running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/metrics")
def get_metrics():
    try:
        return evaluate_models()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to evaluate metrics: {exc}")


@app.get("/predict")
def get_prediction(vds: float, temp: float, freq: float):
    if vds < 0 or temp < -50 or freq <= 0:
        raise HTTPException(status_code=400, detail="Invalid input ranges.")
    result = predict(vds, temp, freq)
    return {"Ids_prediction": result}