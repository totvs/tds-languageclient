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
import { startLanguageServer, stopLanguageServer } from '../src/languageClient';
import {
  ICompileResult,
  IFileCompileResult,
  IRpoTokenResult,
} from '../src/protocolTypes';
import { getRpoTokenFromFile } from '../src/rpoToken';
import { ICompileOptions, IRpoToken, ILSServer } from '../src/types';
import {
  adminUser,
  doAuthenticate,
  doConnect,
  doDisconnect,
  IUserVO,
  serverP20,
} from './helper';

beforeAll(() => {
  startLanguageServer();
});

afterAll(() => {
  stopLanguageServer();
});

const server: ILSServer = serverP20;
const user: IUserVO = adminUser;

beforeEach(async () => {
  await doConnect(server, 'p12');
  await doAuthenticate(server, user);
});

afterEach(() => {
  async () => doDisconnect(server);
});

it('compilação de function sem TOKEN (AdvPL)', () => {
  const options: Partial<ICompileOptions> = {
    filesUris: [path.resolve('.', 'tests', 'assets', 'hello_function.prw')],
    includesUris: [path.resolve('.', 'tests', 'assets', 'includes')],
  };

  return server.compile(options).then(
    (value: ICompileResult) => {
      expect(value.returnCode).toEqual(-1);
      expect(value.compileInfos.length).toEqual(options.filesUris.length);

      const fileResult: IFileCompileResult = value.compileInfos[0];
      expect(fileResult.status).toMatch('FATAL');
      expect(fileResult.detail).toContain('Regular functions are not');
    },
    (err: any) => {
      expect(err).toBeNull();
    }
  );
});

it('envio de TOKEN inválido (AdvPL)', () => {
  const rpoTokenFile: string = path.resolve(
    '.',
    'tests',
    'assets',
    'token_invalid.token'
  );
  const rpoToken: IRpoToken = getRpoTokenFromFile(rpoTokenFile);

  return server.sendRpoToken(rpoToken).then(
    (value: IRpoTokenResult) => {
      expect(value).toBeNull();
    },
    (err: any) => {
      expect(err.code).toEqual(5091);
      expect(err.message).toContain('Invalid token');
    }
  );
});

it('compilação de function com TOKEN (AdvPL)', () => {
  const rpoTokenFile: string = path.resolve(
    '.',
    'tests',
    'assets',
    'token_hsm_development.token'
  );
  const rpoToken: IRpoToken = getRpoTokenFromFile(rpoTokenFile);

  return server
    .sendRpoToken(rpoToken)
    .then(
      (value: IRpoTokenResult) => {
        expect(value.sucess).toBeTruthy();
        expect(value.message).toEqual('');

        return server;
      },
      (err: any) => {
        expect(err).toBeNull();
      }
    )
    .then((value: ILSServer) => {
      const options: Partial<ICompileOptions> = {
        filesUris: [path.resolve('.', 'tests', 'assets', 'hello_function.prw')],
        includesUris: [path.resolve('.', 'tests', 'assets', 'includes')],
      };

      value.compile(options).then(
        (value: ICompileResult) => {
          expect(value.returnCode).toEqual(0);
          expect(value.compileInfos.length).toEqual(options.filesUris.length);

          const fileResult: IFileCompileResult = value.compileInfos[0];
          expect(fileResult.status).toEqual(/SUCCESS|SKIPPED/i);
          expect(fileResult.detail).toContain('Statement unterminated');
        },
        (err: any) => {
          expect(err).toBeNull();
        }
      );
    });
});
