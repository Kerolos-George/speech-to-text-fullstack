from fastapi import WebSocket, WebSocketDisconnect
import asyncio
import json
import base64
import logging
from typing import List, Dict, Set
from .storage import upload_audio_file
from .assembly import transcribe_audio_realtime, transcribe_audio
from .database import SessionLocal
from .models import Transcript
from .config import MAX_CONNECTIONS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Connection manager for real-time updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_ids: Dict[WebSocket, str] = {}
        
    async def connect(self, websocket: WebSocket, connection_id: str = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if connection_id:
            self.connection_ids[websocket] = connection_id
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
        
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.connection_ids:
            del self.connection_ids[websocket]
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
        
    async def send_personal_message(self, message: Dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            self.disconnect(websocket)
            
    async def broadcast(self, message: Dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to connection: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()

async def websocket_handler(ws: WebSocket):
    if len(manager.active_connections) >= MAX_CONNECTIONS:
        await ws.close(code=1013, reason="Too many connections")
        return
        
    await manager.connect(ws)
    
    try:
        while True:
            try:
                # Receive data with timeout
                data = await asyncio.wait_for(ws.receive_text(), timeout=300.0)  # 5 minute timeout
                logger.info(f"Received WebSocket data, length: {len(data)}")
                
                try:
                    message = json.loads(data)
                    await process_websocket_message(ws, message)
                    
                except json.JSONDecodeError as e:
                    logger.error(f"JSON decode error: {e}")
                    await manager.send_personal_message({
                        "status": "error",
                        "message": "Invalid JSON format",
                        "error_type": "json_decode_error"
                    }, ws)
                    
            except asyncio.TimeoutError:
                # Send ping to keep connection alive
                await manager.send_personal_message({
                    "status": "ping",
                    "message": "Connection keepalive"
                }, ws)
                
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected normally")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        manager.disconnect(ws)

async def process_websocket_message(ws: WebSocket, message: Dict):
    """Process different types of WebSocket messages"""
    
    message_type = message.get("type", "transcribe")
    
    if message_type == "transcribe" and "audio_data" in message:
        await handle_audio_transcription(ws, message)
    elif message_type == "get_transcripts":
        await handle_get_transcripts(ws, message)
    elif message_type == "get_transcript":
        await handle_get_single_transcript(ws, message)
    else:
        await manager.send_personal_message({
            "status": "error",
            "message": "Invalid message type or missing audio_data",
            "available_types": ["transcribe", "get_transcripts", "get_transcript"]
        }, ws)

async def handle_audio_transcription(ws: WebSocket, message: Dict):
    """Handle audio transcription requests"""
    try:
        await manager.send_personal_message({
            "status": "received",
            "message": "Audio data received, starting processing..."
        }, ws)
        
        # Decode base64 audio data
        try:
            audio_bytes = base64.b64decode(message["audio_data"])
            logger.info(f"Successfully decoded audio data: {len(audio_bytes)} bytes")
        except Exception as e:
            logger.error(f"Base64 decode error: {e}")
            await manager.send_personal_message({
                "status": "error",
                "message": f"Failed to decode audio data: {str(e)}",
                "error_type": "decode_error"
            }, ws)
            return
        
        file_extension = message.get("file_extension", ".wav")
        filename = message.get("filename", f"audio{file_extension}")
        
        # Upload to Supabase
        await manager.send_personal_message({
            "status": "uploading",
            "message": f"Uploading {filename} to storage..."
        }, ws)
        
        try:
            logger.info(f"Starting upload for file: {filename}, size: {len(audio_bytes)} bytes")
            audio_url = await upload_audio_file(audio_bytes, file_extension)
            logger.info(f"Successfully uploaded to Supabase: {audio_url}")
            
            await manager.send_personal_message({
                "status": "uploaded",
                "message": "File uploaded successfully, starting transcription...",
                "audio_url": audio_url
            }, ws)
            
        except Exception as e:
            error_details = str(e)
            logger.error(f"Upload error details: {error_details}")
            await manager.send_personal_message({
                "status": "error",
                "message": f"Upload failed: {error_details}",
                "error_type": "upload_error",
                "details": {
                    "filename": filename,
                    "file_size": len(audio_bytes),
                    "file_extension": file_extension
                }
            }, ws)
            return
        
        # Start transcription with real-time updates
        try:
            logger.info(f"Starting real-time transcription for: {audio_url}")
            
            result = await transcribe_audio_realtime(audio_url, websocket=ws)
            
            # Broadcast to all connected clients that a new transcript is available
            await manager.broadcast({
                "status": "new_transcript",
                "message": "New transcript available",
                "transcript_id": result["id"],
                "preview": result["text"][:100] + "..." if len(result["text"]) > 100 else result["text"]
            })
            
        except Exception as e:
            logger.error(f"Transcription error: {e}")
            await manager.send_personal_message({
                "status": "error",
                "message": f"Transcription failed: {str(e)}",
                "error_type": "transcription_error"
            }, ws)
            
    except Exception as e:
        logger.error(f"Error in handle_audio_transcription: {e}")
        await manager.send_personal_message({
            "status": "error",
            "message": f"Unexpected error: {str(e)}",
            "error_type": "general_error"
        }, ws)

async def handle_get_transcripts(ws: WebSocket, message: Dict):
    """Handle requests to get all transcripts"""
    try:
        page = message.get("page", 1)
        limit = message.get("limit", 10)
        offset = (page - 1) * limit
        
        db = SessionLocal()
        try:
            transcripts = db.query(Transcript)\
                           .order_by(Transcript.created_at.desc())\
                           .offset(offset)\
                           .limit(limit)\
                           .all()
            
            transcript_list = []
            for transcript in transcripts:
                transcript_list.append({
                    "id": str(transcript.id),
                    "transcript": transcript.transcript,
                    "speakers_count": transcript.speakers_count,
                    "confidence_score": transcript.confidence_score,
                    "audio_duration": transcript.audio_duration,
                    "language_detected": transcript.language_detected,
                    "status": transcript.status,
                    "created_at": transcript.created_at.isoformat() if transcript.created_at else None,
                    "processing_time": transcript.processing_time
                })
            
            await manager.send_personal_message({
                "status": "success",
                "message": "Transcripts retrieved",
                "data": {
                    "transcripts": transcript_list,
                    "page": page,
                    "limit": limit,
                    "total": len(transcript_list)
                }
            }, ws)
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Error getting transcripts: {e}")
        await manager.send_personal_message({
            "status": "error",
            "message": f"Failed to get transcripts: {str(e)}"
        }, ws)

async def handle_get_single_transcript(ws: WebSocket, message: Dict):
    """Handle requests to get a single transcript by ID"""
    try:
        transcript_id = message.get("transcript_id")
        if not transcript_id:
            await manager.send_personal_message({
                "status": "error",
                "message": "transcript_id is required"
            }, ws)
            return
        
        db = SessionLocal()
        try:
            transcript = db.query(Transcript).filter(Transcript.id == transcript_id).first()
            
            if not transcript:
                await manager.send_personal_message({
                    "status": "error",
                    "message": "Transcript not found"
                }, ws)
                return
            
            transcript_data = {
                "id": str(transcript.id),
                "audio_url": transcript.audio_url,
                "transcript": transcript.transcript,
                "diarized_transcript": transcript.diarized_transcript,
                "utterances": transcript.utterances,
                "speakers_count": transcript.speakers_count,
                "confidence_score": transcript.confidence_score,
                "processing_time": transcript.processing_time,
                "audio_duration": transcript.audio_duration,
                "language_detected": transcript.language_detected,
                "status": transcript.status,
                "created_at": transcript.created_at.isoformat() if transcript.created_at else None,
                "completed_at": transcript.completed_at.isoformat() if transcript.completed_at else None
            }
            
            await manager.send_personal_message({
                "status": "success",
                "message": "Transcript retrieved",
                "data": transcript_data
            }, ws)
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Error getting transcript: {e}")
        await manager.send_personal_message({
            "status": "error",
            "message": f"Failed to get transcript: {str(e)}"
        }, ws)

# Legacy function for backward compatibility
async def notify_clients(data):
    """Notify all connected clients"""
    await manager.broadcast({
        "status": "notification",
        "data": data
    })
