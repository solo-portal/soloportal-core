from fastapi import FastAPI

app = FastAPI(title="Solo Portal API")


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "project": "Solo Portal"
    }