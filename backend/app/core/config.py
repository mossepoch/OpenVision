from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./openvision.db"
    LLM_API_KEY: str = ""
    LLM_BASE_URL: str = "https://claude.mengzhaoxu.cn/claude"
    
    class Config:
        env_file = ".env"

settings = Settings()
