from pydantic import BaseModel


class DictionaryItem(BaseModel):
    id: int
    name: str


class DictionaryResponse(BaseModel):
    items: list[DictionaryItem]
