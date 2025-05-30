# 🚀 Deployment Guide

This guide covers how to deploy SpeechFlow AI to various cloud platforms.

## 🌐 Deployment Options

### 1. Heroku (Recommended for Beginners)

#### One-Click Deploy
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Kerolos-George/speech-to-text-fullstack)

#### Manual Heroku Deployment
```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create a new app
heroku create your-app-name

# Set environment variables
heroku config:set ASSEMBLY_API_KEY=your_assemblyai_api_key
heroku config:set SUPABASE_URL=https://your-project.supabase.co
heroku config:set SUPABASE_KEY=your_supabase_anon_key

# Deploy
git push heroku main

# Open your app
heroku open
```

### 2. Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### 3. Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `cd backend && pip install -r requirements.txt`
4. Set start command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in Render dashboard

### 4. DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure build settings:
   - Build command: `cd backend && pip install -r requirements.txt`
   - Run command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Set environment variables
4. Deploy

## 🔧 Environment Variables

Set these environment variables in your deployment platform:

| Variable | Description | Required |
|----------|-------------|----------|
| `ASSEMBLY_API_KEY` | AssemblyAI API key | ✅ |
| `SUPABASE_URL` | Supabase project URL | ✅ |
| `SUPABASE_KEY` | Supabase anon key | ✅ |
| `SUPABASE_BUCKET_NAME` | Storage bucket name | ❌ (default: audio-files) |
| `DEBUG` | Debug mode | ❌ (default: False) |
| `MAX_FILE_SIZE` | Max upload size | ❌ (default: 100MB) |

## 🏠 Local Development

### Windows (PowerShell)
```powershell
# Run the setup script
.\run-local.ps1
```

### Manual Local Setup
```bash
# Backend
cd backend
python setup_env.py
pip install -r requirements.txt
python fast_start.py

# Frontend (new terminal)
cd frontend
npm install
npm start
```

### Docker (Optional)
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🔍 Production Considerations

### Security
- ✅ Set `DEBUG=False` in production
- ✅ Use HTTPS for all external API calls
- ✅ Secure your API keys
- ✅ Configure CORS properly

### Performance
- ✅ Use production WSGI server (Gunicorn)
- ✅ Enable gzip compression
- ✅ Use CDN for static files
- ✅ Implement caching

### Monitoring
- ✅ Set up logging
- ✅ Monitor API response times
- ✅ Track file upload metrics
- ✅ Monitor WebSocket connections

## 🐳 Docker Deployment

### Dockerfile (Backend)
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - ASSEMBLY_API_KEY=${ASSEMBLY_API_KEY}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

## 🌐 Frontend Deployment

The frontend can be deployed separately to static hosting:

### Netlify
```bash
# Build frontend
cd frontend
npm run build

# Deploy to Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

### Vercel
```bash
# Deploy to Vercel
npm install -g vercel
cd frontend
vercel --prod
```

### GitHub Pages
```bash
# Add homepage to package.json
"homepage": "https://yourusername.github.io/speech-to-text-fullstack"

# Install gh-pages
npm install --save-dev gh-pages

# Add deploy script to package.json
"scripts": {
  "deploy": "npm run build && gh-pages -d build"
}

# Deploy
npm run deploy
```

## 🔧 Platform-Specific Configuration

### Heroku Buildpacks
The app uses multiple buildpacks:
1. `heroku/python` - For backend
2. `heroku/nodejs` - For frontend build tools

### Environment Files
- Development: `backend/.env`
- Production: Platform environment variables
- Staging: `backend/.env.staging` (optional)

## 🚨 Troubleshooting

### Common Issues

**Build Failures**
```bash
# Clear buildpacks
heroku buildpacks:clear

# Add buildpacks in order
heroku buildpacks:add heroku/python
heroku buildpacks:add heroku/nodejs
```

**Port Issues**
```bash
# Ensure your app uses $PORT environment variable
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Static Files**
```bash
# For production, serve React build files through FastAPI
# Check backend/app/main.py for static file configuration
```

## 📊 Monitoring & Logs

### View Logs
```bash
# Heroku
heroku logs --tail

# Railway
railway logs

# Docker
docker-compose logs -f
```

### Health Checks
- Backend: `https://your-app.herokuapp.com/health`
- API Docs: `https://your-app.herokuapp.com/docs`

## 🔄 CI/CD

### GitHub Actions (Example)
```yaml
name: Deploy to Heroku
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "your-app-name"
          heroku_email: "your-email@example.com"
```

## 🎯 Performance Tips

1. **Database Optimization**: Use connection pooling
2. **File Storage**: Use CDN for audio files
3. **Caching**: Implement Redis for API responses
4. **Load Balancing**: Use multiple dynos for high traffic
5. **Monitoring**: Set up APM tools like New Relic or DataDog

---

**Need help?** Check the [main README](README.md) or open an issue on GitHub. 