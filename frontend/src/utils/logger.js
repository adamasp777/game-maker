// Frontend logger utility for debug output
// Logs appear in browser console and can be viewed via browser dev tools

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// Enable debug logging by default in development, can be overridden
const isDev = import.meta.env.DEV;
const currentLevel = LOG_LEVELS[import.meta.env.VITE_LOG_LEVEL?.toUpperCase()] ?? (isDev ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO);

function formatTimestamp() {
  return new Date().toISOString();
}

function shouldLog(level) {
  return LOG_LEVELS[level] >= currentLevel;
}

// Color coding for different log levels
const levelColors = {
  DEBUG: '#888',
  INFO: '#2196F3',
  WARN: '#FF9800',
  ERROR: '#F44336'
};

const componentColors = {
  Socket: '#9C27B0',
  API: '#4CAF50',
  App: '#FF5722',
  Auth: '#00BCD4',
  Fight: '#E91E63',
  Lobby: '#3F51B5'
};

export const logger = {
  debug: (component, message, data) => {
    if (shouldLog('DEBUG')) {
      const color = componentColors[component] || '#888';
      console.log(
        `%c[${formatTimestamp()}] %c[DEBUG] %c[${component}]%c ${message}`,
        'color: #888',
        `color: ${levelColors.DEBUG}`,
        `color: ${color}; font-weight: bold`,
        'color: inherit',
        data !== undefined ? data : ''
      );
    }
  },
  
  info: (component, message, data) => {
    if (shouldLog('INFO')) {
      const color = componentColors[component] || '#888';
      console.log(
        `%c[${formatTimestamp()}] %c[INFO] %c[${component}]%c ${message}`,
        'color: #888',
        `color: ${levelColors.INFO}`,
        `color: ${color}; font-weight: bold`,
        'color: inherit',
        data !== undefined ? data : ''
      );
    }
  },
  
  warn: (component, message, data) => {
    if (shouldLog('WARN')) {
      const color = componentColors[component] || '#888';
      console.warn(
        `%c[${formatTimestamp()}] %c[WARN] %c[${component}]%c ${message}`,
        'color: #888',
        `color: ${levelColors.WARN}`,
        `color: ${color}; font-weight: bold`,
        'color: inherit',
        data !== undefined ? data : ''
      );
    }
  },
  
  error: (component, message, data) => {
    if (shouldLog('ERROR')) {
      const color = componentColors[component] || '#888';
      console.error(
        `%c[${formatTimestamp()}] %c[ERROR] %c[${component}]%c ${message}`,
        'color: #888',
        `color: ${levelColors.ERROR}`,
        `color: ${color}; font-weight: bold`,
        'color: inherit',
        data !== undefined ? data : ''
      );
    }
  },
  
  // Group related logs together
  group: (component, label) => {
    if (shouldLog('DEBUG')) {
      const color = componentColors[component] || '#888';
      console.groupCollapsed(
        `%c[${formatTimestamp()}] %c[${component}]%c ${label}`,
        'color: #888',
        `color: ${color}; font-weight: bold`,
        'color: inherit'
      );
    }
  },
  
  groupEnd: () => {
    if (shouldLog('DEBUG')) {
      console.groupEnd();
    }
  },
  
  // Log network requests
  network: (method, url, status, duration) => {
    if (shouldLog('DEBUG')) {
      const statusColor = status >= 400 ? levelColors.ERROR : status >= 300 ? levelColors.WARN : levelColors.INFO;
      console.log(
        `%c[${formatTimestamp()}] %c[API] %c${method} ${url} %c${status} %c(${duration}ms)`,
        'color: #888',
        'color: #4CAF50; font-weight: bold',
        'color: inherit',
        `color: ${statusColor}; font-weight: bold`,
        'color: #888'
      );
    }
  }
};

export default logger;
