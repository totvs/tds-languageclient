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
import { IWsdlGenerateResult } from '../../src/protocolTypes';
import { TLSServerDebugger } from '../../src/types';
import {
  doAuthenticate,
  doConnect,
  doDisconnect,
  doStartLanguageServer,
  doStopLanguageServer
} from '../helper';
import { adminUser, getServer} from '../scenario';

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

it('WSDL com URL válida', () => {
  const WSDL_URL: string =
    'http://sped.rfb.gov.br/estatico/76/05E527051AC2EABC34DD6795D29B5AF16D6102/WsConsulta.wsdl';

  return server.generateWsdl(WSDL_URL).then(
    (value: IWsdlGenerateResult) => {
      expect(value.returnCode).toEqual(0);
      expect(value.content.length).toBeGreaterThan(0);
      expect(value.content).toContain(WSDL_URL);
    },
    (err: any) => {
      expect(err).toBeNull();
    }
  );
});

it('WSDL com URL inválida', () => {
  const WSDL_URL: string = 'http://sped.rfb.gov.br/WsConsulta.wsdl';

  return server.generateWsdl(WSDL_URL).then(
    (value: IWsdlGenerateResult) => {
      expect(value).toBeNull();
    },
    (err: any) => {
      expect(err.code).toEqual(4099);
      expect(err.message).toContain('ERRO AO GERAR FONTE');
    }
  );
});

it('WSDL a partir de arquivo', () => {
  const WSDL_URL: string = path.resolve(
    '.',
    'tests',
    'assets',
    'WsConsulta.wsdl'
  );

  return server.generateWsdl(WSDL_URL).then(
    (value: IWsdlGenerateResult) => {
      expect(value).toBeNull();
    },
    (err: any) => {
      expect(err.code).toEqual(4099);
      expect(err.message).toContain('ERRO AO GERAR FONTE');
    }
  );
});

it('WSDL a partir de arquivo inválido', () => {
  const WSDL_URL: string = path.resolve(
    '.',
    'tests',
    'assets',
    'WsConsultaInvalid.wsdl'
  );

  return server.generateWsdl(WSDL_URL).then(
    (value: IWsdlGenerateResult) => {
      expect(value).toBeNull();
    },
    (err: any) => {
      expect(err.code).toEqual(4099);
      expect(err.message).toContain('ERRO AO GERAR FONTE');
    }
  );
});

it('WSDL a partir de arquivo inexistente', () => {
  const WSDL_URL: string = path.resolve(
    '.',
    'tests',
    'assets',
    'file_not_exist.wsdl'
  );

  return server.generateWsdl(WSDL_URL).then(
    (value: IWsdlGenerateResult) => {
      expect(value).toBeNull();
    },
    (err: any) => {
      expect(err.code).toEqual(4099);
      expect(err.message).toContain('ERRO AO GERAR FONTE');
    }
  );
});
