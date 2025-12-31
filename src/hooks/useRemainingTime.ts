import { useState, useEffect } from 'react';

interface UseRemainingTimeProps {
  estimatedTime: number; // in hours
  trackedTime: number; // in hours
  isTracking: boolean;
  startTime?: string | Date; // ISO string or Date object
}

export function useRemainingTime({ 
  estimatedTime, 
  trackedTime, 
  isTracking,
  startTime 
}: UseRemainingTimeProps) {
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [formattedTime, setFormattedTime] = useState<string>('');

  useEffect(() => {
    // If no estimated time, show 0 remaining
    if (!estimatedTime || estimatedTime <= 0) {
      setRemainingTime(0);
      setFormattedTime('No time limit');
      return;
    }

    if (!isTracking || !startTime) {
      // Calculate remaining time without active tracking
      // Use minutes for precision to avoid floating point errors
      const estimatedMinutes = estimatedTime * 60;
      const trackedMinutes = trackedTime * 60;
      const remainingMinutes = estimatedMinutes - trackedMinutes;
      const remainingHours = Math.max(0, remainingMinutes) / 60;
      
      setRemainingTime(remainingHours);
      setFormattedTime(formatTime(remainingHours));
      return;
    }

    // Calculate remaining time with active tracking
    const calculateRemaining = () => {
      try {
        const start = new Date(startTime);
        const now = new Date();
        
        // Validate dates
        if (isNaN(start.getTime()) || isNaN(now.getTime())) {
          // Fallback to non-tracking calculation using minutes for precision
          const estimatedMinutes = estimatedTime * 60;
          const trackedMinutes = trackedTime * 60;
          const remainingMinutes = estimatedMinutes - trackedMinutes;
          const remainingHours = Math.max(0, remainingMinutes) / 60;
          setRemainingTime(remainingHours);
          setFormattedTime(formatTime(remainingHours));
          return;
        }
        
        // Calculate everything in minutes first for precision, then convert to hours
        // This avoids floating point precision issues
        const estimatedMinutes = estimatedTime * 60;
        const trackedMinutes = trackedTime * 60;
        const elapsedMilliseconds = now.getTime() - start.getTime();
        const elapsedMinutes = elapsedMilliseconds / (1000 * 60);
        
        const totalTrackedMinutes = trackedMinutes + Math.max(0, elapsedMinutes);
        const remainingMinutes = estimatedMinutes - totalTrackedMinutes;
        const remainingHours = Math.max(0, remainingMinutes) / 60;
        
        setRemainingTime(remainingHours);
        setFormattedTime(formatTime(remainingHours));
      } catch (error) {
        console.error('Error calculating remaining time:', error);
        // Fallback to non-tracking calculation using minutes for precision
        const estimatedMinutes = estimatedTime * 60;
        const trackedMinutes = trackedTime * 60;
        const remainingMinutes = estimatedMinutes - trackedMinutes;
        const remainingHours = Math.max(0, remainingMinutes) / 60;
        setRemainingTime(remainingHours);
        setFormattedTime(formatTime(remainingHours));
      }
    };

    // Calculate immediately
    calculateRemaining();

    // Update every second when tracking
    const interval = setInterval(calculateRemaining, 1000);

    return () => clearInterval(interval);
  }, [estimatedTime, trackedTime, isTracking, startTime]);

  return { remainingTime, formattedTime };
}

function formatTime(hours: number): string {
  if (hours <= 0) {
    return '0m remaining';
  }

  // Use Math.round instead of Math.floor for more accurate conversion
  // This ensures 0.9 hours = 54 minutes, not 53 minutes
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h > 0 && m > 0) {
    return `${h}h ${m}m remaining`;
  } else if (h > 0) {
    return `${h}h remaining`;
  } else if (m > 0) {
    return `${m}m remaining`;
  } else {
    return '0m remaining';
  }
}

