import { TransportStreamOptions } from "winston-transport";
import TransportStream = require("winston-transport");
import sqlite3 from "sqlite3";
import { injectable } from "inversify";

interface SQLiteTransportOptions extends TransportStreamOptions {
  db: sqlite3.Database;
}

@injectable()
export class SQLiteTransport extends TransportStream {
  protected db: sqlite3.Database;
  constructor(options: SQLiteTransportOptions) {
    super(options);
    this.db = options.db;
    this.initializeTables();
  }

  private initializeTables() {
    this.db.serialize(() => {
      this.db.run(
        `CREATE TABLE IF NOT EXISTS logs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              level TEXT,
              message TEXT,
              timestamp TEXT
            )
          `,
        (err) => {
          if (err) {
            console.error("Failed to create performance table:", err.message);
          }
        }
      );

      this.db.run(
        `CREATE TABLE IF NOT EXISTS performance (
          id TEXT PRIMARY KEY,                   -- суррогатный ключ
          clazz         TEXT NOT NULL,           -- Имя текущего класса
          method_name TEXT NOT NULL,             -- Имя текущей функции
          caller_clazz TEXT,                     -- Имя вызвавшего класса (может быть NULL)
          caller_method_name TEXT,               -- Имя вызвавшей функции (может быть NULL)
          start_time DATETIME NOT NULL,          -- Время начала выполнения функции
          end_time DATETIME NOT NULL,            -- Время окончания выполнения функции
          duration REAL,                         -- Длительность
          parent_id INTEGER,                     -- ID вызвавшей записи (может быть NULL)
          FOREIGN KEY (parent_id) REFERENCES function_logs(id) ON DELETE CASCADE -- Ограничение внешнего ключа
            )
          `,
        (err) => {
          if (err) {
            console.error("Failed to create performance table:", err.message);
          }
        }
      );
    });
  }

  log(info: any, callback: () => void): void {
    setImmediate(() => {
      this.emit("logged", info);
    });

    const {
      level,
      message,
      timestamp = new Date().toISOString(),
      id,
      clazz,
      method_name,
      caller_clazz,
      caller_method_name,
      start_time,
      end_time,
      duration,
      parent_id,
    } = info;
    const parentId = parent_id ? parent_id : null;

    const tableName = id ? "performance" : "logs";

    const query = id
      ? `INSERT INTO ${tableName} (id, clazz, method_name, caller_clazz, caller_method_name, start_time, end_time, duration, parent_id) VALUES (?,?,?,?,?,?,?,?,?)`
      : `INSERT INTO ${tableName} (level, message, timestamp) VALUES (?, ?, ?)`;

    const params = id
      ? [
          id,
          clazz,
          method_name,
          caller_clazz,
          caller_method_name,
          start_time,
          end_time,
          duration,
          parentId,
        ]
      : [level, message, timestamp];

    this.db.run(query, params, (err) => {
      if (err) {
        console.error(`Failed to log message to ${tableName}:`, err);
      }
      callback();
    });
  }
}
