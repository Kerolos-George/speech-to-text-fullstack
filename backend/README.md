# 🎤 Speech-to-Text API Backend

A powerful FastAPI-based backend for real-time speech transcription with speaker diarization and subtitle export capabilities.

## ✨ Features

- 🎯 **Real-time Speech Transcription** - Using AssemblyAI's advanced AI models
- 👥 **Speaker Diarization** - Automatic speaker identification and separation
- 📝 **Subtitle Export** - Generate SRT and VTT files for video subtitles
- ⚡ **WebSocket Support** - Real-time progress updates and streaming
- 🗄️ **Database Integration** - PostgreSQL/SQLite for transcript storage
- 📁 **File Upload** - Supabase integration for audio file storage
- 🔒 **Environment Security** - Secure configuration management
- 📊 **API Documentation** - Auto-generated OpenAPI/Swagger docs

## 🚀 Quick Start

### 1. Environment Setup
```bash
cd backend
python setup_env.py
```

### 2. Configure Environment Variables
Edit the generated `.env` file with your API keys:
```env
ASSEMBLY_API_KEY=your_assemblyai_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Start the Server
```bash
# Fast startup (production-like)
python fast_start.py

# Development with hot reload
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Verify Installation
- **API Health**: http://localhost:8000/health
- **API Docs**: http://localhost:8000/docs
- **WebSocket**: ws://localhost:8000/ws

## 📋 Requirements

