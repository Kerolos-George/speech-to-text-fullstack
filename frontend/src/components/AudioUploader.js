import React, { useState, useRef, useContext } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  CircularProgress, 
  Paper,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  IconButton,
  Divider
} from '@mui/material';
import { 
  CloudUpload, 
  AudioFile, 
  Person, 
  Schedule, 
  Language,
  ExpandMore,
  ContentCopy,
  Share,
  VolumeUp,
  Download,
  Subtitles
} from '@mui/icons-material';
import { WebSocketContext } from './WebSocketProvider';

const AudioUploader = () => {
  const [file, setFile] = useState(null);
  const [transcriptionData, setTranscriptionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [speakerExpanded, setSpeakerExpanded] = useState(false);

  const fileInputRef = useRef(null);
  const { sendMessage, lastMessage } = useContext(WebSocketContext);

  // Handle WebSocket messages
  React.useEffect(() => {
    if (!lastMessage) return;

    const data = lastMessage;
    
    switch (data.status) {
      case 'received':
      case 'uploading':
      case 'uploaded':
      case 'starting':
      case 'submitted':
        setStatusMessage(data.message);
        setProgress(data.status === 'uploading' ? 25 : data.status === 'uploaded' ? 50 : 75);
        break;
        
      case 'processing':
        setStatusMessage(data.message);
        setProgress(85);
        break;
        
      case 'completed':
        setProgress(100);
        setStatusMessage(data.message);
        setTranscriptionData(data.data);
        setIsLoading(false);
        break;
        
      case 'error':
        setError(data.message);
        setIsLoading(false);
        setProgress(0);
        setStatusMessage('');
        break;
        
      default:
        break;
    }
  }, [lastMessage]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('audio/')) {
      // Check file size (limit to 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (selectedFile.size > maxSize) {
        setError('File size too large. Please select a file smaller than 100MB.');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError('');
      setTranscriptionData(null);
      setProgress(0);
      setStatusMessage('');
    } else {
      setError('Please select a valid audio file');
      setFile(null);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
      // Check file size (limit to 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (droppedFile.size > maxSize) {
        setError('File size too large. Please select a file smaller than 100MB.');
        return;
      }
      
      setFile(droppedFile);
      setError('');
      setTranscriptionData(null);
      setProgress(0);
      setStatusMessage('');
    } else {
      setError('Please drop a valid audio file');
    }
  };

  const uploadAndTranscribe = async () => {
    if (!file) return;

    setIsLoading(true);
    setError('');
    setProgress(0);
    setStatusMessage('Preparing audio file...');
    setTranscriptionData(null);

    try {
      // Check file size first
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        setError('File too large. Please select a file smaller than 100MB.');
        setIsLoading(false);
        return;
      }

      setStatusMessage('Optimizing file for upload...');
      setProgress(10);

      // Convert file to base64 with progress tracking
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentLoaded = Math.round((e.loaded / e.total) * 30); // 30% for reading
          setProgress(10 + percentLoaded);
        }
      };

      reader.onload = async (e) => {
        try {
          setStatusMessage('Encoding audio data...');
          setProgress(45);

          // Extract base64 data
          const dataUrl = e.target.result;
          const base64String = dataUrl.split(',')[1];
          
          // Get file extension
          const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
          
          setStatusMessage('Uploading to server...');
          setProgress(60);

          // Send via WebSocket with chunking for large files
          const message = {
            type: 'transcribe',
            audio_data: base64String,
            file_extension: fileExtension,
            filename: file.name,
            file_size: file.size
          };
          
          sendMessage(message);
          setProgress(75);
          setStatusMessage('Upload complete, starting transcription...');
          
        } catch (err) {
          setError(`Upload error: ${err.message}`);
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        setError('Failed to read the audio file');
        setIsLoading(false);
      };
      
      // Start reading the file
      reader.readAsDataURL(file);
      
    } catch (err) {
      setError(`Error: ${err.message}`);
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const downloadSubtitle = async (format, transcriptId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/transcripts/${transcriptId}/${format}`);
      if (!response.ok) {
        throw new Error(`Failed to download ${format.toUpperCase()} file`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `transcript_${transcriptId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError(`Failed to download ${format.toUpperCase()}: ${error.message}`);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSpeakerColor = (speaker) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
    const hash = speaker.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Upload Section */}
      <Paper 
        elevation={2}
        sx={{ 
          p: 4, 
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Upload Audio File
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
          Drag and drop your audio file or click to browse
        </Typography>

        <Box
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          sx={{
            border: '2px dashed rgba(255,255,255,0.5)',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.8)',
              backgroundColor: 'rgba(255,255,255,0.1)'
            }
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="audio/*"
            onChange={handleFileChange}
          />
          
          <CloudUpload sx={{ fontSize: 48, mb: 2, opacity: 0.8 }} />
          <Typography variant="h6" gutterBottom>
            {file ? file.name : 'Choose or drag audio file'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Supported formats: MP3, WAV, M4A, MP4, and more
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          size="large"
          onClick={uploadAndTranscribe}
          disabled={!file || isLoading}
          sx={{ 
            mt: 3,
            px: 4,
            py: 1.5,
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.3)'
            }
          }}
        >
          {isLoading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
              Processing...
            </>
          ) : (
            <>
              <AudioFile sx={{ mr: 1 }} />
              Transcribe Audio
            </>
          )}
        </Button>

        {isLoading && (
          <Box sx={{ mt: 3 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.3)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  backgroundColor: 'white'
                }
              }}
            />
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              {statusMessage}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Results Section */}
      {transcriptionData && (
        <Box sx={{ space: 2 }}>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Person sx={{ fontSize: 40, color: '#3b82f6', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  {transcriptionData.diarized_transcript?.speakers_count || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Speakers
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Schedule sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  {formatTime(transcriptionData.audio_duration || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Duration
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Language sx={{ fontSize: 40, color: '#f59e0b', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  {(transcriptionData.confidence * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Confidence
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <VolumeUp sx={{ fontSize: 40, color: '#8b5cf6', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  {transcriptionData.language_detected || 'EN'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Language
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Full Transcript */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Full Transcript
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Download SRT Subtitles">
                  <IconButton 
                    onClick={() => downloadSubtitle('srt', transcriptionData.id)}
                    size="small"
                    color="primary"
                  >
                    <Subtitles />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download VTT Subtitles">
                  <IconButton 
                    onClick={() => downloadSubtitle('vtt', transcriptionData.id)}
                    size="small"
                    color="secondary"
                  >
                    <Download />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Copy to clipboard">
                  <IconButton 
                    onClick={() => copyToClipboard(transcriptionData.text)}
                    size="small"
                  >
                    <ContentCopy />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Paper sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Typography sx={{ lineHeight: 1.8 }}>
                {transcriptionData.text}
              </Typography>
            </Paper>
          </Paper>

          {/* Subtitle Export Section */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Export Subtitles
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              Download subtitle files for your videos with speaker labels included
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <Subtitles sx={{ fontSize: 40, color: '#3b82f6', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    SRT Format
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                    Compatible with most video players (VLC, Windows Media Player, etc.)
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Download />}
                    onClick={() => downloadSubtitle('srt', transcriptionData.id)}
                    fullWidth
                  >
                    Download SRT
                  </Button>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <VolumeUp sx={{ fontSize: 40, color: '#8b5cf6', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    VTT Format
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                    Web-compatible format for HTML5 video players and YouTube
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<Download />}
                    onClick={() => downloadSubtitle('vtt', transcriptionData.id)}
                    fullWidth
                  >
                    Download VTT
                  </Button>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          {/* Speaker Diarization */}
          {transcriptionData.diarized_transcript?.speakers_summary && (
            <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Accordion 
                expanded={speakerExpanded} 
                onChange={() => setSpeakerExpanded(!speakerExpanded)}
              >
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: '#f1f5f9' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Speaker Analysis ({transcriptionData.diarized_transcript.speakers_count} speakers)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  {/* Speaker Statistics */}
                  <Box sx={{ p: 3, bgcolor: '#fafafa' }}>
                    <Grid container spacing={2}>
                      {transcriptionData.diarized_transcript.speakers_summary.map((speaker, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card sx={{ p: 2, textAlign: 'center' }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: getSpeakerColor(speaker.speaker), 
                                mx: 'auto', 
                                mb: 1,
                                width: 40,
                                height: 40
                              }}
                            >
                              {speaker.speaker.charAt(speaker.speaker.length - 1)}
                            </Avatar>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {speaker.speaker}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {speaker.speaking_percentage.toFixed(1)}% speaking time
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {speaker.total_words} words
                            </Typography>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Detailed Utterances */}
                  <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {transcriptionData.utterances?.map((utterance, index) => (
                      <ListItem key={index} alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar 
                            sx={{ 
                              bgcolor: getSpeakerColor(utterance.speaker),
                              width: 32,
                              height: 32
                            }}
                          >
                            {utterance.speaker.charAt(utterance.speaker.length - 1)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {utterance.speaker}
                              </Typography>
                              <Chip 
                                label={`${formatTime(utterance.start)} - ${formatTime(utterance.end)}`}
                                size="small"
                                variant="outlined"
                              />
                              <Chip 
                                label={`${(utterance.confidence * 100).toFixed(0)}%`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.6 }}>
                              {utterance.text}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AudioUploader; 