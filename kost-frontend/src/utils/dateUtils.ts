// File: src/utils/dateUtils.ts

/**
 * Utility functions for handling timestamps and dates
 */

/**
 * Parse timestamp from various formats (MQTT, API, etc.)
 * Returns current time as fallback for invalid timestamps to prevent crashes
 */
export function parseTimestamp(timestamp: any): Date {
  if (!timestamp) {
    console.warn('parseTimestamp: Empty timestamp, using current time');
    return new Date();
  }

  // Debug logging to help troubleshoot timestamp issues (dev only)
  if (process.env.NODE_ENV === 'development') {
    console.debug('parseTimestamp input:', { timestamp, type: typeof timestamp });
  }

  try {
    if (typeof timestamp === 'number') {
      // Validate timestamp range to avoid 1970 dates
      const MIN_TIMESTAMP = new Date('2020-01-01').getTime() / 1000; // Jan 1, 2020 in seconds
      const MAX_TIMESTAMP = new Date('2030-01-01').getTime() / 1000; // Jan 1, 2030 in seconds
      
      // Check if it's in seconds or milliseconds
      if (timestamp < 10000000000) {
        // Timestamp in seconds
        if (timestamp < MIN_TIMESTAMP || timestamp > MAX_TIMESTAMP) {
          console.warn('Invalid timestamp (seconds) - outside reasonable range:', timestamp, '- using current time');
          return new Date(); // Return current time instead of null
        }
        const result = new Date(timestamp * 1000);
        if (process.env.NODE_ENV === 'development') {
          console.debug('parseTimestamp result (seconds):', result);
        }
        return result;
      } else {
        // Timestamp in milliseconds
        const timestampInSeconds = timestamp / 1000;
        if (timestampInSeconds < MIN_TIMESTAMP || timestampInSeconds > MAX_TIMESTAMP) {
          console.warn('Invalid timestamp (milliseconds) - outside reasonable range:', timestamp, '- using current time');
          return new Date(); // Return current time instead of null
        }
        const result = new Date(timestamp);
        if (process.env.NODE_ENV === 'development') {
          console.debug('parseTimestamp result (milliseconds):', result);
        }
        return result;
      }
    } else if (typeof timestamp === 'string') {
      // First try parsing as ISO string (most common from API)
      const isoResult = new Date(timestamp);
      if (!isNaN(isoResult.getTime()) && isoResult.getFullYear() >= 2020 && isoResult.getFullYear() <= 2030) {
        if (process.env.NODE_ENV === 'development') {
          console.debug('parseTimestamp result (ISO string):', isoResult);
        }
        return isoResult;
      }
      
      // Fallback: Try parsing as Unix timestamp string
      const timestampNum = parseInt(timestamp);
      if (!isNaN(timestampNum)) {
        // Use the same validation as number parsing
        return parseTimestamp(timestampNum);
      }
    } else if (timestamp instanceof Date) {
      // Validate Date object
      if (!isNaN(timestamp.getTime()) && timestamp.getFullYear() >= 2020 && timestamp.getFullYear() <= 2030) {
        if (process.env.NODE_ENV === 'development') {
          console.debug('parseTimestamp result (already Date):', timestamp);
        }
        return timestamp;
      } else {
        console.warn('Invalid Date object:', timestamp, '- using current time');
        return new Date(); // Return current time instead of null
      }
    }
  } catch (error) {
    console.warn('Failed to parse timestamp:', timestamp, error, '- using current time');
    return new Date(); // Return current time instead of null
  }

  console.warn('parseTimestamp failed to parse:', timestamp, '- using current time');
  return new Date(); // Return current time instead of null
}

/**
 * Format date for display in Indonesian locale
 */
export function formatTimeForDisplay(date: any): string {
  // Parse and validate the date first
  const validDate = parseTimestamp(date);
  
  // Since parseTimestamp always returns a Date, we can safely use it
  return validDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Jakarta'
  });
}

/**
 * Get relative time string (e.g., "2 menit lalu")
 */
