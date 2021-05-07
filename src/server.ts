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
import { ICompileOptions, IRpoToken, ILSServer, LS_SERVER_TYPE } from './types';

import {
  IAuthenticationResult,
  ICompileResult,
  IConnectionResult,
  IDisconnectionResult,
  IReconnectOptions,
  IReconnectResult,
  IResponseStatus,
  IRpoTokenResult,
  ITdsLanguageClient,
  IValidationResult,
  LS_CONNECTION_TYPE,
  LS_SERVER_ENCODING,
} from './protocolTypes';
import { tdsLanguageClient } from './languageClient';
import { ResponseError } from 'vscode-jsonrpc';
import { BuildVersion } from '.';

export class LSServerInformation implements ILSServer {
  private _id: string = null;
  private _serverName = '';
  private _connected = false;
  private _token: string = null;
  private _serverType: LS_SERVER_TYPE = null;
  private _address: string = null;
  private _port: number = null;
  private _build: BuildVersion = null;
  private _secure = true;
  private _environment: string = null;
  private _needAuthentication: boolean;
  private _lastError: IResponseStatus;

  public get lastError(): IResponseStatus {
    return this._lastError;
  }

  public set lastError(value: IResponseStatus) {
    this._lastError = value;
  }

  public get serverName(): string {
    return this._serverName;
  }

  public set serverName(value: string) {
    this._serverName = value;
  }

  public get id(): string {
    return this._id;
  }

  public set id(value: string) {
    this._id = value;
  }
  public get connected(): boolean {
    return this._connected;
  }
  public set connected(value: boolean) {
    this._connected = value;
  }
  public get token(): string {
    return this._token;
  }
  public set token(value: string) {
    this._token = value;
  }
  public get serverType(): LS_SERVER_TYPE {
    return this._serverType;
  }
  public set serverType(value: LS_SERVER_TYPE) {
    this._serverType = value;
  }
  public get address(): string {
    return this._address;
  }
  public set address(value: string) {
    this._address = value;
  }
  public get port(): number {
    return this._port;
  }
  public set port(value: number) {
    this._port = value;
  }

  public get build(): BuildVersion {
    return this._build;
  }
  public set build(value: BuildVersion) {
    this._build = value;
  }
  public get secure(): boolean {
    return this._secure;
  }
  public set secure(value: boolean) {
    this._secure = value;
  }
  public get environment(): string {
    return this._environment;
  }
  public set environment(value: string) {
    this._environment = value;
  }
  public get connection(): ITdsLanguageClient {
    return tdsLanguageClient;
  }
  public get needAuthentication(): boolean {
    return this._needAuthentication;
  }
  public set needAuthentication(value: boolean) {
    this._needAuthentication = value;
  }

  public constructor(options?: any) {
    const that = <any>this;
    Object.keys(options).forEach((key: string) => {
      if (that.hasOwnProperty(`_${key}`)) {
        that[`_${key}`] = options[<any>key];
      }
    });
  }

