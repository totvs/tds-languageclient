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
  IAppKillUserResult,
  IGetConnectionStatusResult,
  IGetUsersResult,
  IKillUserResult,
  IResponseStatus,
  ISendUserMessageResult,
  ISetConnectionStatusResult,
  IStopServerResult,
  LS_CONNECTION_TYPE,
} from './protocolTypes';
import { LSServerAbstract } from './serverAbstract';
import { TLSServerMonitor } from './types';

export class LSServerMonitor
  extends LSServerAbstract
  implements TLSServerMonitor
{
  connect(environment: string): Promise<boolean> {
    return super.connect(environment, LS_CONNECTION_TYPE.Monitor);
  }

  setLockServer(lock: boolean): Thenable<ISetConnectionStatusResult> {
    return this.connection.setLockServer(this, lock).then(
      (result: ISetConnectionStatusResult) => {
        return result;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = error as unknown as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  isLockServer(): Thenable<boolean> {
    return this.connection.isLockServer(this).then(
      (result: IGetConnectionStatusResult) => {
        return !result.status;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = error as unknown as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  sendUserMessage(recipient: string, message: string) {
    return this.connection.sendUserMessage(this, recipient, message).then(
      (result: ISendUserMessageResult) => {
        return result;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = error as unknown as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  stop(): Thenable<IStopServerResult> {
    return this.connection.stopServer(this).then(
      (response: IStopServerResult) => {
        return response;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = error as unknown as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  killConnection(target: any): Thenable<IKillUserResult> {
    return this.connection.killConnection(this, target).then(
      (response: IKillUserResult) => {
        return response;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = error as unknown as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  appKillConnection(target: any): Thenable<IAppKillUserResult> {
    return this.connection.appKillConnection(this, target).then(
      (response: IKillUserResult) => {
        return response;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = error as unknown as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }

  getUsers(): Thenable<IGetUsersResult> {
    return this.connection.getUsers(this).then(
      (response: IGetUsersResult) => {
        return response as unknown as IGetUsersResult;
      },
      (error: ResponseError<IResponseStatus>) => {
        this.lastError = error as unknown as IResponseStatus;

        return Promise.reject(error);
      }
    );
  }
}
