import winston from "winston";
import chalk from "chalk";
import DailyRotateFile from "winston-daily-rotate-file";
import dayjs from "dayjs";
export type LoggerLevel = "info" | "warn" | "error";
export default class Loggerd {
  public loggers: Record<LoggerLevel, InstanceType<typeof winston.Logger>>;
  public format = winston.format.combine(
    winston.format.printf(info => {
      const levelColor =
        this.levelColors[info.level] ||
        ("green" as unknown as keyof typeof chalk);

      const timestamp = chalk.gray(dayjs().format("YYYY-MM-DD HH:mm:ss"));
      const level = (chalk as unknown as any)?.[levelColor](
        `[${info.level.toUpperCase()}]`
      );
      const message = (chalk as unknown as any)?.[levelColor](info.message);
      return `${timestamp} ${level} ${message}`;
    })
  );
  public levelColors: Record<string, string> = {
    error: "red",
    warn: "yellow",
    info: "green",
    debug: "blue",
  };
  constructor() {
    this.createLogger(["info", "error", "warn"]);
  }
  public createLogger(levels: LoggerLevel[]) {
    this.loggers = {} as unknown as typeof this.loggers;
    levels.forEach(level => {
      this.loggers[level] = winston.createLogger({
        level: level,
        format: this.format,
        transports: [
          new DailyRotateFile({
            filename: `logs/%DATE%/${level}.log`,
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            //  maxFiles: '14d',
            format: winston.format.uncolorize(),
          }),
          new winston.transports.Console(),
        ],
      });
    });
  }
  public info(message?: string) {
    if (message) {
      this.loggers.info.log("info", message);
    }
    return this;
  }
  public error(message?: string) {
    if (message) {
      this.loggers.error.log("error", message);
    }
    return this;
  }
  public warn(message?: string) {
    if (message) {
      this.loggers.warn.log("warn", message);
    }
    return this;
  }
  public log(level: LoggerLevel, message?: string) {
    if (message) {
      this.loggers[level].log("level", message);
    }
    return this;
  }
}
