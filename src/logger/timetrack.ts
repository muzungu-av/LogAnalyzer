import { createNamespace } from "cls-hooked";
import { LoggerProvider } from "./loggerProvider";

function generateUID(): string {
  const timestamp = Date.now().toString(36);
  const randomNum = Math.floor(Math.random() * 1e8).toString(36);
  return `${timestamp}-${randomNum}`;
}
// Create a namespace to store the context
const namespace = createNamespace("myNamespace");

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");
  return `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

function logExecutionTime(
  uid: string,
  className: string,
  methodName: string,
  startTime: number,
  previousCaller: any,
  logger: any
) {
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  const caller = previousCaller || {
    className: null,
    methodName: null,
    uid: null,
  };

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
}

export function TimeTrack(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const className = target.constructor.name;
    const methodName = propertyKey;
    const logger = LoggerProvider.getLogger();
    const uid = generateUID();

    // linked execution context
    const boundFunction = namespace.bind(() => {
      const previousCaller = namespace.get("caller");

      //set the caller to the current method
      namespace.set("caller", { className, methodName, uid });

      const startTime = Date.now();
      try {
        const result = originalMethod.apply(this, args);

        if (result instanceof Promise) {
          return result.then((res) => {
            // log in sqlite
            logExecutionTime(
              uid,
              className,
              methodName,
              startTime,
              previousCaller,
              logger
            );

            if (!previousCaller) {
              namespace.set("caller", null);
            }
            return res; // Return the result (Promise) of the original method execution
          });
        } else {
          // log in sqlite
          logExecutionTime(
            uid,
            className,
            methodName,
            startTime,
            previousCaller,
            logger
          );

          if (!previousCaller) {
            namespace.set("caller", null);
          }
          return result; // Return the result of the original method execution
        }
      } finally {
        if (!previousCaller) {
          // Reset the calling method after execution if it was a root call
          namespace.set("caller", null);
        } else {
          // information about the previous calling method
          namespace.set("caller", previousCaller);
        }
      }
    });

    return boundFunction();
  };

  return descriptor;
}
