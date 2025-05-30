# 🎤 SpeechFlow AI - Speech-to-Text Transcription Platform

A complete full-stack speech-to-text transcription platform with real-time processing, speaker diarization, and subtitle export capabilities.

## ✨ Features

### 🎯 **Core Functionality**
- **AI-Powered Transcription** - Advanced speech recognition using AssemblyAI
- **Speaker Diarization** - Automatic identification and separation of multiple speakers
- **Real-time Processing** - WebSocket-based live transcription status updates
- **Subtitle Export** - Generate SRT and VTT files for video subtitles
- **Multi-format Support** - MP3, WAV, M4A, AAC, OGG, FLAC, WEBM

### 🏗️ **Technical Stack**
- **Backend**: FastAPI, Python 3.8+, WebSocket, PostgreSQL/SQLite
- **Frontend**: React 18+, Material-UI, WebSocket Client
- **AI Services**: AssemblyAI for speech recognition
- **Storage**: Supabase for file storage and database
- **Security**: Environment-based configuration, API key protection

### 🎨 **User Experience**
- **Modern UI/UX** - Clean, responsive design with Material-UI
- **Drag & Drop Upload** - Intuitive file upload with progress tracking
- **Audio Preview** - Built-in audio player for uploaded files
- **Smart Notifications** - Real-time status updates and error handling
- **Mobile Responsive** - Works perfectly across all devices

## 🚀 Quick Start

