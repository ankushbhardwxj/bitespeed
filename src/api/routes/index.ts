import { Router } from "express";
import identifyUserRoute from "./identify-user.route";

export default () => {
  const app = Router();
  identifyUserRoute(app);
  return app;
};
