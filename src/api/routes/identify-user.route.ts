import { Router, Request, Response } from "express";
const identificationRouter = Router();
export default (router: Router) => {
  router.use("/identify", identificationRouter);
  identificationRouter.post("/", async (req: Request, res: Response) => {
    try {
      console.log(req.body);
      res.send("Success");
    } catch (error) {
      console.error(error);
      res.send("Failed to identify user");
    }
  });
};
