import { inject, injectable } from "inversify";
import { ILogger } from "./logger/logger.interface";
import { TimeTrack } from "./logger/timetrack";

@injectable()
export class AnotherSlowProcess {
  constructor(@inject("ILogger") private logger: ILogger) {}

  private randomPause(): Promise<void> {
    const delay = Math.random() * (2000 - 500) + 500;
    return new Promise<void>((resolve) => setTimeout(resolve, delay));
  }

  @TimeTrack
  public async calculateSumm(a: number, b: number): Promise<number> {
    this.logger.info("run AnotherSlowProcess.calculateSumm()");
    await this.randomPause();
    return Promise.resolve(a + b);
  }
}
