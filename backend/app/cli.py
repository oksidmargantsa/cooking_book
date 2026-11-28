import argparse
import asyncio
from pathlib import Path

from app.modules.catalog.ingredient_seed import SNAPSHOT, download_snapshot, seed_ingredients


async def cleanup() -> int:
    from app.core.db import SessionLocal, engine
    from app.modules.accounts.auth_service import AuthService

    try:
        async with SessionLocal() as session:
            return await AuthService(session).cleanup_expired_tokens()
    finally:
        await engine.dispose()


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m app.cli")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("cleanup", help="Delete expired refresh tokens")
    download = commands.add_parser("download-ingredients", help="Fetch a Russian ingredient CSV")
    download.add_argument("--output", type=Path, default=SNAPSHOT)
    seed = commands.add_parser("seed-ingredients", help="Import the ingredient CSV into PostgreSQL")
    seed.add_argument("--input", type=Path, default=SNAPSHOT)
    args = parser.parse_args()

    if args.command == "cleanup":
        deleted = asyncio.run(cleanup())
        print(f"Deleted expired refresh tokens: {deleted}")
    elif args.command == "download-ingredients":
        downloaded = download_snapshot(args.output)
        print(f"Downloaded Russian ingredients: {downloaded}")
    elif args.command == "seed-ingredients":
        inserted = asyncio.run(seed_ingredients(args.input))
        print(f"Inserted ingredients: {inserted}")


if __name__ == "__main__":
    main()
