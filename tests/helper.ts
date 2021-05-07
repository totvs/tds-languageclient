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
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { LS_CONNECTION_TYPE, LS_SERVER_ENCODING } from '../src/protocolTypes';
import { LSServerInformation } from '../src/server';
import { ILSServer, LS_SERVER_TYPE } from '../src/types';

export interface IUserVO {
  username: string;
  password: string;
  encondig?: LS_SERVER_ENCODING;
}

export const serverP20: ILSServer = new LSServerInformation({
  id: 'XXXXXX',
  serverName: 'p20',
  serverType: LS_SERVER_TYPE.PROTHEUS,
  address: 'localhost',
  port: 2030,
  build: '7.00.210324P',
});

export const invalidUser: IUserVO = {
  username: 'NOT_EXIST_USER',
  password: 'XXXXXXX',
};

export const adminUser: IUserVO = {
  username: 'admin',
  password: '1234',
};

export const noAdminUser: IUserVO = {
  username: 'USERORIGEM',
  password: '1234',
};

export function startServer(
  idLogger: string,
  appServerBin: string
): ChildProcessWithoutNullStreams {
  //const logger: ILogger = getLogger(idLogger);

  const spawnArgs = ['-console'];
  const spawnOptions = {
    env: process.env,
  };

  const childProcess = spawn(appServerBin, spawnArgs, spawnOptions);

  return childProcess;
}

export async function doConnect(
  server: ILSServer,
  environment: string,
  type?: LS_CONNECTION_TYPE
): Promise<boolean> {
  return await new Promise<boolean>((resolve) => {
    resolve(server.connect(type || LS_CONNECTION_TYPE.Debugger, environment));
  });
}

export async function doDisconnect(server: ILSServer): Promise<string> {
  return await new Promise<string>((resolve) => {
    resolve(server.disconnect());
  });
}

export async function doAuthenticate(
  server: ILSServer,
  user: IUserVO
): Promise<boolean> {
  return await new Promise<boolean>((resolve) => {
    resolve(
      server.authenticate(
        user.username,
        user.password,
        user.encondig || LS_SERVER_ENCODING.CP1251
      )
    );
  });
}
