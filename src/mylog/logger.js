const { createLogger, format, transports } = require("winston");
const winstonCloudWatch = require("winston-aws-cloudwatch");
// const moment = require('moment')

// set default log level.
const logLevel = "info";

var logger = createLogger({
  level: logLevel,
  levels: {
    fatal: 0,
    crit: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
  },
  format: format.combine(
    format.prettyPrint(),
    format.timestamp({
      format: "DD-MM-YYYY hh:mm:ss A",
    }),
    format.printf((nfo) => {
      return `${nfo.timestamp} - ${nfo.level}: ${nfo.message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: "bot.log",
    }),
  ],
});
//if (process.env.NODE_ENV === "production") {
  logger.add(
    new winstonCloudWatch({
      logGroupName: "csye6225",
      logStreamName: "webapp",
      createLogGroup: true,
      createLogStream: true,
      awsConfig: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: "us-east-1",
      },
    })
  );
//}
// Extend logger object to properly log 'Error' types
var origLog = logger.log;

logger.log = function (level, msg) {
  if (msg instanceof Error) {
    var args = Array.prototype.slice.call(arguments);
    args[1] = msg.stack;
    origLog.apply(logger, args);
  } else {
    origLog.apply(logger, arguments);
  }
};

module.exports = logger;
