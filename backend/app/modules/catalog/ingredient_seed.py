import csv
import re
import unicodedata
from collections.abc import Iterable
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import TypedDict
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ingredient import INGREDIENT_NAME_MAX_LENGTH, Ingredient

DATA_DIRECTORY = Path(__file__).resolve().parents[3] / "data"
SNAPSHOT = DATA_DIRECTORY / "ingredients_ru.csv"
SNAPSHOT_FIELDS = ("wikidata_id", "name")
WIKIDATA_QUERY = DATA_DIRECTORY / "ingredients_ru.sparql"
WIKIDATA_ENDPOINT = "https://query-next.wikidata.org/sparql"
WIKIDATA_ID = re.compile(r"Q[1-9][0-9]{0,18}")
RUSSIAN_LETTER = re.compile(r"[а-яё]", re.IGNORECASE)


class IngredientRow(TypedDict):
    wikidata_id: str
    name: str


def normalize_name(name: str) -> str:
    return unicodedata.normalize("NFC", " ".join(name.split()))


def name_key(name: str) -> str:
    return name.lower().replace("ё", "е")


def parse_wikidata_rows(lines: Iterable[str]) -> list[IngredientRow]:
    reader = csv.DictReader(lines)
    if reader.fieldnames != ["item", "name", "uses"]:
        raise ValueError("Unexpected Wikidata CSV columns")

    ingredients: dict[str, IngredientRow] = {}
    for row in reader:
        wikidata_id = row["item"].rsplit("/", 1)[-1]
        name = normalize_name(row["name"])
        if not WIKIDATA_ID.fullmatch(wikidata_id):
            raise ValueError(f"Invalid Wikidata identifier: {wikidata_id}")
        if len(name) <= INGREDIENT_NAME_MAX_LENGTH and RUSSIAN_LETTER.search(name):
            # The query sorts by usage so the most commonly cited entity wins name collisions.
            ingredients.setdefault(name_key(name), {"wikidata_id": wikidata_id, "name": name})

    if not ingredients:
        raise ValueError("Wikidata returned no Russian ingredients")
    return [ingredients[key] for key in sorted(ingredients)]


def download_snapshot(output: Path) -> int:
    query = WIKIDATA_QUERY.read_text(encoding="utf-8")
    request = Request(
        f"{WIKIDATA_ENDPOINT}?{urlencode({'query': query})}",
        headers={
            "Accept": "text/csv",
            "User-Agent": "CookingBookStudentProject/1.0 (https://github.com/oksidmargantsa/cooking_book)",
        },
    )
    with urlopen(request, timeout=60) as response:
        ingredients = parse_wikidata_rows(response.read().decode("utf-8").splitlines(keepends=True))

    temporary_file = NamedTemporaryFile(
        "w", encoding="utf-8", newline="", dir=output.parent, delete=False
    )
    temporary_path = Path(temporary_file.name)
    try:
        with temporary_file as file:
            writer = csv.DictWriter(file, fieldnames=SNAPSHOT_FIELDS, lineterminator="\n")
            writer.writeheader()
            writer.writerows(ingredients)
        temporary_path.replace(output)
    finally:
        temporary_path.unlink(missing_ok=True)
    return len(ingredients)


def load_snapshot(path: Path) -> list[IngredientRow]:
    with path.open(encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)
        if reader.fieldnames != list(SNAPSHOT_FIELDS):
            raise ValueError(f"Invalid ingredient CSV columns: {path}")
        ingredients = []
        for row in reader:
            wikidata_id = row["wikidata_id"] or ""
            name = normalize_name(row["name"] or "")
            if (
                not WIKIDATA_ID.fullmatch(wikidata_id)
                or not RUSSIAN_LETTER.search(name)
                or len(name) > INGREDIENT_NAME_MAX_LENGTH
            ):
                raise ValueError(f"Invalid ingredient at {path}:{reader.line_num}")
            ingredients.append(IngredientRow(wikidata_id=wikidata_id, name=name))
    if not ingredients:
        raise ValueError(f"Ingredient CSV is empty: {path}")
    return ingredients


async def insert_ingredients(session: AsyncSession, ingredients: list[IngredientRow]) -> int:
    statement = insert(Ingredient).on_conflict_do_nothing().returning(Ingredient.id)
    ids = await session.scalars(statement, ingredients)
    return len(ids.all())


async def seed_ingredients(path: Path) -> int:
    from app.core.db import SessionLocal, engine

    try:
        ingredients = load_snapshot(path)
        async with SessionLocal.begin() as session:
            return await insert_ingredients(session, ingredients)
    finally:
        await engine.dispose()
