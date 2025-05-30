from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

# Configure logging for better performance monitoring
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app with optimized settings
app = FastAPI(
    title="Speech-to-Text API",
    description="Real-time speech transcription with speaker diarization",
    version="1.0.0"
)

# CORS configuration - allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Starting Speech-to-Text API...")
    
    # Import and include routes
    from .api import router as api_router
    app.include_router(api_router, prefix="/api")
    
    logger.info("⚡ Server ready for connections!")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 Shutting down Speech-to-Text API...")

@app.get("/")
async def root():
    return {
        "message": "Speech-to-Text API is running!",
        "status": "healthy",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "speech-to-text-api"}

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    from .websocket import websocket_handler
    await websocket_handler(websocket)

@app.websocket("/ws/transcribe")
async def websocket_transcribe(websocket: WebSocket):
    from .websocket import websocket_handler
    await websocket_handler(websocket)
