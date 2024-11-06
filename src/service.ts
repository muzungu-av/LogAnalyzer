import { inject, injectable } from "inversify";
import { AnotherSlowProcess } from "./slowProcess";

@injectable()
export class Service {
  constructor(
    @inject("AnotherSlowProcess") private process: AnotherSlowProcess
  ) {}

  public async serviceGetSumm(a: number, b: number): Promise<number> {
    return this.process.calculateSumm(a, b);
  }
}
