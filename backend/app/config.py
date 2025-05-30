import os
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_env_var(var_name: str, default=None, required=True):
    """Get environment variable with validation"""
    value = os.getenv(var_name, default)
    if required and not value:
        raise ValueError(f"Required environment variable {var_name} is not set")
    return value

# AssemblyAI Configuration
ASSEMBLY_API_KEY = get_env_var("ASSEMBLY_API_KEY", required=True)

# Supabase Configuration
SUPABASE_URL = get_env_var("SUPABASE_URL", required=True)
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET_NAME = get_env_var("SUPABASE_BUCKET_NAME", "audio-files")

# Database Configuration
DATABASE_URL = get_env_var(
    "DATABASE_URL", 
    "sqlite:///./speech_to_text.db",  # SQLite fallback for development
    required=False
)

# Server Configuration
HOST = get_env_var("HOST", "0.0.0.0", required=False)
PORT = int(get_env_var("PORT", "8000", required=False))
DEBUG = get_env_var("DEBUG", "False", required=False).lower() == "true"
LOG_LEVEL = get_env_var("LOG_LEVEL", "INFO", required=False)

# WebSocket Configuration
MAX_CONNECTIONS = int(get_env_var("MAX_CONNECTIONS", "100", required=False))
WEBSOCKET_TIMEOUT = int(get_env_var("WEBSOCKET_TIMEOUT", "300", required=False))

# File Upload Configuration
MAX_FILE_SIZE = int(get_env_var("MAX_FILE_SIZE", "104857600", required=False))  # 100MB
ALLOWED_EXTENSIONS = get_env_var(
    "ALLOWED_EXTENSIONS", 
    ".mp3,.wav,.m4a,.aac,.ogg,.flac,.webm",
    required=False
).split(",")

# Security Configuration
SECRET_KEY = get_env_var("SECRET_KEY", "your-secret-key-change-in-production", required=False)
ALLOWED_ORIGINS = get_env_var(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
    required=False
).split(",")

# Optional: Rate Limiting
RATE_LIMIT_REQUESTS = int(get_env_var("RATE_LIMIT_REQUESTS", "100", required=False))
RATE_LIMIT_WINDOW = int(get_env_var("RATE_LIMIT_WINDOW", "3600", required=False))

# Validate critical configuration
def validate_config():
    """Validate that all required configuration is present"""
    try:
        if not ASSEMBLY_API_KEY or ASSEMBLY_API_KEY == "your_assemblyai_api_key_here":
            logger.warning("⚠️  AssemblyAI API key not configured!")
            
        if not SUPABASE_URL or SUPABASE_URL == "https://your-project.supabase.co":
            logger.warning("⚠️  Supabase URL not configured!")
            
        if not SUPABASE_KEY or SUPABASE_KEY == "your_supabase_anon_key_here":
            logger.warning("⚠️  Supabase key not configured!")
            
        logger.info("✅ Configuration loaded successfully")
        logger.info(f"📊 Database: {DATABASE_URL}")
        logger.info(f"🌐 Server: {HOST}:{PORT}")
        logger.info(f"📁 Max file size: {MAX_FILE_SIZE / 1024 / 1024:.1f}MB")
        
    except Exception as e:
        logger.error(f"❌ Configuration validation failed: {e}")
        raise

# Run validation on import
validate_config() 