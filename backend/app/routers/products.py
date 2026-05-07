from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product
from app.schemas import CategoryOption, ProductRead

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=list[ProductRead])
def list_products(
    search: str | None = Query(default=None, description="Basic product search"),
    category: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[Product]:
    query = select(Product).order_by(Product.name.asc()).limit(limit)
    if search:
        query = (
            select(Product)
            .where(Product.name.ilike(f"%{search.strip()}%"))
            .order_by(Product.name.asc())
            .limit(limit)
        )
    if category:
        query = (
            select(Product)
            .where(Product.category == category)
            .order_by(Product.name.asc())
            .limit(limit)
        )
        if search:
            query = (
                select(Product)
                .where(Product.category == category)
                .where(Product.name.ilike(f"%{search.strip()}%"))
                .order_by(Product.name.asc())
                .limit(limit)
            )
    return list(db.scalars(query))


@router.get("/categories", response_model=list[CategoryOption])
def list_categories(db: Session = Depends(get_db)) -> list[CategoryOption]:
    rows = db.execute(
        select(Product.category, func.count(Product.id))
        .where(Product.category.is_not(None))
        .group_by(Product.category)
        .order_by(Product.category.asc())
    ).all()
    return [CategoryOption(category=row[0], product_count=row[1]) for row in rows if row[0]]
