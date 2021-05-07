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
import { ICompileResult, IFileCompileResult } from '../src/protocolTypes';
import { ICompileOptions, ILSServer } from '../src/types';
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

it('compilação com atributos mínimos não informado', () => {
  const options: Partial<ICompileOptions> = {};

  return server.compile(options).then(
    (value: ICompileResult) => {
      expect(value).toBeNull();

      return server;
    },
    (err: any) => {
      expect(err.code).toEqual(40912);
      expect(err.message).toContain('File URIs');
    }
  );
});

it('compilação com includeList inexistente (AdvPL)', () => {
  const options: Partial<ICompileOptions> = {
    filesUris: [path.resolve('.', 'tests', 'assets', 'hello.prw')],
    includesUris: [path.resolve('.', 'tests', 'assets', 'not_exist')],
  };

  return server.compile(options).then(
    (value: ICompileResult) => {
      expect(value).toBeNull();
    },
    (err: any) => {
      expect(err.code).toEqual(4091);
      expect(err.message).toContain('One or more include');
    }
  );
});

it('compilação de fonte inexistente (AdvPL)', () => {
  const options: Partial<ICompileOptions> = {
    filesUris: [path.resolve('.', 'tests', 'assets', 'not_exist.prw')],
    includesUris: [path.resolve('.', 'tests', 'assets', 'includes')],
  };

  return server.compile(options).then(
    (value: ICompileResult) => {
      expect(value.returnCode).toEqual(-1);
      expect(value.compileInfos.length).toEqual(options.filesUris.length);

      const fileResult: IFileCompileResult = value.compileInfos[0];
      expect(fileResult.status).toEqual('ERROR');
      expect(fileResult.message).toEqual('File not found');
    },
    (err: any) => {
      expect(err).toBeNull();
    }
  );
});

it('compilação com parâmetros mínimos (AdvPL)', () => {
  const options: Partial<ICompileOptions> = {
    filesUris: [path.resolve('.', 'tests', 'assets', 'hello.prw')],
    includesUris: [path.resolve('.', 'tests', 'assets', 'includes')],
  };

  return server.compile(options).then(
    (value: ICompileResult) => {
      expect(value.returnCode).toEqual(0);
      expect(value.compileInfos.length).toEqual(options.filesUris.length);

      const fileResult: IFileCompileResult = value.compileInfos[0];
      expect(fileResult.status).toMatch(/SUCCESS|SKIPPED/i);
      expect(fileResult.detail).toEqual('');
    },
    (err: any) => {
      expect(err).toBeNull();
    }
  );
});

it('compilação de fonte com erro de sixtaxe (AdvPL)', () => {
  const options: Partial<ICompileOptions> = {
    filesUris: [path.resolve('.', 'tests', 'assets', 'hello_sintax_error.prw')],
    includesUris: [path.resolve('.', 'tests', 'assets', 'includes')],
  };

  return server.compile(options).then(
    (value: ICompileResult) => {
      expect(value.returnCode).toEqual(-1);
      expect(value.compileInfos.length).toEqual(options.filesUris.length);

      const fileResult: IFileCompileResult = value.compileInfos[0];
      expect(fileResult.status).toEqual('ERROR');
      expect(fileResult.detail).toContain('Statement unterminated');
    },
    (err: any) => {
      expect(err).toBeNull();
    }
  );
});
