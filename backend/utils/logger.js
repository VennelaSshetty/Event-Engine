const formatLog = (level, data) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    ...data
  }, null, 2);
};

const logger = {
  info: (data) => {
    console.log(formatLog("INFO", data));
  },

  warn: (data) => {
    console.warn(formatLog("WARN", data));
  },

  error: (data) => {
    console.error(formatLog("ERROR", data));
  }
};

export default logger;