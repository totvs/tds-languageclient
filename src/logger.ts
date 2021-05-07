/*
Copyright 2021 TOTVS S.A

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http: //www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import * as winston from 'winston';
import packageJSON from '../package.json';

export interface IAppInfo {
  name: string;
  version: string;
  description: string;
  url: string;
  displayName: string;
  getShortName: () => string;
}

const outDir: string = '.'; //path.join(os.homedir(), '.act-nodejs');

const fileTextFormat = winston.format.printf(
  ({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
  }
);

const consoleFormat = winston.format.printf(({ message }) => {
  return message;
});

export interface ILoggerConfig {
  appInfo?: IAppInfo;
  verbose?: LogLevel;
  showBanner?: boolean;
  logToFile?: boolean;
  logFormat?: 'text' | 'json';
  silent?: boolean;
}

export type LogLevel =
  | 'error'
  | 'warn'
  | 'info'
  | 'verbose'
  | 'debug'
  | 'help'
  | 'nested'
  | 'data';

export interface ILogger {
  log: (...args: any) => void;
  error: (...args: any) => void;
  warn: (...args: any) => void;
  help: (...args: any) => void;
  info: (...args: any) => void;
  debug: (...args: any) => void;
  verbose: (...args: any) => void;
  nested: (level: LogLevel, message: string, ...args: any) => void;
  profile: (id: string) => void;
  setConfig: (config: ILoggerConfig) => void;
}

class Logger implements ILogger {
  private _config: ILoggerConfig = {
    appInfo: undefined,
    verbose: 'verbose',
    showBanner: true,
    logToFile: false,
    logFormat: 'text',
    silent: false,
  };

  private _id: string;
  private _logger!: winston.Logger;
  private _logFile!: winston.transports.FileTransportInstance;
  private _firstLog: boolean;

  constructor(id: string, config: ILoggerConfig) {
    this._id = id.trim().toLowerCase();
    this._firstLog = true;

    this.setConfig(config);
  }

  getConfig(): ILoggerConfig {
    return this._config;
  }

  setConfig(newConfig: ILoggerConfig) {
    this._config = { ...this._config, ...newConfig };
    const level: string = this._config.verbose || 'warn';

    const options: winston.LoggerOptions = {
      exitOnError: false,
      handleExceptions: false,
      level,
      levels: winston.config.cli.levels,
      format: winston.format.combine(
        winston.format.splat(),
        winston.format.colorize({ all: true }),
        winston.format.label({ label: this._config.appInfo?.getShortName() }),
        winston.format.timestamp(),
        consoleFormat
      ),
      transports: [
        new winston.transports.Console({
          silent: this._config.silent,
        }),
      ],
    };

    if (this._logger) {
      this._logger.configure(options);
    } else {
      this._logger = winston.createLogger(options);
    }

    if (this._config.logToFile) {
      if (this._config.logFormat === 'text') {
        this._logFile = new winston.transports.File({
          level,
          filename: this._id + '.log',
          dirname: outDir,
          format: fileTextFormat,
        });
      } else {
        this._logFile = new winston.transports.File({
          level,
          filename: this._id + '.json.log',
          dirname: outDir,
          format: winston.format.json(),
        });
      }

      this._logger.add(this._logFile);
    } else if (this._logFile) {
      this._logger.remove(this._logFile);
      this._logFile = undefined;
    }
  }

  nested(level: LogLevel, message: string, ...args: any) {
    this.consoleLog(level, message);

    Object.keys(args).forEach((key) => {
      const item: any = args[key];

      if (Array.isArray(item)) {
        const aitem: any[] = item;
        aitem.forEach((element: any) => {
          this.consoleLog('data', '> %s', element);
        });
      } else if (typeof args[key] === 'object') {
        this.nested('data', key, args[key]);
      } else {
        this.consoleLog('data', '>  %s = %s', key, args[key]);
      }
    });
  }

  private consoleLog(level: LogLevel, message: string, ...data: any) {
    if (this._firstLog) {
      this._firstLog = false;
      this.showHeader();
    }

    this._logger.log(level, message, ...data);
  }

  log(...args: any) {
    this.consoleLog('data', args[0], args.slice(1));
  }

  help(...args: any) {
    this.consoleLog('help', args[0], args.slice(1));
  }

  data(...args: any) {
    this.consoleLog('data', args[0], args.slice(1));
  }

  debug(...args: any) {
    this.consoleLog('debug', args[0], args.slice(1));
  }

  error(...args: any[]) {
    this.consoleLog('error', args[0], args.slice(1));
  }

  warn(...args: any[]) {
    this.consoleLog('warn', args[0], args.slice(1));
  }

  info(...args: any[]) {
    this.consoleLog('info', args[0], args.slice(1));
  }

  verbose(...args: any[]) {
    if (this._logger.isVerboseEnabled()) {
      const text: string = args[0] as string;
      this.nested('verbose', text, args.slice(1));
    }
  }

  profile(id: string) {
    this._logger.profile(id);
  }

  private appText(appInfo: IAppInfo): string[] {
    return [
      `${appInfo.displayName} [${appInfo.name}] ${appInfo.version}`,
      `${appInfo.description}`,
      '',
    ];
  }

  // prettier-ignore
  private banner(appInfo: IAppInfo): string[] {

		return [
			"-".padStart((64 - appInfo.displayName.length) / 2, "-") +
			"< " + appInfo.displayName + " >" +
			"-".padEnd((64 - appInfo.displayName.length) / 2, "-"),
      appInfo.description,
      `${appInfo.name} ${appInfo.version}`,
      appInfo.url,
      '--< (C) 2020-21 TOTVS S.A. >--'.padEnd(66, '-')
    ];
	}

  private showHeader() {
    if (this._config.appInfo) {
      if (!this._config.showBanner) {
        this.appText(this._config.appInfo).forEach((line: string) =>
          this.help(line)
        );
      } else {
        this.banner(this._config.appInfo).forEach((line: string) =>
          this.help(line)
        );
      }
    }
  }
}

const loggerMap: Map<string, ILogger> = new Map<string, ILogger>();

const appInfo: IAppInfo = {
  name: packageJSON.name,
  displayName: packageJSON.displayName,
  version: packageJSON.version,
  description: packageJSON.description,
  url: packageJSON.repository.url,
  getShortName: () => {
    return 'totvs-lsc';
  },
};

const loggerConfig: ILoggerConfig = {
  appInfo: appInfo,
  verbose: 'error',
  showBanner: true,
};

createLogger('tds-languageclient', loggerConfig); //indica log padrão

export function getLogger(id?: string): ILogger {
  return loggerMap.get(id || 'tds-languageclient');
}

export function createLogger(id: string, config: ILoggerConfig): ILogger {
  const runTest: boolean = process.env['JEST_WORKER_ID'] ? true : false;
  if (runTest) {
    config.logToFile = true;
    config.logFormat = 'text';
    config.verbose = 'verbose';
    config.silent = config.silent || true;
  }

  const newLogger: ILogger = new Logger(id, config);
  loggerMap.set(id, newLogger);

  return newLogger;
}
