from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import properties, models
import uvicorn

app = FastAPI(title="SmartStay AI API")

# Enable CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your FE domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(properties.router, prefix="/api")
app.include_router(models.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to SmartStay AI API", "status": "running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
