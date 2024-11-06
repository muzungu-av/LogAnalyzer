import express, { Request, Response, NextFunction } from "express";
import path from "path";
import container from "./config/inversify/container";
import { ILogger } from "./logger/logger.interface";
import Controller from "./video/controller";
import dotenv from "dotenv";

const app = express();

const envPath = path.join(process.cwd(), `.env.production`);
dotenv.config({ path: envPath });
console.log(envPath);

const logger = container.get<ILogger>("ILogger");

app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

logger.info("INFO logging level is enabled!");

const port = 3000;

app.use(express.static(path.join("./", "build")));

const controller = container.get<Controller>("Controller");

app.use("/", controller.getRoute());

app.listen(port, () => {
  logger.info(`Server Up and running on port ${port}`);
});
