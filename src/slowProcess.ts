import { inject, injectable } from "inversify";

@injectable()
export class AnotherSlowProcess {
  public async calculateSumm(a: number, b: number): Promise<number> {
    return Promise.resolve(a + b);
  }
}