### Prerequisites
- **Python** 3.8+
- **Node.js** 16.0+
- **AssemblyAI Account** - [Sign up here](https://www.assemblyai.com/dashboard)
- **Supabase Account** - [Sign up here](https://supabase.com/dashboard)

### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Setup environment
python setup_env.py

# Edit .env with your API keys
# ASSEMBLY_API_KEY=your_assemblyai_api_key_here
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_KEY=your_supabase_anon_key_here

# Install dependencies
pip install -r requirements.txt

# Start server
python fast_start.py
```

### 2. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 3. Verify Setup
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📁 Project Structure

```
speech-to-text/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI application
│   │   ├── api.py          # API endpoints
│   │   ├── websocket.py    # WebSocket handlers
│   │   ├── assembly.py     # AssemblyAI integration
│   │   ├── storage.py      # Supabase storage
│   │   └── models.py       # Database models
│   ├── env.example         # Environment template
│   ├── setup_env.py        # Environment setup script
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js         # Main application
│   │   └── config.js      # Configuration
│   ├── public/            # Static files
│   └── package.json       # Node dependencies
├── .gitignore             # Git ignore rules
├── ENVIRONMENT_SETUP.md   # Detailed setup guide
└── README.md             # This file
```

## 🎯 How It Works

### 1. Audio Upload
- User uploads audio file via drag-and-drop or file picker
- File is validated for format and size
- Audio is uploaded to Supabase storage
- Real-time progress tracking via WebSocket

### 2. Transcription Process
- Audio URL is sent to AssemblyAI for processing
- AI analyzes audio for speech recognition and speaker diarization
- Real-time status updates sent to frontend via WebSocket
- Results stored in database with speaker information

### 3. Results Display
- Transcribed text displayed with speaker labels
- Speaker statistics showing talk time and word count
- Confidence scores and processing time
- Audio player for reviewing original file

### 4. Subtitle Export
- Generate SRT or VTT subtitle files
- Configurable caption length and timing
- Direct download with proper formatting
- Compatible with video editing software

## 🔧 Configuration

### Environment Variables
```env
# AssemblyAI Configuration
ASSEMBLY_API_KEY=your_assemblyai_api_key_here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
SUPABASE_BUCKET_NAME=audio-files

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# File Upload Settings
MAX_FILE_SIZE=104857600  # 100MB
ALLOWED_EXTENSIONS=.mp3,.wav,.m4a,.aac,.ogg,.flac,.webm
```

### Supported Audio Formats
- **MP3** - Most common format
- **WAV** - Uncompressed audio
- **M4A** - Apple audio format
- **AAC** - Advanced Audio Coding
- **OGG** - Open source format
- **FLAC** - Lossless compression
- **WEBM** - Web-optimized format

## 📚 Documentation

### Component Documentation
- **[Backend README](backend/README.md)** - FastAPI server, API endpoints, database
- **[Frontend README](frontend/README.md)** - React app, components, UI/UX
- **[Environment Setup](ENVIRONMENT_SETUP.md)** - Detailed configuration guide

### API Documentation
- **OpenAPI Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🛠️ Development

### Backend Development
```bash
cd backend

# Install in development mode
pip install -r requirements.txt

# Run with hot reload
python -m uvicorn app.main:app --reload

# Run tests
pytest

# Database operations
python create_tables.py
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start with hot reload
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Full Stack Development
```bash
# Terminal 1: Backend
cd backend && python fast_start.py

# Terminal 2: Frontend
cd frontend && npm start

# Open browser to http://localhost:3000
```

## 🚀 Deployment

### Production Environment Setup
1. Set up production databases (PostgreSQL)
2. Configure production Supabase project
3. Set environment variables for production
4. Configure HTTPS and domain
5. Set up monitoring and logging

### Docker Deployment
```bash
# Backend
docker build -t speech-api ./backend
docker run -p 8000:8000 speech-api

# Frontend
docker build -t speech-frontend ./frontend
docker run -p 3000:3000 speech-frontend
```

### Cloud Deployment Options
- **Backend**: Railway, Heroku, AWS Lambda, Google Cloud Run
- **Frontend**: Netlify, Vercel, GitHub Pages, AWS S3
- **Database**: Supabase, AWS RDS, Google Cloud SQL
- **Storage**: Supabase Storage, AWS S3, Google Cloud Storage

## 🎵 Usage Examples

### Basic Transcription
1. Upload an audio file (drag & drop or click)
2. Wait for upload completion
3. Click "Start Transcription"
4. Monitor real-time progress
5. View results with speaker identification

### Subtitle Creation
1. Complete a transcription
2. Navigate to subtitle export section
3. Choose SRT or VTT format
4. Adjust caption settings if needed
5. Download subtitle file

### Batch Processing
- Upload multiple files sequentially
- Monitor progress via WebSocket notifications
- Download all results as subtitle files
- Review speaker statistics across sessions

## 🔍 Troubleshooting

### Common Issues

**Backend won't start**
- Check API keys in `.env` file
- Verify Python version (3.8+)
- Check port availability (8000)

**Frontend connection errors**
- Ensure backend is running on port 8000
- Check CORS configuration
- Verify WebSocket connectivity

**Upload failures**
- Check file format (must be audio)
- Verify file size (under 100MB)
- Check Supabase storage permissions

**Transcription errors**
- Verify AssemblyAI API key
- Check audio quality and format
- Review error messages in console

### Debug Mode
```bash
# Backend debug
export LOG_LEVEL=DEBUG
python fast_start.py

# Frontend debug
REACT_APP_DEBUG=true npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Python PEP 8 for backend code
- Use ESLint/Prettier for frontend code
- Add tests for new features
- Update documentation as needed
- Follow commit message conventions

## 📊 Performance & Scalability

### Current Limitations
- Single file processing (not batch)
- 100MB file size limit
- WebSocket connection limits

### Optimization Opportunities
- Add file compression
- Implement caching layer
- Add CDN for audio files
- Horizontal scaling options

## 🔒 Security Features

- ✅ Environment variable protection
- ✅ API key validation
- ✅ File upload restrictions
- ✅ Input sanitization
- ✅ CORS configuration
- ✅ Error boundary protection

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **AssemblyAI** - For powerful speech recognition API
- **Supabase** - For backend-as-a-service platform
- **Material-UI** - For beautiful React components
- **FastAPI** - For high-performance Python web framework

## 🔗 Useful Links

- [AssemblyAI Documentation](https://www.assemblyai.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [React Documentation](https://reactjs.org/docs)
- [Material-UI Documentation](https://mui.com)

---

**Built with ❤️ for developers who need powerful speech-to-text capabilities** 