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
import { doStartLanguageServer, doStopLanguageServer } from '../helper';
import { configVO, getServer} from '../scenario';

beforeAll(() => {
  doStartLanguageServer();
} );

afterAll(() => {
  doStopLanguageServer();
} );

const server: TLSServerDebugger = getServer();

it('conexão', () => {
  return server
    .connect(configVO.environment)
    .then(
      (value: boolean) => {
        expect(value).toBeTruthy();

        return server;
      },
      (err: any) => {
        console.log(err);
      }
    )
    .then((value: TLSServerDebugger) => {
      expect(value.connected).toBeTruthy();
      expect(value.token).not.toBeNull();

      return value.disconnect();
    })
    .then((message: string) => {
      expect(message).toEqual('Success');
    });
});
