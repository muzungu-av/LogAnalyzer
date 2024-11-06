import "reflect-metadata";
import { Container } from "inversify";

import path from "path";
import fs from "fs";
import { createLogger, format, transports } from "winston";
import sqlite3 from "sqlite3";
import { AnotherSlowProcess } from "../../slowProcess";
import Controller from "../../controller";
import { Service } from "../../service";
import { SQLiteTransport } from "../../logger/sqliteTransport";
import { ILogger } from "../../logger/logger.interface";
import { LoggerProvider } from "../../logger/loggerProvider";

const container = new Container();

container.bind<Service>("Service").to(Service);

container.bind<Controller>("Controller").to(Controller);

container.bind<AnotherSlowProcess>("AnotherSlowProcess").to(AnotherSlowProcess);

const logsDir = path.join(process.cwd(), "./logs");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const fname = "LOGS.db";

const logFilePath = path.join(logsDir, fname);

if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, "");
}

const db = new sqlite3.Database(logFilePath);
container
  .bind<SQLiteTransport>("SQLiteTransport")
  .toDynamicValue(() => new SQLiteTransport({ db }))
  .inSingletonScope();

container
  .bind<ILogger>("ILogger")
  .toDynamicValue(() => {
    const logger = createLogger({
      level: "info",
      format: format.combine(format.timestamp(), format.json()),
      transports: [new transports.Console()], // Добавляем Console транспорт
    });
    if (process.env.ENABLE_SQLITE_LOGGING === "true") {
      const sqliteTransport = container.get<SQLiteTransport>("SQLiteTransport");
      logger.add(sqliteTransport);
    }
    // Установка логгера в LoggerProvider
    LoggerProvider.setLogger(logger);
    return logger;
  })
  .inSingletonScope();

export default container;