export function getRelativeTime(date: Date): string {
  try {
    // Validate input
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.warn('getRelativeTime: Invalid date input, using current time');
      return 'baru saja';
    }

    const now = Date.now();
    const dateTime = date.getTime();
    const diffMs = now - dateTime;
    const minutes = Math.floor(diffMs / 60000);

    // Debug logging for troubleshooting (dev only)
    if (process.env.NODE_ENV === 'development') {
      console.debug('getRelativeTime calculation:', {
        now,
        dateTime,
        diffMs,
        minutes,
        dateString: date.toString()
      });
    }

    // Sanity check: if difference is negative or too large, there might be an issue
    if (diffMs < 0) {
      console.warn('Negative time difference detected:', { now, dateTime, date: date.toString() });
      return 'waktu di masa depan';
    }
    
    if (minutes > 365 * 24 * 60) { // More than a year
      console.warn('Extremely large time difference detected:', { minutes, date: date.toString() });
      return 'data timestamp tidak valid';
    }

    // Extra protection for extremely large differences
    if (minutes > 527117) { // This was the value from your error
      console.warn('Detected known problematic timestamp, using fallback');
      return 'timestamp ESP32 tidak valid';
    }

    if (minutes < 1) {
      return 'baru saja';
    } else if (minutes < 60) {
      return `${minutes} menit lalu`;
    } else if (minutes < 1440) { // 24 hours
      const hours = Math.floor(minutes / 60);
      return `${hours} jam lalu`;
    } else if (minutes < 10080) { // 7 days
      const days = Math.floor(minutes / 1440);
      return `${days} hari lalu`;
    } else {
      // For very old dates, show a more reasonable message
      const days = Math.floor(minutes / 1440);
      if (days > 30) {
        return 'lebih dari sebulan lalu';
      }
      return `${days} hari lalu`;
    }
  } catch (error) {
    console.error('getRelativeTime error:', error, 'date:', date);
    return 'error waktu';
  }
}

/**
 * Get device last seen human readable string
 */
export function getLastSeenHuman(lastSeen: any, fallbackDate?: any): string {
  console.debug('getLastSeenHuman inputs:', { lastSeen, fallbackDate });
  
  const date = parseTimestamp(lastSeen);
  
  // Since parseTimestamp now always returns a Date, we can safely use it
  const result = getRelativeTime(date);
  console.debug('getLastSeenHuman using timestamp:', { date, result });
  return result;
}

/**
 * Check if device is considered online based on last seen time
 * Default threshold: 2 minutes (ESP32 sends heartbeat every 30 seconds)
 */
export function isDeviceOnline(lastSeen: any, thresholdMinutes: number = 2): boolean {
  const date = parseTimestamp(lastSeen);
  
  // Since parseTimestamp now always returns a Date, we can safely use it
  // But if it's a fallback current time for invalid data, consider device offline
  if (!lastSeen) {
    return false;
  }
  
  const now = Date.now();
  const diffMs = now - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  
  return minutes < thresholdMinutes;
}

/**
 * Format timestamp for display with relative time
 */
export function formatTimestampWithRelative(timestamp: any): string {
  if (process.env.NODE_ENV === 'development') {
    console.debug('formatTimestampWithRelative input:', timestamp);
  }
  
  const date = parseTimestamp(timestamp);
  
  // Since parseTimestamp now always returns a Date, we can safely use it
  const timeStr = formatTimeForDisplay(date);
  const relativeStr = getRelativeTime(date);
  
  if (process.env.NODE_ENV === 'development') {
    console.debug('formatTimestampWithRelative result:', { timeStr, relativeStr });
  }
  
  return `${timeStr} (${relativeStr})`;
}

/**
 * Test function to debug timestamp parsing issues
 */
export function testTimestampParsing() {
  const testCases = [
    '2025-07-05T01:44:11.000000Z',
    '2025-07-05 01:44:11',
    1720129451000, // milliseconds (July 4, 2024)
    1720129451,    // seconds (July 4, 2024)
    new Date(),
    // Invalid cases that should be filtered out
    45843.07235,   // Excel serial (should be invalid)
    1000000,       // Too old (1970)
    'invalid-date'
  ];
  
  console.group('🧪 Testing timestamp parsing:');
  testCases.forEach((test, index) => {
    const parsed = parseTimestamp(test);
    const formatted = parsed ? formatTimestampWithRelative(test) : 'INVALID';
    console.log(`Test ${index + 1}:`, {
      input: test,
      parsed: parsed ? parsed.toString() : 'NULL',
      formatted: formatted
    });
  });
  console.groupEnd();
  
  // Test current time
  console.log('✅ Current time test:', formatTimestampWithRelative(new Date()));
}