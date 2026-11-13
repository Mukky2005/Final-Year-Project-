import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")
    PROJECT_NAME: str = "Tenant-Isolated Enterprise Knowledge Assistant"
    VERSION: str = "1.0.0"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgrespassword@localhost:5432/enterprise_knowledge"
    )
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "nomic-embed-text")
    CHAT_MODEL: str = os.getenv("CHAT_MODEL", "llama3.2")
    EMBEDDING_DIMENSION: int = 768
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 100
    SECRET_KEY: str = os.getenv("SECRET_KEY", "enterprise_secret_jwt_key_super_secure_mvp_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

settings = Settings()

