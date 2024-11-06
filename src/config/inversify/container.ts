import "reflect-metadata";
import { Container } from "inversify";
import { Service } from "../../service";
import Controller from "../../controller";
import { AnotherSlowProcess } from "../../slowProcess";

const container = new Container();

container.bind<Service>("Service").to(Service);

container.bind<Controller>("Controller").to(Controller);

container.bind<AnotherSlowProcess>("AnotherSlowProcess").to(AnotherSlowProcess);

export default container;
