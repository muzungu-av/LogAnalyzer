import { createNamespace } from "cls-hooked";
import { LoggerProvider } from "./loggerProvider";

function generateUID(): string {
  const timestamp = Date.now().toString(36); // time
  const randomNum = Math.floor(Math.random() * 1e8).toString(36); // random number
  return `${timestamp}-${randomNum}`;
}
// Create a namespace to store the context
const namespace = createNamespace("myNamespace");

export function TimeTrack(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const className = target.constructor.name;
    const methodName = propertyKey;
    const logger = LoggerProvider.getLogger();
    const uid = generateUID();

    const formatDate = (timestamp: number) => {
      const date = new Date(timestamp);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      const milliseconds = String(date.getMilliseconds()).padStart(3, "0");
      return `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}.${milliseconds}`;
    };

    // linked execution context
    const boundFunction = namespace.bind(async () => {
      const previousCaller = namespace.get("caller");

      // If this is a root call (no previous caller), set the caller to the current method
      if (!previousCaller) {
        namespace.set("caller", { className, methodName, uid });
      } else {
        // If there is already a previousCaller, update it for the current method
        // Set a new caller for the next level
        namespace.set("caller", { className, methodName, uid });
      }

      const startTime = Date.now();

      const result = await originalMethod.apply(this, args);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      // information about the previous calling method
      const caller = previousCaller || {
        className: "None",
        methodName: "None",
        uid: "None",
      };

      // log in sqlite
      logger.log("info", "Execution time", {
        id: uid,
        clazz: className,
        method_name: methodName,
        caller_clazz: caller.className,
        caller_method_name: caller.methodName,
        start_time: formatDate(startTime),
        end_time: formatDate(endTime),
        duration: duration,
        parent_id: caller.uid,
      });

      // Reset the calling method after execution if it was a root call
      if (!previousCaller) {
        namespace.set("caller", null);
      }

      return result; // Return the result of the original method execution
    });

    return boundFunction();
  };

  return descriptor;
}
