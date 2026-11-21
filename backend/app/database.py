import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import settings

logger = logging.getLogger(__name__)

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    """Ensure pgvector extension is enabled, all tables are created, and RLS policies are applied."""
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        conn.commit()

    Base.metadata.create_all(bind=engine)

    # Apply PostgreSQL native Row-Level Security (Section IV.D)
    migration_file = os.path.join(os.path.dirname(__file__), "migrations", "enable_rls.sql")
    if os.path.exists(migration_file):
        try:
            with open(migration_file, "r") as f:
                rls_sql = f.read()
            with engine.connect() as conn:
                for statement in rls_sql.split(";"):
                    stmt = statement.strip()
                    if stmt:
                        conn.execute(text(stmt))
                conn.commit()
            logger.info("PostgreSQL Row-Level Security (RLS) policies successfully activated.")
        except Exception as e:
            logger.warning(f"Could not apply native RLS migration: {e}")

def set_tenant_context(db: Session, tenant_id: str):
    """
    Sets transaction-local PostgreSQL session variable for RLS enforcement (Section IV.D).
    Uses SET LOCAL so context is automatically wiped when the transaction commits/ends,
    preventing connection pool contamination across requests.
    """
    if tenant_id:
        db.execute(text("SET LOCAL app.current_tenant_id = :tid"), {"tid": tenant_id})

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

