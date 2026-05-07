import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Price, Product, User
from app.schemas import OCRPreview, ProductNormalization, SubmitPriceResponse
from app.services.ai_service import normalize_product_name
from app.services.geo_service import resolve_coordinates
from app.services.ocr_service import extract_ticket_preview

router = APIRouter(prefix="/api/submit", tags=["submit"])

POINTS_PER_SUBMISSION = 10


@router.post("/analyze", response_model=OCRPreview)
async def analyze_submission(
    raw_text: str = Form(default=""),
    photo: UploadFile | None = File(default=None),
) -> OCRPreview:
    preview = extract_ticket_preview(raw_text=raw_text, filename=photo.filename if photo else None)
    return preview


@router.post("", response_model=SubmitPriceResponse)
async def submit_price(
    product_name: str = Form(...),
    price: Decimal = Form(...),
    city: str = Form(...),
    region: str = Form(...),
    source: str = Form(default="citizen"),
    user_id: uuid.UUID = Form(...),
    latitude: Decimal | None = Form(default=None),
    longitude: Decimal | None = Form(default=None),
    photo: UploadFile | None = File(default=None),
    raw_text: str = Form(default=""),
    confirm_low_confidence: bool = Form(default=False),
    db: Session = Depends(get_db),
) -> SubmitPriceResponse:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    normalization = normalize_product_name(db, product_name)
    if normalization.needs_confirmation and not confirm_low_confidence:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Low confidence normalization, confirmation required",
                "normalization": normalization.model_dump(mode="json"),
            },
        )

    product = db.get(Product, normalization.product_id) if normalization.product_id else None
    if not product:
        product = Product(
            id=uuid.uuid4(),
            name=normalization.normalized_name,
            category="A confirmer",
            unit=None,
            barcode=None,
        )
        db.add(product)
        db.flush()
        normalization = ProductNormalization(
            product_id=product.id,
            normalized_name=product.name,
            confidence=normalization.confidence,
            needs_confirmation=False,
        )

    coordinates = resolve_coordinates(
        city=city,
        region=region,
        latitude=float(latitude) if latitude is not None else None,
        longitude=float(longitude) if longitude is not None else None,
    )

    submitted_price = Price(
        id=uuid.uuid4(),
        product_id=product.id,
        price=price,
        currency="TND",
        source=source,
        confidence=normalization.confidence,
        status="pending" if normalization.needs_confirmation else "approved",
        photo_url=photo.filename if photo else None,
        latitude=coordinates[0] if coordinates else latitude,
        longitude=coordinates[1] if coordinates else longitude,
        city=city,
        region=region,
        submitted_by=user.id,
    )
    db.add(submitted_price)
    user.points += POINTS_PER_SUBMISSION
    db.commit()
    db.refresh(user)

    price_with_relations = (
        db.query(Price)
        .options(joinedload(Price.product), joinedload(Price.merchant))
        .filter(Price.id == submitted_price.id)
        .one()
    )

    return SubmitPriceResponse(
        price=price_with_relations,
        user=user,
        points_awarded=POINTS_PER_SUBMISSION,
        normalization=normalization,
    )
