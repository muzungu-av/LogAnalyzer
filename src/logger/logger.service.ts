import "winston-sqlite3";
import { createLogger, transports, format, Logger, LogEntry } from "winston";
import { ILogger } from "./logger.interface";
import { inject, injectable } from "inversify";
import { SQLiteTransport } from "./sqliteTransport";

@injectable()
export class LoggerService implements ILogger {
  private logger: Logger;
  private logLevel: string;
  private uid: string;
  constructor(
    @inject("SQLiteTransport")
    private transport: SQLiteTransport
  ) {
    const { randomUUID } = require("crypto");
    this.uid = randomUUID();

    this.logLevel = process.env.LOG_LEVEL || "info";

    this.logger = createLogger({
      level: this.logLevel,
      format: format.combine(format.timestamp(), format.json()),
      transports: [new transports.Console(), transport],
    });
  }

  info(message: string, meta?: Record<string, unknown>): void {
    message = message + ":-:-:" + this.uid;
    this.logger.info({ level: "info", message, meta });
  }
  warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(message, meta);
  }
  debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(message, meta);
  }
  error(message: string, meta?: Record<string, unknown>): void {
    this.logger.error(message, meta);
  }

  log(
    level: string,
    message: string,
    meta?: Record<string, unknown> | undefined
  ): void {}
}
