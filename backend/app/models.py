from sqlalchemy import Column, String, Text, DateTime, Integer, Float, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid
from .database import Base

class Transcript(Base):
    __tablename__ = "transcripts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    audio_url = Column(Text, nullable=False)
    transcript = Column(Text)
    diarized_transcript = Column(JSONB)  # Structured diarization data
    utterances = Column(JSONB)  # Speaker-separated utterances
    speakers_count = Column(Integer, default=0)
    confidence_score = Column(Float)
    processing_time = Column(Float)  # Time taken to process
    audio_duration = Column(Float)  # Duration in seconds
    language_detected = Column(String(10))
    status = Column(String(20), default="processing")  # processing, completed, error
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

class Speaker(Base):
    __tablename__ = "speakers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transcript_id = Column(UUID(as_uuid=True), nullable=False)
    speaker_label = Column(String(50), nullable=False)  # e.g., "Speaker A", "Speaker B"
    total_words = Column(Integer, default=0)
    total_duration = Column(Float, default=0.0)  # Total speaking time
    confidence_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
