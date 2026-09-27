from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import router
from app.core import init_db
from app.seed import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed()
    yield


app = FastAPI(title="Shiply Iran API", version="1.0.0", lifespan=lifespan,
              description="بازارگاه مزایده معکوس حمل بار / Reverse-auction freight marketplace")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])
app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok"}
