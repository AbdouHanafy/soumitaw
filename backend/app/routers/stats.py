from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Price, Product
from app.schemas import MapFilters, MapPoint, MapStatsResponse, RegionComparison, RegionHeatPoint
from app.services.geo_service import average_coordinates, normalize_place_name, resolve_coordinates

router = APIRouter(prefix="/api/stats", tags=["stats"])


def _decimal_average(value: object) -> Decimal:
    return Decimal(str(round(float(value), 3)))


@router.get("/map", response_model=MapStatsResponse)
def get_map_stats(
    category: str | None = Query(default=None),
    region: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> MapStatsResponse:
    selected_region = normalize_place_name(region)
    selected_category = category.strip() if category else None

    base_query = (
        select(Price)
        .options(joinedload(Price.product), joinedload(Price.merchant))
        .join(Product, Price.product_id == Product.id)
        .where(Price.status == "approved")
    )

    if selected_category:
        base_query = base_query.where(Product.category == selected_category)

    if selected_region:
        base_query = base_query.where(func.lower(Price.region) == selected_region)

    prices = list(db.scalars(base_query.order_by(Price.submitted_at.desc())).unique())

    points: list[MapPoint] = []
    regional_coordinates: dict[str, list[tuple[float, float]]] = {}

    for entry in prices:
        lat_lng = resolve_coordinates(
            city=entry.city or getattr(entry.merchant, "city", None),
            region=entry.region or getattr(entry.merchant, "region", None),
            latitude=float(entry.latitude) if entry.latitude is not None else None,
            longitude=float(entry.longitude) if entry.longitude is not None else None,
        )
        if not lat_lng:
            lat_lng = resolve_coordinates(
                city=getattr(entry.merchant, "city", None),
                region=getattr(entry.merchant, "region", None),
                latitude=float(entry.merchant.latitude) if entry.merchant and entry.merchant.latitude is not None else None,
                longitude=float(entry.merchant.longitude) if entry.merchant and entry.merchant.longitude is not None else None,
            )
        if not lat_lng:
            continue

        region_label = entry.region or getattr(entry.merchant, "region", None) or "Inconnue"
        regional_coordinates.setdefault(region_label, []).append(lat_lng)

        points.append(
            MapPoint(
                id=entry.id,
                product_id=entry.product.id,
                product_name=entry.product.name,
                category=entry.product.category,
                merchant_name=entry.merchant.name if entry.merchant else None,
                price=entry.price,
                city=entry.city or getattr(entry.merchant, "city", None),
                region=region_label,
                latitude=lat_lng[0],
                longitude=lat_lng[1],
                source=entry.source,
                confidence=entry.confidence,
            )
        )

    heat_query = (
        select(
            func.coalesce(Price.region, "Inconnue"),
            func.avg(Price.price),
            func.min(Price.price),
            func.max(Price.price),
            func.count(Price.id),
            func.count(func.distinct(Price.product_id)),
            func.max(Price.submitted_at),
        )
        .join(Product, Price.product_id == Product.id)
        .where(Price.status == "approved")
    )
    if selected_category:
        heat_query = heat_query.where(Product.category == selected_category)
    heat_rows = db.execute(
        heat_query
        .group_by(func.coalesce(Price.region, "Inconnue"))
        .order_by(func.avg(Price.price))
    ).all()

    if selected_region:
        heat_rows = [row for row in heat_rows if normalize_place_name(row[0]) == selected_region]

    max_avg = max((float(row[1]) for row in heat_rows), default=0.0)
    min_avg = min((float(row[1]) for row in heat_rows), default=0.0)
    value_range = max(max_avg - min_avg, 1.0)

    heatmap: list[RegionHeatPoint] = []
    comparisons: list[RegionComparison] = []

    for row in heat_rows:
        region_label = row[0]
        coords = average_coordinates(regional_coordinates.get(region_label, [])) or resolve_coordinates(region=region_label)
        if not coords:
            continue
        intensity = (float(row[1]) - min_avg) / value_range
        heatmap.append(
            RegionHeatPoint(
                region=region_label,
                average_price=_decimal_average(row[1]),
                min_price=row[2],
                max_price=row[3],
                sample_size=row[4],
                latitude=coords[0],
                longitude=coords[1],
                intensity=round(intensity, 3),
            )
        )
        comparisons.append(
            RegionComparison(
                region=region_label,
                average_price=_decimal_average(row[1]),
                product_coverage=row[5],
                latest_entry_at=row[6],
            )
        )

    region_options = [
        row[0]
        for row in db.execute(
            select(func.coalesce(Price.region, "Inconnue"))
            .where(Price.status == "approved")
            .group_by(func.coalesce(Price.region, "Inconnue"))
            .order_by(func.coalesce(Price.region, "Inconnue"))
        ).all()
    ]
    category_options = [
        row[0]
        for row in db.execute(
            select(func.distinct(Product.category))
            .where(Product.category.is_not(None))
            .order_by(Product.category.asc())
        ).all()
        if row[0]
    ]

    return MapStatsResponse(
        filters=MapFilters(regions=region_options, categories=category_options),
        points=points,
        heatmap=heatmap,
        comparisons=comparisons,
    )
