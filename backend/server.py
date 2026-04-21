"""
SKAPA FastAPI server entry point.
"""
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import router as auth_router
from config import settings
from db import close_db, init_db
from drops import router as drops_router
from me import router as me_router
from rooms import router as rooms_router
from listening_events import router as listening_router, poll_listening_events


# Background task handle
_polling_task = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _polling_task
    await init_db()
    
    # Start background listening events polling
    _polling_task = asyncio.create_task(poll_listening_events())
    print("[SKAPA] Started listening events polling...")
    
    yield
    
    # Cleanup
    if _polling_task:
        _polling_task.cancel()
        try:
            await _polling_task
        except asyncio.CancelledError:
            pass
    await close_db()


app = FastAPI(title="SKAPA API", version="0.1.0", lifespan=lifespan)

origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")] if settings.CORS_ORIGINS else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"ok": True, "service": "skapa", "version": "0.1.0"}


app.include_router(auth_router)
app.include_router(me_router)
app.include_router(drops_router)
app.include_router(rooms_router)
app.include_router(listening_router)
