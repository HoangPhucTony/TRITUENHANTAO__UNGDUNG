import os

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import models, properties
from schemas import HealthResponse
from services.data_service import data_service
from services.model_service import model_service

load_dotenv()

DEFAULT_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:8082",
    "http://127.0.0.1:8082",
]
LOCAL_DEV_ORIGIN_REGEX = r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"


def get_cors_origins():
    raw_origins = os.getenv("CORS_ORIGINS", "")
    if not raw_origins.strip():
        return DEFAULT_CORS_ORIGINS

    origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    return origins or DEFAULT_CORS_ORIGINS


HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
CORS_ORIGINS = get_cors_origins()
ALLOW_ALL_ORIGINS = CORS_ORIGINS == ["*"]

app = FastAPI(title="SmartStay AI API")

# Enable CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=LOCAL_DEV_ORIGIN_REGEX,
    allow_credentials=not ALLOW_ALL_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(properties.router, prefix="/api")
app.include_router(models.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to SmartStay AI API", "status": "running"}


@app.get("/health", response_model=HealthResponse)
async def health():
    return {
        "status": "ok",
        "data_loaded": not data_service.df.empty,
        "models_loaded": sorted(model_service.models.keys()),
        "cors_origins": CORS_ORIGINS,
        "allow_origin_regex": LOCAL_DEV_ORIGIN_REGEX,
        "dataset": data_service.get_summary() or None,
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
