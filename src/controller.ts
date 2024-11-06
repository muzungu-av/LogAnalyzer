import { ILogger } from "./logger/logger.interface";
import { Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { Service } from "./service";
import { TimeTrack } from "./logger/timetrack";

@injectable()
export class Controller {
  public router: Router;
  constructor(
    @inject("ILogger") private logger: ILogger,
    @inject("Service") private service: Service
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/getsumm", this.ControllerGetSumm.bind(this));
  }

  public getRoute() {
    return this.router;
  }

  @TimeTrack
  public async ControllerGetSumm(req: Request, res: Response) {
    try {
      this.logger.info("run Controller.ControllerGetSumm()");
      const result = await this.service.serviceGetSumm(2, 7);
      return res.send({ result: result });
    } catch (error) {
      this.logger.error("Error in ControllerGetSumm:", { error });
      return res.status(500).send({ error: "Internal server error" });
    }
  }
}

export default Controller;
