import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Pagination,
  TextField,
  InputAdornment,
  Skeleton,
  Alert,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Visibility,
  Delete,
  Search,
  FilterList,
  Person,
  Schedule,
  Language,
  MoreVert,
  ContentCopy,
  Download
} from '@mui/icons-material';
import { WebSocketContext } from './WebSocketProvider';
import { API_BASE_URL } from '../config';

const TranscriptsList = () => {
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTranscriptId, setSelectedTranscriptId] = useState(null);
  
  const { sendMessage, lastMessage } = useContext(WebSocketContext);

  useEffect(() => {
    fetchTranscripts();
  }, [page, statusFilter]);

  useEffect(() => {
    // Listen for new transcript notifications
    if (lastMessage && lastMessage.status === 'new_transcript') {
      fetchTranscripts(); // Refresh the list
    }
  }, [lastMessage]);

  const fetchTranscripts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`${API_BASE_URL}/transcripts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTranscripts(data);
      } else {
        console.error('Failed to fetch transcripts');
      }
    } catch (error) {
      console.error('Error fetching transcripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTranscript = async (transcriptId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transcripts/${transcriptId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedTranscript(data);
        setDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching transcript details:', error);
    }
  };

  const handleDeleteTranscript = async (transcriptId) => {
    if (window.confirm('Are you sure you want to delete this transcript?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/transcripts/${transcriptId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchTranscripts(); // Refresh the list
        }
      } catch (error) {
        console.error('Error deleting transcript:', error);
      }
    }
    setAnchorEl(null);
  };

  const handleMenuClick = (event, transcriptId) => {
    setAnchorEl(event.currentTarget);
    setSelectedTranscriptId(transcriptId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTranscriptId(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    handleMenuClose();
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSpeakerColor = (speaker) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
    const hash = speaker.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const filteredTranscripts = transcripts.filter(transcript =>
    transcript.transcript?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transcript.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Transcripts Library
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={() => {
            const newFilter = statusFilter === 'all' ? 'completed' : 'all';
            setStatusFilter(newFilter);
          }}
        >
          {statusFilter === 'all' ? 'Show All' : 'Show Completed'}
        </Button>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search transcripts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      {/* Transcripts Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="100%" height={60} />
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Skeleton variant="rectangular" width={60} height={24} />
                    <Skeleton variant="rectangular" width={80} height={24} />
                    <Skeleton variant="rectangular" width={70} height={24} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filteredTranscripts.length === 0 ? (
        <Alert severity="info" sx={{ textAlign: 'center' }}>
          No transcripts found. Upload an audio file to get started!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredTranscripts.map((transcript) => (
            <Grid item xs={12} md={6} key={transcript.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                      Transcript #{transcript.id.slice(-8)}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, transcript.id)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {transcript.transcript || 'Processing...'}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip
                      icon={<Person />}
                      label={`${transcript.speakers_count || 0} speakers`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<Schedule />}
                      label={formatTime(transcript.audio_duration)}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<Language />}
                      label={transcript.language_detected || 'EN'}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={transcript.status}
                      size="small"
                      color={transcript.status === 'completed' ? 'success' : 'warning'}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(transcript.created_at)}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleViewTranscript(transcript.id)}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {!loading && filteredTranscripts.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(filteredTranscripts.length / 10)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewTranscript(selectedTranscriptId)}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          const transcript = transcripts.find(t => t.id === selectedTranscriptId);
          if (transcript) copyToClipboard(transcript.transcript);
        }}>
          <ContentCopy sx={{ mr: 1 }} />
          Copy Text
        </MenuItem>
        <MenuItem onClick={() => handleDeleteTranscript(selectedTranscriptId)}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Transcript Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Transcript Details
        </DialogTitle>
        <DialogContent>
          {selectedTranscript && (
            <Box>
              {/* Summary Stats */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {selectedTranscript.speakers_count || 0}
                    </Typography>
                    <Typography variant="caption">Speakers</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {formatTime(selectedTranscript.audio_duration)}
                    </Typography>
                    <Typography variant="caption">Duration</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {selectedTranscript.confidence_score ? (selectedTranscript.confidence_score * 100).toFixed(1) : 0}%
                    </Typography>
                    <Typography variant="caption">Confidence</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {selectedTranscript.language_detected || 'EN'}
                    </Typography>
                    <Typography variant="caption">Language</Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Full Transcript */}
              <Typography variant="h6" gutterBottom>
                Full Transcript
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 3 }}>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedTranscript.transcript}
                </Typography>
              </Box>

              {/* Speaker Breakdown */}
              {selectedTranscript.speakers && selectedTranscript.speakers.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Speaker Breakdown
                  </Typography>
                  <List>
                    {selectedTranscript.speakers.map((speaker, index) => (
                      <ListItem key={index}>
                        <Avatar
                          sx={{
                            bgcolor: getSpeakerColor(speaker.speaker_label),
                            mr: 2
                          }}
                        >
                          {speaker.speaker_label.charAt(speaker.speaker_label.length - 1)}
                        </Avatar>
                        <ListItemText
                          primary={speaker.speaker_label}
                          secondary={`${speaker.total_words} words • ${formatTime(speaker.total_duration)} speaking time`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedTranscript) {
                copyToClipboard(selectedTranscript.transcript);
              }
            }}
          >
            Copy Transcript
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TranscriptsList; 