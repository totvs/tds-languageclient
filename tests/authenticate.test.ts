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
import { LS_SERVER_ENCODING } from '../src/protocolTypes';
import { ILSServer } from '../src/types';
import {
  adminUser,
  doConnect,
  doDisconnect,
  invalidUser,
  noAdminUser,
  serverP20,
} from './helper';

const server: ILSServer = serverP20;

beforeAll(() => {
  startLanguageServer();
});

afterAll(() => {
  stopLanguageServer();
});

beforeEach(async () => {
  await doConnect(server, 'p12');
});

afterEach(async () => {
  await doDisconnect(server);
});

it('autenticação com usuário inválido', () => {
  const user: any = invalidUser;

  return server
    .authenticate(user.username, user.password, LS_SERVER_ENCODING.CP1251)
    .then(
      (value: boolean) => {
        expect(value).toBeFalsy();
      },
      (error: any) => {
        expect(error.code).toEqual(4082);
        expect(error.message).toContain('Invalid user and/or password');
      }
    );
});

it('autenticação com usuário ADMIN', () => {
  const user: any = adminUser;

  return server
    .authenticate(user.username, user.password, LS_SERVER_ENCODING.CP1251)
    .then(
      (value: boolean) => {
        expect(value).toBeTruthy();
      },
      (error: any) => {
        expect(error).toBeNull();
      }
    );
});

it.skip('autenticação com usuário NO ADMIN USER', () => {
  const user: any = noAdminUser;

  return server
    .authenticate(user.username, user.password, LS_SERVER_ENCODING.CP1251)
    .then(
      (value: boolean) => {
        expect(value).toBeFalsy();
      },
      (error: any) => {
        expect(error).toBeNull();
      }
    );
});

it('autenticação com usuário INVALID USER', () => {
  const user: any = invalidUser;

  return server
    .authenticate(user.username, user.password, LS_SERVER_ENCODING.CP1251)
    .then(
      (value: boolean) => {
        expect(value).toBeFalsy();
      },
      (error: any) => {
        expect(error.code).toEqual(4082);
        expect(error.message).toContain('Invalid user and/or password');
      }
    );
});
