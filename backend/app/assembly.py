import httpx
import asyncio
import time
from datetime import datetime
from typing import Dict, List, Optional
from .database import SessionLocal
from .models import Transcript, Speaker
from .config import ASSEMBLY_API_KEY
import logging

logger = logging.getLogger(__name__)

headers = {"authorization": ASSEMBLY_API_KEY}

async def transcribe_audio_realtime(audio_url: str, websocket=None) -> Dict:
    """
    Enhanced transcription with speaker diarization and real-time updates
    
    Args:
        audio_url: URL of the audio file to transcribe
        websocket: WebSocket connection for real-time updates (optional)
    """
    start_time = time.time()
    
    async with httpx.AsyncClient() as client:
        # Notify start
        if websocket:
            await websocket.send_json({
                "status": "starting",
                "message": "Submitting transcription request..."
            })

        # Submit transcription request with basic, well-documented parameters
        payload = {
            "audio_url": audio_url,
            "speaker_labels": True,  # Enable speaker diarization
            "language_detection": True, # Auto-detect language
            "punctuate": True,
            "format_text": True
        }
        
        logger.info(f"AssemblyAI payload: {payload}")
        
        res = await client.post(
            "https://api.assemblyai.com/v2/transcript",
            headers=headers,
            json=payload
        )
        
        if res.status_code != 200:
            raise Exception(f"Failed to submit transcription: {res.text}")
            
        transcript_id = res.json()["id"]
        
        if websocket:
            await websocket.send_json({
                "status": "submitted",
                "message": f"Transcription submitted (ID: {transcript_id}). Processing..."
            })

        # Enhanced polling with progress updates
        status = "queued"
        last_update = time.time()
        
        while status not in ["completed", "error"]:
            await asyncio.sleep(3)  # Check every 3 seconds
            
            r = await client.get(
                f"https://api.assemblyai.com/v2/transcript/{transcript_id}", 
                headers=headers
            )
            
            if r.status_code != 200:
                raise Exception(f"Failed to get transcript status: {r.text}")
            
            result = r.json()
            status = result["status"]
            
            # Send periodic updates
            current_time = time.time()
            if websocket and (current_time - last_update) > 10:  # Update every 10 seconds
                await websocket.send_json({
                    "status": "processing",
                    "message": f"Still processing... Status: {status}"
                })
                last_update = current_time

        if status == "error":
            error_msg = result.get("error", "Unknown error occurred")
            raise Exception(f"Transcription failed: {error_msg}")

        # Calculate processing time
        processing_time = time.time() - start_time
        
        # Parse results
        transcript_text = result.get("text", "")
        utterances = result.get("utterances", [])
        confidence = result.get("confidence", 0.0)
        audio_duration = result.get("audio_duration", 0.0) / 1000.0  # Convert ms to seconds
        language_code = result.get("language_code", "en")
        
        logger.info(f"Received {len(utterances)} utterances from AssemblyAI")
        logger.info(f"Audio duration: {audio_duration} seconds")
        
        # Enhance speaker diarization data
        enhanced_utterances = []
        speaker_stats = {}
        
        for utterance in utterances:
            speaker_label = utterance.get("speaker", "Unknown")
            words = utterance.get("words", [])
            text = utterance.get("text", "")
            start_time_ms = utterance.get("start", 0)
            end_time_ms = utterance.get("end", 0)
            confidence_score = utterance.get("confidence", 0.0)
            
            # Calculate duration
            duration = (end_time_ms - start_time_ms) / 1000.0
            
            # Track speaker statistics
            if speaker_label not in speaker_stats:
                speaker_stats[speaker_label] = {
                    "total_words": 0,
                    "total_duration": 0.0,
                    "utterances": 0,
                    "confidence_scores": []
                }
            
            speaker_stats[speaker_label]["total_words"] += len(words)
            speaker_stats[speaker_label]["total_duration"] += duration
            speaker_stats[speaker_label]["utterances"] += 1
            speaker_stats[speaker_label]["confidence_scores"].append(confidence_score)
            
            enhanced_utterances.append({
                "speaker": speaker_label,
                "text": text,
                "start": start_time_ms / 1000.0,  # Convert to seconds
                "end": end_time_ms / 1000.0,
                "duration": duration,
                "confidence": confidence_score,
                "words": words
            })
        
        # Create structured diarization data
        speakers_summary = []
        for speaker, stats in speaker_stats.items():
            avg_confidence = sum(stats["confidence_scores"]) / len(stats["confidence_scores"]) if stats["confidence_scores"] else 0.0
            speakers_summary.append({
                "speaker": speaker,
                "total_words": stats["total_words"],
                "total_duration": stats["total_duration"],
                "utterances_count": stats["utterances"],
                "avg_confidence": avg_confidence,
                "speaking_percentage": (stats["total_duration"] / audio_duration * 100) if audio_duration > 0 else 0
            })
        
        logger.info(f"Speaker diarization results:")
        logger.info(f"- Total speakers detected: {len(speaker_stats)}")
        for speaker, stats in speaker_stats.items():
            logger.info(f"- {speaker}: {stats['utterances']} utterances, {stats['total_duration']:.1f}s speaking time")
        
        diarized_transcript = {
            "speakers_summary": speakers_summary,
            "speakers_count": len(speaker_stats),
            "enhanced_utterances": enhanced_utterances
        }

        # Save to database
        db = SessionLocal()
        try:
            # Create transcript record
            db_transcript = Transcript(
                audio_url=audio_url,
                transcript=transcript_text,
                diarized_transcript=diarized_transcript,
                utterances=utterances,
                speakers_count=len(speaker_stats),
                confidence_score=confidence,
                processing_time=processing_time,
                audio_duration=audio_duration,
                language_detected=language_code,
                status="completed",
                completed_at=datetime.utcnow()
            )
            db.add(db_transcript)
            db.commit()
            db.refresh(db_transcript)
            
            # Save speaker data
            for speaker, stats in speaker_stats.items():
                avg_confidence = sum(stats["confidence_scores"]) / len(stats["confidence_scores"]) if stats["confidence_scores"] else 0.0
                db_speaker = Speaker(
                    transcript_id=db_transcript.id,
                    speaker_label=speaker,
                    total_words=stats["total_words"],
                    total_duration=stats["total_duration"],
                    confidence_score=avg_confidence
                )
                db.add(db_speaker)
            
            db.commit()
            
            # Prepare final result
            final_result = {
                "id": str(db_transcript.id),
                "text": transcript_text,
                "utterances": enhanced_utterances,
                "diarized_transcript": diarized_transcript,
                "speakers_summary": speakers_summary,
                "confidence": confidence,
                "processing_time": processing_time,
                "audio_duration": audio_duration,
                "language_detected": language_code,
                "created_at": db_transcript.created_at.isoformat()
            }
            
            if websocket:
                await websocket.send_json({
                    "status": "completed",
                    "message": "Transcription completed successfully!",
                    "data": final_result
                })
            
            return final_result
            
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()

# Legacy function for backward compatibility
async def transcribe_audio(audio_url: str) -> Dict:
    """Backward compatible function"""
    return await transcribe_audio_realtime(audio_url)
