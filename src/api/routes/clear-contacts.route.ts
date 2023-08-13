import { Router, Request, Response, response } from "express";
import clearContactsService from "../../services/clear.service";

const clearContactsRouter = Router();
export default (router: Router) => {
  router.use("/clear-contacts", clearContactsRouter);
  clearContactsRouter.post("/", async (req: Request, res: Response) => {
    try {
      const responseObject = await clearContactsService();
      res.send(responseObject);
    } catch (error) {
      console.error(error);
      res.send("Failed to identify user");
    }
  });
};
