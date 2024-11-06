import express, { Request, Response, NextFunction } from "express";
import path from "path";
import dotenv from "dotenv";

const app = express();

const envPath = path.join(process.cwd(), `.env.production`);
dotenv.config({ path: envPath });
console.log(envPath);

const port = 3000;

app.use(express.static(path.join("./", "build")));

app.listen(port);
