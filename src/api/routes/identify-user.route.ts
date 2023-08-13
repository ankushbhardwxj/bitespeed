import { Router, Request, Response, response } from "express";
import identificationService from "../../services/identify.service";

const identificationRouter = Router();
export default (router: Router) => {
  router.use("/identify", identificationRouter);
  identificationRouter.post("/", async (req: Request, res: Response) => {
    try {
      const responseObject = await identificationService(req.body);
      if (!responseObject) throw new Error("Failed to get user");
      res.send(responseObject);
    } catch (error) {
      console.error(error);
      res.send("Failed to identify user");
    }
  });
};
