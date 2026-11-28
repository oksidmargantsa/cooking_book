from sqlalchemy import ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class UserDietPreference(Base):
    __tablename__ = "user_diet_preferences"
    __table_args__ = (Index("ix_user_diet_preferences_diet_tag_id", "diet_tag_id"),)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    diet_tag_id: Mapped[int] = mapped_column(primary_key=True)
