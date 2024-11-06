import express, { Request, Response, NextFunction } from "express";
import path from "path";
import dotenv from "dotenv";
import Controller from "./controller";
import container from "./config/inversify/container";

const app = express();

const envPath = path.join(process.cwd(), `.env.production`);
dotenv.config({ path: envPath });
console.log(envPath);

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const port = 3000;

app.use(express.static(path.join("./", "build")));

app.use(express.static(path.join("./", "build")));

const controller = container.get<Controller>("Controller");

app.use("/", controller.getRoute());

app.listen(port, () => {
  console.log(`Server Up and running on port ${port}`);
});
