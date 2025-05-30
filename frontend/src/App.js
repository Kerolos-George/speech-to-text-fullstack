import React, { useState, useEffect } from 'react';
import { 
  Container, 
  CssBaseline, 
  ThemeProvider, 
  createTheme,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton
} from '@mui/material';
import { Mic, Notifications } from '@mui/icons-material';
import AudioUploader from './components/AudioUploader';
import NotificationSystem from './components/NotificationSystem';
import WebSocketProvider from './components/WebSocketProvider';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#7c3aed',
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1e293b',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        }
      }
    }
  }
});

function App() {
  const [notifications, setNotifications] = useState([]);

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WebSocketProvider onNotification={handleNewNotification}>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <Mic sx={{ mr: 2, color: '#2563eb' }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              SpeechFlow AI
            </Typography>
            <NotificationSystem 
              notifications={notifications}
              onClear={() => setNotifications([])}
            />
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#1e293b', mb: 1 }}>
              Speech-to-Text Transcription
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
              Upload audio files for AI-powered transcription with speaker diarization and subtitle export
            </Typography>
          </Box>

          <AudioUploader />
        </Container>
      </WebSocketProvider>
    </ThemeProvider>
  );
}

export default App;
