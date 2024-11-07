import { ILogger } from "../logger/logger.interface";

/* Static instance Logger object */
export class LoggerProvider {
  private static loggerInstance: ILogger;

  public static setLogger(logger: ILogger) {
    this.loggerInstance = logger;
  }

  public static getLogger(): ILogger {
    if (!this.loggerInstance) {
      throw new Error("Logger has not been initialized.");
    }
    return this.loggerInstance;
  }
}
