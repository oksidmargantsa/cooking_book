import argparse
import asyncio


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
    args = parser.parse_args()

    if args.command == "cleanup":
        deleted = asyncio.run(cleanup())
        print(f"Deleted expired refresh tokens: {deleted}")


if __name__ == "__main__":
    main()
