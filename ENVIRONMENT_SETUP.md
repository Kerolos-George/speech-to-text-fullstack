# 🔐 Environment Setup Guide

This guide will help you configure your Speech-to-Text API environment variables securely.

## 🚀 Quick Setup

### 1. Automatic Setup (Recommended)
```bash
cd backend
python setup_env.py
```

### 2. Manual Setup
```bash
cd backend
cp env.example .env
```

Then edit `.env` with your actual values.

## 📋 Required Environment Variables

### 🎤 AssemblyAI Configuration
```env
ASSEMBLY_API_KEY=your_assemblyai_api_key_here
```
- **Where to get it:** [AssemblyAI Dashboard](https://www.assemblyai.com/dashboard)
- **Used for:** Speech-to-text transcription and speaker diarization

### 🗄️ Supabase Configuration
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
SUPABASE_BUCKET_NAME=audio-files
```
- **Where to get it:** [Supabase Dashboard](https://supabase.com/dashboard)
- **Used for:** File storage and database

### 🗃️ Database Configuration
```env
DATABASE_URL=postgresql://username:password@localhost:5432/speech_to_text
```
- **Default:** SQLite (for development)
- **Production:** PostgreSQL recommended

## 🔧 Optional Configuration

### 🌐 Server Settings
```env
HOST=0.0.0.0
PORT=8000
DEBUG=True
LOG_LEVEL=INFO
```

### 📡 WebSocket Settings
```env
MAX_CONNECTIONS=100
WEBSOCKET_TIMEOUT=300
```

### 📁 File Upload Settings
```env
MAX_FILE_SIZE=104857600  # 100MB
ALLOWED_EXTENSIONS=.mp3,.wav,.m4a,.aac,.ogg,.flac,.webm
```

### 🔒 Security Settings
```env
SECRET_KEY=your_secret_key_here
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## 🛡️ Security Best Practices

### ✅ Do's
- ✅ Keep `.env` files out of version control
- ✅ Use strong, unique API keys
- ✅ Rotate keys regularly
- ✅ Use different keys for development/production
- ✅ Set proper file permissions (`chmod 600 .env`)

### ❌ Don'ts
- ❌ Never commit `.env` files to Git
- ❌ Don't share API keys in chat/email
- ❌ Don't use example keys in production
- ❌ Don't store secrets in code

## 🔍 Validation

The app will automatically validate your configuration on startup:

```bash
✅ Configuration loaded successfully
📊 Database: postgresql://...
🌐 Server: 0.0.0.0:8000
📁 Max file size: 100.0MB
```

## ⚠️ Troubleshooting

### Missing API Keys
```
⚠️  AssemblyAI API key not configured!
```
**Solution:** Add your AssemblyAI API key to `.env`

### Supabase Connection Issues
```
⚠️  Supabase URL not configured!
```
**Solution:** Verify your Supabase URL and key in `.env`

### Database Connection
```
❌ Configuration validation failed
```
**Solution:** Check your `DATABASE_URL` format

## 🚀 Getting Started

1. **Set up environment:**
   ```bash
   cd backend
   python setup_env.py
   ```

2. **Edit your `.env` file:**
   ```bash
   nano .env  # or use your preferred editor
   ```

3. **Start the server:**
   ```bash
   python fast_start.py
   ```

4. **Verify setup:**
   - Visit: http://localhost:8000/health
   - Should return: `{"status": "healthy"}`

## 📚 Additional Resources

- [AssemblyAI Documentation](https://www.assemblyai.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Environment Variables](https://fastapi.tiangolo.com/advanced/settings/)

## 🆘 Need Help?

If you encounter issues:
1. Check the console output for error messages
2. Verify all required environment variables are set
3. Ensure API keys are valid and have proper permissions
4. Check network connectivity to external services 