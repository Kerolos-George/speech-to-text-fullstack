import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  Notifications,
  NotificationsNone,
  VolumeUp,
  Clear,
  CheckCircle
} from '@mui/icons-material';

const NotificationSystem = ({ notifications, onClear }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_transcript':
        return <VolumeUp sx={{ color: '#10b981' }} />;
      case 'completed':
        return <CheckCircle sx={{ color: '#3b82f6' }} />;
      default:
        return <Notifications sx={{ color: '#6b7280' }} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_transcript':
        return 'success';
      case 'completed':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ mr: 1 }}
      >
        <Badge badgeContent={notifications.length} color="error">
          {notifications.length > 0 ? <Notifications /> : <NotificationsNone />}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 400,
            overflow: 'auto'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            {notifications.length > 0 && (
              <Button
                size="small"
                startIcon={<Clear />}
                onClick={() => {
                  onClear();
                  handleClose();
                }}
              >
                Clear All
              </Button>
            )}
          </Box>
        </Box>

        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsNone sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </Box>
        ) : (
          notifications.map((notification, index) => (
            <MenuItem
              key={index}
              onClick={handleClose}
              sx={{
                py: 1.5,
                px: 2,
                borderBottom: index < notifications.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                alignItems: 'flex-start'
              }}
            >
              <ListItemIcon sx={{ mt: 0.5, minWidth: 36 }}>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {notification.type === 'new_transcript' ? 'New Transcript' : 'Notification'}
                    </Typography>
                    <Chip
                      label="NEW"
                      size="small"
                      color={getNotificationColor(notification.type)}
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      {notification.message}
                    </Typography>
                    {notification.data?.preview && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          fontStyle: 'italic',
                          mb: 0.5
                        }}
                      >
                        "{notification.data.preview}"
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(notification.timestamp || Date.now())}
                    </Typography>
                  </Box>
                }
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationSystem; 