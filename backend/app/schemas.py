from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProductRead(BaseModel):
    id: UUID
    name: str
    category: str | None = None
    unit: str | None = None
    barcode: str | None = None

    model_config = ConfigDict(from_attributes=True)


class MerchantSummary(BaseModel):
    id: UUID
    name: str
    city: str | None = None
    region: str | None = None

    model_config = ConfigDict(from_attributes=True)


class PriceRead(BaseModel):
    id: UUID
    price: Decimal
    currency: str
    source: str | None = None
    confidence: Decimal | None = None
    status: str
    city: str | None = None
    region: str | None = None
    submitted_at: datetime
    product: ProductRead
    merchant: MerchantSummary | None = None

    model_config = ConfigDict(from_attributes=True)


class CategoryOption(BaseModel):
    category: str
    product_count: int


class MapPoint(BaseModel):
    id: UUID
    product_id: UUID
    product_name: str
    category: str | None = None
    merchant_name: str | None = None
    price: Decimal
    city: str | None = None
    region: str | None = None
    latitude: float
    longitude: float
    source: str | None = None
    confidence: Decimal | None = None


class RegionHeatPoint(BaseModel):
    region: str
    average_price: Decimal
    min_price: Decimal
    max_price: Decimal
    sample_size: int
    latitude: float
    longitude: float
    intensity: float


class RegionComparison(BaseModel):
    region: str
    average_price: Decimal
    product_coverage: int
    latest_entry_at: datetime


class MapFilters(BaseModel):
    regions: list[str]
    categories: list[str]


class MapStatsResponse(BaseModel):
    filters: MapFilters
    points: list[MapPoint]
    heatmap: list[RegionHeatPoint]
    comparisons: list[RegionComparison]


class PriceSummary(BaseModel):
    id: UUID
    price: Decimal
    city: str | None = None
    region: str | None = None
    source: str | None = None
    confidence: Decimal | None = None
    status: str
    submitted_at: datetime
    merchant: MerchantSummary | None = None

    model_config = ConfigDict(from_attributes=True)


class ProductStats(BaseModel):
    min_price: Decimal | None = None
    max_price: Decimal | None = None
    avg_price: Decimal | None = None
    entries: int


class ProductTimelinePoint(BaseModel):
    label: str
    average_price: Decimal
    sample_size: int


class ProductRegionStat(BaseModel):
    region: str
    min_price: Decimal
    max_price: Decimal
    avg_price: Decimal


class ProductDetail(BaseModel):
    product: ProductRead
    stats: ProductStats
    timeline: list[ProductTimelinePoint]
    region_stats: list[ProductRegionStat]
    merchants: list[PriceSummary]


class UserRead(BaseModel):
    id: UUID
    email: str | None = None
    role: str
    points: int
    reputation: Decimal

    model_config = ConfigDict(from_attributes=True)


class UserProfile(BaseModel):
    user: UserRead
    level: str
    next_level_points: int | None = None
    submissions: list[PriceRead]


class OCRPreview(BaseModel):
    raw_text: str
    detected_product_name: str | None = None
    detected_price: Decimal | None = None
    merchant_hint: str | None = None


class ProductNormalization(BaseModel):
    product_id: UUID | None = None
    normalized_name: str
    confidence: Decimal = Field(default=Decimal("0.60"))
    needs_confirmation: bool


class SubmitPriceResponse(BaseModel):
    price: PriceRead
    user: UserRead | None = None
    points_awarded: int
    normalization: ProductNormalization
