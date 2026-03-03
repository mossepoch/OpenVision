from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_cameras():
    return {"cameras": [], "total": 0}

@router.post("/")
async def add_camera(name: str, url: str):
    return {"id": 1, "name": name, "url": url, "status": "offline"}
