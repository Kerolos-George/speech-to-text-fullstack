# 🎵 SpeechFlow AI - Frontend

A modern React frontend for the Speech-to-Text API with real-time transcription, file upload, and subtitle export capabilities.

## ✨ Features

- 🎯 **Modern UI/UX** - Clean, responsive design with Material-UI
- 📁 **Drag & Drop Upload** - Intuitive file upload with progress tracking
- ⚡ **Real-time Updates** - WebSocket integration for live transcription status
- 🎵 **Audio Preview** - Built-in audio player for uploaded files
- 📝 **Subtitle Export** - Download SRT/VTT files with one click
- 👥 **Speaker Diarization** - Visual representation of speaker segments
- 🔔 **Smart Notifications** - Toast notifications for all operations
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🎨 **Beautiful Components** - Professional-grade UI components

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Backend URL
Edit `src/config.js` if your backend runs on a different port:
```javascript
export const API_BASE_URL = 'http://localhost:8000';
export const WS_BASE_URL = 'ws://localhost:8000';
```

### 3. Start Development Server
```bash
npm start
```

### 4. Open in Browser
- **Application**: http://localhost:3000
- **Backend API**: http://localhost:8000/docs

## 📋 Requirements

- **Node.js**: 16.0+
- **npm**: 8.0+
- **Backend**: Speech-to-Text API running on port 8000

## 🛠️ Installation

### Method 1: Quick Setup
```bash
git clone <your-repo>
cd speech-to-text/frontend
npm install
npm start
```

### Method 2: Development Setup
```bash
# 1. Clone and navigate
cd frontend

# 2. Install dependencies
npm install

# 3. Create environment file (optional)
cp .env.example .env.local
# Edit with your backend URL if different

# 4. Start development server
npm start

# 5. Build for production
npm run build
```

## 🎨 Technologies Used

### Core Framework
- **React** 18.2+ - Modern React with Hooks
- **JavaScript ES6+** - Modern JavaScript features

### UI & Styling
- **Material-UI (MUI)** 5.0+ - Complete React component library
- **Material Icons** - Comprehensive icon set
- **CSS-in-JS** - Styled components with theming

### File Handling
- **React Dropzone** - Drag and drop file uploads
- **File Validation** - Type and size validation
- **Progress Tracking** - Real-time upload progress

### Communication
- **WebSocket API** - Real-time communication with backend
- **Fetch API** - HTTP requests for RESTful operations
- **JSON Handling** - Data serialization and parsing

## 🏗️ Project Structure

```
frontend/
├── public/
│   ├── index.html           # Main HTML template
│   ├── manifest.json        # PWA manifest
│   └── favicon.ico          # App icon
├── src/
│   ├── components/
│   │   ├── AudioUploader.js      # Main upload component
│   │   ├── NotificationSystem.js # Toast notifications
│   │   ├── TranscriptDisplay.js  # Transcript viewer
│   │   ├── SpeakerView.js        # Speaker diarization
│   │   ├── SubtitleExport.js     # Subtitle download
│   │   └── WebSocketProvider.js  # WebSocket management
│   ├── utils/
│   │   ├── api.js               # API helper functions
│   │   ├── audio.js             # Audio processing utilities
│   │   └── formatting.js        # Text formatting helpers
│   ├── App.js               # Main application component
│   ├── App.css              # Global styles
│   ├── index.js             # React entry point
│   └── config.js            # Configuration constants
├── package.json             # Dependencies and scripts
├── package-lock.json        # Dependency lock file
└── README.md               # This file
```

## 🎯 Component Overview

### AudioUploader Component
- **File Selection**: Click or drag-and-drop interface
- **File Validation**: Audio format and size checking
- **Upload Progress**: Real-time progress bar
- **Audio Preview**: Built-in audio player
- **Error Handling**: User-friendly error messages

### TranscriptDisplay Component
- **Text Rendering**: Clean transcript display
- **Speaker Labels**: Color-coded speaker identification
- **Timestamp Support**: Time-aligned transcript segments
- **Copy Functionality**: One-click text copying

### SpeakerView Component
- **Speaker Statistics**: Words count and speaking time
- **Visual Timeline**: Speaker timeline visualization
- **Color Coding**: Consistent speaker color scheme

### SubtitleExport Component
- **Format Options**: SRT and VTT export formats
- **Custom Settings**: Configurable caption length
- **Download Manager**: Direct file downloads

### NotificationSystem Component
- **Toast Notifications**: Non-intrusive user feedback
- **Status Updates**: Real-time operation status
- **Error Reporting**: Clear error communication

## 🎨 UI Theme & Design

### Color Palette
```javascript
primary: '#2563eb'      // Modern blue
secondary: '#7c3aed'    // Purple accent
background: '#f8fafc'   // Light gray
text: '#1e293b'         // Dark slate
muted: '#64748b'        // Medium gray
```

