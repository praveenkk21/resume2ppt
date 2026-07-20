from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.convert import router

app = FastAPI(title="Resume-to-PPT Editor", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
