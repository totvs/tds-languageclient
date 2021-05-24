import { LS_SERVER_ENCODING } from '../src/protocolTypes';
import * as fs from 'fs';
import path from 'path';
import { LSServerType } from '../src';
import {
  BuildVersion,
  IStartLSOptions,
  TLSServerDebugger,
  TLSServerMonitor,
} from '../src/types';
import { LSServerMonitor } from '../src/serverMonitor';
import { LSServerDebugger } from '../src/serverDebugger';

const config: any = {
  scenario: '',
};

process.argv.reduce((cmd: String, arg: String) => {
  if (arg.startsWith('--')) {
    const sub = arg.substring('--'.length).split('=');
    if (Object.keys(config).includes(sub[0])) {
      config[sub[0]] = sub[1];
      return '';
    }
  }

  return '';
});

if (config.scenario === '') {
  throw new Error(
    "Scenario not informed. Add the key '--scenario=<scenario_file.json>'"
  );
}

const fileConfig: string = path.resolve(config.scenario);
const buffer: Buffer = fs.readFileSync(fileConfig);

export interface IUserVO {
  username: string;
  password: string;
}

export interface IConfigVO {
  autorizationToken: any;
  server: {
    name: string;
    type: LSServerType.LS_SERVER_TYPE;
    address: string;
    port: number;
    build: BuildVersion;
    secure: boolean;
  };
  environment: string;
  encondig: LS_SERVER_ENCODING;
  adminUser: IUserVO;
  noAdminUser: IUserVO;
  startLSOptions?: IStartLSOptions;
  customKeys?: any;
}

export const configVO: IConfigVO = JSON.parse(buffer.toString());

export const invalidUser: IUserVO = {
  username: 'NOT_EXIST_USER',
  password: 'XXXXXXX',
};

export const adminUser: IUserVO = {
  username: 'admin',
  password: '1234',
  ...configVO.adminUser,
};

export const noAdminUser: IUserVO = {
  username: 'USERORIGEM',
  password: '1234',
  ...configVO.noAdminUser,
};

export const server: TLSServerDebugger = new LSServerDebugger('XXXXXX', {
  name: configVO.server.name,
  type: configVO.server.type,
  address: configVO.server.address,
  port: configVO.server.port,
  build: configVO.server.build,
  secure: configVO.server.secure,
});

export const monitor: TLSServerMonitor = new LSServerMonitor('XXXXXX', {
  name: configVO.server.name,
  type: configVO.server.type,
  address: configVO.server.address,
  port: configVO.server.port,
  build: configVO.server.build,
  secure: configVO.server.secure,
});

export const startLSOptions: IStartLSOptions = { ...configVO.startLSOptions };

server.environment = configVO.environment;
server.authorizationToken = configVO.autorizationToken;

monitor.environment = configVO.environment;
monitor.authorizationToken = configVO.autorizationToken;
