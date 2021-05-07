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
import {
  MessageConnection,
  RequestType0,
  CancellationToken,
  RequestType,
  RequestType1,
  RequestType2,
  RequestType3,
  RequestType4,
  RequestType5,
  RequestType6,
  RequestType7,
  RequestType8,
  RequestType9,
} from 'vscode-jsonrpc';
import { LogLevel } from './logger';
import {
  ICompileExtraOptions,
  ICompileResult,
  IReconnectOptions,
  IResponseStatus,
  IRpoTokenResult,
  LS_CONNECTION_TYPE,
  LS_SERVER_ENCODING,
} from './protocolTypes';

export interface IStartLSOptions {
  logging: boolean;
  trace: 'messages' | 'verbose' | 'off';
  verbose: LogLevel;
}

export interface IMessageConnection extends MessageConnection {
  sendRequest<R, E>(
    type: RequestType0<R, E>,
    token?: CancellationToken
  ): Promise<R>;
  sendRequest<P, R, E>(
    type: RequestType<P, R, E>,
    params: P,
    token?: CancellationToken
  ): Promise<R>;
  sendRequest<P1, R, E>(
    type: RequestType1<P1, R, E>,
    p1: P1,
    token?: CancellationToken
  ): Promise<R>;
  sendRequest<P1, P2, R, E>(
    type: RequestType2<P1, P2, R, E>,
    p1: P1,
    p2: P2,
    token?: CancellationToken
  ): Promise<R>;
  sendRequest<P1, P2, P3, R, E>(
    type: RequestType3<P1, P2, P3, R, E>,
    p1: P1,
    p2: P2,
    p3: P3,
    token?: CancellationToken
  ): Promise<R>;
  sendRequest<P1, P2, P3, P4, R, E>(
    type: RequestType4<P1, P2, P3, P4, R, E>,
    p1: P1,
    p2: P2,
    p3: P3,
    p4: P4,
    token?: CancellationToken
  ): Promise<R>;
  sendRequest<P1, P2, P3, P4, P5, R, E>(
    type: RequestType5<P1, P2, P3, P4, P5, R, E>,
    p1: P1,
    p2: P2,
    p3: P3,
    p4: P4,
    p5: P5,
    token?: CancellationToken
  ): Promise<R>;
  sendRequest<P1, P2, P3, P4, P5, P6, R, E>(
    type: RequestType6<P1, P2, P3, P4, P5, P6, R, E>,
    p1: P1,
    p2: P2,
    p3: P3,
    p4: P4,
    p5: P5,
    p6: P6,
    token?: CancellationToken
  ): Promise<R>;
  sendRequest<P1, P2, P3, P4, P5, P6, P7, R, E>(
    type: RequestType7<P1, P2, P3, P4, P5, P6, P7, R, E>,
    p1: P1,
    p2: P2,
    p3: P3,
    p4: P4,
    p5: P5,
    p6: P6,
    p7: P7,
    token?: CancellationToken
  ): Promise<R>;
  sendRequest<P1, P2, P3, P4, P5, P6, P7, P8, R, E>(
    type: RequestType8<P1, P2, P3, P4, P5, P6, P7, P8, R, E>,
    p1: P1,
    p2: P2,
    p3: P3,
    p4: P4,
    p5: P5,
    p6: P6,
    p7: P7,
    p8: P8,
    token?: CancellationToken
  ): Promise<R>;
  sendRequest<P1, P2, P3, P4, P5, P6, P7, P8, P9, R, E>(
    type: RequestType9<P1, P2, P3, P4, P5, P6, P7, P8, P9, R, E>,
    p1: P1,
    p2: P2,
    p3: P3,
    p4: P4,
    p5: P5,
    p6: P6,
    p7: P7,
    p8: P8,
    p9: P9,
    token?: CancellationToken
  ): Promise<R>;
  sendRequest<R>(method: string, ...params: any[]): Promise<R>;
}

export type BuildVersion =
  | '7.00.131227A'
  | '7.00.170117A'
  | '7.00.191205P'
  | '7.00.210324P';

export enum LS_ERROR {
  NO_CONNECTED,
  ERR_ALREADY_CONNECTED,
}

export enum LS_SERVER_TYPE {
  PROTHEUS = 1,
  LOGIX = 2,
  TOVSTECX = 3,
}

export interface IRpoToken {
  file: string;
  token: string;
  header: {
    alg: string;
    typ: string;
  };
  body: {
    auth: string;
    exp: Date;
    iat: Date;
    iss: string;
    name: string;
    sub: string;
  };
  error?: string;
  warning?: string;
}

export interface ICompileOptions {
  authorizationToken: string;
  includesUris: string[];
  filesUris: string[];
  extensionsAllowed: string[];
  extraOptions: ICompileExtraOptions;
}

export interface ILSServer {
  id: string;
  serverName: string;
  connected: boolean;
  token: string;
  serverType: LS_SERVER_TYPE;
  address: string;
  port: number;
  build: BuildVersion;
  secure: boolean;
  environment: string;
  lastError: IResponseStatus;

  getExtensionsAllowed(): string[];

  connect(
    connectionType: LS_CONNECTION_TYPE,
    environment: string
  ): Promise<boolean>;

  disconnect(): Promise<string>;

  reconnect(options?: Partial<IReconnectOptions>): Promise<boolean>;

  authenticate(
    user: string,
    password: string,
    encoding: LS_SERVER_ENCODING
  ): Promise<boolean>;

  validate(): Promise<boolean>;

  compile(options: Partial<ICompileOptions>): Promise<ICompileResult>;

  sendRpoToken(rpoToken: IRpoToken): Promise<IRpoTokenResult>;

  // getRpoTokenFile(): string;
  // getServerType(): LS_SERVER_TYPE;
  // getAddress(): Url;
  // getBuild(): BuildVersion;
  // getEnvironment(): string;
  // isSecure(): boolean;
  // isConnected(): boolean;

  // setRpoToken(rpoToken: IRpoToken): this;
  // setRpoTokenFile(rpoTokenFile: string): this;
  // setServerType(serverType: LS_SERVER_TYPE): this;
  // setAddress(address: Url): this;
  // setBuild(build: BuildVersion): this;
  // setEnvironment(environment: string): this;
  // setSecure(secure: boolean): this;
  // setConnected(connected: boolean): this;
}
