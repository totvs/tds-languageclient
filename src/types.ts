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
  IAppKillUserResult,
  IApplyScope,
  IApplyTemplateResult,
  ICompileExtraOptions,
  ICompileResult,
  IDeleteProgramResult,
  IInspectorFunctionsResult,
  IInspectorObjectsResult,
  IKillUserResult,
  IPatchGenerateResult,
  IPatchValidateResult,
  IReconnectOptions,
  IResponseStatus,
  IRpoChechIntegrityResult,
  IRpoInfoResult,
  ISendUserMessageResult,
  ISetConnectionStatusResult,
  IStopServerResult,
  IWsdlGenerateResult,
  LS_SERVER_ENCODING,
} from './protocolTypes';

export interface IStartLSOptions {
  logging: boolean;
  trace: 'messages' | 'verbose' | 'off';
  verbose: LogLevel;
}

export interface ITdsMessageConnection extends MessageConnection {
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
  | ''
  | '7.00.131227A'
  | '7.00.170117A'
  | '7.00.191205P'
  | '7.00.210324P';

export enum LS_ERROR {
  NO_CONNECTED,
  ERR_ALREADY_CONNECTED,
}

enum _LS_SERVER_TYPE {
  UNDEFINED = 0,
  PROTHEUS = 1,
  LOGIX = 2,
  TOVSTECX = 3,
}

export namespace LSServerType {
  export enum LS_SERVER_TYPE {
    UNDEFINED = '',
    PROTHEUS = 'totvs_server_protheus',
    LOGIX = 'totvs_server_logix',
    TOVSTECX = 'totvs_server_tecx',
  }

  export function fromString(value: string): _LS_SERVER_TYPE {
    switch (value) {
      case '':
        return _LS_SERVER_TYPE.UNDEFINED;
      case 'totvs_server_protheus':
        return _LS_SERVER_TYPE.PROTHEUS;
      case 'totvs_server_logix':
        return _LS_SERVER_TYPE.LOGIX;
      case 'totvs_server_tecx':
        return _LS_SERVER_TYPE.TOVSTECX;
      default:
        throw Error(
          'LSServerType.fromString called with invalid arqument. Argument: ' +
            value
        );
    }
  }

  export function toString(value: _LS_SERVER_TYPE): LS_SERVER_TYPE {
    switch (value) {
      case _LS_SERVER_TYPE.UNDEFINED:
        return LS_SERVER_TYPE.UNDEFINED;
      case _LS_SERVER_TYPE.PROTHEUS:
        return LS_SERVER_TYPE.PROTHEUS;
      case _LS_SERVER_TYPE.LOGIX:
        return LS_SERVER_TYPE.LOGIX;
      case _LS_SERVER_TYPE.TOVSTECX:
        return LS_SERVER_TYPE.TOVSTECX;
      default:
        throw Error(
          'LSServerType.toString called with invalid arqument. Argument: ' +
            value
        );
    }
  }
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
  includesUris: string[];
  filesUris: string[];
  extensionsAllowed: string[];
  extraOptions: Partial<ICompileExtraOptions>;
}

export interface ILSServerAttributes {
  readonly id: string;
  name: string;
  type: LSServerType.LS_SERVER_TYPE;
  connected: boolean;
  token: string;
  authorizationToken: string;
  address: string;
  port: number;
  build: BuildVersion;
  secure: boolean;
  environment: string;
  lastError: IResponseStatus;
}

export function LS_ATTRIBUTES_DEFAULT(): ILSServerAttributes {
  return {
    id: '',
    name: '',
    token: '',
    type: LSServerType.LS_SERVER_TYPE.UNDEFINED,
    address: '',
    port: 0,
    build: '',
    secure: false,
    environment: '',
    connected: false,
    authorizationToken: '',
    lastError: undefined,
  };
}

export interface ILSServerAbstract {
  disconnect(): Promise<string>;

  reconnect(options?: Partial<IReconnectOptions>): Promise<boolean>;

  validate(): Promise<boolean>;

  authenticate(
    environment: string,
    user: string,
    password: string,
    encoding: LS_SERVER_ENCODING
  ): Promise<boolean>;
}

export interface ILSServerMonitor {
  connect(environment: string): Promise<boolean>;
  setLockServer(lock: boolean): Thenable<ISetConnectionStatusResult>;
  isLockServer(): Thenable<boolean>;
  sendUserMessage(
    recipient: string,
    message: string
  ): Thenable<ISendUserMessageResult>;
  killConnection(target: any): Thenable<IKillUserResult>;
  appKillConnection(target: any): Thenable<IAppKillUserResult>;
  stop(): Thenable<IStopServerResult>;
  killConnection(target: any): Thenable<IKillUserResult>;
  appKillConnection(target: any): Thenable<IAppKillUserResult>;
}

export type IPatchApplyScope = 'none' | 'only_new' | 'all';

export interface ILSServerDebugger {
  connect(environment: string): Promise<boolean>;

  compile(options: Partial<ICompileOptions>): Promise<ICompileResult>;

  rpoCheckIntegrity(): Promise<IRpoChechIntegrityResult>;

  generateWsdl(
    //authorizationToken: string,
    url: string
  ): Promise<IWsdlGenerateResult>;

  applyTemplate(
    includesUris: Array<string>,
    templateUri: string
  ): Promise<IApplyTemplateResult>;

  deletePrograms(
    //authorizationToken: string,
    programs: string[]
  ): Promise<IDeleteProgramResult>;

  getRpoInfo(): Promise<IRpoInfoResult>;

  patchValidate(patchURI: string): Promise<IPatchValidateResult>;

  applyPatch(
    patchURI: string,
    applyScope: IApplyScope
  ): Promise<IPatchValidateResult>;

  inspectorObjects(includeTres: boolean): Promise<IInspectorObjectsResult>;
  
  inspectorFunctions(): Promise<IInspectorFunctionsResult>;

  patchGenerate(
    patchMaster: string,
    patchDest: string,
    patchType: number,
    patchName: string,
    filesPath: string[],
    authorizationToken: string
  ): Promise<IPatchGenerateResult>;

  getPatchInfo(patchUri: string): any;

  defragRpo(): any;

  getExtensionsAllowed(): string[];

  // getServerType(): LS_SERVER_TYPE;
  // getAddress(): Url;
  // getBuild(): BuildVersion;
  // getEnvironment(): string;
  // isSecure(): boolean;
  // isConnected(): boolean;

  // setServerType(serverType: LS_SERVER_TYPE): this;
  // setAddress(address: Url): this;
  // setBuild(build: BuildVersion): this;
  // setEnvironment(environment: string): this;
  // setSecure(secure: boolean): this;
  // setConnected(connected: boolean): this;
}

export declare type TLSServerAbstract = ILSServerAbstract & ILSServerAttributes;
export declare type TLSServerMonitor = TLSServerAbstract & ILSServerMonitor;
export declare type TLSServerDebugger = TLSServerAbstract & ILSServerDebugger;
