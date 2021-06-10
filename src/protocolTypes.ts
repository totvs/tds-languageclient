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
import { ChildProcess } from 'child_process';
import { ICompileOptions, ILSServerAttributes } from './types';

export enum LS_CONNECTION_TYPE {
  Debugger = 3,
  Monitor = 13,
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
  lsProcess: ChildProcess;

  connect(
    server: ILSServerAttributes,
    connectionType: LS_CONNECTION_TYPE,
    environment: string
  ): any;

  disconnect(server: ILSServerAttributes): any;

  authenticate(
    server: ILSServerAttributes,
    environment: string,
    user: string,
    password: string,
    encoding: LS_SERVER_ENCODING
  ): any;

  reconnect(
    serverItem: ILSServerAttributes,
    connectionToken: string,
    connType: LS_CONNECTION_TYPE
  ): any;

  validation(server: ILSServerAttributes): any; //Thenable<IValidationResult>;

  rpoCheckIntegrity(server: ILSServerAttributes): any; //

  compile(server: ILSServerAttributes, options: Partial<ICompileOptions>): any; //Thenable<ICompileResult>

  generateWsdl(
    server: ILSServerAttributes,
    //authorizationToken: string,
    url: string
  ): any; //

  applyTemplate(
    server: ILSServerAttributes,
    includesUris: Array<string>,
    templateUri: string
  ): any;

  deleteProgram(server: ILSServerAttributes, programs: string[]): any;

  getRpoInfo(server: ILSServerAttributes): any;

  patchValidate(server: ILSServerAttributes, patchURI: string): any;

  applyPatch(
    server: ILSServerAttributes,
    scope: IApplyScope,
    patchURI: string
  ): any;

  inspectorObjects(server: ILSServerAttributes, includeTres: boolean): any;

  patchGenerate(
    server: ILSServerAttributes,
    patchMaster: string,
    patchDest: string,
    patchType: number,
    patchName: string,
    filesPath: string[]
  ): any;

  getPatchInfo(server: ILSServerAttributes, patchUri: string): any;

  setLockServer(
    server: ILSServerAttributes,
    lock: boolean
  ): Thenable<ISetConnectionStatusResult>;

  isLockServer(
    server: ILSServerAttributes
  ): Thenable<IGetConnectionStatusResult>;

  sendUserMessage(
    server: ILSServerAttributes,
    recipient: string,
    message: string
  ): Thenable<ISendUserMessageResult>;

  stopServer(server: ILSServerAttributes): Thenable<IStopServerResult>;

  killConnection(
    server: ILSServerAttributes,
    target: any
  ): Thenable<IKillUserResult>;

  appKillConnection(
    server: ILSServerAttributes,
    target: any
  ): Thenable<IAppKillUserResult>;

  getUsers(server: ILSServerAttributes): Thenable<IGetUsersResult>;

  defragRpo(server: ILSServerAttributes): Thenable<IDefragRpoResult>;
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
  connType: LS_CONNECTION_TYPE;
  encoding?: LS_SERVER_ENCODING;
  environment?: string;
}

export interface IValidationInfo {
  server: string;
  port: number;
  connType?: LS_CONNECTION_TYPE;
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
  connectionToken: string;
  environment: string;
  file: string;
  content: string;
}

export interface IWsdlGenerateInfo {
  connectionToken: string;
  authorizationToken: string;
  environment: string;
  wsdlUrl: string;
}

export interface IWsdlGenerateResult {
  returnCode: number;
  content: string;
}

export interface IRpoCheckIntegrityInfo {
  connectionToken: string;
  environment: string;
}

export interface IRpoChechIntegrityResult {
  integrity: boolean;
  message: string;
}

export interface IApplyTemplateInfo {
  connectionToken: string;
  authorizationToken: string;
  environment: string;
  includeUris: string[];
  templateUri: string;
  isLocal: boolean;
}

export interface IApplyTemplateResult {
  error: boolean;
  message: string;
  errorCode: number;
}

export interface IDeleteProgramInfo {
  connectionToken: string;
  authorizationToken: string;
  environment: string;
  programs: string[];
}

export interface IDeleteProgramResult {
  returnCode: number;
}

export interface IRpoInfo {
  connectionToken: string;
  environment: string;
}

export interface IProgramApp {
  name: string;
  date: string;
}

export interface IRpoPatch {
  dateFileGeneration: string;
  buildFileGeneration: string;
  dateFileApplication: string;
  buildFileApplication: string;
  skipOld: boolean;
  typePatch: number;
  programsApp: IProgramApp[];
}

