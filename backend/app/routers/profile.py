import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Price, User
from app.schemas import UserProfile

router = APIRouter(prefix="/api/profile", tags=["profile"])


def get_level(points: int) -> tuple[str, int | None]:
    if points >= 100:
        return "Champion", None
    if points >= 50:
        return "Expert", 100
    return "Contributeur", 50


@router.get("/{user_id}", response_model=UserProfile)
def get_profile(user_id: uuid.UUID, db: Session = Depends(get_db)) -> UserProfile:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    submissions = list(
        db.scalars(
            select(Price)
            .options(joinedload(Price.product), joinedload(Price.merchant))
            .where(Price.submitted_by == user_id)
            .order_by(Price.submitted_at.desc())
        )
    )

    level, next_level_points = get_level(user.points)
    return UserProfile(
        user=user,
        level=level,
        next_level_points=next_level_points,
        submissions=submissions,
    )
