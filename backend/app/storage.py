import os
import uuid
from supabase import create_client, Client
import httpx
from .config import SUPABASE_URL, SUPABASE_KEY
import logging

# Optimize logging for performance
logger = logging.getLogger(__name__)
logger.setLevel(logging.WARNING)  # Reduce log verbosity for speed

# Initialize Supabase client (cached)
_supabase_client = None

def get_supabase_client() -> Client:
    """Get cached Supabase client for better performance"""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase_client

async def upload_audio_file(audio_data: bytes, file_extension: str = ".wav") -> str:
    """
    Optimized audio file upload to Supabase storage
    """
    # Generate unique filename
    filename = f"audio_{uuid.uuid4()}{file_extension}"
    
    try:
        # Primary method: Supabase Python client (faster)
        supabase = get_supabase_client()
        
        # Upload with optimized settings
        response = supabase.storage.from_("audio-files").upload(
            path=filename,
            file=audio_data,
            file_options={
                "content-type": f"audio/{file_extension[1:] if file_extension.startswith('.') else file_extension}",
                "cache-control": "3600"  # 1 hour cache
            }
        )
        
        if response:
            # Get public URL
            public_url_response = supabase.storage.from_("audio-files").get_public_url(filename)
            if public_url_response:
                return public_url_response
        
        raise Exception("Failed to get public URL from Supabase")
        
    except Exception as e:
        logger.warning(f"Supabase upload failed: {e}")
        
        # Fallback: HTTP method (slower but reliable)
        try:
            return await upload_via_http(audio_data, filename, file_extension)
        except Exception as fallback_error:
            logger.error(f"Both upload methods failed: {fallback_error}")
            raise Exception(f"Upload failed: {fallback_error}")

async def upload_via_http(audio_data: bytes, filename: str, file_extension: str) -> str:
    """
    Fallback HTTP upload method
    """
    upload_url = f"{SUPABASE_URL}/storage/v1/object/audio-files/{filename}"
    
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": f"audio/{file_extension[1:] if file_extension.startswith('.') else file_extension}",
        "x-upsert": "true"
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:  # Reduced timeout for speed
        response = await client.post(upload_url, content=audio_data, headers=headers)
        
        if response.status_code not in [200, 201]:
            raise Exception(f"HTTP upload failed: {response.status_code} - {response.text}")
    
    # Return public URL
    return f"{SUPABASE_URL}/storage/v1/object/public/audio-files/{filename}"

def get_content_type(file_extension: str) -> str:
    """Get the appropriate content type for the file extension"""
    extension_map = {
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.m4a': 'audio/mp4',
        '.aac': 'audio/aac',
        '.ogg': 'audio/ogg',
        '.flac': 'audio/flac',
        '.webm': 'audio/webm'
    }
    return extension_map.get(file_extension.lower(), 'audio/mpeg') 