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
  ILSServerAttributes,
  IMessageConnection,
  IStartLSOptions,
  LSServerType,
} from './types';
import {
  IApplyTemplateInfo,
  IApplyTemplateResult,
  IAuthenticationInfo,
  IAuthenticationResult,
  ICompileInfo,
  ICompileResult,
  IConnectionInfo,
  IConnectionResult,
  IDeleteProgramInfo,
  IDeleteProgramResult,
  IDisconnectionInfo,
  IDisconnectionResult,
  IReconnectInfo,
  IReconnectResult,
  IResponseStatus,
  IRpoChechIntegrityResult,
  IRpoCheckIntegrityInfo,
  IRpoInfoResult,
  IRpoInfo,
  ITdsLanguageClient,
  IValidationInfo,
  IValidationResult,
  IWsdlGenerateInfo,
  IWsdlGenerateResult,
  LS_CONNECTION_TYPE,
  LS_MESSAGE_TYPE,
  LS_SERVER_ENCODING,
  IPatchValidateInfo,
  IPatchValidateResult,
  IInspectorObjectsInfo,
  IInspectorObjectsResult,
  IPatchGenerateInfo,
  IPatchGenerateResult,
  IPatchInfo,
  IPatchResult,
  ISetConnectionStatusInfo,
  ISetConnectionStatusResult,
  IGetConnectionStatusResult,
  IGetConnectionStatusInfo,
  IApplyScope,
  IPatchApplyInfo,
  ISendUserMessageInfo,
  ISendUserMessageResult,
  IStopServerInfo,
  IStopServerResult,
  IKillUserResult,
  IKillUserInfo,
  IAppKillUserInfo,
  IAppKillUserResult,
  IGetUsersResult,
  IGetUsersInfo,
  IDefragRpoInfo,
  IDefragRpoResult,
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
    childProcess = undefined;
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

  get lsProcess(): ChildProcess {
    return childProcess;
  }

  public on(event: string, listener: (...args: any[]) => void): this {
    logger.debug('on %s', event, listener.name);

    super.on(event, listener);

    return this;
  }

  public connect(
    server: ILSServerAttributes,
    connectionType: LS_CONNECTION_TYPE,
    environment: string
  ): Thenable<IConnectionResult> {
    const requestData: IConnectionInfo = {
      connType: connectionType,
      identification: server.id,
      serverType: LSServerType.fromString(server.type),
      serverName: server.name,
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

  public disconnect(
    server: ILSServerAttributes
  ): Thenable<IDisconnectionResult> {
    const requestData: IDisconnectionInfo = {
      serverName: server.name,
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
    server: ILSServerAttributes,
    environment: string,
    user: string,
    password: string,
    encoding: LS_SERVER_ENCODING
  ): Thenable<IAuthenticationResult> {
    const requestData: IAuthenticationInfo = {
      connectionToken: server.token,
      user: user,
      password: password,
      environment: environment,
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
    serverItem: ILSServerAttributes,
    connectionToken: string,
    connType: LS_CONNECTION_TYPE
  ): Thenable<IReconnectResult> {
    const requestData: IReconnectInfo = {
      serverName: serverItem.name,
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

  public validation(server: ILSServerAttributes): Thenable<IValidationResult> {
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

  public rpoCheckIntegrity(
    server: ILSServerAttributes
  ): Thenable<IRpoChechIntegrityResult> {
    const requestData: IRpoCheckIntegrityInfo = {
      connectionToken: server.token,
      environment: server.environment,
    };

    return this.connection
      .sendRequest('$totvsserver/rpoCheckIntegrity', {
        rpoCheckIntegrityInfo: requestData,
      })
      .then(
        (response: IRpoChechIntegrityResult) => {
          return response;
        },
        (err: rpc.ResponseError<IResponseStatus>) => {
          logger.error(err.message);

          return Promise.reject(err);
        }
      );
  }

  public compile(
    server: ILSServerAttributes,
    options: ICompileOptions
  ): Thenable<any> {
    const requestData: ICompileInfo = {
      connectionToken: server.token,
      environment: server.environment,
      authorizationToken: server.authorizationToken,
      includeUris: options.includesUris,
      fileUris: options.filesUris,
      compileOptions: {
        recompile: false,
        debugAphInfo: false,
        gradualSending: false,
        generatePpoFile: false,
        showPreCompiler: false,
        priorVelocity: false,
        returnPpo: false,
        commitWithErrorOrWarning: false,
        ...options.extraOptions,
      },
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
          logger.error(error);
          return Promise.reject(error);
        }
      );
  }

  generateWsdl(
    server: ILSServerAttributes,
    url: string
  ): Thenable<IWsdlGenerateResult> {
    const requestData: IWsdlGenerateInfo = {
      connectionToken: server.token,
      authorizationToken: server.authorizationToken,
      environment: server.environment,
      wsdlUrl: url,
    };

    return this.connection
      .sendRequest('$totvsserver/wsdlGenerate', {
        wsdlGenerateInfo: requestData,
      })
      .then(
        (response: IWsdlGenerateResult) => {
          return response;
        },
        (err: rpc.ResponseError<IResponseStatus>) => {
          logger.error(err);

          return Promise.reject(err);
        }
      );
  }

  applyTemplate(
    server: ILSServerAttributes,
    includesUris: Array<string>,
    templateUri: string
  ): Thenable<IApplyTemplateResult> {
    const requestData: IApplyTemplateInfo = {
      connectionToken: server.token,
      authorizationToken: server.authorizationToken,
      environment: server.environment,
      includeUris: includesUris,
      templateUri: templateUri,
      isLocal: true,
    };

    return this.connection
      .sendRequest('$totvsserver/templateApply', {
        templateApplyInfo: requestData,
      })
      .then(
        (response: IApplyTemplateResult) => {
          if (response.error) {
            return Promise.reject(response);
          }

          return Promise.resolve(response);
        },
        (err: rpc.ResponseError<IResponseStatus>) => {
          const error: IApplyTemplateResult = {
            error: true,
            message: err.message,
            errorCode: err.code,
          };

          logger.error(error);
          return Promise.reject(error);
        }
      );
  }

  deleteProgram(server: ILSServerAttributes, programs: string[]): any {
    const requestData: IDeleteProgramInfo = {
      connectionToken: server.token,
      authorizationToken: server.authorizationToken,
      environment: server.environment,
      programs: programs,
    };

    return this.connection
      .sendRequest('$totvsserver/deletePrograms', {
        deleteProgramsInfo: requestData,
      })
      .then(
        (response: IDeleteProgramResult) => {
          return response;
        },
        (err: rpc.ResponseError<IResponseStatus>) => {
          logger.error(err);

          return Promise.reject(err);
        }
      );
  }

  getRpoInfo(server: ILSServerAttributes): any {
    const requestData: IRpoInfo = {
      connectionToken: server.token,
      environment: server.environment,
    };

    return this.connection
      .sendRequest('$totvsserver/rpoInfo', {
        rpoInfo: requestData,
      })
      .then(
        (rpoInfo: IRpoInfoResult) => {
          return rpoInfo;
        },
        (err: rpc.ResponseError<IResponseStatus>) => {
          logger.error(err);

          return Promise.reject(err);
        }
      );
  }

  patchValidate(server: ILSServerAttributes, patchURI: string): any {
    const requestData: IPatchValidateInfo = {
      connectionToken: server.token,
      authorizationToken: server.authorizationToken,
      environment: server.environment,
      patchUri: patchURI,
      isLocal: true,
    };

    return this.connection
      .sendRequest('$totvsserver/patchValidate', {
        patchValidateInfo: requestData,
      })
      .then(
        (result: IPatchValidateResult) => {
          return result;
        },
        (err: rpc.ResponseError<IResponseStatus>) => {
          logger.error(err);

          return Promise.reject(err);
        }
      );
  }

  applyPatch(
    server: ILSServerAttributes,
    patchURI: string,
    applyScope: IApplyScope
  ): Thenable<IPatchValidateResult> {
    const requestData: IPatchApplyInfo = {
      connectionToken: server.token,
      authenticateToken: server.authorizationToken,
      environment: server.environment,
      patchUri: patchURI,
      isLocal: true,
      applyScope: applyScope,
      isValidOnly: false,
    };

    return this.connection
      .sendRequest('$totvsserver/patchApply', {
        patchValidateInfo: requestData,
      })
      .then(
        (result: IPatchValidateResult) => {
          if (result.error) {
            return Promise.reject(result);
          }

          return result;
        },
        (err: rpc.ResponseError<IResponseStatus>) => {
          logger.error(err);

          return Promise.reject(err);
        }
      );
  }

  inspectorObjects(server: ILSServerAttributes, includeTres: boolean): any {
    const requestData: IInspectorObjectsInfo = {
      connectionToken: server.token,
      environment: server.environment,
      includeTres: includeTres,
    };

    return this.connection
      .sendRequest('$totvsserver/inspectorObjects', {
        inspectorObjectsInfo: requestData,
      })
      .then(
        (response: IInspectorObjectsResult) => {
          return response;
        },
        (err: rpc.ResponseError<IResponseStatus>) => {
          logger.error(err);

          return Promise.reject(err);
        }
      );
  }

  patchGenerate(
    server: ILSServerAttributes,
    patchMaster: string,
    patchDest: string,
    patchType: number,
    patchName: string,
    filesPath: string[]
  ): any {
    const requestData: IPatchGenerateInfo = {
      connectionToken: server.token,
      authorizationToken: server.authorizationToken,
      environment: server.environment,
      patchMaster: patchMaster,
      patchDest: patchDest,
      isLocal: true,
      patchType: patchType,
      name: patchName,
      patchFiles: filesPath,
    };

    return this.connection
      .sendRequest('$totvsserver/patchGenerate', {
        patchGenerateInfo: requestData,
      })
      .then(
        (response: IPatchGenerateResult) => {
          return response;
        },
        (err: rpc.ResponseError<IResponseStatus>) => {
          logger.error(err);

          return Promise.reject(err);
        }
      );
  }

  getPatchInfo(
    server: ILSServerAttributes,
    patchUri: string
  ): Thenable<IPatchResult> {
    const requestData: IPatchInfo = {
      connectionToken: server.token,
      authorizationToken: server.authorizationToken,
      environment: server.environment,
      patchUri: patchUri,
      isLocal: true,
    };

    return this.connection
      .sendRequest('$totvsserver/patchInfo', {
        patchInfoInfo: requestData,
      })
      .then(
        (response: IPatchResult) => {
          return response;
        },
        (err: rpc.ResponseError<IResponseStatus>) => {
          logger.error(err);

          return Promise.reject(err);
        }
      );
  }

  setLockServer(
    server: ILSServerAttributes,
    lock: boolean
  ): Thenable<ISetConnectionStatusResult> {
    const requestData: ISetConnectionStatusInfo = {
      connectionToken: server.token,
      status: !lock,
    };

    return this.connection
      .sendRequest('$totvsmonitor/setConnectionStatus', {
        setConnectionStatusInfo: requestData,
      })
      .then(
        (response: ISetConnectionStatusResult) => {
          return response;
        },
        (err: rpc.ResponseError<IResponseStatus>) => {
          logger.error(err);

          return Promise.reject(err);
        }
      );
  }

  isLockServer(
    server: ILSServerAttributes
  ): Thenable<IGetConnectionStatusResult> {
    const requestData: IGetConnectionStatusInfo = {
      connectionToken: server.token,
    };

    return this.connection
      .sendRequest('$totvsmonitor/getConnectionStatus', {
        getConnectionStatusInfo: requestData,
      })
      .then(
        (response: IGetConnectionStatusResult) => {
          return response;
        },
        (err: rpc.ResponseError<IResponseStatus>) => {
          logger.error(err);

          return Promise.reject(err);
        }
      );
  }

  sendUserMessage(
    server: ILSServerAttributes,
    target: any,
    message: string
  ): Promise<ISendUserMessageResult> {
    const requestData: ISendUserMessageInfo = {
      connectionToken: server.token,
      userName: target.username,
      computerName: target.computerName,
      threadId: target.threadId,
      server: target.server,
      environment: target.environment,
      message: message,
    };

    return this.connection
      .sendRequest('$totvsmonitor/sendUserMessage', {
        sendUserMessageInfo: requestData,
      })
      .then(
        (result: ISendUserMessageResult) => result,
        (error: rpc.ResponseError<IResponseStatus>) => {
          logger.error(error);

          return Promise.reject(error);
        }
      );
  }

  stopServer(server: ILSServerAttributes): Thenable<IStopServerResult> {
    const requestData: IStopServerInfo = {
      connectionToken: server.token,
    };

    return this.connection
      .sendRequest('$totvsserver/stopServer', {
        stopServerInfo: requestData,
      })
      .then(
        (response: IStopServerResult) => {
          return response;
        },
        (error: Error) => {
          return error;
        }
      );
  }

  killConnection(
    server: ILSServerAttributes,
    target: any
  ): Thenable<IKillUserResult> {
    const requestData: IKillUserInfo = {
      connectionToken: server.token,
      userName: target.username,
      computerName: target.computerName,
      threadId: target.threadId,
      serverName: target.server,
    };

    return this.connection
      .sendRequest('$totvsmonitor/killUser', {
        killUserInfo: requestData,
      })
      .then(
        (response: any) => {
          return response.message;
        },
        (error: Error) => {
          return error.message;
        }
      );
  }

  appKillConnection(
    server: ILSServerAttributes,
    target: any
  ): Thenable<IAppKillUserResult> {
    const requestData: IAppKillUserInfo = {
      connectionToken: server.token,
      userName: target.username,
      computerName: target.computerName,
      threadId: target.threadId,
      serverName: target.server,
    };

    return this.connection
      .sendRequest('$totvsmonitor/appKillUser', {
        killUserInfo: requestData,
      })
      .then(
        (response: any) => {
          return response.message;
        },
        (error: Error) => {
          return error.message;
        }
      );
  }

  getUsers(server: ILSServerAttributes): any {
    const requestData: IGetUsersInfo = {
      connectionToken: server.token,
    };

    return this.connection
      .sendRequest('$totvsmonitor/getUsers', {
        killUserInfo: requestData,
      })
      .then(
        (response: IGetUsersResult) => {
          return response;
        },
        (error: Error) => {
          return error.message;
        }
      );
  }

  defragRpo(server: ILSServerAttributes): any {
    const requestData: IDefragRpoInfo = {
      connectionToken: server.token,
      environment: server.environment,
      packPatchInfo: true,
    };

    return this.connection
      .sendRequest('$totvsserver/defragRpo', {
        defragRpoInfo: requestData,
      })
      .then(
        (response: IDefragRpoResult) => {
          return response;
        },
        (error: Error) => {
          return error.message;
        }
      );
  }
}
