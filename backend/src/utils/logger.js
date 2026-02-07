// Logger utility for debug output visible in Unraid/Docker logs
// All output goes to stdout/stderr which Docker captures

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// Set via environment variable: LOG_LEVEL=DEBUG|INFO|WARN|ERROR
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.DEBUG;

function formatTimestamp() {
  return new Date().toISOString();
}

function formatMessage(level, component, message, data) {
  const timestamp = formatTimestamp();
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level}] [${component}] ${message}${dataStr}`;
}

function shouldLog(level) {
  return LOG_LEVELS[level] >= currentLevel;
}

export const logger = {
  debug: (component, message, data) => {
    if (shouldLog('DEBUG')) {
      console.log(formatMessage('DEBUG', component, message, data));
    }
  },
  
  info: (component, message, data) => {
    if (shouldLog('INFO')) {
      console.log(formatMessage('INFO', component, message, data));
    }
  },
  
  warn: (component, message, data) => {
    if (shouldLog('WARN')) {
      console.warn(formatMessage('WARN', component, message, data));
    }
  },
  
  error: (component, message, data) => {
    if (shouldLog('ERROR')) {
      console.error(formatMessage('ERROR', component, message, data));
    }
  },
  
  // Log HTTP request details
  request: (req, component = 'HTTP') => {
    if (shouldLog('DEBUG')) {
      console.log(formatMessage('DEBUG', component, `${req.method} ${req.path}`, {
        query: Object.keys(req.query).length ? req.query : undefined,
        body: req.body && Object.keys(req.body).length ? req.body : undefined,
        ip: req.ip
      }));
    }
  },
  
  // Log Socket.IO events
  socket: (event, socketId, data) => {
    if (shouldLog('DEBUG')) {
      console.log(formatMessage('DEBUG', 'Socket', `Event: ${event}`, {
        socketId,
        ...data
      }));
    }
  }
};

export default logger;
