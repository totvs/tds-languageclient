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
import * as rpc from 'vscode-jsonrpc';
import { EventEmitter } from 'events';
import {
  ICompileOptions,
  IMessageConnection,
  IRpoToken,
  ILSServer,
  IStartLSOptions,
} from './types';
import {
  IAuthenticationInfo,
  IAuthenticationResult,
  ICompileInfo,
  ICompileResult,
  IConnectionInfo,
  IConnectionResult,
  IDisconnectionInfo,
  IDisconnectionResult,
  IReconnectInfo,
  IReconnectResult,
  IResponseStatus,
  IRpoTokenResult,
  ITdsLanguageClient,
  IValidationInfo,
  IValidationResult,
  LS_CONNECTION_TYPE,
  LS_MESSAGE_TYPE,
  LS_SERVER_ENCODING,
} from './protocolTypes';

import { ChildProcess, spawn } from 'child_process';
import { createMessageConnection } from 'vscode-jsonrpc';
import languageServerBin from '@totvs/tds-ls';
import { chmodSync } from 'fs';
import { getLogger, ILogger, LogLevel } from './logger';

const logger: ILogger = getLogger();
let childProcess: ChildProcess = null;
export let tdsLanguageClient: TdsLanguageClient;

export function startLanguageServer(
  startOptions?: Partial<IStartLSOptions>
): TdsLanguageClient {
  if (!tdsLanguageClient) {
    const optionsDefault: IStartLSOptions = {
      logging: false,
      trace: rpc.Trace.toString(rpc.Trace.Messages),
      verbose: 'warn',
    };

    const options: any = {
      ...optionsDefault,
      ...startOptions,
    };

    tdsLanguageClient = new TdsLanguageClient(options);
  } else {
    console.warn('TDS-Language server already running.');
  }

  return tdsLanguageClient;
}

export function stopLanguageServer(): void {
  if (childProcess) {
    //childProcess.disconnect();
    childProcess.kill();
  }
  tdsLanguageClient = undefined;
}

function launchLanguageServer(
  logging: boolean,
  args?: string[],
  options?: any
): IMessageConnection {
  const spawnArgs = ['--language-server'],
    spawnOptions = {
      env: process.env,
    };
  let bin = languageServerBin;

  if (Array.isArray(args)) {
    spawnArgs.push(...args);
  }

  // activate logging
  if (logging) {
    //TODO colocar data e hora no nome dos arquivos
    spawnArgs.push(
      '--log-file=totvsls.log',
      '--log-file-append=totvsls_full.log',
      '--record=totvsls'
    );
  }

  if (options) {
    Object.assign(spawnOptions, options);
  }

  if (bin.match(/[\\\/]app\.asar[\\\/]/)) {
    bin = bin.replace(/([\\\/]app\.asar)([\\\/])/g, '$1.unpacked$2');
  }

  if (process.platform !== 'win32') {
    chmodSync(bin, '0777');
  }

  childProcess = spawn(bin, spawnArgs, spawnOptions);
  // Use stdin and stdout for communication:
  const connection = createMessageConnection(
    new rpc.StreamMessageReader(childProcess.stdout),
    new rpc.StreamMessageWriter(childProcess.stdin),
    {
      error: (message: string) => {
        logger.error(message);
      },
      warn: (message: string) => {
        logger.warn(message);
      },
      info: (message: string) => {
        logger.info(message);
      },
      log: (message: string) => {
        logger.debug(message);
      },
    }
  );

  connection.listen();

  return connection as IMessageConnection;
}

class TdsLanguageClient extends EventEmitter implements ITdsLanguageClient {
  private connection: IMessageConnection = null;

  constructor(options?: IStartLSOptions) {
    super();

    const logging = options && options.logging;
    const trace = options && rpc.Trace.fromString(options.trace);

    const verbose: LogLevel =
      options && options.verbose ? options.verbose : 'info';
    logger.setConfig({ verbose: verbose });

    this.connection = launchLanguageServer(logging);
    this.connection.trace(trace, logger, false);

    this.connection.onUnhandledNotification((e: rpc.NotificationMessage) => {
      logger.debug('unhandledNotification: %s', e.method, e.params || []);

      this.emit(e.method, e.params);
    });

    this.connection.onUnhandledProgress((params) => {
      logger.debug('unhandledProgress: %s', params);

      this.emit('progress', params);
    });

    this.connection.onNotification('window/logMessage', (params) => {
      logger.debug('window/logMessage: %s', params);

      switch (params.type) {
        case LS_MESSAGE_TYPE.Info:
          logger.info('window/logMessage: %s', JSON.stringify(params));
          break;
        case LS_MESSAGE_TYPE.Log:
          logger.log('window/logMessage: %s', JSON.stringify(params));
          break;
        case LS_MESSAGE_TYPE.Warning:
          logger.warn('window/logMessage: %s', JSON.stringify(params));
          break;

        default:
          //LS_MESSAGE_TYPE.Success
          break;
      }

      this.emit('notification', params);
    });

    this.connection.onNotification('window/showMessage', (params) => {
      logger.debug('window/logMessage: %s', params);

      switch (params.type) {
        case LS_MESSAGE_TYPE.Info:
          logger.info('window/showMessage: %s', params);
          break;
        case LS_MESSAGE_TYPE.Log:
          logger.log('window/showMessage: %s', params);
          break;
        case LS_MESSAGE_TYPE.Warning:
          logger.warn('window/showMessage: %s', params);
          break;

        default:
          //LS_MESSAGE_TYPE.Success
          break;
      }

      this.emit('notification', params);
    });

    this.connection.onError((e) => {
      logger.debug('error: %s', e);

      logger.error(JSON.stringify(e));
    });

    this.connection.onClose(() => {
      logger.debug('close');

      stopLanguageServer();
    });
  }

