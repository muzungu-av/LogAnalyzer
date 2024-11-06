import { inject, injectable } from "inversify";
import { AnotherSlowProcess } from "./slowProcess";
import { ILogger } from "./logger/logger.interface";
import { TimeTrack } from "./logger/timetrack";

@injectable()
export class Service {
  constructor(
    @inject("AnotherSlowProcess") private process: AnotherSlowProcess,
    @inject("ILogger") private logger: ILogger
  ) {}

  @TimeTrack
  public async serviceGetSumm(a: number, b: number): Promise<number> {
    this.logger.info("run Service.serviceGetSumm()");
    return this.process.calculateSumm(a, b);
  }
}
