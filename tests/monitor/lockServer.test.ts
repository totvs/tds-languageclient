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
import { TLSServerMonitor } from '../../src';
import { ISetConnectionStatusResult } from '../../src/protocolTypes';
import {
  doAuthenticate,
  doConnect,
  doDisconnect,
  doStartLanguageServer,
  doStopLanguageServer
} from '../helper';
import { adminUser, getMonitor } from '../scenario';

beforeAll(() => {
  doStartLanguageServer();
} );

afterAll(() => {
  doStopLanguageServer();
} );


const monitor: TLSServerMonitor = getMonitor();
beforeEach(async () => {
  await doConnect(monitor, monitor.environment);
  await doAuthenticate(monitor, adminUser);
});

afterEach(() => {
  async () => doDisconnect(monitor);
});

it.skip('lockServer', () => {
  return monitor
    .setLockServer(true)
    .then(
      (value: ISetConnectionStatusResult) => {
        expect(value.message).toEqual('OK');
      },
      (err: any) => {
        expect(err).toBeNull();
      }
    )
    .then(() => {
      expect(monitor.isLockServer()).toBeTruthy();
    })
    .then(() => {
      monitor.setLockServer(false);
    });
  // .then(() => {
  //  expect(monitor.isLockServer()).toBeFalsy();
  // });
});
