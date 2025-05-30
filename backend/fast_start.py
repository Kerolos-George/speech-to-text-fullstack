#!/usr/bin/env python3
"""
Fast startup script for Speech-to-Text API
Optimized for development with faster startup times
"""

import os
import sys
import uvicorn
from pathlib import Path

# Add the current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Set environment variables for faster startup
os.environ["PYTHONUNBUFFERED"] = "1"
os.environ["UVICORN_WORKERS"] = "1"

def main():
    print("🚀 Starting Speech-to-Text API (Fast Mode)")
    print("📦 Loading minimal dependencies...")
    
    # Start with optimized uvicorn settings
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Disable reload for faster startup
        workers=1,
        access_log=False,  # Disable access logs for speed
        log_level="info",
        loop="asyncio"
    )

if __name__ == "__main__":
    main() 