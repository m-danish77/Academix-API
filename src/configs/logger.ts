import winston from "winston";
import path from "path";
import fs from "fs";

// 1. Create a "logs" folder if it doesn't exist
const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 2. Define how the logs should look (format)
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Add timestamp
  winston.format.errors({ stack: true }), // Include error stack traces
  winston.format.splat(), // Allows string interpolation
  winston.format.json(), // Output as JSON (easy to read by machines)
);

// 3. Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug", // In dev, log everything. In prod, log only info and above.
  format: logFormat,
  transports: [
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
    // Write only errors to error.log
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
  ],
});

// 4. In development, also print logs to the console with colors. Inside the code block, Winston dynamically adds a new output destination: your terminal console screen.
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Add colors to the console output
        winston.format.simple(), // Simple, human-readable format
      ),
    }),
  );
}

export default logger;
