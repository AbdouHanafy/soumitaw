import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Price, Product
from app.schemas import ProductDetail, ProductRegionStat, ProductStats, ProductTimelinePoint

router = APIRouter(prefix="/api/products", tags=["product-detail"])


@router.get("/{product_id}", response_model=ProductDetail)
def get_product_detail(product_id: uuid.UUID, db: Session = Depends(get_db)) -> ProductDetail:
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    merchant_prices = list(
        db.scalars(
            select(Price)
            .options(joinedload(Price.merchant))
            .where(Price.product_id == product_id)
            .where(Price.status.in_(["approved", "pending"]))
            .order_by(Price.submitted_at.desc())
        )
    )

    stats_row = db.execute(
        select(
            func.min(Price.price),
            func.max(Price.price),
            func.avg(Price.price),
            func.count(Price.id),
        ).where(Price.product_id == product_id)
    ).one()

    timeline_rows = db.execute(
        select(
            func.to_char(Price.submitted_at, "YYYY-MM-DD"),
            func.avg(Price.price),
            func.count(Price.id),
        )
        .where(Price.product_id == product_id)
        .group_by(func.to_char(Price.submitted_at, "YYYY-MM-DD"))
        .order_by(func.to_char(Price.submitted_at, "YYYY-MM-DD"))
    ).all()

    region_rows = db.execute(
        select(
            func.coalesce(Price.region, "Inconnue"),
            func.min(Price.price),
            func.max(Price.price),
            func.avg(Price.price),
        )
        .where(Price.product_id == product_id)
        .group_by(func.coalesce(Price.region, "Inconnue"))
        .order_by(func.avg(Price.price))
    ).all()

    return ProductDetail(
        product=product,
        stats=ProductStats(
            min_price=stats_row[0],
            max_price=stats_row[1],
            avg_price=Decimal(str(round(stats_row[2], 3))) if stats_row[2] is not None else None,
            entries=stats_row[3] or 0,
        ),
        timeline=[
            ProductTimelinePoint(
                label=row[0],
                average_price=Decimal(str(round(row[1], 3))),
                sample_size=row[2],
            )
            for row in timeline_rows
        ],
        region_stats=[
            ProductRegionStat(
                region=row[0],
                min_price=row[1],
                max_price=row[2],
                avg_price=Decimal(str(round(row[3], 3))),
            )
            for row in region_rows
        ],
        merchants=merchant_prices,
    )
