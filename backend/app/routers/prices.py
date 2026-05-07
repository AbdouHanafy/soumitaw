from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Price, Product
from app.schemas import PriceRead

router = APIRouter(prefix="/api/prices", tags=["prices"])


@router.get("", response_model=list[PriceRead])
def list_prices(
    search: str | None = Query(default=None, description="Filter by product name"),
    city: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[Price]:
    query = select(Price).options(joinedload(Price.product), joinedload(Price.merchant))

    if search:
        query = query.join(Product, Price.product_id == Product.id).where(
            Product.name.ilike(f"%{search.strip()}%")
        )

    if city:
        query = query.where(Price.city.ilike(city.strip()))

    query = (
        query.where(Price.status == "approved")
        .order_by(Price.submitted_at.desc())
        .limit(limit)
    )

    return list(db.scalars(query).unique())