### Typography
- **Font Family**: Inter, Roboto, Helvetica, Arial
- **Headings**: Semi-bold weights (600)
- **Body Text**: Regular weight (400)
- **Responsive**: Scales for different screen sizes

### Layout
- **Container**: Centered with max-width
- **Cards**: Elevated with subtle shadows
- **Spacing**: Consistent 8px grid system
- **Responsive**: Mobile-first design approach

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 600px
- **Tablet**: 600px - 960px
- **Desktop**: > 960px

### Mobile Optimizations
- Touch-friendly buttons and interactions
- Optimized file upload for mobile devices
- Readable typography on small screens
- Simplified navigation for touch interfaces

## 🔌 WebSocket Integration

### Connection Management
```javascript
// Automatic reconnection
// Error handling
// Status monitoring
// Message queuing
```

### Message Types
```javascript
// Upload progress
{
  "type": "upload_progress",
  "progress": 75,
  "message": "Uploading audio file..."
}

// Transcription status
{
  "type": "transcription_status", 
  "status": "processing",
  "message": "Analyzing audio..."
}

// Completion
{
  "type": "transcription_complete",
  "data": { ... }
}
```

## 🎵 Audio File Support

### Supported Formats
- **MP3** - Most common format
- **WAV** - Uncompressed audio
- **M4A** - Apple audio format
- **AAC** - Advanced Audio Coding
- **OGG** - Open source format
- **FLAC** - Lossless compression
- **WEBM** - Web-optimized format

### File Limitations
- **Max Size**: 100MB (configurable)
- **Duration**: No specific limit
- **Quality**: All sample rates supported

## 🎯 Usage Guide

### 1. Upload Audio File
1. Click the upload area or drag a file
2. Select an audio file from your device
3. Wait for upload progress to complete
4. Preview the audio if needed

### 2. Start Transcription
1. Click "Start Transcription" button
2. Monitor real-time progress updates
3. Wait for completion notification

### 3. View Results
1. Read the generated transcript
2. Review speaker diarization
3. Check transcription confidence
4. See processing statistics

### 4. Export Subtitles
1. Choose SRT or VTT format
2. Adjust caption length if needed
3. Click download button
4. Save file to your device

## 🧪 Development

### Available Scripts
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject configuration (irreversible)
npm run eject

# Lint code
npm run lint

# Format code
npm run format
```

### Development Server
- **Hot Reload**: Automatic browser refresh
- **Error Overlay**: In-browser error display
- **Source Maps**: Debugging support
- **Proxy Support**: Backend API proxying

### Production Build
```bash
npm run build
```
- Minified and optimized bundle
- Tree-shaking for smaller size
- Service worker for caching
- Static file optimization

## 🔧 Configuration

### Environment Variables
Create `.env.local` for custom configuration:
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
REACT_APP_MAX_FILE_SIZE=104857600
```

### API Configuration
Edit `src/config.js`:
```javascript
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
export const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';
export const MAX_FILE_SIZE = process.env.REACT_APP_MAX_FILE_SIZE || 104857600;
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
```bash
# Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=build

# Vercel
npm install -g vercel
vercel --prod

# GitHub Pages
npm install -g gh-pages
npm run deploy
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔍 Troubleshooting

### Common Issues

**1. Backend Connection Failed**
```
Error: Failed to fetch
```
**Solution**: Verify backend is running on port 8000

**2. WebSocket Connection Issues**
```
WebSocket connection failed
```
**Solution**: Check CORS settings and firewall

**3. File Upload Failures**
```
Upload failed: File too large
```
**Solution**: Check file size limits (100MB default)

**4. Audio Preview Not Working**
```
Audio format not supported
```
**Solution**: Use supported audio formats (MP3, WAV, etc.)

### Debug Mode
```bash
# Enable debug logging
REACT_APP_DEBUG=true npm start
```

### Performance Issues
- Check browser console for errors
- Monitor network tab for failed requests
- Verify audio file format compatibility
- Clear browser cache and reload

## 🔒 Security

- ✅ No sensitive data in frontend code
- ✅ API calls over HTTPS in production
- ✅ File validation before upload
- ✅ Error boundary for crash protection
- ✅ XSS protection through React

## 🎨 Customization

### Theme Customization
Edit the theme in `App.js`:
```javascript
const theme = createTheme({
  palette: {
    primary: { main: '#your-color' },
    secondary: { main: '#your-accent' }
  }
});
```

### Component Styling
Use Material-UI's `sx` prop:
```javascript
<Button sx={{ 
  backgroundColor: 'custom.color',
  '&:hover': { backgroundColor: 'custom.hover' }
}}>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the coding standards
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [React Documentation](https://reactjs.org/docs)
- [Material-UI Documentation](https://mui.com)
- [Create React App](https://create-react-app.dev)
