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
import { ICompileOptions, IRpoToken, ILSServer } from './types';

export enum LS_CONNECTION_TYPE {
  Debugger = 3,
  MONITOMonitor = 13,
}

export enum LS_MESSAGE_TYPE {
  Success = 0,
  Error = 1,
  Warning = 2,
  Info = 3,
  Log = 4,
}

export enum DISPLAY_TYPE {
  Show = 0,
  Log = 1,
}

export enum LS_SERVER_ENCODING {
  CP1252 = 'CP1252',
  CP1251 = 'CP1251',
}
export enum LS_ERROR_CODES {
  DbApiError = -50000,

  PatchError = -40000,

  OldResources = -32701,
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
  serverErrorStart = -32099,
  serverErrorEnd = -32000,
  ServerNotInitialized = -32002,
  UnknownErrorCode = -32001,
  RequestCancelled = -32800,
  ContentModified = -32801,
  ConnectionRetrieveError = -32802,
  AuthorizationTokenExpiredError = -32803,
  StartBuildError = -32804,
  ReadOnlyError = -32805,
  InsufficientPrivilegesError = -32806,

  NoError = 0,

  LspInitializeError = 3081,
  TotvsServerValidationError = 4081, // connection
  TotvsServerAuthenticationError = 4082,
  TotvsServerDisconnectError = 4083,
  TotvsServerAuthorizationError = 4084,
  TotvsServerAuthTokenInfoError = 4085,
  TotvsServerReconnectError = 4086,
  TotvsServerStopServerError = 4087,
  TotvsServerConnectionError = 4088,
  TotvsServerCompilationError = 4091, // appserver commands
  TotvsServerPatchGenerateError = 4092,
  TotvsServerPatchApplyError = 4093,
  TotvsServerValidPatchError = 4094,
  TotvsServerDeleteProgramsError = 4095,
  TotvsServerDefragRpoError = 4096,
  TotvsServerInspectorFunctionsError = 4097,
  TotvsServerInspectorObjectsError = 4098,
  TotvsServerWsdlGenerateError = 4099,
  TotvsServerPatchInfoError = 4100,
  TotvsServerRpoCheckIntegrityError = 4101,
  TotvsServerTemplateGenerateError = 4192,
  TotvsServerTemplateApplyError = 4193,
  TotvsServerChangeSettingError = 4400, // settings
  TotvsServerRetrieveSettingsError = 4401,
  TotvsServerValidKeyError = 4500, // chave compilcacao
  TotvsServerGetIdError = 4501,
  TotvsMonitorGetUsers = 5081, //monitor
  TotvsMonitorAppKillUser = 5082,
  TotvsMonitorKillUser = 5083,
  TotvsMonitorSendUserMessage = 5084,
  TotvsMonitorGetConnectionStatus = 5085,
  TotvsMonitorSetConnectionStatus = 5086,
  TotvsServerPermissionsError = 5087,
  TotvsServerSlaveError = 5088,
  TotvsGetPathDirListInfoError = 5089,
  TotvsServerRpoInfoError = 5090,
  TotvsServerRpoTokenError = 5091,
}

export interface IResponseStatus {
  level: LS_MESSAGE_TYPE;
  code: LS_ERROR_CODES;
  subcode: number;
  message: string;
  data: any;
}

export interface IResponseBase {
  status: IResponseStatus;
}

export interface ITdsLanguageClient {
  connect(
    server: ILSServer,
    connectionType: LS_CONNECTION_TYPE,
    environment: string
  ): any;

  disconnect(server: ILSServer): any;

  authenticate(
    server: ILSServer,
    user: string,
    password: string,
    encoding: LS_SERVER_ENCODING
  ): any;

  reconnect(
    serverItem: ILSServer,
    connectionToken: string,
    connType: LS_CONNECTION_TYPE
  ): any;

  validation(server: ILSServer): any; //Thenable<IValidationResult>;

  compile(server: ILSServer, options: Partial<ICompileOptions>): any; //Thenable<ICompileResult>

  sendRpoToken(server: ILSServer, rpoToken: IRpoToken): any; // Thenable<IRpoTokenResult>;
}

export interface IConnectionInfo {
  connType: number;
  serverName: string;
  identification: string;
  serverType: number;
  server: string;
  port: number;
  buildVersion: string;
  bSecure: number;
  environment: string;
  autoReconnect: boolean;
}

export interface IConnectionResult extends IResponseBase {
  id: string;
  osType: number;
  connectionToken: string;
  needAuthentication: boolean;
}

export interface IDisconnectionInfo {
  serverName?: string;
  connectionToken: string;
}

export interface IDisconnectionResult extends IResponseBase {
  id: string;
  message: string;
}

export interface IAuthenticationInfo {
  connectionToken: string;
  environment: string;
  user: string;
  password: string;
  encoding: LS_SERVER_ENCODING;
}

export interface IAuthenticationResult {
  id: any;
  osType: number;
  connectionToken: string;
}

export interface IReconnectInfo {
  connectionToken: string;
  serverName: string;
  connType: LS_CONNECTION_TYPE;
}

export interface IReconnectResult {
  connectionToken: string;
  environment: string;
  user: string;
}

export interface IReconnectOptions {
  connectionToken: string;
  connType: number;
  encoding?: LS_SERVER_ENCODING;
}

export interface IValidationInfo {
  server: string;
  port: number;
  connType?: number;
}

export interface IValidationResult {
  id: any;
  buildVersion: string;
  secure: boolean;
}

export interface ICompileExtraOptions {
  recompile: boolean;
  debugAphInfo: boolean;
  gradualSending: boolean;
  generatePpoFile: boolean;
  showPreCompiler: boolean;
  priorVelocity: boolean;
  returnPpo: boolean;
  commitWithErrorOrWarning: boolean;
}

export interface ICompileInfo {
  connectionToken: string;
  environment: string;
  authorizationToken: string;
  includeUris: string[];
  fileUris: string[];
  extensionsAllowed: string[];
  compileOptions: ICompileExtraOptions;
}

export class IFileCompileResult {
  status: string;
  filePath: string;
  message: string;
  detail: string;
}

export interface ICompileResult {
  returnCode: number;
  compileInfos: Array<IFileCompileResult>;
}

export interface IRpoTokenInfo {
  sucess: boolean;
  message: string;
}

export interface IRpoTokenResult {
  sucess: boolean;
  message: string;
}

/*
interface ITokenInfo {
  sucess: boolean;
  token: string;
  needAuthentication: boolean;
}

interface IAuthenticationInfo {
  sucess: boolean;
  token: string;
}




interface DisconnectReturnInfo {
  id: any;
  code: any;
  message: string;
}
*/
