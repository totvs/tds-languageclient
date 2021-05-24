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
import { IPatchResult } from '../../src/protocolTypes';
import {
  doAuthenticate,
  doConnect,
  doDisconnect,
  doStartLanguageServer,
  doStopLanguageServer,
} from '../helper';
import { adminUser, server } from '../scenario';

beforeAll(() => {
  doStartLanguageServer();
});

afterAll(() => {
  doStopLanguageServer();
});

beforeEach(async () => {
  await doConnect(server, server.environment);
  await doAuthenticate(server, adminUser);
});

afterEach(() => {
  async () => doDisconnect(server);
});

it('informações sobre patch', () => {
  const patchUri: string = path.resolve('.', 'tests', 'assets', 'patch_ok.ptm');

  return server.getPatchInfo(patchUri).then(
    (value: IPatchResult) => {
      expect(value.returnCode).toEqual(0);
      expect(value.patchInfos).not.toBeNull();
      expect(value.patchInfos.length).toBeGreaterThan(0);
    },
    (err: any) => {
      expect(err).toBeNull();
    }
  );
});
