from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers.health import router as health_router
from app.routers.product_detail import router as product_detail_router
from app.routers.prices import router as prices_router
from app.routers.profile import router as profile_router
from app.routers.products import router as products_router
from app.routers.stats import router as stats_router
from app.routers.submit import router as submit_router

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(products_router)
app.include_router(product_detail_router)
app.include_router(prices_router)
app.include_router(stats_router)
app.include_router(submit_router)
app.include_router(profile_router)
