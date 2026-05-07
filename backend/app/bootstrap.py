from pathlib import Path

from sqlalchemy import text

from app.database import engine


MIGRATIONS_DIR = Path(__file__).resolve().parent.parent / "migrations"


def apply_sql_migrations() -> None:
    migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    if not migration_files:
        return

    with engine.begin() as connection:
        for migration in migration_files:
            sql = migration.read_text(encoding="utf-8")
            if not sql.strip():
                continue
            connection.execute(text(sql))


if __name__ == "__main__":
    apply_sql_migrations()
