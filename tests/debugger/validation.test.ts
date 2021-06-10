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
import { TLSServerDebugger } from '../../src/types';
import {
  doConnect,
  doDisconnect,
  doStartLanguageServer,
  doStopLanguageServer
} from '../helper';
import { getServer} from '../scenario';

beforeAll(() => {
  doStartLanguageServer();
} );

afterAll(() => {
  doStopLanguageServer();
} );

const server: TLSServerDebugger = getServer();
beforeEach(async () => {
  await doConnect(server, server.environment);
});

afterEach(() => {
  async () => doDisconnect(server);
});

it('validação (validate/validation)', () => {
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
    .then((value: TLSServerDebugger) => {
      expect(value.build).toMatch(/7\.00\.210324P|7\.00\.191205P/);
      expect(value.secure).toBeTruthy();
    });
});
