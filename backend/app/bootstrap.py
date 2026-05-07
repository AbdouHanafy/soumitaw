import sys
import traceback
from pathlib import Path

from sqlalchemy import text

from app.database import engine


MIGRATIONS_DIR = Path(__file__).resolve().parent.parent / "migrations"


def apply_sql_migrations() -> None:
    migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    if not migration_files:
        print("Bootstrap: no SQL migrations found", flush=True)
        return

    print(f"Bootstrap: applying {len(migration_files)} migration file(s)", flush=True)
    with engine.begin() as connection:
        connection.execute(text("SELECT 1"))
        print("Bootstrap: database connection succeeded", flush=True)
        for migration in migration_files:
            print(f"Bootstrap: running migration {migration.name}", flush=True)
            sql = migration.read_text(encoding="utf-8")
            if not sql.strip():
                print(f"Bootstrap: skipping empty migration {migration.name}", flush=True)
                continue
            connection.execute(text(sql))
            print(f"Bootstrap: migration {migration.name} completed", flush=True)


if __name__ == "__main__":
    try:
        apply_sql_migrations()
        print("Bootstrap: completed successfully", flush=True)
    except Exception as exc:
        print(f"Bootstrap: failed with {exc.__class__.__name__}: {exc}", file=sys.stderr, flush=True)
        traceback.print_exc()
        raise