export interface IRpoInfoResult {
  rpoVersion: string;
  dateGeneration: string;
  environment: string;
  rpoPatchs: IRpoPatch[];
}

export interface IPatchValidateInfo {
  connectionToken: string;
  authorizationToken: string;
  environment: string;
  patchUri: string;
  isLocal: boolean;
}

export interface IPatchValidateData {
  file: string;
  dateRpo: string;
  datePatch: string;
}

export interface IPatchValidateResult {
  error: boolean;
  message: string;
  patchValidates: IPatchValidateData[];
  errorCode: number;
}

export interface IInspectorObjectsInfo {
  connectionToken: string;
  environment: string;
  includeTres: boolean;
}

export interface IInspectorObject {
  name: string;
  type: string;
  date: string;
}

export interface IInspectorObjectsResult {
  message: string;
  objects: Array<IInspectorObject>;
}

export interface IPatchGenerateInfo {
  connectionToken: string;
  authorizationToken: string;
  environment: string;
  patchMaster: string;
  patchDest: string;
  isLocal: boolean;
  patchType: number;
  name: string;
  patchFiles: string[];
}

export interface IPatchGenerateResult {
  returnCode: number;
}

export interface IPatchInfo {
  connectionToken: string;
  authorizationToken: string;
  environment: string;
  patchUri: string;
  isLocal: boolean;
}

export interface IPatchInfoData {
  buildType: string;
  name: string;
  type: string;
  date: string;
  size: string;
}

export interface IPatchResult {
  returnCode: number;
  patchInfos: IPatchInfoData[];
}

export interface ISetConnectionStatusInfo {
  connectionToken: string;
  status: boolean;
}

export interface ISetConnectionStatusResult {
  message: string;
}

export interface IGetConnectionStatusInfo {
  connectionToken: string;
}

export interface IGetConnectionStatusResult {
  status: boolean;
}

export declare type TApplyPatchStatus =
  | 'loaded'
  | 'validating'
  | 'valid'
  | 'applying'
  | 'applyed'
  | 'error'
  | 'cancelApply'
  | 'warning';

export const PATCH_ERROR_CODE = {
  OK: 0,
  RETURN_UNDEFINED: 1,
  INVALID_RETURN: 2,
  INSUFICIENT_PRIVILEGES: 3,
  GENERIC_ERROR: 4,
  OLD_RESOURCES: 5,
  EMPTY_EMPFIL_LIST: 6,
  APPLY_DENIED: 7,
};

export declare type IApplyScope = 'none' | 'only_new' | 'all';

export interface IPatchFileInfo {
  status: TApplyPatchStatus;
  name: string;
  fullpath: string;
  size: number;
  zipFile: string;
  message: string;
  applyScope: IApplyScope;
  data: { error_number: number; data: any };
}

export interface IApplyPatchData {
  validateProcess: boolean;
  patchFiles: IPatchFileInfo[];
  lastFolder: string;
  historyFolder: string[];
}

export interface IPatchApplyInfo {
  connectionToken: string;
  authenticateToken: string;
  environment: string;
  patchUri: string;
  isLocal: boolean;
  applyScope: IApplyScope;
  isValidOnly: boolean;
}

export interface ISendUserMessageInfo {
  connectionToken: string;
  userName: string;
  computerName: string;
  threadId: number;
  server: string;
  environment: string;
  message: string;
}

export interface ISendUserMessageResult {
  message: string;
}

export interface IStopServerInfo {
  connectionToken: string;
}

export interface IStopServerResult {
  message: string;
}

export interface IKillUserInfo {
  connectionToken: string;
  userName: string;
  computerName: string;
  threadId: number;
  serverName: string;
}

export interface IKillUserResult {
  message: string;
}

export interface IAppKillUserInfo {
  connectionToken: string;
  userName: string;
  computerName: string;
  threadId: number;
  serverName: string;
}

export interface IAppKillUserResult {
  message: string;
}

export interface IGetUsersInfo {
  connectionToken: string;
}

export interface IUserData {
  username: string;
  computerName: string;
  server: string;
  mainName: string;
  environment: string;
  loginTime: string;
  elapsedTime: string;
  remark: string;
  appUser: string;
  sid: string;
  clientType: string;
  inactiveTime: number;
  threadId: number;
  totalInstrCount: number;
  instrCountPerSec: number;
  memUsed: number;
  ctreeTaskId: number;
}

export interface IGetUsersResult {
  mntUsers: IUserData[];
}

export interface IDefragRpoInfo {
  connectionToken: string;
  environment: string;
  packPatchInfo: boolean;
}

export interface IDefragRpoResult {
  message: string;
}
