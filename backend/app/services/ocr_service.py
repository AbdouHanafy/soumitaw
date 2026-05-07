import re
from decimal import Decimal, InvalidOperation

from app.schemas import OCRPreview


PRICE_PATTERN = re.compile(r"(\d{1,3}(?:[.,]\d{1,3})?)")


def extract_ticket_preview(raw_text: str | None, filename: str | None = None) -> OCRPreview:
    text = (raw_text or "").strip()
    product_name = None
    merchant_hint = filename
    detected_price = None

    if text:
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        if lines:
            merchant_hint = merchant_hint or lines[0]
            product_name = lines[1] if len(lines) > 1 else lines[0]
        match = PRICE_PATTERN.search(text.replace(",", "."))
        if match:
            try:
                detected_price = Decimal(match.group(1).replace(",", "."))
            except InvalidOperation:
                detected_price = None

    return OCRPreview(
        raw_text=text,
        detected_product_name=product_name,
        detected_price=detected_price,
        merchant_hint=merchant_hint,
    )
