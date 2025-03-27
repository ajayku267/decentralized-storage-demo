import React from 'react';
import { Box, styled } from '@mui/material';

// Timeline container
export const Timeline = styled(Box)(({ theme, position = 'left' }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(1.5, 0),
  margin: 0,
  '& .MuiTimelineItem-root:last-child': {
    minHeight: 'auto',
  },
  '& .MuiTimelineItem-root:last-child .MuiTimelineSeparator-root .MuiTimelineConnector-root': {
    display: 'none',
  },
  ...(position === 'alternate' && {
    '& .MuiTimelineItem-root:nth-of-type(even) .MuiTimelineContent-root': {
      textAlign: 'left',
    },
    '& .MuiTimelineItem-root:nth-of-type(odd) .MuiTimelineContent-root': {
      textAlign: 'right',
    },
  }),
  ...(position === 'left' && {
    '& .MuiTimelineContent-root': {
      textAlign: 'left',
    },
  }),
  ...(position === 'right' && {
    '& .MuiTimelineContent-root': {
      textAlign: 'right',
    },
  }),
}));

// Timeline item
export const TimelineItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  position: 'relative',
  minHeight: 70,
}));

// Timeline separator
export const TimelineSeparator = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: '0 0 auto',
  padding: theme.spacing(0, 2),
}));

// Timeline dot
export const TimelineDot = styled(Box)(({ theme, color = 'primary', variant = 'filled' }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  borderRadius: '50%',
  border: '2px solid transparent',
  padding: theme.spacing(1),
  ...(variant === 'filled' && {
    backgroundColor: theme.palette[color]?.main || color || theme.palette.grey[400],
    color: theme.palette[color]?.contrastText || '#fff',
  }),
  ...(variant === 'outlined' && {
    boxShadow: `0 0 0 2px ${theme.palette[color]?.main || color || theme.palette.grey[400]}`,
    color: theme.palette[color]?.main || color || theme.palette.grey[400],
  }),
}));

// Timeline connector
export const TimelineConnector = styled(Box)(({ theme }) => ({
  width: 2,
  backgroundColor: theme.palette.divider,
  flexGrow: 1,
}));

// Timeline content
export const TimelineContent = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(1, 2),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

// Timeline opposite content
export const TimelineOppositeContent = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(1, 2),
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'right',
  justifyContent: 'center',
})); 