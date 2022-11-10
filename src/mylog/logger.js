// const { createLogger, format, transports } = require("winston");
// //const winstonCloudWatch = require("winston-aws-cloudwatch");
// // const moment = require('moment')

// // set default log level.
// const logLevel = "info";

// var logger = createLogger({
//   level: logLevel,
//   levels: {
//     fatal: 0,
//     crit: 1,
//     warn: 2,
//     info: 3,
//     debug: 4,
//     trace: 5,
//   },
//   format: format.combine(
//     format.prettyPrint(),
//     format.timestamp({
//       format: "DD-MM-YYYY hh:mm:ss A",
//     }),
//     format.printf((nfo) => {
//       return `${nfo.timestamp} - ${nfo.level}: ${nfo.message}`;
//     })
//   ),
//   transports: [
//     new transports.Console(),
//     new transports.File({
//       filename: "bot.log",
//     }),
//   ],
// });
// var origLog = logger.log;

// logger.log = function (level, msg) {
//   if (msg instanceof Error) {
//     var args = Array.prototype.slice.call(arguments);
//     args[1] = msg.stack;
//     origLog.apply(logger, args);
//   } else {
//     origLog.apply(logger, arguments);
//   }
// };

// module.exports = logger;
var appRoot = require('app-root-path');
var winston = require('winston');


var options = {
  file: {
    level: 'info',
    filename: `${appRoot}/logs/webapp.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

// instantiate a new Winston Logger with the settings defined above
var logger = new winston.createLogger({
    transports: [
      new winston.transports.File(options.file),
      new winston.transports.Console(options.console)
    ],
    exitOnError: false, // do not exit on handled exceptions
  });
  

logger.stream = {
  write: function(message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
};

module.exports = logger;