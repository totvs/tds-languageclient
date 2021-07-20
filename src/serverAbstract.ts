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
import { ResponseError } from 'vscode-jsonrpc';
import { BuildVersion } from '.';
import { getTDSLanguageServer } from './languageClient';
import {
  IAuthenticationResult,
  IConnectionResult,
  IDisconnectionResult,
  IReconnectOptions,
  IReconnectResult,
  IResponseStatus,
  ITdsLanguageClient,
  IValidationResult,
  LS_CONNECTION_TYPE,
  LS_SERVER_ENCODING,
} from './protocolTypes';
import {
  ILSServerAttributes,
  LSServerType,
  LS_ATTRIBUTES_DEFAULT,
  TLSServerAbstract,
} from './types';

export class LSServerAbstract implements TLSServerAbstract {
  protected _id: string;
  private _type: LSServerType.LS_SERVER_TYPE;
  private _build: BuildVersion;
  private _name: string;
  private _address: string;
  private _port: number;
  private _connected: boolean;
  private _token: string;
  private _authorizationToken: string;
  private _environment: string;
  private _needAuthentication: boolean;
  private _secure: boolean;
  private _lastError: IResponseStatus;

  public constructor(id: string, options?: Partial<ILSServerAttributes>) {
    const fullOptions: any = {
      ...LS_ATTRIBUTES_DEFAULT(),
      ...options,
    };

    Object.assign(this, fullOptions);
    this._id = id;
  }

  public validate(): Promise<boolean> {
    return this.connection.validation(this).then(
      (result: IValidationResult) => {
        this.build = result.buildVersion as BuildVersion;
        this.secure = result.secure;

        return true;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = error as unknown as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  public get authorizationToken(): string {
    return this._authorizationToken;
  }

  public set authorizationToken(value: string) {
    this._authorizationToken = value;
  }

  public get lastError(): IResponseStatus {
    return this._lastError;
  }

  public set lastError(value: IResponseStatus) {
    this._lastError = value;
  }

  public get name(): string {
    return this._name;
  }

  public set name(value: string) {
    this._name = value;
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
  public get type(): LSServerType.LS_SERVER_TYPE {
    return this._type;
  }
  public set type(value: LSServerType.LS_SERVER_TYPE) {
    this._type = value;
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
    return getTDSLanguageServer();
  }
  public get needAuthentication(): boolean {
    return this._needAuthentication;
  }
  public set needAuthentication(value: boolean) {
    this._needAuthentication = value;
  }

  protected connect(
    environment: string,
    connectionType: LS_CONNECTION_TYPE
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
        this.lastError = error as unknown as IResponseStatus;

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
        this.lastError = error as unknown as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  public authenticate(
    environment: string,
    user: string,
    password: string,
    encoding?: LS_SERVER_ENCODING
  ): Promise<boolean> {
    return this.connection
      .authenticate(this, environment, user, password, encoding)
      .then(
        (result: IAuthenticationResult) => {
          this.token = result.connectionToken;

          return true;
        },
        (error: ResponseError<IResponseStatus>) => {
          this.lastError = error as unknown as IResponseStatus;

          return Promise.reject(error);
        }
      );
  }

  public reconnect(options?: Partial<IReconnectOptions>): Promise<boolean> {
    const reconnectInfo: IReconnectOptions = {
      connType: LS_CONNECTION_TYPE.Debugger,
      connectionToken: this.token,
      ...options,
    };

    return this.connection
      .reconnect(this, reconnectInfo.connectionToken, reconnectInfo.connType)
      .then(
        (result: IReconnectResult) => {
          this.token = result.connectionToken;
          this.connected = true;

          return true;
        },
        (error: ResponseError<IResponseStatus>) => {
          this.lastError = error as unknown as IResponseStatus;

          this.connected = false;

          return Promise.reject(error);
        }
      );
  }
}