- **Python**: 3.8+
- **AssemblyAI Account**: [Sign up here](https://www.assemblyai.com/dashboard)
- **Supabase Account**: [Sign up here](https://supabase.com/dashboard)

## 🛠️ Installation

### Method 1: Quick Setup
```bash
git clone <your-repo>
cd speech-to-text/backend
python setup_env.py
pip install -r requirements.txt
python fast_start.py
```

### Method 2: Manual Setup
```bash
# 1. Clone and navigate
cd backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
.\venv\Scripts\activate   # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Setup environment
cp env.example .env
# Edit .env with your API keys

# 5. Run server
python fast_start.py
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `ASSEMBLY_API_KEY` | ✅ | AssemblyAI API key | - |
| `SUPABASE_URL` | ✅ | Supabase project URL | - |
| `SUPABASE_KEY` | ✅ | Supabase anon key | - |
| `DATABASE_URL` | ❌ | Database connection string | SQLite |
| `HOST` | ❌ | Server host | 0.0.0.0 |
| `PORT` | ❌ | Server port | 8000 |
| `MAX_FILE_SIZE` | ❌ | Max upload size (bytes) | 100MB |
| `MAX_CONNECTIONS` | ❌ | Max WebSocket connections | 100 |

### Supported Audio Formats
- MP3, WAV, M4A, AAC, OGG, FLAC, WEBM

## 📡 API Endpoints

### Health & Status
```http
GET /health
GET /
```

### Audio Upload & Transcription
```http
POST /api/upload-audio
POST /api/transcribe
```

### Transcript Management
```http
GET /api/transcripts              # List all transcripts
GET /api/transcripts/{id}         # Get specific transcript
DELETE /api/transcripts/{id}      # Delete transcript
```

### Subtitle Export
```http
GET /api/transcripts/{id}/srt     # Download SRT subtitle
GET /api/transcripts/{id}/vtt     # Download VTT subtitle
```

### Speaker Analysis
```http
GET /api/speakers/{transcript_id} # Get speaker statistics
```

### WebSocket
```ws
WS /ws                           # Main WebSocket endpoint
```

## 🔌 WebSocket Messages

### Client → Server
```json
{
  "type": "transcribe",
  "audio_data": "base64_encoded_audio",
  "file_extension": ".mp3",
  "filename": "audio.mp3",
  "file_size": 1024000
}
```

### Server → Client
```json
{
  "status": "completed",
  "message": "Transcription completed successfully!",
  "data": {
    "id": "transcript_id",
    "text": "Transcribed text...",
    "speakers_summary": [...],
    "confidence": 0.95,
    "audio_duration": 120.5
  }
}
```

## 🗄️ Database Schema

### Transcripts Table
```sql
CREATE TABLE transcripts (
    id UUID PRIMARY KEY,
    audio_url TEXT,
    transcript TEXT,
    diarized_transcript JSON,
    utterances JSON,
    speakers_count INTEGER,
    confidence_score FLOAT,
    processing_time FLOAT,
    audio_duration FLOAT,
    language_detected VARCHAR(10),
    status VARCHAR(20),
    error_message TEXT,
    created_at TIMESTAMP,
    completed_at TIMESTAMP
);
```

### Speakers Table
```sql
CREATE TABLE speakers (
    id UUID PRIMARY KEY,
    transcript_id UUID REFERENCES transcripts(id),
    speaker_label VARCHAR(10),
    total_words INTEGER,
    total_duration FLOAT,
    confidence_score FLOAT
);
```

## 🎯 Usage Examples

### Python Client
```python
import requests
import websockets
import asyncio
import json

# HTTP API
response = requests.get("http://localhost:8000/health")
print(response.json())

# WebSocket
async def transcribe_audio():
    uri = "ws://localhost:8000/ws"
    async with websockets.connect(uri) as websocket:
        # Send audio file
        message = {
            "type": "transcribe",
            "audio_data": base64_audio_data,
            "filename": "test.wav"
        }
        await websocket.send(json.dumps(message))
        
        # Receive results
        async for response in websocket:
            data = json.loads(response)
            print(f"Status: {data['status']}")
            if data['status'] == 'completed':
                break
```

### cURL Examples
```bash
# Health check
curl http://localhost:8000/health

# Get transcripts
curl http://localhost:8000/api/transcripts

# Download SRT subtitle
curl -o subtitle.srt \
  http://localhost:8000/api/transcripts/{id}/srt
```

## 🚀 Performance Optimization

### Fast Startup Mode
```bash
python fast_start.py
```
- Disables hot reload
- Reduces logging
- Optimizes imports
- Single worker process

### Production Deployment
```bash
# Using Gunicorn
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker

# Using Docker
docker build -t speech-api .
docker run -p 8000:8000 speech-api
```

## 🧪 Testing

```bash
# Run tests
pytest

# Test specific endpoint
curl -X POST http://localhost:8000/api/transcribe \
  -H "Content-Type: application/json" \
  -d '{"audio_url": "https://example.com/audio.mp3"}'
```

## 🔍 Troubleshooting

### Common Issues

**1. AssemblyAI API Errors**
```
⚠️ AssemblyAI API key not configured!
```
**Solution**: Add valid API key to `.env` file

**2. Supabase Upload Failures**
```
Upload failed: 403 Forbidden
```
**Solution**: Check Supabase permissions and bucket settings

**3. Database Connection Issues**
```
❌ Configuration validation failed
```
**Solution**: Verify `DATABASE_URL` format

**4. WebSocket Connection Drops**
```
WebSocket disconnected
```
**Solution**: Check network stability and timeout settings

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
python fast_start.py
```

### Health Checks
```bash
# API health
curl http://localhost:8000/health

# Database connection
curl http://localhost:8000/api/transcripts

# WebSocket test
wscat -c ws://localhost:8000/ws
```

## 🔒 Security

- ✅ Environment variable protection
- ✅ API key validation
- ✅ Input sanitization
- ✅ File size limits
- ✅ CORS configuration
- ✅ Error handling

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration management
│   ├── models.py            # Database models
│   ├── database.py          # Database connection
│   ├── api.py               # API endpoints
│   ├── websocket.py         # WebSocket handlers
│   ├── assembly.py          # AssemblyAI integration
│   ├── storage.py           # Supabase storage
│   └── subtitle_generator.py # SRT/VTT generation
├── env.example              # Environment template
├── requirements.txt         # Python dependencies
├── fast_start.py           # Fast startup script
├── setup_env.py            # Environment setup
└── create_tables.py        # Database setup
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [AssemblyAI Documentation](https://www.assemblyai.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com) 