  public connect(
    connectionType: LS_CONNECTION_TYPE,
    environment: string
  ): Promise<boolean> {
    return this.connection.connect(this, connectionType, environment).then(
      (result: IConnectionResult) => {
        this.environment = environment;
        this.needAuthentication = result.needAuthentication;
        this.token = result.connectionToken;
        this.connected = true;

        return true;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.connected = false;
        this.lastError = (error as unknown) as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  public disconnect(): Promise<string> {
    //se não conectado, assume que a desconexão foi bem suscedida
    if (!this.connected) {
      return Promise.resolve('Success');
    }

    return this.connection.disconnect(this).then(
      (response: IDisconnectionResult) => {
        this.connected = false;

        return response.message;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.connected = false;
        this.lastError = (error as unknown) as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  public authenticate(
    user: string,
    password: string,
    encoding?: LS_SERVER_ENCODING
  ): Promise<boolean> {
    return this.connection.authenticate(this, user, password, encoding).then(
      (result: IAuthenticationResult) => {
        this.token = result.connectionToken;

        return true;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = (error as unknown) as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  public reconnect(options?: Partial<IReconnectOptions>): Promise<boolean> {
    const reconnectInfo: IReconnectOptions = Object.assign(
      {
        connType: LS_CONNECTION_TYPE.Debugger,
        connectionToken: this.token,
        serverName: this.serverName,
      },
      options || {}
    );

    return this.connection
      .reconnect(this, reconnectInfo.connectionToken, reconnectInfo.connType)
      .then(
        (result: IReconnectResult) => {
          this.token = result.connectionToken;
          this.connected = true;

          return true;
        },
        (error: ResponseError<IResponseStatus>) => {
          this.lastError = (error as unknown) as IResponseStatus;

          this.connected = false;

          return Promise.reject(error);
        }
      );
  }

  public validate(): Promise<boolean> {
    return this.connection.validation(this).then(
      (result: IValidationResult) => {
        this.build = result.buildVersion as BuildVersion;
        this.secure = result.secure;

        return true;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = (error as unknown) as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  public getExtensionsAllowed(): string[] {
    return [];
  }

  public compile(options: Partial<ICompileOptions>): Promise<ICompileResult> {
    options = {
      authorizationToken: '',
      includesUris: [],
      filesUris: [],
      extensionsAllowed: this.getExtensionsAllowed(),
      extraOptions: {
        recompile: false,
        debugAphInfo: true,
        gradualSending: true,
        generatePpoFile: false,
        showPreCompiler: false,
        priorVelocity: true,
        returnPpo: false,
        commitWithErrorOrWarning: false,
      },
      ...options,
    };

    return this.connection.compile(this, options).then(
      (result: ICompileResult) => {
        return result;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = (error as unknown) as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  public sendRpoToken(rpoToken: IRpoToken): Promise<IRpoTokenResult> {
    return this.connection.sendRpoToken(this, rpoToken).then(
      (result: IRpoTokenResult) => {
        return result;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = (error as unknown) as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }
}

// return

//       return true;
//     }
//   );
// ,
// (error: ResponseError<IResponseStatus>) => {
//   // this.lastError = error;
//   // this.build = '';
//   // this.secure = '';

//   return Promise.reject(error);
// }

/*



  public async validate(): Promise<boolean> {
    if (this.address === null || this.port === -1) return false;

    const tryValidate = (): Promise<boolean> => {
      const validationInfo: ValidationOptions = {
        server: this.address,
        port: this.port,
        connType: 13,
      };

      return this.connection
        .sendRequest<ServerValidationResult>('$totvsserver/validation', {
          validationInfo: validationInfo,
        })
        .then(
          (result: ServerValidationResult) => {
            console.log('$totvsserver/validation', result);

            if (!result.buildVersion) return false;

            this.build = result.buildVersion;
            this.secure = result.secure == 1;

            return true;
          },
          (error: Error) => {
            console.log(error);
            return false;
          }
        );
    };

    return await tryValidate();
  }

  public async stopServer() {
    this.connection
      .sendRequest('$totvsserver/stopServer', {
        stopServerInfo: {
          connectionToken: this.token,
        },
      })
      .then((response: any) => response.message);
  }
}


interface ValidationOptions {
  server: string;
  port: number;
  connType: number;
}

export interface ServerConnectionInfo {
  connType: number;
  serverName: string;
  identification: string;
  serverType: number;
  server: string;
  port: number;
  bSecure: number;
  buildVersion: BuildVersion;
  environment: string;
  autoReconnect: boolean;
}


interface ServerValidationResult {
  buildVersion: BuildVersion | '';
  secure: number;
}


interface ServerAuthenticationResult {
  id: any;
  connectionToken: string;
}

interface ServerReconnectResult {
  connectionToken: string;
  environment: string;
  user: string;
}

interface DisconnectResult {
  message: string;
}
*/
