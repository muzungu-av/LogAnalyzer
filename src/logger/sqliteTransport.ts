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

      /*The idea was to enable support for external keys. But because of the peculiarity of the algorithm - the deepest methods (the last ones)
        are written to the database first, when there is no parent yet, it will cause an error. That's why we disable it. */
      this.db.run("PRAGMA foreign_keys = OFF");

      this.db.run(
        `CREATE TABLE IF NOT EXISTS performance (
          id TEXT PRIMARY KEY,                   -- surrogate key
          clazz TEXT NOT NULL,                   -- The name of the current class
          method_name TEXT NOT NULL,             -- Name of the current function
          caller_clazz TEXT,                     -- Name of the called class (can be NULL)
          caller_method_name TEXT,               -- Name of the called function (can be NULL)
          start_time DATETIME NOT NULL,          -- Start time of the function
          end_time DATETIME NOT NULL,            -- End time of function execution
          duration REAL,                         -- Duration
          parent_id INTEGER,                     -- ID of the called record (can be NULL)
          FOREIGN KEY (parent_id) REFERENCES performance(id) -- Restricting a foreign key to its own table
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
