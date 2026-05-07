from decimal import Decimal
from difflib import SequenceMatcher

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Product
from app.schemas import ProductNormalization


ALIASES = {
    "huile cristal 1l": "Huile vegetale 1L",
    "huile 1l": "Huile vegetale 1L",
    "زيت نباتي": "Huile vegetale 1L",
    "lait 1l": "Lait demi-ecreme 1L",
    "semoule fine": "Semoule fine 1kg",
}


def normalize_product_name(db: Session, raw_name: str) -> ProductNormalization:
    cleaned = " ".join(raw_name.lower().split()).strip()
    mapped = ALIASES.get(cleaned)
    products = list(db.scalars(select(Product).order_by(Product.name.asc())))

    best_product = None
    best_score = 0.0

    for product in products:
        candidate_names = {product.name.lower(), cleaned}
        if mapped:
            candidate_names.add(mapped.lower())
        score = max(SequenceMatcher(None, cleaned, name).ratio() for name in candidate_names)
        if mapped and product.name == mapped:
            score = max(score, 0.96)
        if score > best_score:
            best_score = score
            best_product = product

    normalized_name = best_product.name if best_product else raw_name.strip()
    confidence = Decimal(str(round(best_score or 0.55, 2)))

    return ProductNormalization(
        product_id=best_product.id if best_product else None,
        normalized_name=normalized_name,
        confidence=confidence,
        needs_confirmation=confidence < Decimal("0.80"),
    )

