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
import { startLanguageServer, stopLanguageServer } from '../src/languageClient';
import { ILSServer } from '../src/types';
import { doConnect, doDisconnect, serverP20 } from './helper';

beforeAll(() => {
  startLanguageServer();
});

afterAll(() => {
  stopLanguageServer();
});

const server: ILSServer = serverP20;

beforeEach(async () => {
  await doConnect(server, 'p12');
});

afterEach(() => {
  async () => doDisconnect(server);
});

it('validação', () => {
  return server
    .validate()
    .then(
      (value: boolean) => {
        expect(value).toBeTruthy();

        return server;
      },
      (err: any) => {
        expect(err).toBeNull();
      }
    )
    .then((value: ILSServer) => {
      expect(value.build).toEqual('7.00.210324P');
      expect(value.secure).toBeTruthy();
    });
});
