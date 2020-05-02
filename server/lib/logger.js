const {createLogger, format, transports}  = require('winston');
const config = require('./config');

//
// A unified logger that allows us to identify which
// components are doing the logging
//

class Logger{
  constructor(serviceName = 'server'){
    const logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
      defaultMeta: { service: serviceName },
      transports: [
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        new transports.File({ filename: config.error_log_file, level: 'error' }),
        new transports.File({ filename: config.log_file })
      ]
    });

    // If we're not in production then log to the `console` with the format:
    // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
    if (process.env.NODE_ENV !== 'production') { 
      logger.add(
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          )
        })
      );
    }
    return logger
  }
}

module.exports = (serviceName) => { return new Logger(serviceName) }
