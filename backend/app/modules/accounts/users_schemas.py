from pydantic import BaseModel


class UserProfile(BaseModel):
    id: int
    login: str
    diet_tags: list[int]
