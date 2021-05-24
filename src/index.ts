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
export { BuildVersion } from './types';
export { LSServerDebugger } from './serverDebugger';
export { LSServerMonitor } from './serverMonitor';
export {
  TLSServerDebugger,
  TLSServerMonitor,
  IStartLSOptions,
  LSServerType,
  ICompileOptions,
  ILSServerAttributes,
} from './types';
export { startLanguageServer, stopLanguageServer } from './languageClient';
export {
  PATCH_ERROR_CODE,
  LS_SERVER_ENCODING,
  IReconnectOptions,
  ITdsLanguageClient,
  IStopServerResult,
  IApplyPatchData,
  IPatchFileInfo,
  IApplyScope,
  IResponseStatus,
  ICompileResult,
  IRpoChechIntegrityResult,
  LS_CONNECTION_TYPE,
  IApplyTemplateResult,
  IDeleteProgramResult,
  IPatchGenerateResult,
  IInspectorObjectsResult,
  IRpoInfoResult,
  IProgramApp,
  IRpoPatch,
  IAuthenticationResult,
  IPatchValidateResult,
  IKillUserResult,
  IAppKillUserResult,
  IReconnectResult,
  IUserData,
  IGetUsersResult,
  IDefragRpoResult,
  ISetConnectionStatusResult,
} from './protocolTypes';
