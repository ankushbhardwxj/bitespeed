import express, { Request, Response } from "express";
import loaders from "./src/loaders";
const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world");
});

app.listen(8001, () => {
  loaders(app);
  console.log("Server running on ", 8001);
});
