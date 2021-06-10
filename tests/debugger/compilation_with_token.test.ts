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
import { ICompileResult, IFileCompileResult } from '../../src/protocolTypes';
import { ICompileOptions, TLSServerDebugger } from '../../src/types';
import {
  doAuthenticate,
  doConnect,
  doDisconnect,
  doStartLanguageServer,
  doStopLanguageServer
} from '../helper';
import { adminUser, configVO, getServer} from '../scenario';

beforeAll(() => {
  doStartLanguageServer();
} );

afterAll(() => {
  doStopLanguageServer();
} );

const server: TLSServerDebugger = getServer();

beforeEach(async () => {
  await doConnect(server, server.environment);
  await doAuthenticate(server, adminUser);
});

afterEach(() => {

  async () => doDisconnect(server);
});

it('compilação de function com TOKEN (AdvPL)', () => {
  const options: Partial<ICompileOptions> = {
    filesUris: [configVO.getAssetFile('hello_function.prw')],
    includesUris: [configVO.getAssetFile('includes')],
  };

  return server.compile(options).then(
    (value: ICompileResult) => {
      expect(value.returnCode).toEqual(0);
      expect(value.compileInfos.length).toEqual(options.filesUris.length);

      const fileResult: IFileCompileResult = value.compileInfos[0];
      expect(fileResult.status).toMatch(/SUCCESS|SKIPPED/);
      expect(fileResult.detail).toEqual('');
    },
    (err: any) => {
      expect(err).toBeNull();
    }
  );
});
