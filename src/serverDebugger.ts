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
import {
  IApplyScope,
  IApplyTemplateInfo,
  IApplyTemplateResult,
  ICompileResult,
  IDefragRpoResult,
  IDeleteProgramResult,
  IInspectorObjectsResult,
  IInspectorFunctionsResult,
  IPatchGenerateResult,
  IPatchResult,
  IPatchValidateResult,
  IResponseStatus,
  IRpoChechIntegrityResult,
  IRpoInfoResult,
  IWsdlGenerateResult,
  LS_CONNECTION_TYPE,
} from './protocolTypes';
import { LSServerAbstract } from './serverAbstract';
import { ICompileOptions, TLSServerDebugger } from './types';

export class LSServerDebugger
  extends LSServerAbstract
  implements TLSServerDebugger
{
  public connect(environment: string): Promise<boolean> {
    return super.connect(environment, LS_CONNECTION_TYPE.Debugger);
  }

  public getExtensionsAllowed(): string[] {
    return [];
  }

  public compile(options: Partial<ICompileOptions>): Promise<ICompileResult> {
    options = {
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
        this.lastError = error as unknown as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  rpoCheckIntegrity(): Promise<IRpoChechIntegrityResult> {
    return this.connection.rpoCheckIntegrity(this).then(
      (result: IRpoChechIntegrityResult) => {
        return result;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = error as unknown as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  generateWsdl(
    url: string
  ): Promise<IWsdlGenerateResult> {
    return this.connection.generateWsdl(this, url).then(
      (result: IWsdlGenerateResult) => {
        return result;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = error as unknown as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  applyTemplate(
    includesUris: Array<string>,
    templateUri: string
  ): Promise<IApplyTemplateResult> {
    return this.connection.applyTemplate(this, includesUris, templateUri).then(
      (result: IApplyTemplateInfo) => {
        return result;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = error as unknown as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  deletePrograms(programs: string[]): Promise<IDeleteProgramResult> {
    return this.connection.deleteProgram(this, programs).then(
      (result: IDeleteProgramResult) => {
        return result;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = error as unknown as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  getRpoInfo(): Promise<IRpoInfoResult> {
    return this.connection.getRpoInfo(this).then(
      (result: IRpoInfoResult) => {
        return result;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = error as unknown as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  applyPatch(
    patchURI: string,
    applyScope: IApplyScope
  ): Promise<IPatchValidateResult> {
    return this.connection.applyPatch(this, applyScope, patchURI).then(
      (result: IPatchValidateResult) => {
        return result;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = error as unknown as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  patchValidate(patchURI: string): Promise<IPatchValidateResult> {
    return this.connection.patchValidate(this, patchURI).then(
      (result: IPatchValidateResult) => {
        return result;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = error as unknown as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  inspectorObjects(includeTres: boolean): any {
    return this.connection.inspectorObjects(this, includeTres).then(
      (result: IInspectorObjectsResult) => {
        return result;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = error as unknown as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  inspectorFunctions(): any {
    return this.connection.inspectorFunctions(this).then(
      (result: IInspectorFunctionsResult) => {
        return result;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = error as unknown as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  patchGenerate(
    patchMaster: string,
    patchDest: string,
    patchType: number,
    patchName: string,
    filesPath: string[]
  ): Promise<IPatchGenerateResult> {
    return this.connection
      .patchGenerate(
        this,
        patchMaster,
        patchDest,
        patchType,
        patchName,
        filesPath
      )
      .then(
        (result: IPatchGenerateResult) => {
          return result;
        },
        (error: ResponseError<IResponseStatus>) => {
          this.lastError = error as unknown as IResponseStatus;

          return Promise.reject(error);
        }
      );
  }

  getPatchInfo(patchUri: string): any {
    return this.connection.getPatchInfo(this, patchUri).then(
      (result: IPatchResult) => {
        return result;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = error as unknown as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  defragRpo(): any {
    return this.connection.defragRpo(this).then(
      (result: IDefragRpoResult) => {
        return result;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = error as unknown as IResponseStatus;

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
