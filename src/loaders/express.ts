import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import express from "express";
import routes from "../api/routes";

export default (app: express.Application) => {
  app.use(cors());
  app.use(morgan("dev"));
  app.use(bodyParser.json());
  app.use("/", routes());
};
