import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  Schedule,
  Person,
  Language,
  VolumeUp,
  Assessment
} from '@mui/icons-material';
import { API_BASE_URL } from '../config';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    totalTranscripts: 0,
    totalDuration: 0,
    averageConfidence: 0,
    totalSpeakers: 0,
    languageDistribution: {},
    recentActivity: [],
    speakerStats: [],
    processingTimes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/transcripts?limit=100`);
      if (response.ok) {
        const transcripts = await response.json();
        calculateAnalytics(transcripts);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (transcripts) => {
    const completed = transcripts.filter(t => t.status === 'completed');
    
    const totalDuration = completed.reduce((sum, t) => sum + (t.audio_duration || 0), 0);
    const totalSpeakers = completed.reduce((sum, t) => sum + (t.speakers_count || 0), 0);
    const averageConfidence = completed.length > 0 
      ? completed.reduce((sum, t) => sum + (t.confidence_score || 0), 0) / completed.length 
      : 0;

    // Language distribution
    const languageDistribution = {};
    completed.forEach(t => {
      const lang = t.language_detected || 'Unknown';
      languageDistribution[lang] = (languageDistribution[lang] || 0) + 1;
    });

    // Recent activity (last 10 transcripts)
    const recentActivity = completed
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    // Processing times
    const processingTimes = completed
      .filter(t => t.processing_time)
      .map(t => ({
        id: t.id,
        duration: t.audio_duration,
        processingTime: t.processing_time,
        efficiency: t.audio_duration / t.processing_time
      }))
      .sort((a, b) => b.efficiency - a.efficiency);

    setAnalytics({
      totalTranscripts: completed.length,
      totalDuration,
      averageConfidence,
      totalSpeakers,
      languageDistribution,
      recentActivity,
      processingTimes: processingTimes.slice(0, 5)
    });
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLanguageFlag = (lang) => {
    const flags = {
      'en': '🇺🇸',
      'es': '🇪🇸',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'it': '🇮🇹',
      'pt': '🇵🇹',
      'zh': '🇨🇳',
      'ja': '🇯🇵',
      'ko': '🇰🇷',
      'ar': '🇸🇦'
    };
    return flags[lang.toLowerCase()] || '🌐';
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
          Analytics Dashboard
        </Typography>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ width: 40, height: 40, bgcolor: 'grey.200', borderRadius: 1, mr: 2 }} />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ height: 20, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
                      <Box sx={{ height: 16, bgcolor: 'grey.100', borderRadius: 1, width: '60%' }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
        Analytics Dashboard
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Assessment sx={{ fontSize: 40, color: '#3b82f6', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1e293b' }}>
              {analytics.totalTranscripts}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Transcripts
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Schedule sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1e293b' }}>
              {formatTime(analytics.totalDuration)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Audio Processed
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <TrendingUp sx={{ fontSize: 40, color: '#f59e0b', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1e293b' }}>
              {(analytics.averageConfidence * 100).toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average Confidence
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Person sx={{ fontSize: 40, color: '#8b5cf6', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1e293b' }}>
              {analytics.totalSpeakers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Speakers Identified
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Language Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Language Distribution
              </Typography>
              {Object.entries(analytics.languageDistribution).length === 0 ? (
                <Typography color="text.secondary">
                  No data available
                </Typography>
              ) : (
                <List>
                  {Object.entries(analytics.languageDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .map(([language, count]) => {
                      const percentage = (count / analytics.totalTranscripts) * 100;
                      return (
                        <ListItem key={language} sx={{ px: 0 }}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1">
                                  {getLanguageFlag(language)} {language.toUpperCase()}
                                </Typography>
                                <Chip 
                                  label={count} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined" 
                                />
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={percentage} 
                                  sx={{ height: 6, borderRadius: 3 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {percentage.toFixed(1)}%
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      );
                    })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Processing Efficiency */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Processing Efficiency
              </Typography>
              {analytics.processingTimes.length === 0 ? (
                <Typography color="text.secondary">
                  No processing data available
                </Typography>
              ) : (
                <List>
                  {analytics.processingTimes.map((item, index) => (
                    <ListItem key={item.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">
                              Transcript #{item.id.slice(-8)}
                            </Typography>
                            <Chip 
                              label={`${item.efficiency.toFixed(1)}x speed`}
                              size="small"
                              color={item.efficiency > 1 ? 'success' : 'warning'}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(item.duration)} audio → {item.processingTime.toFixed(1)}s processing
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Recent Activity
              </Typography>
              {analytics.recentActivity.length === 0 ? (
                <Typography color="text.secondary">
                  No recent activity
                </Typography>
              ) : (
                <List>
                  {analytics.recentActivity.map((transcript, index) => (
                    <React.Fragment key={transcript.id}>
                      <ListItem sx={{ px: 0 }}>
                        <Avatar sx={{ mr: 2, bgcolor: '#3b82f6' }}>
                          <VolumeUp />
                        </Avatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1">
                                Transcript #{transcript.id.slice(-8)}
                              </Typography>
                              <Chip 
                                label={`${transcript.speakers_count || 0} speakers`}
                                size="small"
                                variant="outlined"
                              />
                              <Chip 
                                label={transcript.language_detected || 'EN'}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {transcript.transcript?.substring(0, 100)}...
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(transcript.created_at)} • {formatTime(transcript.audio_duration)} • {(transcript.confidence_score * 100).toFixed(1)}% confidence
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < analytics.recentActivity.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics; 