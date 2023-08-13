import { Router } from "express";
import identifyUserRoute from "./identify-user.route";
import clearContactsRoute from "./clear-contacts.route";

export default () => {
  const app = Router();
  identifyUserRoute(app);
  clearContactsRoute(app);
  return app;
};
