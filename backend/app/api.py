from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Depends, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from .storage import upload_audio_file
from .assembly import transcribe_audio, transcribe_audio_realtime
from .websocket import notify_clients
from .database import SessionLocal
from .models import Transcript, Speaker
from .subtitle_generator import generate_srt_from_transcript, generate_vtt_from_transcript
import os
from fastapi.responses import JSONResponse
import json

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class TranscribeRequest(BaseModel):
    audio_url: str

class TranscriptResponse(BaseModel):
    id: str
    transcript: str
    speakers_count: int
    confidence_score: Optional[float]
    audio_duration: Optional[float]
    language_detected: Optional[str]
    status: str
    created_at: str
    processing_time: Optional[float]

@router.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...)):
    """Upload an audio file and return the Supabase URL"""
    try:
        # Check if it's an audio file
        if not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="Only audio files are allowed")
        
        # Read file content
        file_content = await file.read()
        
        # Get file extension
        file_extension = os.path.splitext(file.filename)[1] if file.filename else '.wav'
        
        # Upload to Supabase
        audio_url = await upload_audio_file(file_content, file_extension)
        
        return {
            "status": "success",
            "audio_url": audio_url,
            "filename": file.filename
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/transcribe")
async def transcribe_audio_file(request: TranscribeRequest):
    """Transcribe an audio file from URL"""
    try:
        result = await transcribe_audio(request.audio_url)
        return {
            "status": "success",
            "transcription": result["text"],
            "utterances": result.get("utterances", []),
            "speakers_summary": result.get("speakers_summary", []),
            "confidence": result.get("confidence", 0.0),
            "processing_time": result.get("processing_time", 0.0)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transcripts", response_model=List[TranscriptResponse])
async def get_transcripts(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all transcripts with pagination"""
    try:
        offset = (page - 1) * limit
        
        query = db.query(Transcript)
        if status:
            query = query.filter(Transcript.status == status)
        
        transcripts = query.order_by(Transcript.created_at.desc())\
                          .offset(offset)\
                          .limit(limit)\
                          .all()
        
        result = []
        for transcript in transcripts:
            result.append(TranscriptResponse(
                id=str(transcript.id),
                transcript=transcript.transcript or "",
                speakers_count=transcript.speakers_count or 0,
                confidence_score=transcript.confidence_score,
                audio_duration=transcript.audio_duration,
                language_detected=transcript.language_detected,
                status=transcript.status or "unknown",
                created_at=transcript.created_at.isoformat() if transcript.created_at else "",
                processing_time=transcript.processing_time
            ))
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transcripts/{transcript_id}")
async def get_transcript(transcript_id: str, db: Session = Depends(get_db)):
    """Get a specific transcript by ID"""
    try:
        transcript = db.query(Transcript).filter(Transcript.id == transcript_id).first()
        
        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found")
        
        # Get speaker data
        speakers = db.query(Speaker).filter(Speaker.transcript_id == transcript_id).all()
        
        speaker_data = []
        for speaker in speakers:
            speaker_data.append({
                "speaker_label": speaker.speaker_label,
                "total_words": speaker.total_words,
                "total_duration": speaker.total_duration,
                "confidence_score": speaker.confidence_score
            })
        
        return {
            "id": str(transcript.id),
            "audio_url": transcript.audio_url,
            "transcript": transcript.transcript,
            "diarized_transcript": transcript.diarized_transcript,
            "utterances": transcript.utterances,
            "speakers_count": transcript.speakers_count,
            "speakers": speaker_data,
            "confidence_score": transcript.confidence_score,
            "processing_time": transcript.processing_time,
            "audio_duration": transcript.audio_duration,
            "language_detected": transcript.language_detected,
            "status": transcript.status,
            "created_at": transcript.created_at.isoformat() if transcript.created_at else None,
            "completed_at": transcript.completed_at.isoformat() if transcript.completed_at else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/transcripts/{transcript_id}")
async def delete_transcript(transcript_id: str, db: Session = Depends(get_db)):
    """Delete a transcript and its associated data"""
    try:
        # Delete speakers first (foreign key constraint)
        db.query(Speaker).filter(Speaker.transcript_id == transcript_id).delete()
        
        # Delete transcript
        transcript = db.query(Transcript).filter(Transcript.id == transcript_id).first()
        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found")
        
        db.delete(transcript)
        db.commit()
        
        return {"status": "success", "message": "Transcript deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/speakers/{transcript_id}")
async def get_speakers(transcript_id: str, db: Session = Depends(get_db)):
    """Get speaker statistics for a transcript"""
    try:
        transcript = db.query(Transcript).filter(Transcript.id == transcript_id).first()
        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found")
        
        speakers = db.query(Speaker).filter(Speaker.transcript_id == transcript_id).all()
        
        speaker_stats = []
        for speaker in speakers:
            speaker_stats.append({
                "id": str(speaker.id),
                "speaker_label": speaker.speaker_label,
                "total_words": speaker.total_words,
                "total_duration": speaker.total_duration,
                "confidence_score": speaker.confidence_score,
                "speaking_percentage": (speaker.total_duration / transcript.audio_duration * 100) 
                                     if transcript.audio_duration and transcript.audio_duration > 0 else 0
            })
        
        return {
            "transcript_id": transcript_id,
            "speakers": speaker_stats,
            "total_speakers": len(speaker_stats)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/transcribe/")
async def transcribe_legacy(audio_url: str):
    """Legacy endpoint for backward compatibility"""
    result = await transcribe_audio(audio_url)
    await notify_clients(result)
    return result

@router.get("/transcripts/{transcript_id}/srt")
async def get_srt_subtitle(
    transcript_id: str, 
    chars_per_caption: int = Query(80, ge=20, le=200),
    db: Session = Depends(get_db)
):
    """Get SRT subtitle for a transcript"""
    try:
        transcript = db.query(Transcript).filter(Transcript.id == transcript_id).first()
        
        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found")
        
        # Prepare transcript data for subtitle generation
        transcript_data = {
            "text": transcript.transcript,
            "utterances": transcript.utterances or [],
            "diarized_transcript": transcript.diarized_transcript or {}
        }
        
        srt_content = generate_srt_from_transcript(transcript_data, chars_per_caption)
        
        return Response(
            content=srt_content, 
            media_type="application/x-subrip",
            headers={"Content-Disposition": f"attachment; filename=transcript_{transcript_id}.srt"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transcripts/{transcript_id}/vtt")
async def get_vtt_subtitle(
    transcript_id: str, 
    chars_per_caption: int = Query(80, ge=20, le=200),
    db: Session = Depends(get_db)
):
    """Get VTT subtitle for a transcript"""
    try:
        transcript = db.query(Transcript).filter(Transcript.id == transcript_id).first()
        
        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found")
        
        # Prepare transcript data for subtitle generation
        transcript_data = {
            "text": transcript.transcript,
            "utterances": transcript.utterances or [],
            "diarized_transcript": transcript.diarized_transcript or {}
        }
        
        vtt_content = generate_vtt_from_transcript(transcript_data, chars_per_caption)
        
        return Response(
            content=vtt_content, 
            media_type="text/vtt",
            headers={"Content-Disposition": f"attachment; filename=transcript_{transcript_id}.vtt"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
