"""
Subtitle generation utilities for SRT and VTT formats
"""
from typing import List, Dict, Optional
import math

def seconds_to_srt_time(seconds: float) -> str:
    """Convert seconds to SRT time format: HH:MM:SS,mmm"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    milliseconds = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{milliseconds:03d}"

def seconds_to_vtt_time(seconds: float) -> str:
    """Convert seconds to VTT time format: HH:MM:SS.mmm"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    milliseconds = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{milliseconds:03d}"

def split_text_by_chars(text: str, max_chars: int = 80) -> List[str]:
    """Split text into lines with maximum character limit"""
    if len(text) <= max_chars:
        return [text]
    
    words = text.split()
    lines = []
    current_line = ""
    
    for word in words:
        if len(current_line) + len(word) + 1 <= max_chars:
            if current_line:
                current_line += " " + word
            else:
                current_line = word
        else:
            if current_line:
                lines.append(current_line)
            current_line = word
    
    if current_line:
        lines.append(current_line)
    
    return lines

def generate_srt_from_utterances(utterances: List[Dict], chars_per_caption: int = 80) -> str:
    """Generate SRT format from utterances with speaker labels"""
    srt_content = []
    subtitle_index = 1
    
    for utterance in utterances:
        start_time = utterance.get('start', 0)
        end_time = utterance.get('end', 0)
        text = utterance.get('text', '')
        speaker = utterance.get('speaker', 'Unknown')
        
        # Add speaker label to text
        speaker_text = f"[{speaker}] {text}"
        
        # Split long text into multiple captions
        text_lines = split_text_by_chars(speaker_text, chars_per_caption)
        
        if len(text_lines) == 1:
            # Single caption
            srt_content.append(f"{subtitle_index}")
            srt_content.append(f"{seconds_to_srt_time(start_time)} --> {seconds_to_srt_time(end_time)}")
            srt_content.append(text_lines[0])
            srt_content.append("")  # Empty line between subtitles
            subtitle_index += 1
        else:
            # Multiple captions for long text
            duration_per_line = (end_time - start_time) / len(text_lines)
            
            for i, line in enumerate(text_lines):
                line_start = start_time + (i * duration_per_line)
                line_end = start_time + ((i + 1) * duration_per_line)
                
                srt_content.append(f"{subtitle_index}")
                srt_content.append(f"{seconds_to_srt_time(line_start)} --> {seconds_to_srt_time(line_end)}")
                srt_content.append(line)
                srt_content.append("")  # Empty line between subtitles
                subtitle_index += 1
    
    return "\n".join(srt_content)

def generate_vtt_from_utterances(utterances: List[Dict], chars_per_caption: int = 80) -> str:
    """Generate VTT format from utterances with speaker labels"""
    vtt_content = ["WEBVTT", ""]  # VTT header
    
    for utterance in utterances:
        start_time = utterance.get('start', 0)
        end_time = utterance.get('end', 0)
        text = utterance.get('text', '')
        speaker = utterance.get('speaker', 'Unknown')
        
        # Add speaker label to text
        speaker_text = f"[{speaker}] {text}"
        
        # Split long text into multiple captions
        text_lines = split_text_by_chars(speaker_text, chars_per_caption)
        
        if len(text_lines) == 1:
            # Single caption
            vtt_content.append(f"{seconds_to_vtt_time(start_time)} --> {seconds_to_vtt_time(end_time)}")
            vtt_content.append(text_lines[0])
            vtt_content.append("")  # Empty line between subtitles
        else:
            # Multiple captions for long text
            duration_per_line = (end_time - start_time) / len(text_lines)
            
            for i, line in enumerate(text_lines):
                line_start = start_time + (i * duration_per_line)
                line_end = start_time + ((i + 1) * duration_per_line)
                
                vtt_content.append(f"{seconds_to_vtt_time(line_start)} --> {seconds_to_vtt_time(line_end)}")
                vtt_content.append(line)
                vtt_content.append("")  # Empty line between subtitles
    
    return "\n".join(vtt_content)

def generate_srt_from_transcript(transcript_data: Dict, chars_per_caption: int = 80) -> str:
    """Generate SRT from complete transcript data"""
    utterances = transcript_data.get('utterances', [])
    if not utterances:
        # Fallback: create from enhanced_utterances if available
        enhanced_utterances = transcript_data.get('diarized_transcript', {}).get('enhanced_utterances', [])
        if enhanced_utterances:
            utterances = enhanced_utterances
        else:
            # Last resort: create single subtitle from full text
            return f"1\n00:00:00,000 --> 00:00:10,000\n{transcript_data.get('text', 'No text available')}\n"
    
    return generate_srt_from_utterances(utterances, chars_per_caption)

def generate_vtt_from_transcript(transcript_data: Dict, chars_per_caption: int = 80) -> str:
    """Generate VTT from complete transcript data"""
    utterances = transcript_data.get('utterances', [])
    if not utterances:
        # Fallback: create from enhanced_utterances if available
        enhanced_utterances = transcript_data.get('diarized_transcript', {}).get('enhanced_utterances', [])
        if enhanced_utterances:
            utterances = enhanced_utterances
        else:
            # Last resort: create single subtitle from full text
            return f"WEBVTT\n\n00:00:00.000 --> 00:00:10.000\n{transcript_data.get('text', 'No text available')}\n"
    
    return generate_vtt_from_utterances(utterances, chars_per_caption) 