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
import path from 'path';
import { TLSServerDebugger } from '../../src';
import { IPatchValidateResult } from '../../src/protocolTypes';
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

it.skip('patch válido', () => {
  const patchUri: string = configVO.getAssetFile('patch_ok.ptm');

  return server.patchValidate(patchUri).then(
    (value: IPatchValidateResult) => {
      expect(value.error).toEqual(0);
    },
    (err: any) => {
      expect(err).toBeNull();
    }
  );
});

it.skip('patch inválido', () => {
  const patchUri: string = path.resolve(
    '.',
    'tests',
    'assets',
    'patch_invalid.ptm'
  );

  return server.patchValidate(patchUri).then(
    (value: IPatchValidateResult) => {
      expect(value.error).toEqual(0);
      // expect(value.rpoVersion).not.toEqual('');
    },
    (err: any) => {
      expect(err).toBeNull();
    }
  );
});
