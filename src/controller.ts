import { Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { Service } from "./service";

@injectable()
export class Controller {
  private service: Service;
  public router: Router;
  constructor(@inject("Service") service: Service) {
    this.service = service;
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/getsumm", this.ControllerGetSumm.bind(this));
  }

  public getRoute() {
    return this.router;
  }

  public async ControllerGetSumm(req: Request, res: Response) {
    try {
      const result = await this.service.serviceGetSumm(2, 7);
      return res.send({ result: result });
    } catch (error) {
      return res.status(500).send({ error: "Internal server error" });
    }
  }
}

export default Controller;
