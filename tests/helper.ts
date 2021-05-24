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
import { configVO, IUserVO, startLSOptions } from './scenario';
import {
  startLanguageServer,
  stopLanguageServer,
  TLSServerDebugger,
  TLSServerMonitor,
} from '../src';

// export function startServer(
//   idLogger: string,
//   appServerBin: string
// ): ChildProcessWithoutNullStreams {
//   //const logger: ILogger = getLogger(idLogger);

//   const spawnArgs = ['-console'];
//   const spawnOptions = {
//     env: process.env,
//   };

//   const childProcess = spawn(appServerBin, spawnArgs, spawnOptions);

//   return childProcess;
// }

export async function doStartLanguageServer() {
  startLanguageServer(startLSOptions);
}

export async function doStopLanguageServer() {
  stopLanguageServer();
}

export async function doConnect(
  server: TLSServerDebugger | TLSServerMonitor,
  environment: string
): Promise<boolean> {
  return await new Promise<boolean>((resolve) => {
    resolve(server.connect(environment));
  });
}

export async function doDisconnect(
  server: TLSServerDebugger | TLSServerMonitor
): Promise<string> {
  return await new Promise<string>((resolve) => {
    resolve(server.disconnect());
  });
}

export async function doAuthenticate(
  server: TLSServerDebugger | TLSServerMonitor,
  user: IUserVO
): Promise<boolean> {
  return await new Promise<boolean>((resolve) => {
    resolve(
      server.authenticate(
        server.environment,
        user.username,
        user.password,
        configVO.encondig
      )
    );
  });
}