  public on(event: string, listener: (...args: any[]) => void): this {
    logger.debug('on %s', event, listener.name);

    super.on(event, listener);

    return this;
  }

  public connect(
    server: ILSServer,
    connectionType: LS_CONNECTION_TYPE,
    environment: string
  ): Thenable<IConnectionResult> {
    const requestData: IConnectionInfo = {
      connType: connectionType,
      identification: server.id,
      serverType: server.serverType,
      serverName: server.serverName,
      server: server.address,
      port: server.port,
      bSecure: server.secure ? 1 : 0,
      buildVersion: server.build,
      environment: environment,
      autoReconnect: true,
    };

    return this.connection
      .sendRequest('$totvsserver/connect', {
        connectionInfo: requestData,
      })
      .then(
        (connectionResult: IConnectionResult) => {
          return connectionResult;
        },
        (err: rpc.ResponseError<IResponseStatus>) => {
          logger.error(err.message);
          return Promise.reject(err);
        }
      );
  }

  public disconnect(server: ILSServer): Thenable<IDisconnectionResult> {
    const requestData: IDisconnectionInfo = {
      serverName: server.serverName,
      connectionToken: server.token,
    };

    return this.connection
      .sendRequest('$totvsserver/disconnect', {
        disconnectInfo: requestData,
      })
      .then(
        (connectionResult: IDisconnectionResult) => {
          return connectionResult;
        },
        (err: rpc.ResponseError<IResponseStatus>) => {
          logger.error(err.message);
          return Promise.reject(err);
        }
      );
  }

  public authenticate(
    server: ILSServer,
    user: string,
    password: string,
    encoding: LS_SERVER_ENCODING
  ): Thenable<IAuthenticationResult> {
    const requestData: IAuthenticationInfo = {
      connectionToken: server.token,
      user: user,
      password: password,
      environment: server.environment,
      encoding: encoding,
    };

    return this.connection
      .sendRequest('$totvsserver/authentication', {
        authenticationInfo: requestData,
      })
      .then(
        (result: IAuthenticationResult) => {
          return result;
        },
        (err: rpc.ResponseError<IResponseStatus>) => {
          logger.error(err.message);
          return Promise.reject(err);
        }
      );
  }

  public reconnect(
    serverItem: ILSServer,
    connectionToken: string,
    connType: LS_CONNECTION_TYPE
  ): Thenable<IReconnectResult> {
    const requestData: IReconnectInfo = {
      serverName: serverItem.serverName,
      connectionToken: connectionToken,
      connType: connType,
    };

    return this.connection
      .sendRequest('$totvsserver/reconnect', {
        reconnectInfo: requestData,
      })
      .then(
        (result: IReconnectResult) => {
          return result;
        },
        (err: rpc.ResponseError<IResponseStatus>) => {
          logger.error(err.message);
          return Promise.reject(err);
        }
      );
  }

  public validation(server: ILSServer): Thenable<IValidationResult> {
    const requestData: IValidationInfo = {
      server: server.address,
      port: server.port,
    };

    return this.connection
      .sendRequest('$totvsserver/validation', {
        validationInfo: requestData,
      })
      .then(
        (result: IValidationResult) => {
          return result;
        },
        (err: rpc.ResponseError<IResponseStatus>) => {
          logger.error(err.message);
          return Promise.reject(err);
        }
      );
  }

  public compile(server: ILSServer, options: ICompileOptions): Thenable<any> {
    const requestData: ICompileInfo = {
      connectionToken: server.token,
      environment: server.environment,
      authorizationToken: options.authorizationToken,
      includeUris: options.includesUris,
      fileUris: options.filesUris,
      compileOptions: options.extraOptions,
      extensionsAllowed: options.extensionsAllowed,
    };

    return this.connection
      .sendRequest('$totvsserver/compilation', {
        compilationInfo: requestData,
      })
      .then(
        (result: ICompileResult) => {
          return result;
        },
        (error: rpc.ResponseError<IResponseStatus>) => {
          logger.log(error);
          return Promise.reject(error);
        }
      );
  }

  public sendRpoToken(
    server: ILSServer,
    rpoToken: IRpoToken
  ): Thenable<IRpoTokenResult> {
    return this.connection
      .sendRequest('$totvsserver/rpoToken', {
        rpoToken: {
          connectionToken: server.token,
          environment: server.environment,
          file: rpoToken.file,
          content: rpoToken.token,
        },
      })
      .then(
        (response: IRpoTokenResult) => {
          if (!response.sucess) {
            logger.log(response.message);
          }

          return response;
        },
        (err: rpc.ResponseError<IResponseStatus>) => {
          logger.log(err);
          return Promise.reject(err);
        }
      );
  }
}
